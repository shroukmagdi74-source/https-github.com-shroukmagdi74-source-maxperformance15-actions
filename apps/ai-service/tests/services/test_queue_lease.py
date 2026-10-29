from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from typing import Any
import unittest
from unittest.mock import AsyncMock, patch

from src.services.queue_service import QueuePriority, QueueService


class MockDBResult:
    def __init__(self, rows: list[dict[str, Any]], first_val: Any = None):
        self._rows = rows
        self._first_val = first_val

    def first(self):
        if self._first_val is not None:
            return (self._first_val,)
        if self._rows:
            return (self._rows[0].get("id"),)
        return None

    def fetchall(self):
        return [(r.get("id"),) for r in self._rows]

    def mappings(self):
        class _Mappings:
            def __init__(self, r):
                self._r = r
            def first(self):
                return self._r[0] if self._r else None
            def all(self):
                return self._r
        return _Mappings(self._rows)

    def all(self):
        return self._rows


class MockAsyncSession:
    def __init__(self, db_store: dict[str, dict[str, Any]]):
        self.db_store = db_store
        self.committed = False

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        return False

    async def commit(self):
        self.committed = True

    async def execute(self, stmt, params=None):
        sql = str(stmt).strip()
        params = params or {}
        now = datetime.now(timezone.utc)

        # 1. INSERT ON CONFLICT
        if "INSERT INTO ai_runtime_queue_jobs" in sql:
            qkey = params.get("queue_key")
            for job in self.db_store.values():
                if job.get("queueKey") == qkey:
                    return MockDBResult([], None)  # ON CONFLICT DO NOTHING
            job_id = params.get("id")
            new_job = {
                "id": job_id,
                "companyId": params.get("company_id"),
                "agentId": params.get("agent_id"),
                "queueKey": qkey,
                "channel": params.get("channel"),
                "status": "PENDING",
                "priority": params.get("priority", 0),
                "attempts": 0,
                "maxAttempts": 3,
                "lockToken": None,
                "lockExpiresAt": None,
                "availableAt": now,
                "inputSnapshot": params.get("input_snapshot", "{}"),
                "metadata": params.get("metadata", "{}"),
            }
            self.db_store[job_id] = new_job
            return MockDBResult([new_job], job_id)

        # 2. SELECT id FROM ... WHERE queueKey
        if "SELECT id FROM ai_runtime_queue_jobs" in sql and "queueKey" in sql:
            qkey = params.get("queue_key")
            for job in self.db_store.values():
                if job.get("queueKey") == qkey:
                    return MockDBResult([job], job["id"])
            return MockDBResult([])

        # 3. RESERVE (UPDATE ... SET status='RUNNING' ... WHERE id = (SELECT ...))
        if "UPDATE ai_runtime_queue_jobs" in sql and "SET status = 'RUNNING'" in sql:
            token = params.get("lock_token")
            # Filter candidates: status in (PENDING, RETRY), availableAt <= now
            candidates = [
                j for j in self.db_store.values()
                if j.get("status") in ("PENDING", "RETRY") and j.get("availableAt", now) <= now
            ]
            # Check NOT EXISTS running job with same agentId
            running_agent_ids = {
                j.get("agentId") for j in self.db_store.values()
                if j.get("status") == "RUNNING" and j.get("agentId") is not None
            }
            eligible = [
                j for j in candidates
                if j.get("agentId") is None or j.get("agentId") not in running_agent_ids
            ]
            if not eligible:
                return MockDBResult([])

            # Sort by priority desc, availableAt asc
            eligible.sort(key=lambda x: (-x.get("priority", 0), x.get("availableAt", now)))
            chosen = eligible[0]
            chosen["status"] = "RUNNING"
            chosen["lockToken"] = token
            chosen["lockedAt"] = now
            chosen["lockExpiresAt"] = now + timedelta(seconds=300)
            chosen["attempts"] = chosen.get("attempts", 0) + 1
            return MockDBResult([chosen])

        # 4. REAP EXPIRED
        if "UPDATE ai_runtime_queue_jobs" in sql and "SET status = 'RETRY'" in sql and "lockExpiresAt" in sql:
            reaped = []
            for j in self.db_store.values():
                if j.get("status") == "RUNNING" and j.get("lockExpiresAt") and j.get("lockExpiresAt") < now:
                    j["status"] = "RETRY"
                    j["lockToken"] = None
                    j["availableAt"] = now
                    reaped.append(j)
            return MockDBResult(reaped)

        # 5. HEARTBEAT
        if "UPDATE ai_runtime_queue_jobs" in sql and "lockExpiresAt" in sql and "status = 'RUNNING'" in sql:
            jid = params.get("job_id")
            token = params.get("token")
            job = self.db_store.get(jid)
            if job and job.get("status") == "RUNNING" and job.get("lockToken") == token:
                job["lockExpiresAt"] = now + timedelta(seconds=300)
                return MockDBResult([job], jid)
            return MockDBResult([])

        # 6. ACK
        if "UPDATE ai_runtime_queue_jobs" in sql and "status = 'COMPLETED'" in sql:
            jid = params.get("job_id")
            token = params.get("token")
            job = self.db_store.get(jid)
            if job and job.get("lockToken") == token:
                job["status"] = "COMPLETED"
                job["completedAt"] = now
                return MockDBResult([job], jid)
            return MockDBResult([])

        # 7. FAIL
        if "UPDATE ai_runtime_queue_jobs" in sql and "CASE WHEN attempts <" in sql:
            jid = params.get("job_id")
            token = params.get("token")
            job = self.db_store.get(jid)
            if job and job.get("lockToken") == token:
                if job.get("attempts", 1) < job.get("maxAttempts", 3):
                    job["status"] = "RETRY"
                    job["availableAt"] = now + timedelta(seconds=10)
                else:
                    job["status"] = "DEAD"
                job["lockToken"] = None
                return MockDBResult([job], job["status"])
            return MockDBResult([])

        return MockDBResult([])


class TestQueueLease(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.db_store: dict[str, dict[str, Any]] = {}
        self.queue_svc = QueueService()

    async def _mock_session_factory(self):
        return MockAsyncSession(self.db_store)

    async def test_01_enqueue_same_dedupe_key_twice_inserts_only_once(self):
        """Test 1: enqueue with same dedupe_key twice -> count(*) == 1 (ON CONFLICT DO NOTHING)."""
        with patch.object(self.queue_svc, "_ensure_session", side_effect=self._mock_session_factory):
            id1 = await self.queue_svc.enqueue(
                queue_name="agent-tasks",
                task_type="agent.scheduled_task",
                payload={"order_id": 100},
                dedupe_key="test:dedupe:key:1",
            )
            id2 = await self.queue_svc.enqueue(
                queue_name="agent-tasks",
                task_type="agent.scheduled_task",
                payload={"order_id": 100},
                dedupe_key="test:dedupe:key:1",
            )
            self.assertEqual(id1, id2)
            matching = [j for j in self.db_store.values() if j["queueKey"] == "test:dedupe:key:1"]
            self.assertEqual(len(matching), 1)

    async def test_02_parallel_reserve_claims_exactly_once(self):
        """Test 2: asyncio.gather(reserve(), reserve()) on 1 job -> only one succeeds, the other returns None."""
        with patch.object(self.queue_svc, "_ensure_session", side_effect=self._mock_session_factory):
            await self.queue_svc.enqueue(
                queue_name="agent-tasks",
                task_type="agent.scheduled_task",
                payload={"msg": "single"},
                dedupe_key="test:single:job",
            )
            res1, res2 = await asyncio.gather(
                self.queue_svc.reserve("agent-tasks"),
                self.queue_svc.reserve("agent-tasks"),
            )
            claimed = [r for r in (res1, res2) if r is not None]
            none_results = [r for r in (res1, res2) if r is None]
            self.assertEqual(len(claimed), 1)
            self.assertEqual(len(none_results), 1)
            self.assertEqual(claimed[0]["status"], "RUNNING")

    async def test_03_reap_expired_resets_dead_worker_job_to_retry(self):
        """Test 3: reserve then reap_expired after lockExpiresAt in past -> status='RETRY' then reserve succeeds."""
        with patch.object(self.queue_svc, "_ensure_session", side_effect=self._mock_session_factory):
            job_id = await self.queue_svc.enqueue(
                queue_name="agent-tasks",
                task_type="agent.scheduled_task",
                payload={"data": "retry-test"},
                dedupe_key="test:retry:job",
            )
            job = await self.queue_svc.reserve("agent-tasks")
            self.assertIsNotNone(job)
            self.assertEqual(job["status"], "RUNNING")

            # Simulate worker death: set lockExpiresAt to the past
            self.db_store[job_id]["lockExpiresAt"] = datetime.now(timezone.utc) - timedelta(seconds=10)

            # Reaper runs
            reaped = await self.queue_svc.reap_expired()
            self.assertIn(job_id, reaped)
            self.assertEqual(self.db_store[job_id]["status"], "RETRY")

            # Subsequent reserve picks it back up
            re_reserved = await self.queue_svc.reserve("agent-tasks")
            self.assertIsNotNone(re_reserved)
            self.assertEqual(re_reserved["id"], job_id)
            self.assertEqual(re_reserved["attempts"], 2)

    async def test_04_per_agent_concurrency_serialization(self):
        """Test 4: reserve twice for the same agentId -> second returns None (per-agent serialization)."""
        with patch.object(self.queue_svc, "_ensure_session", side_effect=self._mock_session_factory):
            await self.queue_svc.enqueue(
                queue_name="agent-tasks",
                task_type="agent.scheduled_task",
                payload={"task": 1},
                agent_id="agent-shipping-1",
                dedupe_key="test:agent:1",
            )
            await self.queue_svc.enqueue(
                queue_name="agent-tasks",
                task_type="agent.scheduled_task",
                payload={"task": 2},
                agent_id="agent-shipping-1",
                dedupe_key="test:agent:2",
            )
            res1 = await self.queue_svc.reserve("agent-tasks")
            self.assertIsNotNone(res1)
            self.assertEqual(res1["agent_id"], "agent-shipping-1")

            # Second reserve for the same agent while first is RUNNING must return None
            res2 = await self.queue_svc.reserve("agent-tasks")
            self.assertIsNone(res2)

            # Ack the first job
            await self.queue_svc.ack(res1["id"], res1["lock_token"])

            # Now second job for this agent can be reserved
            res3 = await self.queue_svc.reserve("agent-tasks")
            self.assertIsNotNone(res3)
            self.assertEqual(res3["agent_id"], "agent-shipping-1")

    async def test_05_enqueue_persists_in_db_when_redis_is_down(self):
        """Test 5: enqueue when Redis is down -> job is preserved in DB and can be reserved."""
        from src.services.queue_service import redis_client

        with patch.object(redis_client, "available", False), \
             patch.object(self.queue_svc, "_ensure_session", side_effect=self._mock_session_factory):
            job_id = await self.queue_svc.enqueue(
                queue_name="agent-tasks",
                task_type="agent.scheduled_task",
                payload={"offline": True},
                dedupe_key="test:redis:down",
            )
            self.assertIn(job_id, self.db_store)
            reserved = await self.queue_svc.reserve("agent-tasks")
            self.assertIsNotNone(reserved)
            self.assertEqual(reserved["id"], job_id)
            self.assertEqual(reserved["payload"]["offline"], True)
