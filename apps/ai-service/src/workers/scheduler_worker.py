from __future__ import annotations

import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Any

try:
    import structlog
    logger = structlog.get_logger(__name__)
except ImportError:
    import logging
    logger = logging.getLogger(__name__)

try:
    from sqlalchemy import text
except ImportError:
    class _TextClause:
        def __init__(self, text_str: str):
            self.text = text_str
        def __str__(self):
            return self.text
    text = _TextClause

from src.services.queue_service import QueuePriority, queue_service


async def _ensure_session():
    try:
        from src.db.session import async_session, init_db
        if async_session is None:
            await init_db()
            from src.db.session import async_session
        return async_session()
    except Exception as err:
        raise RuntimeError(f"Database session unavailable: {err}") from err


async def tick_scheduler(limit: int = 20) -> list[str]:
    """Poll for due schedules, atomically claim them with lease, and enqueue jobs."""
    token = str(uuid.uuid4())
    enqueued_schedule_ids: list[str] = []

    stmt = text("""
        WITH due AS (
          SELECT id FROM ai_agent_schedules
          WHERE enabled = true AND "nextRunAt" <= now()
            AND ("lockExpiresAt" IS NULL OR "lockExpiresAt" < now())
          ORDER BY "nextRunAt" ASC
          LIMIT :limit
          FOR UPDATE SKIP LOCKED
        )
        UPDATE ai_agent_schedules s
        SET "lockToken" = :lock_token,
            "lockExpiresAt" = now() + interval '120 seconds',
            "nextRunAt" = now() + (s."intervalMinutes" || ' minutes')::interval,
            "lastRunAt" = now(),
            "lastStatus" = 'ENQUEUED',
            "updatedAt" = now()
        FROM due WHERE s.id = due.id
        RETURNING s.*;
    """)

    try:
        session = await _ensure_session()
        async with session:
            res = await session.execute(stmt, {"lock_token": token, "limit": limit})
            rows = res.mappings().all()
            await session.commit()
    except Exception as exc:
        logger.warning("scheduler_claim_query_failed", error=str(exc))
        return []

    for row in rows:
        schedule_id = row.get("id")
        company_id = row.get("companyId")
        agent_id = row.get("agentId")
        task_type = row.get("taskType") or "GENERAL"

        raw_context = row.get("context")
        if isinstance(raw_context, str):
            try:
                context = json.loads(raw_context)
            except Exception:
                context = {}
        elif isinstance(raw_context, dict):
            context = raw_context
        else:
            context = {}

        now_dt = datetime.now(timezone.utc)
        due_at = row.get("lastRunAt") or now_dt
        due_ts = int(due_at.timestamp()) if hasattr(due_at, "timestamp") else int(now_dt.timestamp())

        dedupe_key = f"agent:{company_id}:{agent_id}:{schedule_id}:{due_ts}"
        task_id = f"task_{uuid.uuid4().hex[:16]}"

        payload = {
            "company_id": company_id,
            "agent_id": agent_id,
            "type": task_type,
            "schedule_id": schedule_id,
            "task_id": task_id,
            "context": context,
        }

        try:
            await queue_service.enqueue(
                queue_name="agent-tasks",
                task_type="agent.scheduled_task",
                payload=payload,
                priority=QueuePriority.MEDIUM,
                dedupe_key=dedupe_key,
                agent_id=agent_id,
                company_id=company_id,
            )
            enqueued_schedule_ids.append(schedule_id)
        except Exception as exc:
            logger.error(
                "scheduler_enqueue_failed",
                schedule_id=schedule_id,
                dedupe_key=dedupe_key,
                error=str(exc),
            )

    return enqueued_schedule_ids


async def start_scheduler_worker(poll_interval: float = 30.0) -> None:
    """Run the periodic scheduler loop every poll_interval seconds."""
    logger.info("scheduler worker started", interval=poll_interval)
    while True:
        try:
            enqueued = await tick_scheduler()
            if enqueued:
                logger.info("scheduler enqueued tasks", count=len(enqueued), schedules=enqueued)
        except asyncio.CancelledError:
            logger.info("scheduler worker cancelled")
            break
        except Exception as exc:
            logger.error("scheduler tick crashed", error=str(exc))
        await asyncio.sleep(poll_interval)
