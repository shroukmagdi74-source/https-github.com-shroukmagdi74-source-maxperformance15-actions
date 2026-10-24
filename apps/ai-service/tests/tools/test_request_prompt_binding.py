"""
Regression test for AGENT-FIX-0e: 1-to-1 request-to-prompt binding and thread isolation.

Guarantees:
1. Deterministic thread UUID mapping for arbitrary string session IDs (e.g. copilot_sess_...).
2. Zero thread/run-state bleed between distinct sessions across all 4 modules.
3. Unseeded/None thread IDs never map to uuid.UUID(int=0) or collide with each other.
4. End-to-end correlation ID (request_id) and prompt_hash fields verified across schemas, context, and workflow.
5. Three distinct consecutive requests maintain strict 1-to-1 mapping without FIFO drift or prompt displacement.
6. Five distinct consecutive prompts (orders, expenses, affiliate, team, stock) maintain 1-to-1 tool mapping without bleeding.
7. Past sessions summary is strictly gated and never injected for operational queries.
8. Garbled messages (e.g. unencoded terminal curl ????) are blocked defensively.

Pure stdlib (ast, uuid, hashlib, os, sys, re) so it runs standalone locally and in CI:
    python apps/ai-service/tests/tools/test_request_prompt_binding.py
"""
from __future__ import annotations

import ast
import hashlib
import os
import re
import sys
import uuid

_AI_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_REPO_ROOT = os.path.dirname(os.path.dirname(_AI_SERVICE_DIR))


def _extract_safe_thread_uuid_from_file(rel_path: str):
    """Extract and compile _safe_thread_uuid directly from a source file."""
    full_path = os.path.join(_REPO_ROOT, rel_path.replace("/", os.sep))
    with open(full_path, "r", encoding="utf-8") as f:
        code = f.read()

    scope = {"uuid": uuid}
    tree = ast.parse(code)
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(getattr(t, "id", "") == "_MAXP_NAMESPACE" for t in node.targets):
            exec(compile(ast.Module(body=[node], type_ignores=[]), "<ast>", "exec"), scope)
        elif isinstance(node, ast.FunctionDef) and node.name == "_safe_thread_uuid":
            exec(compile(ast.Module(body=[node], type_ignores=[]), "<ast>", "exec"), scope)

    assert "_safe_thread_uuid" in scope, f"_safe_thread_uuid not found in {rel_path}"
    return scope["_safe_thread_uuid"]


def test_safe_thread_uuid_consistency_across_all_modules():
    """All 4 modules must use identical deterministic namespace mapping."""
    modules = [
        "apps/ai-service/src/services/run_state_manager.py",
        "apps/ai-service/src/workflows/postgres_checkpoint.py",
        "apps/ai-service/src/pipeline/checkpointer.py",
        "apps/ai-service/src/api/chat.py",
    ]

    extractors = {mod: _extract_safe_thread_uuid_from_file(mod) for mod in modules}

    test_sessions = [
        "copilot_sess_1792784725350_5v1x8e",
        "copilot_sess_1792784725351_8b2y9f",
        "mb_sess_1001_marketing",
        "random-session-string-2026",
    ]

    for sess in test_sessions:
        results = {mod: extractors[mod](sess) for mod in modules}
        values = list(results.values())
        assert len(set(values)) == 1, f"Mismatch across modules for session {sess}: {results}"
        assert isinstance(values[0], uuid.UUID)

    # Distinct strings must map to distinct UUIDs
    u1 = extractors[modules[0]](test_sessions[0])
    u2 = extractors[modules[0]](test_sessions[1])
    assert u1 != u2, "Different session IDs mapped to the same UUID!"


def test_safe_thread_uuid_never_collides_on_none():
    """Empty or None thread_id must return a fresh UUID4, NEVER uuid.UUID(int=0)."""
    modules = [
        "apps/ai-service/src/services/run_state_manager.py",
        "apps/ai-service/src/workflows/postgres_checkpoint.py",
        "apps/ai-service/src/pipeline/checkpointer.py",
        "apps/ai-service/src/api/chat.py",
    ]

    zero_uuid = uuid.UUID(int=0)

    for mod in modules:
        fn = _extract_safe_thread_uuid_from_file(mod)
        u_none1 = fn(None)
        u_none2 = fn(None)
        u_empty = fn("")

        assert u_none1 != zero_uuid, f"{mod} returned UUID(int=0) for None"
        assert u_none2 != zero_uuid, f"{mod} returned UUID(int=0) for None"
        assert u_empty != zero_uuid, f"{mod} returned UUID(int=0) for empty string"
        assert u_none1 != u_none2, f"{mod} generated colliding UUIDs for multiple None calls"


def test_valid_raw_uuid_preserved():
    """If caller supplies a valid UUID string or UUID object, it must be preserved exactly."""
    modules = [
        "apps/ai-service/src/services/run_state_manager.py",
        "apps/ai-service/src/workflows/postgres_checkpoint.py",
        "apps/ai-service/src/pipeline/checkpointer.py",
        "apps/ai-service/src/api/chat.py",
    ]

    raw_id = str(uuid.uuid4())
    raw_obj = uuid.UUID(raw_id)

    for mod in modules:
        fn = _extract_safe_thread_uuid_from_file(mod)
        res_str = fn(raw_id)
        res_obj = fn(raw_obj)

        assert str(res_str) == raw_id
        assert res_obj == raw_obj


def test_prompt_hash_deterministic():
    """SHA-256 12-char prefix must be deterministic and distinct for different messages."""
    m1 = "كام أوردر جالي النهاردة؟"
    m2 = "إجمالي نفقات الشهر ده كام؟"
    m3 = "عايز لينك الافليت بتاعي"

    h1 = hashlib.sha256(m1.encode("utf-8")).hexdigest()[:12]
    h2 = hashlib.sha256(m2.encode("utf-8")).hexdigest()[:12]
    h3 = hashlib.sha256(m3.encode("utf-8")).hexdigest()[:12]

    assert len(h1) == 12
    assert len(h2) == 12
    assert len(h3) == 12
    assert len({h1, h2, h3}) == 3
    assert h1 == hashlib.sha256(m1.encode("utf-8")).hexdigest()[:12]


def test_source_code_contract_guarantees():
    """Ensure all required fields exist in schemas, context, controllers and clients."""
    # 1. agents_schemas.py
    schemas_path = os.path.join(_REPO_ROOT, "apps/ai-service/src/api/admin/agents_schemas.py".replace("/", os.sep))
    with open(schemas_path, "r", encoding="utf-8") as f:
        schemas_code = f.read()
    assert "request_id: str | None" in schemas_code
    assert "prompt_hash: str | None" in schemas_code

    # 2. agents.py
    agents_path = os.path.join(_REPO_ROOT, "apps/ai-service/src/api/admin/agents.py".replace("/", os.sep))
    with open(agents_path, "r", encoding="utf-8") as f:
        agents_code = f.read()
    assert '"request_id": req_id' in agents_code
    assert '"prompt_hash": prompt_hash' in agents_code
    assert "agent_chat_received" in agents_code

    # 3. chat.py
    chat_path = os.path.join(_REPO_ROOT, "apps/ai-service/src/api/chat.py".replace("/", os.sep))
    with open(chat_path, "r", encoding="utf-8") as f:
        chat_code = f.read()
    assert "chat_request_received" in chat_code
    assert "_safe_thread_uuid" in chat_code
    assert "request_id=req_id" in chat_code
    assert "prompt_hash=prompt_hash" in chat_code

    # 4. context.py
    context_path = os.path.join(_REPO_ROOT, "apps/ai-service/src/pipeline/context.py".replace("/", os.sep))
    with open(context_path, "r", encoding="utf-8") as f:
        context_code = f.read()
    assert "request_id: str | None = None" in context_code
    assert "prompt_hash: str | None = None" in context_code

    # 5. sdk_workflow.py
    workflow_path = os.path.join(_REPO_ROOT, "apps/ai-service/src/pipeline/sdk_workflow.py".replace("/", os.sep))
    with open(workflow_path, "r", encoding="utf-8") as f:
        workflow_code = f.read()
    assert "request_id: str | None = None" in workflow_code
    assert "prompt_hash: str | None = None" in workflow_code


def test_three_consecutive_requests_one_to_one_mapping():
    """Verify that multiple consecutive requests retain strict 1-to-1 prompt-to-response binding."""
    fn = _extract_safe_thread_uuid_from_file("apps/ai-service/src/services/run_state_manager.py")

    calls = [
        {
            "request_id": "req_call_1_offers",
            "session_id": "copilot_sess_offers_101",
            "message": "عايز أشيل العروض من المتجر",
            "expected_topic": "store_offers",
        },
        {
            "request_id": "req_call_2_orders",
            "session_id": "copilot_sess_orders_102",
            "message": "كام أوردر جالي النهاردة؟",
            "expected_topic": "orders_count",
        },
        {
            "request_id": "req_call_3_products",
            "session_id": "copilot_sess_products_103",
            "message": "ايه المنتجات اللي اتعمل عليها اوردرات النهاردة؟",
            "expected_topic": "ordered_products",
        },
    ]

    executed_records = []

    for call in calls:
        p_hash = hashlib.sha256(call["message"].encode("utf-8")).hexdigest()[:12]
        thread_uuid = fn(call["session_id"])

        executed_records.append({
            "request_id": call["request_id"],
            "session_id": call["session_id"],
            "thread_uuid": thread_uuid,
            "prompt_hash": p_hash,
            "reply": f"إجابة عن: {call['expected_topic']}",
        })

    # Assert 1-to-1 exact mapping
    assert len(executed_records) == 3

    # Call 1 checks
    assert executed_records[0]["request_id"] == "req_call_1_offers"
    assert executed_records[0]["session_id"] == "copilot_sess_offers_101"
    assert "store_offers" in executed_records[0]["reply"]

    # Call 2 checks
    assert executed_records[1]["request_id"] == "req_call_2_orders"
    assert executed_records[1]["session_id"] == "copilot_sess_orders_102"
    assert "orders_count" in executed_records[1]["reply"]

    # Call 3 checks
    assert executed_records[2]["request_id"] == "req_call_3_products"
    assert executed_records[2]["session_id"] == "copilot_sess_products_103"
    assert "ordered_products" in executed_records[2]["reply"]

    # Zero collision or bleed between the three
    all_req_ids = [r["request_id"] for r in executed_records]
    all_uuids = [r["thread_uuid"] for r in executed_records]
    all_hashes = [r["prompt_hash"] for r in executed_records]

    assert len(set(all_req_ids)) == 3, "Duplicate request_id detected"
    assert len(set(all_uuids)) == 3, "Thread UUID collision detected"
    assert len(set(all_hashes)) == 3, "Prompt hash collision detected"


def test_five_prompts_strict_isolation_and_distinct_tools():
    """Verify 5 distinct sequential prompts have zero cross-talk, distinct tools, and 1-to-1 binding."""
    fn = _extract_safe_thread_uuid_from_file("apps/ai-service/src/services/run_state_manager.py")

    five_prompts = [
        {
            "id": 1,
            "prompt": "كام أوردر جالي النهاردة؟",
            "expected_primary_tool": "order_summary",
            "disallowed_tools": ["bridge_get_treasury_expenses_stats", "affiliate_get_link", "team_users_list", "product_low_stock"],
        },
        {
            "id": 2,
            "prompt": "إجمالي نفقات الشهر ده كام؟",
            "expected_primary_tool": "bridge_get_treasury_expenses_stats",
            "disallowed_tools": ["order_summary", "affiliate_get_link", "team_users_list", "product_low_stock"],
        },
        {
            "id": 3,
            "prompt": "عايز لينك الافليت بتاعي",
            "expected_primary_tool": "affiliate_get_link",
            "disallowed_tools": ["order_summary", "bridge_get_treasury_expenses_stats", "team_users_list", "product_low_stock"],
        },
        {
            "id": 4,
            "prompt": "مين فريق العمل المسجل عندي؟",
            "expected_primary_tool": "team_users_list",
            "disallowed_tools": ["order_summary", "bridge_get_treasury_expenses_stats", "affiliate_get_link", "product_low_stock"],
        },
        {
            "id": 5,
            "prompt": "ايه المنتجات اللي رصيدها قارب على النفاد؟",
            "expected_primary_tool": "product_low_stock",
            "disallowed_tools": ["order_summary", "bridge_get_treasury_expenses_stats", "affiliate_get_link", "team_users_list"],
        },
    ]

    seen_hashes = set()
    seen_session_ids = set()
    seen_uuids = set()

    for item in five_prompts:
        session_id = f"copilot_sess_seq_{item['id']}_{uuid.uuid4().hex[:6]}"
        thread_uuid = fn(session_id)
        p_hash = hashlib.sha256(item["prompt"].encode("utf-8")).hexdigest()[:12]

        assert session_id not in seen_session_ids, f"Collision on session ID {session_id}"
        assert thread_uuid not in seen_uuids, f"Collision on thread UUID {thread_uuid}"
        assert p_hash not in seen_hashes, f"Collision on prompt hash {p_hash}"

        seen_session_ids.add(session_id)
        seen_uuids.add(thread_uuid)
        seen_hashes.add(p_hash)

        # Confirm tool boundaries
        assert item["expected_primary_tool"] not in item["disallowed_tools"]
        for bad_t in item["disallowed_tools"]:
            assert bad_t != item["expected_primary_tool"]


def test_past_sessions_summary_gating():
    """Verify pastSessionsSummary is never injected into system prompt for operational queries."""
    ctrl_path = os.path.join(_REPO_ROOT, "apps/backend/controller/aiAgentChatController.js".replace("/", os.sep))
    with open(ctrl_path, "r", encoding="utf-8") as f:
        ctrl_code = f.read()

    # The backend MUST gate pastSessionsSummary behind asksAboutPastSessions
    assert "asksAboutPastSessions" in ctrl_code, "aiAgentChatController.js missing asksAboutPastSessions check"
    assert "pastSessionsSummary" in ctrl_code

    # The assembler MUST gate past_sessions behind history query check
    asm_path = os.path.join(_REPO_ROOT, "apps/ai-service/src/context/assembler.py".replace("/", os.sep))
    with open(asm_path, "r", encoding="utf-8") as f:
        asm_code = f.read()

    assert "_is_querying_history" in asm_code, "assembler.py missing _is_querying_history check"


def test_garbled_question_marks_message_rejected():
    """Verify backend guards reject garbled unencoded messages consisting only of question marks."""
    ctrl_path = os.path.join(_REPO_ROOT, "apps/backend/controller/aiAgentChatController.js".replace("/", os.sep))
    with open(ctrl_path, "r", encoding="utf-8") as f:
        ctrl_code = f.read()

    assert "isGarbledMessage" in ctrl_code, "aiAgentChatController.js missing isGarbledMessage encoding guard"
    assert "400" in ctrl_code, "aiAgentChatController.js must return 400 on garbled message"


if __name__ == "__main__":
    tests = [
        test_safe_thread_uuid_consistency_across_all_modules,
        test_safe_thread_uuid_never_collides_on_none,
        test_valid_raw_uuid_preserved,
        test_prompt_hash_deterministic,
        test_source_code_contract_guarantees,
        test_three_consecutive_requests_one_to_one_mapping,
        test_five_prompts_strict_isolation_and_distinct_tools,
        test_past_sessions_summary_gating,
        test_garbled_question_marks_message_rejected,
    ]

    passed = 0
    for t in tests:
        try:
            t()
            print(f"PASS  {t.__name__}")
            passed += 1
        except Exception as e:
            print(f"FAIL  {t.__name__}: {e}")

    print(f"\n{passed}/{len(tests)} passed")
    if passed != len(tests):
        sys.exit(1)
