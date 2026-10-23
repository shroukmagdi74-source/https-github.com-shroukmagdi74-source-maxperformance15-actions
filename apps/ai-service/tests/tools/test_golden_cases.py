"""Unit and integration tests for golden eval cases (AGENT-COV-5b).

Pure stdlib + asserts, runnable both ways:
  * CI:            pytest tests/tools/test_golden_cases.py
  * standalone:    python tests/tools/test_golden_cases.py
"""
from __future__ import annotations

import copy
import os
import sys
from pathlib import Path

# Ensure apps/ai-service is on sys.path
AI_SERVICE_DIR = Path(__file__).resolve().parents[2]
REPO_ROOT = Path(__file__).resolve().parents[4]
if str(AI_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_DIR))

# Reconfigure stdout to utf-8 if supported on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from src.evals.golden_cases import known_capabilities, load_cases, validate
from src.tools.app_cards import APP_CARDS


GOLDEN_FILE = AI_SERVICE_DIR / "evals" / "golden" / "app_cases.json"


def test_real_golden_cases_validate_clean():
    """Verify that the production app_cases.json validates with 0 errors."""
    assert GOLDEN_FILE.exists(), f"Golden cases file missing at {GOLDEN_FILE}"

    data = load_cases(GOLDEN_FILE)
    cases = data.get("cases", [])
    assert isinstance(cases, list)
    assert len(cases) >= 81, f"Expected at least 81 cases, found {len(cases)}"

    known = known_capabilities(REPO_ROOT)
    assert len(known) >= 50, f"Expected at least 50 known capabilities, found {len(known)}"

    errors = validate(data, known, APP_CARDS.keys())
    if errors:
        error_msg = "\n".join(f"  - {err}" for err in errors)
        assert False, f"Golden cases failed validation with {len(errors)} error(s):\n{error_msg}"


def test_coverage_all_27_slugs_at_least_three_cases():
    """Verify that every single required app card has at least 3 golden cases."""
    data = load_cases(GOLDEN_FILE)
    cases = data.get("cases", [])

    by_app: dict[str, list[dict]] = {}
    for c in cases:
        app = c.get("app")
        by_app.setdefault(app, []).append(c)

    known = known_capabilities(REPO_ROOT)

    for slug in APP_CARDS.keys():
        app_cases = by_app.get(slug, [])
        assert len(app_cases) >= 3, (
            f"App '{slug}' has only {len(app_cases)} golden case(s); expected >= 3"
        )

        # Check if the app has a write capability in WRITE_TOOL_NAMES among known capabilities
        app_has_write = any(
            known.get(cap, {}).get("write")
            for c in app_cases
            for cap in c.get("expected_capabilities", [])
        )
        if app_has_write:
            approval_cases = [c for c in app_cases if c.get("expect_approval") is True]
            assert len(approval_cases) >= 1, (
                f"App '{slug}' contains write capability but has no case with expect_approval=True"
            )


def test_negative_fake_capability():
    """Negative test: A case with an unknown/hallucinated capability must fail validation."""
    data = load_cases(GOLDEN_FILE)
    test_cases = copy.deepcopy(data.get("cases", []))

    # Inject hallucinated capability into the first case
    test_cases[0]["expected_capabilities"].append("hallucinated_fake_tool_xyz123")

    known = known_capabilities(REPO_ROOT)
    errors = validate({"cases": test_cases}, known, APP_CARDS.keys())

    assert len(errors) >= 1, "Expected validation to fail for hallucinated capability, but it passed"
    assert any("hallucinated_fake_tool_xyz123" in err and test_cases[0]["id"] in err for err in errors), (
        f"Error message did not mention the fake tool and case id: {errors}"
    )


def test_negative_write_capability_without_approval():
    """Negative test: A mutating capability with expect_approval=False must fail validation."""
    known = known_capabilities(REPO_ROOT)
    sample_cases = [
        {
            "id": "neg-test-write-no-approval",
            "app": "order-core",
            "question": "الغِي الأوردر رقم 1052 فورا بدون موافقة",
            "expected_capabilities": ["order_cancel"],
            "forbidden_capabilities": [],
            "expect_approval": False,  # ERROR: order_cancel is in WRITE_TOOL_NAMES
        }
    ]

    errors = validate(sample_cases, known, APP_CARDS.keys())
    assert len(errors) >= 1, "Expected validation to fail for write capability with expect_approval=False"
    assert any("order_cancel" in err and "expect_approval" in err and "False" in err for err in errors), (
        f"Expected approval failure error, got: {errors}"
    )


def test_negative_empty_or_short_question():
    """Negative test: Empty or excessively short questions (<8 chars) must fail validation."""
    known = known_capabilities(REPO_ROOT)
    sample_cases = [
        {
            "id": "neg-test-empty-question",
            "app": "order-core",
            "question": "أوردر؟",  # 6 chars < 8 chars
            "expected_capabilities": ["order_summary"],
            "forbidden_capabilities": [],
            "expect_approval": False,
        }
    ]

    errors = validate(sample_cases, known, APP_CARDS.keys())
    assert len(errors) >= 1, "Expected validation to fail for short question"
    assert any("too short" in err for err in errors), f"Expected short question error, got: {errors}"


def test_negative_duplicate_id():
    """Negative test: Duplicate case IDs must be detected and rejected."""
    known = known_capabilities(REPO_ROOT)
    sample_cases = [
        {
            "id": "dup-id-1",
            "app": "order-core",
            "question": "كام أوردر جالي النهاردة في المتجر؟",
            "expected_capabilities": ["order_summary"],
            "forbidden_capabilities": [],
            "expect_approval": False,
        },
        {
            "id": "dup-id-1",  # DUPLICATE
            "app": "order-core",
            "question": "عايز أشوف إجمالي مبيعات اليوم من الطلبات",
            "expected_capabilities": ["order_summary"],
            "forbidden_capabilities": [],
            "expect_approval": False,
        },
    ]

    errors = validate(sample_cases, known, APP_CARDS.keys())
    assert len(errors) >= 1, "Expected validation to fail for duplicate ID"
    assert any("duplicate case id" in err and "dup-id-1" in err for err in errors), (
        f"Expected duplicate id error, got: {errors}"
    )


def test_negative_catalog_app_mismatch():
    """Negative test: A capability bound to one app in catalog cannot be expected for another."""
    known = known_capabilities(REPO_ROOT)
    sample_cases = [
        {
            "id": "mismatch-app-test",
            "app": "coupons-pro",  # WRONG: returns_requests_list is bound to order-core
            "question": "استعرض طلبات المرتجعات المعلقة في النظام",
            "expected_capabilities": ["returns_requests_list"],
            "forbidden_capabilities": [],
            "expect_approval": False,
        }
    ]

    errors = validate(sample_cases, known, APP_CARDS.keys())
    assert len(errors) >= 1, "Expected validation to fail for catalog app mismatch"
    assert any("bound to app 'order-core'" in err for err in errors), (
        f"Expected app mismatch error, got: {errors}"
    )


def run_all_tests() -> int:
    """Standalone test runner displaying comprehensive results and coverage."""
    tests = [
        ("Real Golden Cases Validation", test_real_golden_cases_validate_clean),
        ("27 Apps Coverage (>=3 cases each)", test_coverage_all_27_slugs_at_least_three_cases),
        ("Negative: Hallucinated Capability", test_negative_fake_capability),
        ("Negative: Write Capability Missing Approval", test_negative_write_capability_without_approval),
        ("Negative: Empty / Short Question (<8 chars)", test_negative_empty_or_short_question),
        ("Negative: Duplicate Case ID", test_negative_duplicate_id),
        ("Negative: Catalog App Slug Mismatch", test_negative_catalog_app_mismatch),
    ]

    print("=" * 72)
    print("MaxP AI Service — Golden Cases Test Suite (AGENT-COV-5b)")
    print("=" * 72)

    passed = 0
    failed = 0

    for name, test_func in tests:
        try:
            test_func()
            print(f"  [PASS] {name}")
            passed += 1
        except AssertionError as exc:
            print(f"  [FAIL] {name}: {exc}")
            failed += 1
        except Exception as exc:
            print(f"  [ERROR] {name}: {type(exc).__name__}: {exc}")
            failed += 1

    # Print summary & coverage details
    data = load_cases(GOLDEN_FILE)
    cases = data.get("cases", [])
    by_app = {}
    for c in cases:
        by_app.setdefault(c["app"], []).append(c)

    print("-" * 72)
    print(f"Total Cases:     {len(cases)}")
    print(f"Apps Covered:    {len(by_app)} / {len(APP_CARDS)}")
    write_cases = sum(1 for c in cases if c.get("expect_approval") is True)
    print(f"Write Gate (Approval Required): {write_cases} cases")
    print(f"Test Results:    {passed} passed, {failed} failed")
    print("=" * 72)

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
