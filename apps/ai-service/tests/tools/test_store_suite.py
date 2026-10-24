"""Unit tests for store suite tool definitions and safe endpoint parsing (AGENT-FIX-0d).

Verifies defensive handling of backend endpoints that return either:
  (a) raw list directly: e.g. [{"id": 1, ...}]
  (b) dict containing a 'data' list: e.g. {"data": [{"id": 2, ...}]}
  (c) dict containing a domain key list: e.g. {"reasons": [{"id": 3, ...}]}
  (d) dict containing nested data: e.g. {"data": {"reasons": [...]}}
  (e) empty or non-dict responses

Ensures all reads are guarded with isinstance checks and never throw AttributeError
('list' object has no attribute 'get').

Runnable both ways:
  * CI:            pytest tests/tools/test_store_suite.py
  * Standalone:    python tests/tools/test_store_suite.py
"""

from __future__ import annotations

import asyncio
import os
import sys
import types
from unittest.mock import AsyncMock, patch

# Ensure apps/ai-service is on sys.path
AI_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if AI_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AI_SERVICE_DIR)

# Reconfigure stdout to utf-8 if supported on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ---------------------------------------------------------------------------
# Lightweight stdlib fallback shims for environments without third-party deps
# ---------------------------------------------------------------------------
try:
    import structlog
except ImportError:
    class _DummyLogger:
        def info(self, *a, **kw): pass
        def warning(self, *a, **kw): pass
        def error(self, *a, **kw): pass
        def bind(self, *a, **kw): return self

    _mod = types.ModuleType("structlog")
    _mod.get_logger = lambda *a, **kw: _DummyLogger()
    sys.modules["structlog"] = _mod

try:
    import agent_framework
except ImportError:
    _af_mod = types.ModuleType("agent_framework")

    class _DummyFunctionInvocationContext:
        def __init__(self, agent_role=None):
            self.agent_role = agent_role

    class _DummyFunctionTool:
        def __init__(self, name="", description="", func=None, input_model=None):
            self.name = name
            self.description = description
            self.func = func
            self.input_model = input_model

    _af_mod.FunctionInvocationContext = _DummyFunctionInvocationContext
    _af_mod.FunctionTool = _DummyFunctionTool
    sys.modules["agent_framework"] = _af_mod

try:
    import pydantic
except ImportError:
    _p_mod = types.ModuleType("pydantic")

    class _DummyBaseModel:
        def __init__(self, **kw):
            for k, v in self.__class__.__dict__.items():
                if not k.startswith("_") and not callable(v):
                    setattr(self, k, v)
            for k, v in kw.items():
                setattr(self, k, v)

    def _dummy_field(*args, **kwargs):
        if "default" in kwargs:
            return kwargs["default"]
        if "default_factory" in kwargs and callable(kwargs["default_factory"]):
            return kwargs["default_factory"]()
        return None

    _p_mod.BaseModel = _DummyBaseModel
    _p_mod.Field = _dummy_field
    sys.modules["pydantic"] = _p_mod
    pydantic = _p_mod

try:
    import pydantic_settings
except ImportError:
    _ps_mod = types.ModuleType("pydantic_settings")

    class _DummyBaseSettings(getattr(pydantic, "BaseModel", object)):
        pass

    class _DummySettingsConfigDict(dict):
        pass

    _ps_mod.BaseSettings = _DummyBaseSettings
    _ps_mod.SettingsConfigDict = _DummySettingsConfigDict
    sys.modules["pydantic_settings"] = _ps_mod

from src.tools.definitions.store_suite import (
    BotAutomationManageInput,
    FacebookPagesConnectedListInput,
    ReturnsSettingsManageInput,
    UnifiedInboxManageInput,
    bot_automation_manage,
    facebook_pages_connected_list,
    returns_settings_manage,
    unified_inbox_manage,
)


def _run_async(coro):
    return asyncio.run(coro)


# ── GET_REASONS Defensive Parsing Tests (Ticket AGENT-FIX-0d Core) ───────────


def test_get_reasons_with_raw_list():
    """Case (a): Backend returns a raw list directly without a dict wrapper."""
    raw_list = [
        {"id": "r1", "name": "منتج معيب أو تالف"},
        {"id": "r2", "name": "مقاس غير مناسب"},
    ]
    mock_client = AsyncMock()
    mock_client._request.return_value = raw_list

    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        inp = ReturnsSettingsManageInput(action="GET_REASONS", company_id="test_co_1")
        res = _run_async(returns_settings_manage(inp))

    assert res["success"] is True, f"Expected success=True, got {res}"
    assert res["action"] == "GET_REASONS"
    assert isinstance(res["reasons"], list), f"Expected list, got {type(res['reasons'])}"
    assert len(res["reasons"]) == 2
    assert res["reasons"][0]["id"] == "r1"
    assert res["reasons"][1]["name"] == "مقاس غير مناسب"


def test_get_reasons_with_dict_containing_data_list():
    """Case (b): Backend returns a dict with 'data' key as a list."""
    dict_with_data = {
        "data": [
            {"id": "r3", "name": "استلمت منتج مختلف"},
        ]
    }
    mock_client = AsyncMock()
    mock_client._request.return_value = dict_with_data

    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        inp = ReturnsSettingsManageInput(action="GET_REASONS", company_id="test_co_1")
        res = _run_async(returns_settings_manage(inp))

    assert res["success"] is True, f"Expected success=True, got {res}"
    assert res["action"] == "GET_REASONS"
    assert isinstance(res["reasons"], list), f"Expected list, got {type(res['reasons'])}"
    assert len(res["reasons"]) == 1
    assert res["reasons"][0]["id"] == "r3"


def test_get_reasons_with_dict_containing_reasons_key():
    """Case (c): Backend returns a dict with 'reasons' key as a list."""
    dict_with_reasons = {
        "reasons": [
            {"id": "r4", "name": "تأخر الشحن عن الموعد"},
            {"id": "r5", "name": "غير مطابق للوصف"},
        ]
    }
    mock_client = AsyncMock()
    mock_client._request.return_value = dict_with_reasons

    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        inp = ReturnsSettingsManageInput(action="GET_REASONS", company_id="test_co_1")
        res = _run_async(returns_settings_manage(inp))

    assert res["success"] is True, f"Expected success=True, got {res}"
    assert res["action"] == "GET_REASONS"
    assert isinstance(res["reasons"], list), f"Expected list, got {type(res['reasons'])}"
    assert len(res["reasons"]) == 2
    assert res["reasons"][0]["id"] == "r4"
    assert res["reasons"][1]["id"] == "r5"


def test_get_reasons_with_nested_dict_data_reasons():
    """Case (d): Backend returns a dict where 'data' is an inner dict containing 'reasons'."""
    nested = {
        "data": {
            "reasons": [
                {"id": "r6", "name": "إلغاء من قبل العميل"},
            ]
        }
    }
    mock_client = AsyncMock()
    mock_client._request.return_value = nested

    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        inp = ReturnsSettingsManageInput(action="GET_REASONS", company_id="test_co_1")
        res = _run_async(returns_settings_manage(inp))

    assert res["success"] is True
    assert isinstance(res["reasons"], list)
    assert len(res["reasons"]) == 1
    assert res["reasons"][0]["id"] == "r6"


def test_get_reasons_with_dict_containing_items_key():
    """Case (e): Backend returns a dict with 'items' key as a list."""
    dict_with_items = {
        "items": [
            {"id": "r7", "name": "تكرار الطلب بالخطأ"},
        ]
    }
    mock_client = AsyncMock()
    mock_client._request.return_value = dict_with_items

    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        inp = ReturnsSettingsManageInput(action="GET_REASONS", company_id="test_co_1")
        res = _run_async(returns_settings_manage(inp))

    assert res["success"] is True
    assert isinstance(res["reasons"], list)
    assert len(res["reasons"]) == 1
    assert res["reasons"][0]["id"] == "r7"


def test_get_reasons_with_empty_list():
    """Edge Case: Backend returns an empty list."""
    mock_client = AsyncMock()
    mock_client._request.return_value = []

    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        inp = ReturnsSettingsManageInput(action="GET_REASONS", company_id="test_co_1")
        res = _run_async(returns_settings_manage(inp))

    assert res["success"] is True
    assert isinstance(res["reasons"], list)
    assert res["reasons"] == []


def test_get_reasons_with_empty_dict():
    """Edge Case: Backend returns an empty dict without data/reasons/items keys."""
    mock_client = AsyncMock()
    mock_client._request.return_value = {}

    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        inp = ReturnsSettingsManageInput(action="GET_REASONS", company_id="test_co_1")
        res = _run_async(returns_settings_manage(inp))

    assert res["success"] is True
    assert isinstance(res["reasons"], list)
    assert res["reasons"] == []


def test_get_reasons_with_unexpected_type():
    """Edge Case: Backend returns None or string unexpectedly."""
    for bad_val in (None, "unexpected string", 12345):
        mock_client = AsyncMock()
        mock_client._request.return_value = bad_val

        with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
            inp = ReturnsSettingsManageInput(action="GET_REASONS", company_id="test_co_1")
            res = _run_async(returns_settings_manage(inp))

        assert res["success"] is True
        assert isinstance(res["reasons"], list), f"Expected list for {bad_val}, got {type(res['reasons'])}"
        assert res["reasons"] == []


# ── GET_SETTINGS Defensive Parsing Tests ─────────────────────────────────────


def test_get_settings_with_raw_dict_and_list():
    """ReturnsSettingsManage GET_SETTINGS handles both dict and list responses safely."""
    # 1. Dict with data
    mock_client = AsyncMock()
    mock_client._request.return_value = {"data": {"allowReturns": True, "returnWindowDays": 14}}
    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        res = _run_async(returns_settings_manage(ReturnsSettingsManageInput(action="GET_SETTINGS")))
    assert res["success"] is True
    assert res["settings"] == {"allowReturns": True, "returnWindowDays": 14}

    # 2. Raw list response
    mock_client._request.return_value = [{"key": "policy", "value": "14d"}]
    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        res = _run_async(returns_settings_manage(ReturnsSettingsManageInput(action="GET_SETTINGS")))
    assert res["success"] is True
    assert isinstance(res["settings"], list)


# ── bot_automation_manage Defensive Parsing Tests ─────────────────────────────


def test_bot_automation_manage_read_safe():
    """Bot automation read safely parses dict and list responses."""
    # 1. Dict with data
    mock_client = AsyncMock()
    mock_client._request.return_value = {"data": {"welcomeEnabled": True, "channels": ["WHATSAPP"]}}
    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        res = _run_async(bot_automation_manage(BotAutomationManageInput(action="READ")))
    assert res["success"] is True
    assert res["settings"] == {"welcomeEnabled": True, "channels": ["WHATSAPP"]}

    # 2. Raw list response (never crashes)
    mock_client._request.return_value = [{"channel": "WHATSAPP", "enabled": True}]
    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        res = _run_async(bot_automation_manage(BotAutomationManageInput(action="READ")))
    assert res["success"] is True
    assert isinstance(res["settings"], list)


# ── unified_inbox_manage Defensive Parsing Tests ──────────────────────────────


def test_unified_inbox_manage_safe():
    """Unified inbox stats & conversations safely parse dict and list responses."""
    mock_client = AsyncMock()

    # GET_STATS with list
    mock_client._request.return_value = [{"channel": "WHATSAPP", "unread": 5}]
    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        res = _run_async(unified_inbox_manage(UnifiedInboxManageInput(action="GET_STATS")))
    assert res["success"] is True
    assert isinstance(res["stats"], list)

    # LIST_CONVERSATIONS with list
    mock_client._request.return_value = [{"id": "conv_1", "customer": "Ahmed"}]
    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        res = _run_async(unified_inbox_manage(UnifiedInboxManageInput(action="LIST_CONVERSATIONS")))
    assert res["success"] is True
    assert isinstance(res["conversations"], list)


# ── facebook_pages_connected_list Defensive Parsing Tests ─────────────────────


def test_facebook_pages_connected_list_safe():
    """Facebook pages list safely handles list response without calling .get() on list."""
    mock_client = AsyncMock()

    # 1. Backend returns raw list
    mock_client._request.return_value = [{"id": "page_123", "name": "Store Page"}]
    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        res = _run_async(facebook_pages_connected_list(FacebookPagesConnectedListInput()))
    assert res["success"] is True
    assert isinstance(res["pages"], list)
    assert len(res["pages"]) == 1
    assert res["pages"][0]["id"] == "page_123"

    # 2. Backend returns dict with pages key
    mock_client._request.return_value = {"pages": [{"id": "page_456", "name": "Branch Page"}]}
    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        res = _run_async(facebook_pages_connected_list(FacebookPagesConnectedListInput()))
    assert res["success"] is True
    assert isinstance(res["pages"], list)
    assert len(res["pages"]) == 1
    assert res["pages"][0]["id"] == "page_456"

    # 3. Backend returns dict with data key
    mock_client._request.return_value = {"data": [{"id": "page_789"}]}
    with patch("src.tools.definitions.store_suite.get_backend_client", return_value=mock_client):
        res = _run_async(facebook_pages_connected_list(FacebookPagesConnectedListInput()))
    assert res["success"] is True
    assert isinstance(res["pages"], list)
    assert len(res["pages"]) == 1


if __name__ == "__main__":
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    failed = 0
    print(f"Running {len(tests)} tests for store suite and safe endpoint parsing (AGENT-FIX-0d)...\n")
    for name, fn in tests:
        try:
            fn()
            print(f"PASS  {name}")
        except Exception as exc:
            failed += 1
            print(f"FAIL  {name}: {exc}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    sys.exit(1 if failed else 0)
