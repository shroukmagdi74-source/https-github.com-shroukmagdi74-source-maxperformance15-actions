from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.task import AiAgentTask


class TaskRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_task(self, data: dict[str, Any]) -> AiAgentTask:
        task = AiAgentTask(**data)
        self._session.add(task)
        await self._session.flush()
        return task

    async def get_task(self, task_id: str, company_id: str) -> AiAgentTask | None:
        stmt = select(AiAgentTask).where(
            AiAgentTask.id == task_id,
            AiAgentTask.company_id == company_id,
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_tasks(
        self,
        company_id: str,
        status: str | None = None,
        agent_id: str | None = None,
        checked_out_by: str | None = None,
        active_only: bool = False,
        limit: int = 100,
    ) -> Sequence[AiAgentTask]:
        stmt = select(AiAgentTask).where(AiAgentTask.company_id == company_id)
        if status:
            stmt = stmt.where(AiAgentTask.status == status)
        if agent_id:
            stmt = stmt.where(AiAgentTask.agent_id == agent_id)
        if checked_out_by:
            stmt = stmt.where(AiAgentTask.checked_out_by == checked_out_by)
        if active_only:
            stmt = stmt.where(
                AiAgentTask.status.in_(["PENDING", "CHECKED_OUT", "IN_PROGRESS"])
            )
        stmt = stmt.order_by(AiAgentTask.created_at.desc()).limit(limit)
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def update_task_status(
        self,
        task_id: str,
        company_id: str,
        status: str,
        extra: dict[str, Any] | None = None,
    ) -> AiAgentTask | None:
        task = await self.get_task(task_id, company_id)
        if not task:
            return None
        values: dict[str, Any] = {"status": status}
        if extra:
            values.update(extra)
        stmt = (
            update(AiAgentTask)
            .where(AiAgentTask.id == task_id, AiAgentTask.company_id == company_id)
            .values(**values)
        )
        await self._session.execute(stmt)
        await self._session.flush()
        # Refresh from DB
        return await self.get_task(task_id, company_id)

    async def checkout_task(
        self, task_id: str, company_id: str, agent_id: str
    ) -> AiAgentTask | None:
        now = datetime.now(timezone.utc)
        stmt = (
            update(AiAgentTask)
            .where(
                AiAgentTask.id == task_id,
                AiAgentTask.company_id == company_id,
                AiAgentTask.status == "PENDING",
            )
            .values(
                status="CHECKED_OUT",
                checked_out_by=agent_id,
                checked_out_at=now,
                updated_at=now,
            )
        )
        res = await self._session.execute(stmt)
        await self._session.flush()
        if res.rowcount == 0:
            return None
        return await self.get_task(task_id, company_id)

    async def complete_task(
        self,
        task_id: str,
        company_id: str,
        agent_id: str,
        result: dict[str, Any] | None = None,
    ) -> AiAgentTask | None:
        now = datetime.now(timezone.utc)
        stmt = (
            update(AiAgentTask)
            .where(
                AiAgentTask.id == task_id,
                AiAgentTask.company_id == company_id,
                AiAgentTask.status.in_(["CHECKED_OUT", "IN_PROGRESS"]),
                AiAgentTask.checked_out_by == agent_id,
            )
            .values(
                status="COMPLETED",
                completed_at=now,
                updated_at=now,
            )
        )
        res = await self._session.execute(stmt)
        await self._session.flush()
        if res.rowcount == 0:
            return None
        return await self.get_task(task_id, company_id)

    async def fail_task(
        self,
        task_id: str,
        company_id: str,
        agent_id: str,
        error: str = "",
    ) -> AiAgentTask | None:
        now = datetime.now(timezone.utc)
        stmt = (
            update(AiAgentTask)
            .where(
                AiAgentTask.id == task_id,
                AiAgentTask.company_id == company_id,
                AiAgentTask.status.in_(["CHECKED_OUT", "IN_PROGRESS"]),
                AiAgentTask.checked_out_by == agent_id,
            )
            .values(
                status="FAILED",
                updated_at=now,
            )
        )
        res = await self._session.execute(stmt)
        await self._session.flush()
        if res.rowcount == 0:
            return None
        return await self.get_task(task_id, company_id)

    async def count_active(self, company_id: str) -> dict[str, int]:
        stmt = select(AiAgentTask).where(AiAgentTask.company_id == company_id)
        result = await self._session.execute(stmt)
        all_tasks = result.scalars().all()
        active = sum(1 for t in all_tasks if t.status in ("PENDING", "CHECKED_OUT", "IN_PROGRESS"))
        pending = sum(1 for t in all_tasks if t.status == "PENDING")
        return {"active": active, "pending": pending}
