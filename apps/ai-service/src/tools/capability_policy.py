"""Pure exposure policy for catalog capabilities.

`store_capability` is the single door to every DB-catalogued capability, so the
filtering that decides **what an agent may even see** must live in one place,
be side-effect free, and be unit-testable without a database, pydantic or the
agent framework.

Rules (all fail-closed except where stated):

* ``exposure_state`` must be ``active``.
* ``role`` — two modes:
  - ``strict_roles=False`` (default, matches the live pipeline): catalog
    ``roles`` are **advisory** — the pipeline unions them with
    ``role_tools.yaml``, so a row that says ``["STORE_MANAGER"]`` still
    reaches a role whose YAML lists it. The index therefore relies on the
    deny-lists below, not on the row's role list.
  - ``strict_roles=True``: a row with a non-empty ``roles`` list is only
    exposed to those roles (use for surfaces that must be opt-in).
* ``forbidden_prefixes`` — the role's ``approval_policy.forbidden_prefixes``
  (e.g. ``hr_``) is applied to the canonical capability name.
* ``forbidden_domains`` — the role's ``approval_policy.forbidden_domains``
  (e.g. ``staff``, ``payroll``) blocks the whole catalog domain.

* ``app_slug`` — a row bound to an app is exposed only when the company has
  that app installed and valid. ``active_app_slugs=None`` means "activation
  unknown" and **disables only this check** (documented fail-open): silencing
  every capability because one backend call failed would break the agent,
  while role and prefix checks stay enforced.
* ``active_app_slugs=set()`` (known: no apps) hides every app-bound row.
"""

from __future__ import annotations

from typing import Any, Iterable

DEFAULT_FORBIDDEN_PREFIXES: tuple[str, ...] = ("hr_", "payroll_", "internal_")

_VALID_STATUSES = {"ACTIVE", "TRIAL", "active", "trial"}


def canonical_name(name: str | None) -> str:
    """Registry/canonical form of a capability name (dots → underscores)."""
    return str(name or "").strip().replace(".", "_").lower()


def _field(row: Any, name: str, default: Any = None) -> Any:
    """Read a field from a mapping or an ORM object."""
    if isinstance(row, dict):
        return row.get(name, default)
    return getattr(row, name, default)


def app_slug_of(app: Any) -> str:
    """Extract the marketplace slug from any of the shapes /my-apps returns."""
    if not isinstance(app, dict):
        return ""
    nested = app.get("app") if isinstance(app.get("app"), dict) else {}
    for candidate in (
        nested.get("slug"),
        app.get("appSlug"),
        app.get("app_slug"),
        app.get("slug"),
    ):
        if candidate:
            return str(candidate).strip().lower()
    return ""


def active_app_slugs_from(apps: Iterable[Any] | None) -> set[str] | None:
    """Lower-cased slugs of the company's installed, valid apps.

    ``None`` means the activation list could not be loaded (fail-open by the
    caller's choice); an empty set means the company genuinely has none.
    """
    if apps is None:
        return None
    slugs: set[str] = set()
    for app in apps:
        status = str((app or {}).get("status") or "").strip() if isinstance(app, dict) else ""
        if status and status not in _VALID_STATUSES:
            continue
        slug = app_slug_of(app)
        if slug:
            slugs.add(slug)
    return slugs


def row_is_exposed(
    row: Any,
    *,
    role: str | None,
    active_app_slugs: set[str] | None,
    forbidden_prefixes: Iterable[str] = DEFAULT_FORBIDDEN_PREFIXES,
    forbidden_domains: Iterable[str] = (),
    strict_roles: bool = False,
) -> bool:
    """True when the agent role may see/execute this capability row."""
    state = str(_field(row, "exposure_state", "active") or "active").lower()
    if state != "active":
        return False

    name = canonical_name(_field(row, "name"))

    prefixes = tuple(str(p).lower() for p in forbidden_prefixes if str(p).strip())
    if name and prefixes and name.startswith(prefixes):
        return False

    domain = str(_field(row, "domain", "") or "").lower()
    if domain and domain in {str(d).lower() for d in forbidden_domains}:
        return False

    roles = _field(row, "roles") or []
    if strict_roles and roles:
        allowed = {str(r).strip().upper() for r in roles}
        if not role or str(role).strip().upper() not in allowed:
            return False

    app_slug = str(_field(row, "app_slug", "") or "").strip().lower()
    if app_slug and active_app_slugs is not None and app_slug not in active_app_slugs:
        return False

    return True


def filter_exposed_rows(
    rows: Iterable[Any],
    *,
    role: str | None,
    active_app_slugs: set[str] | None,
    forbidden_prefixes: Iterable[str] = DEFAULT_FORBIDDEN_PREFIXES,
    forbidden_domains: Iterable[str] = (),
    strict_roles: bool = False,
) -> list[Any]:
    """Apply :func:`row_is_exposed` to every row, preserving order."""
    return [
        row
        for row in rows
        if row_is_exposed(
            row,
            role=role,
            active_app_slugs=active_app_slugs,
            forbidden_prefixes=forbidden_prefixes,
            forbidden_domains=forbidden_domains,
            strict_roles=strict_roles,
        )
    ]
