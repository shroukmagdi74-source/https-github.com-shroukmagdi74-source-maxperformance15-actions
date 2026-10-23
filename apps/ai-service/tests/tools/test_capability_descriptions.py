"""Unit tests for capability_descriptions.py and drift integration (AGENT-COV-2).

Pure stdlib + asserts, runnable both ways:
  * CI:            pytest tests/tools/test_capability_descriptions.py
  * standalone:    python tests/tools/test_capability_descriptions.py
"""

from __future__ import annotations

import asyncio
import os
import sys
import types

# Ensure apps/ai-service is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

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

    mod = types.ModuleType("structlog")
    mod.get_logger = lambda *a, **kw: _DummyLogger()
    sys.modules["structlog"] = mod

try:
    import sqlalchemy
except ImportError:
    mod = types.ModuleType("sqlalchemy")
    mod.__path__ = []
    mod.select = lambda *a, **kw: None
    sys.modules["sqlalchemy"] = mod

    import src
    src_db = types.ModuleType("src.db")
    src_db.__path__ = []
    src.db = src_db
    sys.modules["src.db"] = src_db

    src_session = types.ModuleType("src.db.session")
    src_session.async_session = None
    src_db.session = src_session
    sys.modules["src.db.session"] = src_session

    src_models = types.ModuleType("src.db.models")
    src_models.__path__ = []
    src_db.models = src_models
    sys.modules["src.db.models"] = src_models

    src_atc = types.ModuleType("src.db.models.agent_tool_catalog")
    class _AgentToolCatalogShim:
        def __init__(self, **kw):
            self.__dict__.update(kw)
    src_atc.AgentToolCatalog = _AgentToolCatalogShim
    src_models.agent_tool_catalog = src_atc
    sys.modules["src.db.models.agent_tool_catalog"] = src_atc

from src.tools.capability_descriptions import (  # noqa: E402
    DOMAIN_ARABIC,
    GET_PROPERTIES,
    describe_capability,
)
from src.tools.drift import run_drift_check  # noqa: E402


class MockCatalogRow:
    """Mock representing an AgentToolCatalog row in tests."""

    def __init__(self, **kw):
        self.name = kw.get("name", "bridge_route")
        self.domain = kw.get("domain", "returns")
        self.description_en = kw.get("description_en", "Auto-discovered backend capability: GET test")
        self.usage_hint_ar = kw.get("usage_hint_ar", None)
        self.endpoint = kw.get("endpoint", "/api/v1/returns/requests")
        self.http_method = kw.get("http_method", "GET")
        self.input_schema = kw.get("input_schema", {"type": "object", "properties": {}})
        self.path_params = kw.get("path_params", [])
        self.permission_key = kw.get("permission_key", None)
        self.app_slug = kw.get("app_slug", None)
        self.risk_level = kw.get("risk_level", "read")
        self.exposure_state = kw.get("exposure_state", "active")
        self.roles = kw.get("roles", [])
        self.source = kw.get("source", "auto")
        self.catalog_metadata = kw.get("catalog_metadata", {})


class MockResult:
    def __init__(self, rows):
        self._rows = rows

    def scalars(self):
        return self

    def all(self):
        return self._rows


class MockSession:
    def __init__(self, rows):
        self.rows = rows
        self.merged = []
        self.committed = False

    async def execute(self, *_a, **_kw):
        return MockResult(self.rows)

    async def merge(self, obj):
        self.merged.append(obj)

    async def commit(self):
        self.committed = True


# =====================================================================
# Unit Tests for describe_capability
# =====================================================================


def test_all_13_domains_return_non_empty_arabic_and_english():
    """Rule 1: All 13 catalog domains must return non-empty Arabic hint and English desc."""
    expected_domains = [
        "returns",
        "invoices",
        "coupons",
        "loyalty",
        "treasury",
        "staff",
        "webhooks",
        "reviews",
        "import_export",
        "order_workflow",
        "affiliates",
        "pixels",
        "landing_pages",
    ]
    for dom in expected_domains:
        assert dom in DOMAIN_ARABIC, f"Domain {dom} missing from DOMAIN_ARABIC dictionary"
        res = describe_capability(
            method="GET",
            path=f"/api/v1/{dom}/list",
            domain=dom,
            permission_key=None,
            app_slug=None,
        )
        assert res["usage_hint_ar"], f"Missing usage_hint_ar for domain {dom}"
        assert res["description_en"], f"Missing description_en for domain {dom}"
        assert len(res["aliases"]) > 0, f"Missing aliases for domain {dom}"
        assert res["input_schema"]["properties"], f"GET schema should have properties for domain {dom}"


def test_get_parameters_and_descriptions():
    """Rule 4: GET requests must receive page, limit, search, status, dateFrom, dateTo with Arabic descriptions."""
    res = describe_capability(
        method="GET",
        path="/api/v1/returns/requests",
        domain="returns",
        permission_key="orders.view",
        app_slug="order-core",
    )
    props = res["input_schema"]["properties"]
    expected_keys = {"page", "limit", "search", "status", "dateFrom", "dateTo"}
    assert set(props.keys()) == expected_keys
    for k in expected_keys:
        assert k in props
        assert "description" in props[k]
        assert len(props[k]["description"].strip()) > 0
        # Verify descriptions are Arabic
        assert any("\u0600" <= c <= "\u06FF" for c in props[k]["description"])
    assert res["input_schema"]["required"] == []


def test_post_put_patch_delete_have_no_parameters():
    """Rule 4: POST/PUT/PATCH/DELETE must remain strictly parameterless (no guessing)."""
    for write_method in ("POST", "PUT", "PATCH", "DELETE"):
        res = describe_capability(
            method=write_method,
            path="/api/v1/coupons",
            domain="coupons",
            permission_key="coupons.create",
            app_slug="coupons-pro",
        )
        assert res["input_schema"] == {"type": "object", "properties": {}}
        assert res["input_schema"]["properties"] == {}
        assert list(res["input_schema"]["properties"].keys()) == []


def test_custom_human_hint_is_never_overwritten():
    """Rule 5: Custom human hint must not be overwritten."""
    custom = "تخصيص يدوي بشري دقيق خاص بمتجر معين"
    res = describe_capability(
        method="GET",
        path="/api/v1/returns/requests",
        domain="returns",
        permission_key=None,
        app_slug=None,
        existing_hint=custom,
    )
    assert res["usage_hint_ar"] == custom


def test_auto_discovered_placeholder_is_overwritten():
    """Rule 5: Generic Auto-discovered hint must be replaced with Arabic description."""
    placeholder = "Auto-discovered backend capability: GET requests"
    res = describe_capability(
        method="GET",
        path="/api/v1/returns/requests",
        domain="returns",
        permission_key=None,
        app_slug=None,
        existing_hint=placeholder,
    )
    assert res["usage_hint_ar"] != placeholder
    assert "طلبات المرتجعات" in res["usage_hint_ar"]


def test_idempotency_describe_capability():
    """Idempotency: Same inputs produce identical outputs every time."""
    out1 = describe_capability(
        method="GET",
        path="/api/v1/returns/requests",
        domain="returns",
        permission_key="orders.read",
        app_slug="order-core",
    )
    out2 = describe_capability(
        method="GET",
        path="/api/v1/returns/requests",
        domain="returns",
        permission_key="orders.read",
        app_slug="order-core",
    )
    assert out1 == out2


def test_exact_ticket_example():
    """Ticket example: GET /api/v1/returns/requests → «قائمة طلبات المرتجعات — اعرض المرتجعات مع فلترة بالفترة والحالة»."""
    res = describe_capability(
        method="GET",
        path="/api/v1/returns/requests",
        domain="returns",
        permission_key=None,
        app_slug=None,
    )
    assert "قائمة طلبات المرتجعات — اعرض المرتجعات مع فلترة بالفترة والحالة" in res["usage_hint_ar"]


def test_item_lookup_by_id():
    """GET with :id or :param should indicate single item details."""
    res = describe_capability(
        method="GET",
        path="/api/v1/invoices/:id",
        domain="invoices",
        permission_key="invoices.read",
        app_slug="billing-core",
    )
    assert "تفاصيل فاتورة" in res["usage_hint_ar"]
    assert "بواسطة المعرف" in res["usage_hint_ar"]


def test_stats_and_settings_paths():
    """Stats and settings paths should be accurately described."""
    stats_res = describe_capability(
        method="GET",
        path="/api/v1/returns/stats",
        domain="returns",
        permission_key=None,
        app_slug=None,
    )
    assert "إحصائيات" in stats_res["usage_hint_ar"]

    settings_res = describe_capability(
        method="GET",
        path="/api/v1/webhooks/settings",
        domain="webhooks",
        permission_key=None,
        app_slug=None,
    )
    assert "إعدادات" in settings_res["usage_hint_ar"]


def test_unknown_domain_fallback():
    """Unknown domains should fallback gracefully without raising an exception."""
    res = describe_capability(
        method="GET",
        path="/api/v1/custom-fleet/vehicles",
        domain="custom_fleet",
        permission_key=None,
        app_slug=None,
    )
    assert res["usage_hint_ar"]
    assert "custom fleet" in res["usage_hint_ar"] or "vehicles" in res["usage_hint_ar"]
    assert res["description_en"]


# =====================================================================
# Acceptance Criteria & Integration Tests
# =====================================================================


def test_acceptance_criterion_1_search_fixture_6_rows():
    """Acceptance 1: On a fixture with 6 rows (returns/invoices/coupons),
    searching 'مرتجعات' returns the returns rows with an Arabic description."""
    # 6 fixture rows
    rows_data = [
        {"method": "GET", "path": "/api/v1/returns/requests", "domain": "returns", "name": "bridge_get_returns_requests"},
        {"method": "GET", "path": "/api/v1/returns/:id", "domain": "returns", "name": "bridge_get_returns_by_id"},
        {"method": "GET", "path": "/api/v1/invoices", "domain": "invoices", "name": "bridge_get_invoices"},
        {"method": "GET", "path": "/api/v1/invoices/summary", "domain": "invoices", "name": "bridge_get_invoices_summary"},
        {"method": "GET", "path": "/api/v1/coupons", "domain": "coupons", "name": "bridge_get_coupons"},
        {"method": "POST", "path": "/api/v1/coupons", "domain": "coupons", "name": "bridge_post_coupons"},
    ]

    fixture_rows = []
    for r in rows_data:
        described = describe_capability(
            method=r["method"],
            path=r["path"],
            domain=r["domain"],
            permission_key=None,
            app_slug=None,
        )
        row = MockCatalogRow(
            name=r["name"],
            domain=r["domain"],
            description_en=described["description_en"],
            usage_hint_ar=described["usage_hint_ar"],
            endpoint=r["path"],
            http_method=r["method"],
            input_schema=described["input_schema"],
            source="auto",
        )
        fixture_rows.append(row)

    # Search logic matching store_capability.py
    def do_search(query: str):
        q = (query or "").strip().lower()
        results = []
        for row in fixture_rows:
            hint = str(getattr(row, "usage_hint_ar", "") or "")
            haystack = f"{row.name} {row.description_en} {row.domain} {hint}".lower()
            if not q or q in haystack or any(w in haystack for w in q.split()):
                results.append({
                    "name": row.name,
                    "domain": row.domain,
                    "description": (hint or row.description_en or "")[:160],
                    "risk": row.risk_level,
                    "parameters": list((row.input_schema or {}).get("properties", {}).keys()),
                })
        return results

    returns_matches = do_search("مرتجعات")
    assert len(returns_matches) == 2, f"Expected 2 returns rows, got {len(returns_matches)}"
    for m in returns_matches:
        assert m["domain"] == "returns"
        assert "مرتجع" in m["description"] or "المرتجعات" in m["description"]
        # Verify description is Arabic
        assert any("\u0600" <= c <= "\u06FF" for c in m["description"])

    invoices_matches = do_search("فواتير")
    assert len(invoices_matches) == 2, f"Expected 2 invoice rows, got {len(invoices_matches)}"
    for m in invoices_matches:
        assert m["domain"] == "invoices"
        assert "فواتير" in m["description"] or "فاتورة" in m["description"]

    coupons_matches = do_search("كوبونات")
    assert len(coupons_matches) == 2, f"Expected 2 coupon rows, got {len(coupons_matches)}"
    for m in coupons_matches:
        assert m["domain"] == "coupons"
        assert "كوبون" in m["description"]


def test_acceptance_criterion_2_post_without_schema_has_no_parameters():
    """Acceptance 2: POST row has no parameters (no guessing)."""
    res = describe_capability(
        method="POST",
        path="/api/v1/coupons",
        domain="coupons",
        permission_key="coupons.create",
        app_slug="coupons-pro",
    )
    assert res["input_schema"]["properties"] == {}
    assert len(res["input_schema"]["properties"]) == 0


async def test_acceptance_criterion_3_self_healing_and_idempotency_in_drift():
    """Acceptance 3: 100% of source='auto' rows have usage_hint_ar filled after first drift cycle,
    and a second cycle is idempotent."""
    # 4 existing auto rows: 2 with None, 1 with empty string, 1 with generic placeholder, 1 curated row
    r1 = MockCatalogRow(name="row1", domain="returns", endpoint="/api/v1/returns/requests", http_method="GET", source="auto", usage_hint_ar=None)
    r2 = MockCatalogRow(name="row2", domain="invoices", endpoint="/api/v1/invoices", http_method="GET", source="auto", usage_hint_ar="")
    r3 = MockCatalogRow(
        name="row3",
        domain="coupons",
        endpoint="/api/v1/coupons",
        http_method="POST",
        source="auto",
        usage_hint_ar="Auto-discovered backend capability: POST coupons",
    )
    r_curated = MockCatalogRow(
        name="row4",
        domain="staff",
        endpoint="/api/v1/staff",
        http_method="GET",
        source="curated",
        usage_hint_ar=None,  # curated row must not be modified by auto-healing
    )

    session = MockSession(rows=[r1, r2, r3, r_curated])

    # Run cycle 1
    await run_drift_check(session, manifest=[])

    # 100% of auto rows must be healed with Arabic hints
    auto_rows = [r1, r2, r3]
    for r in auto_rows:
        assert r.usage_hint_ar is not None, f"Row {r.name} usage_hint_ar still None"
        assert len(r.usage_hint_ar.strip()) > 0, f"Row {r.name} usage_hint_ar is empty"
        assert not r.usage_hint_ar.startswith("Auto-discovered"), f"Row {r.name} still has auto placeholder"
        assert any("\u0600" <= c <= "\u06FF" for c in r.usage_hint_ar), f"Row {r.name} hint is not Arabic"

    # Curated row must not have been touched
    assert r_curated.usage_hint_ar is None

    # GET rows r1 and r2 received GET input_schema
    assert set(r1.input_schema["properties"].keys()) == set(GET_PROPERTIES.keys())
    # POST row r3 received parameterless schema
    assert r3.input_schema["properties"] == {}

    # Snapshot hints after cycle 1
    snapshots = {r.name: (r.usage_hint_ar, r.description_en, dict(r.input_schema)) for r in auto_rows}

    # Run cycle 2 (idempotency check)
    await run_drift_check(session, manifest=[])

    for r in auto_rows:
        expected = snapshots[r.name]
        assert r.usage_hint_ar == expected[0], f"Row {r.name} usage_hint_ar changed on second cycle"
        assert r.description_en == expected[1], f"Row {r.name} description_en changed on second cycle"
        assert r.input_schema == expected[2], f"Row {r.name} input_schema changed on second cycle"


if __name__ == "__main__":
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    failed = 0
    print(f"Running {len(tests)} tests for capability_descriptions...\n")
    for name, fn in tests:
        try:
            if asyncio.iscoroutinefunction(fn):
                asyncio.run(fn())
            else:
                fn()
            print(f"PASS  {name}")
        except AssertionError as exc:
            failed += 1
            print(f"FAIL  {name}: {exc}")
        except Exception as exc:
            failed += 1
            print(f"ERROR {name}: {type(exc).__name__}: {exc}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    sys.exit(1 if failed else 0)
