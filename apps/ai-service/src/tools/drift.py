"""Capability drift detector — compares the backend capability manifest
(GET /api/v1/internal/capabilities, Phase 1) against the agent tool catalog
(code tools mirrored as ``tracked`` rows + curated/active bridge rows).

Findings:
- NEW backend capability with no catalog coverage → ``draft`` row
  (source=auto). Reads can be auto-activated (approved policy: reads go
  live immediately); writes stay ``draft`` until one-click merchant review.
- Catalog endpoint no longer present in the manifest → row flagged stale
  in catalog_metadata (zombie callers like the retired /ai-bridge/* show up
  here).
- Coverage report per domain for the merchant dashboard.

Runs at startup and hourly (asyncio task in main.py); never raises into the
caller — a failed manifest fetch is logged and retried next cycle.
"""
from __future__ import annotations

import time
from typing import Any

import structlog
from sqlalchemy import select

import src.db.session as _db_mod
from src.db.models.agent_tool_catalog import AgentToolCatalog
from src.tools.capability_descriptions import describe_capability

logger = structlog.get_logger(__name__)

DRIFT_INTERVAL_SECONDS = 60 * 60  # hourly
_manifest_cache: dict[str, Any] = {"at": 0.0, "capabilities": []}


async def fetch_capability_manifest() -> list[dict[str, Any]]:
    """Fetch the backend manifest with a 5-minute cache (matches the
    backend-side cache TTL)."""
    from src.tools.backend_client import get_backend_client

    if time.monotonic() - _manifest_cache["at"] < 300 and _manifest_cache["capabilities"]:
        return _manifest_cache["capabilities"]

    client = get_backend_client()
    result = await client._request("GET", "/api/v1/internal/capabilities")
    capabilities = result.get("capabilities") or []
    _manifest_cache["at"] = time.monotonic()
    _manifest_cache["capabilities"] = capabilities
    return capabilities


def _method_of(route_method: str) -> str:
    return {"ALL": "GET", "PATCH": "PUT"}.get(route_method, route_method)


def _infer_write(method: str) -> bool:
    return method.upper() in ("POST", "PUT", "PATCH", "DELETE")


def _infer_domain(path: str) -> str:
    segment = path.strip("/").split("/")
    # /api/v1/<domain>/...
    if len(segment) >= 3 and segment[0] == "api" and segment[1] == "v1":
        return segment[2].replace("-", "_")
    return "other"


def _bridge_route_name(method: str, path: str) -> str:
    """Deterministic bridge row name from method + manifest path, e.g.
    GET /api/v1/brand-new-widget → bridge_get_brand_new_widget.
    Method-aware so GET/POST on the same path never merge into one row
    (the old scheme silently collapsed ~1000 routes). Non-/api/v1 paths
    return '' (caller skips them)."""
    marker = "/api/v1/"
    if marker not in path:
        return ""
    tail = path.split(marker, 1)[1]
    tail = tail.replace("/", "_").replace("-", "_")
    # strip :param placeholders → stable names
    tail = tail.replace(":", "")
    return f"bridge_{method.lower()}_{tail}"[:118]


# Route prefixes that are storefront-public or inbound receivers — never
# agent-callable surface: auto rows are created straight as 'hidden' so
# they don't pollute the store_capability search index (reviewable later).
AUTO_HIDE_PREFIXES = (
    "/api/v1/public/",
    "/api/v1/webhook",
    "/api/v1/shipping-zones/public/",
)


def _humanize_route(route: dict[str, Any]) -> str:
    method = route.get("method") or "GET"
    path = route.get("path") or ""
    name = path.strip("/").split("/")[-1] or path
    pretty = name.replace("-", " ").replace("_", " ").replace(":param", "by id").strip()
    return f"{method} {pretty}"[:300]


def _pairs_from_manifest(manifest: list[dict[str, Any]]) -> set[tuple[str, str]]:
    return {
        (_method_of(str(r.get("method") or "GET")), str(r.get("path") or ""))
        for r in manifest
    }


async def run_drift_check(session: Any, manifest: list[dict[str, Any]] | None = None) -> dict[str, int]:
    """Diff manifest ↔ catalog. Returns counts for logging/tests."""
    stats = {"new_capabilities": 0, "new_active_reads": 0, "stale_flags": 0, "unchanged": 0}

    if manifest is None:
        try:
            manifest = await fetch_capability_manifest()
        except Exception as exc:  # noqa: BLE001 — never raise into the caller
            logger.warning("drift_manifest_fetch_failed", error=str(exc))
            return stats

    rows = (await session.execute(select(AgentToolCatalog))).scalars().all()

    # Self-heal existing auto rows missing Arabic usage hints
    for r in rows:
        if getattr(r, "source", None) != "auto":
            continue
        hint = getattr(r, "usage_hint_ar", None)
        if not hint or not str(hint).strip() or str(hint).strip().lower().startswith("auto-discovered"):
            r_method = getattr(r, "http_method", None) or "GET"
            r_path = getattr(r, "endpoint", None) or ""
            r_domain = getattr(r, "domain", None) or _infer_domain(r_path)
            described = describe_capability(
                method=r_method,
                path=r_path,
                domain=r_domain,
                permission_key=getattr(r, "permission_key", None),
                app_slug=getattr(r, "app_slug", None),
                existing_hint=hint,
            )
            r.usage_hint_ar = described["usage_hint_ar"]
            desc_en = getattr(r, "description_en", "") or ""
            if not desc_en or desc_en.startswith("Auto-discovered backend capability:"):
                r.description_en = described["description_en"]
            if r_method.upper() == "GET" and (not r.input_schema or not (r.input_schema.get("properties") or {})):
                r.input_schema = described["input_schema"]
            meta = dict(getattr(r, "catalog_metadata", None) or {})
            if described.get("aliases"):
                meta["aliases"] = described["aliases"]
                r.catalog_metadata = meta

    by_endpoint = {
        (r.http_method or "", r.endpoint or ""): r
        for r in rows
        if r.endpoint and r.exposure_state in ("active", "draft")
    }

    for route in manifest:
        method = _method_of(str(route.get("method") or "GET"))
        path = str(route.get("path") or "")
        if not path:
            continue
        if (method, path) in by_endpoint:
            stats["unchanged"] += 1
            continue

        name = _bridge_route_name(method, path)
        if not name:
            continue  # not a versioned API path — not a store capability
        is_write = _infer_write(method)
        # Auto-activate reads only — writes await one-click review (policy).
        # Storefront-public / inbound routes are auto-hidden: they are not
        # agent surface and would only pollute the capability search index.
        if any(path.startswith(p) or path == p.rstrip("/") for p in AUTO_HIDE_PREFIXES):
            state = "hidden"
        else:
            state = "draft" if is_write else "active"

        domain = _infer_domain(path)
        permission_key = route.get("permissionKey")
        app_slug = route.get("appSlug")
        described = describe_capability(
            method=method,
            path=path,
            domain=domain,
            permission_key=permission_key,
            app_slug=app_slug,
            existing_hint=None,
        )
        meta = {"manifest_seen_at": time.time()}
        if described.get("aliases"):
            meta["aliases"] = described["aliases"]

        await session.merge(AgentToolCatalog(
            name=name,
            domain=domain,
            description_en=described["description_en"],
            usage_hint_ar=described["usage_hint_ar"],
            endpoint=path,
            http_method=method,
            input_schema=described["input_schema"],
            path_params=[],
            permission_key=permission_key,
            app_slug=app_slug,
            risk_level="write" if is_write else "read",
            exposure_state=state,
            roles=[],
            source="auto",
            catalog_metadata=meta,
        ))
        stats["new_capabilities"] += 1
        if not is_write and state == "active":
            stats["new_active_reads"] += 1

    # Stale flags: active/draft rows whose endpoint vanished from the manifest
    manifest_pairs = _pairs_from_manifest(manifest)
    for r in rows:
        if not r.endpoint or r.exposure_state not in ("active", "draft"):
            continue
        if (r.http_method or "", r.endpoint) in manifest_pairs:
            continue
        meta = dict(r.catalog_metadata or {})
        if not meta.get("stale"):
            meta["stale"] = True
            meta["stale_detected_at"] = time.time()
            r.catalog_metadata = meta
            stats["stale_flags"] += 1

    await session.commit()
    if stats["new_capabilities"] or stats["stale_flags"]:
        logger.info("drift_check_findings", **stats)
    return stats


async def drift_loop() -> None:
    """Hourly background loop (launched from main.py)."""
    import asyncio

    while True:
        await asyncio.sleep(DRIFT_INTERVAL_SECONDS)
        sf = _db_mod.async_session
        if not sf:
            continue
        try:
            async with sf() as session:
                await run_drift_check(session)
        except Exception as exc:  # noqa: BLE001
            logger.warning("drift_loop_iteration_failed", error=str(exc))


def start_drift_loop() -> None:
    import asyncio

    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return  # no running loop (e.g. sync context) — skip
    asyncio.create_task(drift_loop())
