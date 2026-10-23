"""store_capability — progressive-disclosure meta-tool for catalog
capabilities (the L0/L1 index pattern proven in src/skills/integration.py).

Why: injecting 300 full tool schemas would blow the LLM context (~8-16k
tokens for 57 tools already). Instead agents get ONE compact index tool:
- action="search" → matching capabilities (name, description, risk) from
  ai.agent_tool_catalog active rows, in a few hundred tokens.
- action="execute" → run an active capability through the generic bridge
  (approval for writes is enforced by the risk_level gate, not by the LLM).
"""
from __future__ import annotations

import time
from typing import Any

import structlog
from agent_framework import FunctionInvocationContext, FunctionTool
from pydantic import BaseModel, Field

from src.tools.capability_policy import (
    DEFAULT_FORBIDDEN_PREFIXES,
    active_app_slugs_from,
    filter_exposed_rows,
)
from src.tools.names import canonical_tool_name

logger = structlog.get_logger(__name__)

# The only risk levels an LLM may invoke directly through the index tool;
# write capabilities must go through their dedicated bridge tool + approval.
_INDEX_EXECUTABLE_RISKS = {"read", "direct_write"}
MAX_SEARCH_RESULTS = 15

# Company app activation, cached per tenant. A search/execute pair costs one
# backend round-trip, not one per call.
_APPS_TTL_SECONDS = 300.0
_apps_cache: dict[str, tuple[set[str] | None, float]] = {}


async def _company_app_slugs(company_id: str) -> set[str] | None:
    """Active app slugs for the tenant, or None when the lookup fails."""
    if not company_id:
        return None
    now = time.monotonic()
    cached = _apps_cache.get(company_id)
    if cached and cached[1] > now:
        return cached[0]
    try:
        from src.tools.backend_client import get_backend_client

        apps = await get_backend_client().list_company_apps(company_id)
        slugs = active_app_slugs_from(apps)
    except Exception as exc:  # noqa: BLE001 — never break chat on a failed lookup
        logger.warning("store_capability_apps_lookup_failed", company_id=company_id, error=str(exc))
        return None
    _apps_cache[company_id] = (slugs, now + _APPS_TTL_SECONDS)
    return slugs


def _role_policy(role: str | None) -> tuple[tuple[str, ...], tuple[str, ...]]:
    """(forbidden prefixes, forbidden domains) from roles.manifest.yaml."""
    if not role:
        return DEFAULT_FORBIDDEN_PREFIXES, ()
    try:
        from src.agents.role_registry import get_role

        spec = get_role(role)
        prefixes = tuple(spec.approval_policy.get("forbidden_prefixes", DEFAULT_FORBIDDEN_PREFIXES))
        domains = tuple(spec.approval_policy.get("forbidden_domains", ()) or ())
        return prefixes, domains
    except Exception:  # noqa: BLE001 — unknown role keeps the safe default
        return DEFAULT_FORBIDDEN_PREFIXES, ()



class StoreCapabilityInput(BaseModel):
    action: str = Field(
        description="Either 'search' (find capabilities by keyword) or 'execute' (run one by exact name)"
    )
    query: str | None = Field(default=None, description="Search keywords, e.g. 'مرتجعات', 'invoice', 'coupon stats'")
    capability_name: str | None = Field(
        default=None, description="Exact capability name for action='execute' (from search results)"
    )
    arguments: dict[str, Any] = Field(
        default_factory=dict,
        description="Arguments for action='execute', matching the capability's parameters shown in search results",
    )
    company_id: str | None = Field(default=None, description="Tenant ID (auto-injected)")


async def _active_rows(session: Any) -> list[Any]:
    from sqlalchemy import select

    from src.db.models.agent_tool_catalog import AgentToolCatalog

    result = await session.execute(
        select(AgentToolCatalog).where(AgentToolCatalog.exposure_state == "active")
    )
    return list(result.scalars().all())


async def store_capability(
    input_data: StoreCapabilityInput,
    ctx: FunctionInvocationContext | None = None,
) -> dict[str, Any]:
    action = (input_data.action or "").lower().strip()
    company_id = input_data.company_id or ""
    role = getattr(ctx, "agent_role", None) if ctx is not None else None

    if action not in ("search", "execute"):
        return {"success": False, "error": f"Unknown action '{action}' — use 'search' or 'execute'"}

    import src.db.session as _db_mod

    sf = _db_mod.async_session
    if not sf:
        return {"success": False, "error": "Database not configured"}

    async with sf() as session:
        rows = await _active_rows(session)
        # Only the capabilities this role may use on this tenant's active apps.
        # No company context ⇒ app-bound rows stay hidden (fail-closed).
        active_apps = await _company_app_slugs(company_id) if company_id else set()
        forbidden_prefixes, forbidden_domains = _role_policy(role)
        rows = filter_exposed_rows(
            rows,
            role=role,
            active_app_slugs=active_apps,
            forbidden_prefixes=forbidden_prefixes,
            forbidden_domains=forbidden_domains,
        )

        if action == "search":
            query = (input_data.query or "").strip().lower()
            results = []
            for row in rows:
                hint = str(getattr(row, "usage_hint_ar", "") or "")
                meta = getattr(row, "catalog_metadata", {}) or {}
                raw_aliases = meta.get("aliases", []) if isinstance(meta, dict) else []
                if isinstance(raw_aliases, (list, tuple, set)):
                    aliases_text = " ".join(str(a) for a in raw_aliases if a)
                else:
                    aliases_text = str(raw_aliases or "")
                haystack = f"{row.name} {row.description_en} {row.domain} {hint} {aliases_text}".lower()
                if not query or query in haystack or any(w in haystack for w in query.split()):
                    results.append({
                        "name": row.name,
                        "domain": row.domain,
                        "description": (hint or row.description_en or "")[:160],
                        "risk": row.risk_level,
                        "parameters": list((row.input_schema or {}).get("properties", {}).keys()),
                    })
                if len(results) >= MAX_SEARCH_RESULTS:
                    break
            return {"success": True, "action": "search", "matches": results, "count": len(results)}

        # action == "execute"
        if not company_id:
            return {"success": False, "error": "Missing company_id"}
        wanted = canonical_tool_name(input_data.capability_name or "")
        row = next((r for r in rows if canonical_tool_name(r.name) == wanted), None)
        if row is None:
            return {"success": False, "error": f"Capability '{input_data.capability_name}' not found or not active"}
        if row.risk_level not in _INDEX_EXECUTABLE_RISKS:
            return {
                "success": False,
                "error": (
                    f"Capability '{row.name}' is a write capability — it must be invoked through its "
                    "dedicated tool so the merchant approval card is raised."
                ),
            }

        from src.tools.catalog import execute_catalog_tool

        args = dict(input_data.arguments or {})
        args["company_id"] = company_id
        return await execute_catalog_tool(row, args)


store_capability_tool = FunctionTool(
    name="store_capability",
    description=(
        "Discover and run store capabilities that are not in your main tool list. "
        "action='search' with keywords (Arabic or English) lists matching capabilities with their "
        "parameters; action='execute' runs one by exact name. Read capabilities only — "
        "write capabilities appear in search but must be invoked via their dedicated tools."
    ),
    func=store_capability,
    input_model=StoreCapabilityInput,
)

__all_tools__ = [store_capability_tool]
