"""Unit tests for src/tools/capability_policy.py.

Pure stdlib + asserts, so the same file runs both ways:
  * CI:            pytest tests/tools/test_capability_policy.py
  * no deps here:  python tests/tools/test_capability_policy.py
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.tools.capability_policy import (  # noqa: E402
    active_app_slugs_from,
    app_slug_of,
    filter_exposed_rows,
    row_is_exposed,
)


def row(**kw):
    base = {
        "name": "returns_requests_list",
        "domain": "returns",
        "app_slug": "order-core",
        "roles": ["STORE_MANAGER", "EXECUTIVE_ASSISTANT"],
        "exposure_state": "active",
    }
    base.update(kw)
    return base


class Obj:
    """ORM-shaped row (attribute access, not dict)."""

    def __init__(self, **kw):
        self.__dict__.update(kw)


def test_role_mismatch_is_advisory_by_default():
    # Live pipeline unions catalog roles with role_tools.yaml, so the index
    # must not hide a row that the role's YAML grants.
    r = row(roles=["STORE_MANAGER"])
    assert row_is_exposed(r, role="EXECUTIVE_ASSISTANT", active_app_slugs={"order-core"}) is True


def test_role_mismatch_hidden_in_strict_mode():
    r = row(roles=["STORE_MANAGER"])
    assert row_is_exposed(
        r, role="EXECUTIVE_ASSISTANT", active_app_slugs={"order-core"}, strict_roles=True,
    ) is False
    assert row_is_exposed(
        r, role="STORE_MANAGER", active_app_slugs={"order-core"}, strict_roles=True,
    ) is True


def test_unscoped_row_passes_for_any_role():
    assert row_is_exposed(row(roles=[]), role="EXECUTIVE_ASSISTANT", active_app_slugs={"order-core"})


def test_strict_mode_drops_rows_without_role_context():
    assert row_is_exposed(
        row(roles=["EXECUTIVE_ASSISTANT"]), role=None, active_app_slugs={"order-core"}, strict_roles=True,
    ) is False
    assert row_is_exposed(row(roles=[]), role=None, active_app_slugs={"order-core"}, strict_roles=True) is True


def test_forbidden_prefix_hides_hr_capability():
    r = row(name="hr_employees_list", domain="staff", app_slug="hr-core")
    assert row_is_exposed(r, role="EXECUTIVE_ASSISTANT", active_app_slugs={"hr-core"}) is False


def test_forbidden_prefix_survives_dotted_names():
    r = row(name="hr.employees.list", domain="staff", app_slug="hr-core")
    assert row_is_exposed(r, role="EXECUTIVE_ASSISTANT", active_app_slugs={"hr-core"}) is False


def test_forbidden_domain_block():
    r = row(name="bridge_get_treasury_expenses", domain="treasury", app_slug="treasury-expenses")
    assert row_is_exposed(
        r, role="EXECUTIVE_ASSISTANT", active_app_slugs={"treasury-expenses"},
        forbidden_domains=("treasury",),
    ) is False


def test_app_not_installed_is_hidden():
    r = row(app_slug="hr-core")
    assert row_is_exposed(r, role="EXECUTIVE_ASSISTANT", active_app_slugs={"order-core"}) is False


def test_app_installed_is_visible():
    r = row(app_slug="order-core")
    assert row_is_exposed(r, role="EXECUTIVE_ASSISTANT", active_app_slugs={"order-core"}) is True


def test_unknown_activation_fails_open_only_on_app_check():
    r = row(app_slug="hr-core")
    # apps unknown → app check skipped, role check still applies
    assert row_is_exposed(r, role="STORE_MANAGER", active_app_slugs=None) is True
    # ... but the forbidden prefix still hides HR
    r2 = row(name="hr_employees_list", app_slug="hr-core")
    assert row_is_exposed(r2, role="STORE_MANAGER", active_app_slugs=None) is False


def test_known_empty_app_set_hides_app_bound_rows():
    assert row_is_exposed(row(app_slug="order-core"), role="EXECUTIVE_ASSISTANT", active_app_slugs=set()) is False


def test_unbound_row_ignores_app_set():
    assert row_is_exposed(row(app_slug=None), role="EXECUTIVE_ASSISTANT", active_app_slugs=set()) is True


def test_inactive_state_is_hidden():
    assert row_is_exposed(row(exposure_state="draft"), role="EXECUTIVE_ASSISTANT", active_app_slugs={"order-core"}) is False
    assert row_is_exposed(row(exposure_state="hidden"), role="EXECUTIVE_ASSISTANT", active_app_slugs={"order-core"}) is False


def test_orm_objects_are_supported():
    r = Obj(name="returns_requests_list", domain="returns", app_slug="order-core",
            roles=["EXECUTIVE_ASSISTANT"], exposure_state="active")
    assert row_is_exposed(r, role="EXECUTIVE_ASSISTANT", active_app_slugs={"order-core"}) is True


def test_filter_preserves_order_and_drops_denied():
    rows = [
        row(name="a_read"),
        row(name="hr_employees_list", app_slug="hr-core"),
        row(name="b_read", app_slug="order-core"),
    ]
    out = filter_exposed_rows(rows, role="EXECUTIVE_ASSISTANT", active_app_slugs={"order-core"})
    assert [r["name"] for r in out] == ["a_read", "b_read"]


def test_app_slug_shapes_from_my_apps():
    assert app_slug_of({"app": {"slug": "order-core"}}) == "order-core"
    assert app_slug_of({"appSlug": "hr-core"}) == "hr-core"
    assert app_slug_of({"slug": "treasury-expenses"}) == "treasury-expenses"
    assert app_slug_of({"name": "no slug"}) == ""


def test_active_app_slugs_skips_expired_and_dedupes():
    apps = [
        {"app": {"slug": "order-core"}, "status": "ACTIVE"},
        {"app": {"slug": "order-core"}, "status": "ACTIVE"},
        {"app": {"slug": "hr-core"}, "status": "EXPIRED"},
        {"app": {"slug": "treasury-expenses"}, "status": "TRIAL"},
    ]
    assert active_app_slugs_from(apps) == {"order-core", "treasury-expenses"}
    assert active_app_slugs_from(None) is None
    assert active_app_slugs_from([]) == set()


if __name__ == "__main__":
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    failed = 0
    for name, fn in tests:
        try:
            fn()
            print(f"PASS  {name}")
        except AssertionError as exc:
            failed += 1
            print(f"FAIL  {name}: {exc}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    sys.exit(1 if failed else 0)
