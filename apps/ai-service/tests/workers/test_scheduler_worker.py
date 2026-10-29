from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from src.workers.scheduler_worker import tick_scheduler


class MockSchedulerResult:
    def __init__(self, rows: list[dict[str, Any]]):
        self._rows = rows

    def mappings(self):
        return self

    def all(self):
        return self._rows


class TestSchedulerWorker(unittest.IsolatedAsyncioTestCase):
    async def test_tick_scheduler_claims_and_enqueues(self):
        """Scheduler pass claims due schedules and enqueues them with deterministic dedupe_key."""
        now = datetime.now(timezone.utc)
        mock_schedule = {
            "id": "sched_1",
            "companyId": "comp_100",
            "agentId": "agent_200",
            "taskType": "SHIPPING",
            "intervalMinutes": 30,
            "nextRunAt": now,
            "lastRunAt": now,
            "context": {"priority": "high"},
        }

        mock_session = AsyncMock()
        mock_result = MockSchedulerResult([mock_schedule])
        mock_session.execute.return_value = mock_result

        with patch("src.workers.scheduler_worker._ensure_session", AsyncMock(return_value=mock_session)):
            with patch("src.workers.scheduler_worker.queue_service.enqueue", AsyncMock(return_value="job_123")) as mock_enqueue:
                enqueued = await tick_scheduler()

                self.assertEqual(len(enqueued), 1)
                self.assertEqual(enqueued[0], "sched_1")
                mock_enqueue.assert_awaited_once()
                call_kwargs = mock_enqueue.await_args.kwargs
                self.assertEqual(call_kwargs["queue_name"], "agent-tasks")
                self.assertEqual(call_kwargs["task_type"], "agent.scheduled_task")
                self.assertEqual(call_kwargs["company_id"], "comp_100")
                self.assertEqual(call_kwargs["agent_id"], "agent_200")
                self.assertTrue(call_kwargs["dedupe_key"].startswith("agent:comp_100:agent_200:sched_1:"))

    async def test_tick_scheduler_empty_when_no_due_jobs(self):
        """When no schedules are due, tick_scheduler returns empty list without calling enqueue."""
        mock_session = AsyncMock()
        mock_result = MockSchedulerResult([])
        mock_session.execute.return_value = mock_result

        with patch("src.workers.scheduler_worker._ensure_session", AsyncMock(return_value=mock_session)):
            with patch("src.workers.scheduler_worker.queue_service.enqueue", AsyncMock()) as mock_enqueue:
                enqueued = await tick_scheduler()
                self.assertEqual(len(enqueued), 0)
                mock_enqueue.assert_not_awaited()

    async def test_handle_scheduled_agent_task_tenant_isolation(self):
        """handle_scheduled_agent_task must fail closed (tenant_mismatch) if agent not owned by company."""
        from src.workers.agent_worker import handle_scheduled_agent_task

        job = {
            "id": "job_999",
            "type": "agent.scheduled_task",
            "payload": {
                "company_id": "company_A",
                "agent_id": "agent_owned_by_company_B",
                "task_id": "task_custom_1",
                "type": "SHIPPING",
            },
        }

        mock_session = AsyncMock()
        mock_repo = MagicMock()
        mock_repo.return_value.get_agent = AsyncMock(return_value=None)

        fake_logger = MagicMock()

        with patch("src.workers.agent_worker.async_session", return_value=mock_session), \
             patch("src.workers.agent_worker.AgentRepository", mock_repo), \
             patch("src.workers.agent_worker.logger", fake_logger):

            await handle_scheduled_agent_task(job)

            # Verification: tenant_mismatch warning logged and function returned early
            fake_logger.warning.assert_called_with(
                "tenant_mismatch",
                agent_id="agent_owned_by_company_B",
                company_id="company_A",
                job_id="job_999",
            )
