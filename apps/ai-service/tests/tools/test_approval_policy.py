"""Unit and integration tests for approval_policy.py and conditional write-approval gate (AGENT-FIX-0b).

Pure stdlib + asserts, runnable both ways:
  * CI:            pytest tests/tools/test_approval_policy.py
  * standalone:    python tests/tools/test_approval_policy.py
"""

from __future__ import annotations

import ast
import importlib.util
import os
import sys

# Ensure apps/ai-service is on sys.path
_AI_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, _AI_SERVICE_DIR)

# Reconfigure stdout to utf-8 if supported on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ---------------------------------------------------------------------------
# Import approval_policy (direct or via importlib spec in pure-stdlib standalone)
# ---------------------------------------------------------------------------
try:
    from src.pipeline.approval_policy import CONDITIONAL_READ_ACTIONS, is_read_action
except ImportError:
    _policy_path = os.path.join(_AI_SERVICE_DIR, "src", "pipeline", "approval_policy.py")
    _spec = importlib.util.spec_from_file_location("src.pipeline.approval_policy", _policy_path)
    if _spec is None or _spec.loader is None:
        raise RuntimeError(f"Could not load spec for {_policy_path}")
    _mod = importlib.util.module_from_spec(_spec)
    sys.modules["src.pipeline.approval_policy"] = _mod
    _spec.loader.exec_module(_mod)
    CONDITIONAL_READ_ACTIONS = _mod.CONDITIONAL_READ_ACTIONS
    is_read_action = _mod.is_read_action

# ---------------------------------------------------------------------------
# Resolve WRITE_TOOL_NAMES (import or AST-parse in lightweight standalone)
# ---------------------------------------------------------------------------
try:
    from src.tools.registry import WRITE_TOOL_NAMES
except Exception:
    _reg_path = os.path.join(_AI_SERVICE_DIR, "src", "tools", "registry.py")
    with open(_reg_path, "r", encoding="utf-8") as _f:
        _tree = ast.parse(_f.read(), filename=_reg_path)
    WRITE_TOOL_NAMES = set()
    for _node in ast.walk(_tree):
        if isinstance(_node, (ast.Assign, ast.AnnAssign)):
            target = getattr(_node, "target", None) or (_node.targets[0] if getattr(_node, "targets", None) else None)
            if getattr(target, "id", None) == "WRITE_TOOL_NAMES" and isinstance(_node.value, ast.Set):
                for _elt in _node.value.elts:
                    if isinstance(_elt, ast.Constant):
                        WRITE_TOOL_NAMES.add(_elt.value)


def _evaluate_write_approval(func_name: str, arguments: dict, approval_mode: str = "never_require") -> bool:
    """Replicates the exact approval gate logic from skills_pipeline.py."""
    is_write_approval = (
        func_name in WRITE_TOOL_NAMES
        or approval_mode == "always_require"
    )
    if func_name in WRITE_TOOL_NAMES and is_read_action(func_name, arguments):
        is_write_approval = False
    if func_name == "manage_agent_skill" and arguments.get("action") == "get":
        is_write_approval = False
    return is_write_approval


# ===========================================================================
# 1. Unit Tests for is_read_action
# ===========================================================================

def test_returns_settings_manage_get_settings_is_read():
    """returns_settings_manage + GET_SETTINGS is provably a read."""
    assert is_read_action("returns_settings_manage", {"action": "GET_SETTINGS"}) is True


def test_returns_settings_manage_get_reasons_is_read():
    """returns_settings_manage + GET_REASONS is provably a read."""
    assert is_read_action("returns_settings_manage", {"action": "GET_REASONS"}) is True


def test_returns_settings_manage_update_settings_is_not_read():
    """returns_settings_manage + UPDATE_SETTINGS is a write (not a read)."""
    assert is_read_action("returns_settings_manage", {"action": "UPDATE_SETTINGS"}) is False


def test_returns_settings_manage_missing_action_fails_closed():
    """returns_settings_manage without action fails closed (False)."""
    assert is_read_action("returns_settings_manage", {}) is False
    assert is_read_action("returns_settings_manage", {"action": None}) is False


def test_bot_automation_manage_read_is_read():
    """bot_automation_manage + READ is provably a read."""
    assert is_read_action("bot_automation_manage", {"action": "READ"}) is True


def test_bot_automation_manage_update_is_not_read():
    """bot_automation_manage + UPDATE is a write (not a read)."""
    assert is_read_action("bot_automation_manage", {"action": "UPDATE"}) is False


def test_normal_write_tool_is_never_read():
    """Regular write tools (e.g. order_cancel) always return False regardless of action."""
    assert is_read_action("order_cancel", {"action": "READ"}) is False
    assert is_read_action("order_cancel", {"action": "GET_SETTINGS"}) is False
    assert is_read_action("product_update_price", {"action": "READ"}) is False
    assert is_read_action("orders_bulk_status_update", {"action": "GET_SETTINGS"}) is False


def test_action_case_insensitivity_and_whitespace():
    """Lower-case and surrounded-by-whitespace actions are accepted."""
    assert is_read_action("bot_automation_manage", {"action": "read"}) is True
    assert is_read_action("bot_automation_manage", {"action": "  READ  "}) is True
    assert is_read_action("returns_settings_manage", {"action": "get_settings"}) is True
    assert is_read_action("returns_settings_manage", {"action": "  GET_REASONS  "}) is True


def test_action_non_string_types_fail_closed():
    """Non-string action values (int, list, dict) fail closed (False)."""
    assert is_read_action("returns_settings_manage", {"action": 123}) is False
    assert is_read_action("bot_automation_manage", {"action": 123}) is False
    assert is_read_action("bot_automation_manage", {"action": ["READ"]}) is False
    assert is_read_action("returns_settings_manage", {"action": {"type": "read"}}) is False


def test_arguments_non_dict_fails_closed():
    """Non-dict arguments (None, list, string) fail closed (False)."""
    assert is_read_action("returns_settings_manage", None) is False
    assert is_read_action("returns_settings_manage", "GET_SETTINGS") is False
    assert is_read_action("returns_settings_manage", [1, 2, 3]) is False


def test_unknown_action_fails_closed():
    """Unknown or empty actions fail closed (False)."""
    assert is_read_action("returns_settings_manage", {"action": ""}) is False
    assert is_read_action("returns_settings_manage", {"action": "   "}) is False
    assert is_read_action("returns_settings_manage", {"action": "DELETE_ALL"}) is False
    assert is_read_action("bot_automation_manage", {"action": "PURGE"}) is False


# ===========================================================================
# 2. Pipeline Gate & Invariance Tests
# ===========================================================================

def test_tools_remain_in_write_tool_names():
    """Invariance rule: both tools MUST stay in WRITE_TOOL_NAMES."""
    assert "returns_settings_manage" in WRITE_TOOL_NAMES
    assert "bot_automation_manage" in WRITE_TOOL_NAMES


def test_pipeline_gate_returns_settings_read_requires_no_approval():
    """GET_SETTINGS and GET_REASONS must bypass approval gate."""
    assert _evaluate_write_approval("returns_settings_manage", {"action": "GET_SETTINGS"}) is False
    assert _evaluate_write_approval("returns_settings_manage", {"action": "GET_REASONS"}) is False
    assert _evaluate_write_approval("returns_settings_manage", {"action": "get_settings"}) is False


def test_pipeline_gate_returns_settings_update_requires_approval():
    """UPDATE_SETTINGS on returns_settings_manage must require merchant approval."""
    assert _evaluate_write_approval("returns_settings_manage", {"action": "UPDATE_SETTINGS"}) is True


def test_pipeline_gate_returns_settings_missing_action_requires_approval():
    """Missing or empty action on returns_settings_manage must require approval (fail-closed)."""
    assert _evaluate_write_approval("returns_settings_manage", {}) is True
    assert _evaluate_write_approval("returns_settings_manage", {"action": 123}) is True


def test_pipeline_gate_bot_automation_read_requires_no_approval():
    """READ action on bot_automation_manage must bypass approval gate."""
    assert _evaluate_write_approval("bot_automation_manage", {"action": "READ"}) is False
    assert _evaluate_write_approval("bot_automation_manage", {"action": "read"}) is False


def test_pipeline_gate_bot_automation_update_requires_approval():
    """UPDATE action on bot_automation_manage must require merchant approval."""
    assert _evaluate_write_approval("bot_automation_manage", {"action": "UPDATE"}) is True


def test_pipeline_gate_order_cancel_always_requires_approval():
    """Normal write tools like order_cancel always require approval."""
    assert _evaluate_write_approval("order_cancel", {"order_number": "1001", "reason": "damaged"}) is True
    assert _evaluate_write_approval("order_cancel", {"action": "READ"}) is True


def test_skills_pipeline_source_contains_gate_hook():
    """Verify that skills_pipeline.py source code actually invokes is_read_action."""
    pipe_path = os.path.join(_AI_SERVICE_DIR, "src", "pipeline", "stages", "skills_pipeline.py")
    with open(pipe_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "from src.pipeline.approval_policy import is_read_action" in content
    assert "if func_name in WRITE_TOOL_NAMES and is_read_action(func_name, arguments):" in content
    assert "is_write_approval = False" in content


# ===========================================================================
# Standalone Runner
# ===========================================================================

if __name__ == "__main__":
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    failed = 0
    print(f"Running {len(tests)} tests for approval_policy...")
    print()
    for name, fn in tests:
        try:
            fn()
            print(f"PASS  {name}")
        except AssertionError as exc:
            failed += 1
            print(f"FAIL  {name}: {exc}")
        except Exception as exc:
            failed += 1
            print(f"ERROR {name}: {exc}")
    print()
    print(f"{len(tests) - failed}/{len(tests)} passed")
    sys.exit(1 if failed else 0)
