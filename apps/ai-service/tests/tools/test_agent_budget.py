"""Unit tests for agent budget extraction, rounds limits, and manifest integrity (AGENT-COV-5).

Pure stdlib + asserts, runnable both ways:
  * CI:            pytest tests/tools/test_agent_budget.py
  * standalone:    python tests/tools/test_agent_budget.py
"""

from __future__ import annotations

import json
import os
import sys

# Ensure apps/ai-service is on sys.path
AI_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, AI_SERVICE_DIR)

REPO_ROOT = os.path.dirname(os.path.dirname(AI_SERVICE_DIR))

from src.tools.agent_budget import (  # noqa: E402
    DEFAULT_MAX_ROUNDS,
    DEFAULT_MAX_TOOL_CALLS,
    SAFE_CAP_MAX_ROUNDS,
    resolve_max_rounds,
    resolve_max_tool_calls,
)


def test_resolve_max_rounds_defaults_and_limits():
    # Defaults
    assert resolve_max_rounds(None) == DEFAULT_MAX_ROUNDS
    assert resolve_max_rounds({}) == DEFAULT_MAX_ROUNDS
    assert resolve_max_rounds({"other": 123}) == DEFAULT_MAX_ROUNDS

    # Valid values within range (1 to 8)
    assert resolve_max_rounds({"maxRounds": 6}) == 6
    assert resolve_max_rounds({"maxRounds": 4}) == 4
    assert resolve_max_rounds({"maxRounds": 1}) == 1
    assert resolve_max_rounds({"maxRounds": 8}) == 8

    # Safe cap at 8
    assert resolve_max_rounds({"maxRounds": 9}) == SAFE_CAP_MAX_ROUNDS
    assert resolve_max_rounds({"maxRounds": 20}) == SAFE_CAP_MAX_ROUNDS
    assert resolve_max_rounds({"maxRounds": 100}) == SAFE_CAP_MAX_ROUNDS

    # Floor at 1
    assert resolve_max_rounds({"maxRounds": 0}) == 1
    assert resolve_max_rounds({"maxRounds": -5}) == 1

    # String numeric vs malformed
    assert resolve_max_rounds({"maxRounds": "6"}) == 6
    assert resolve_max_rounds({"maxRounds": "not_a_number"}) == DEFAULT_MAX_ROUNDS
    assert resolve_max_rounds({"maxRounds": None}) == DEFAULT_MAX_ROUNDS

    # Nested under 'budget' key
    assert resolve_max_rounds({"budget": {"maxRounds": 6}}) == 6
    assert resolve_max_rounds({"budget": {"maxRounds": 12}}) == 8


def test_resolve_max_tool_calls_defaults_and_limits():
    # Defaults
    assert resolve_max_tool_calls(None) == DEFAULT_MAX_TOOL_CALLS
    assert resolve_max_tool_calls({}) == DEFAULT_MAX_TOOL_CALLS

    # Valid values
    assert resolve_max_tool_calls({"maxToolCallsPerRun": 16}) == 16
    assert resolve_max_tool_calls({"maxToolCallsPerRun": 8}) == 8
    assert resolve_max_tool_calls({"maxToolCallsPerRun": "16"}) == 16

    # Minimum safety floor
    assert resolve_max_tool_calls({"maxToolCallsPerRun": 0}) == 1
    assert resolve_max_tool_calls({"maxToolCallsPerRun": -10}) == 1

    # Fallback on invalid
    assert resolve_max_tool_calls({"maxToolCallsPerRun": "invalid"}) == DEFAULT_MAX_TOOL_CALLS

    # Nested under 'budget' key
    assert resolve_max_tool_calls({"budget": {"maxToolCallsPerRun": 16}}) == 16


def test_object_and_context_shape_support():
    class DummyConfig:
        def __init__(self, budget):
            self.budget = budget

    class DummyAgent:
        def __init__(self, budget):
            self.config = DummyConfig(budget)

    class DummyContext:
        def __init__(self, budget):
            self.agent = DummyAgent(budget)

    ctx = DummyContext({"maxRounds": 6, "maxToolCallsPerRun": 16})
    assert resolve_max_rounds(ctx) == 6
    assert resolve_max_tool_calls(ctx) == 16

    # Object without budget
    ctx_empty = DummyContext(None)
    assert resolve_max_rounds(ctx_empty) == 4
    assert resolve_max_tool_calls(ctx_empty) == 10


def test_saleem_manifest_budget_values():
    manifest_path = os.path.join(REPO_ROOT, "apps", "backend", "agents", "executive-assistant-agent", "agent.json")
    assert os.path.exists(manifest_path), f"Manifest file not found: {manifest_path}"

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data.get("slug") == "executive-assistant-agent"
    assert data.get("role") == "EXECUTIVE_ASSISTANT"

    budget = data.get("budget", {})
    assert budget.get("maxToolCallsPerRun") == 16, f"Expected maxToolCallsPerRun == 16, got {budget.get('maxToolCallsPerRun')}"
    assert budget.get("maxRounds") == 6, f"Expected maxRounds == 6, got {budget.get('maxRounds')}"

    # Resolved via pure helper
    assert resolve_max_rounds(budget) == 6
    assert resolve_max_tool_calls(budget) == 16


def test_other_agents_budgets_are_untouched():
    agents_dir = os.path.join(REPO_ROOT, "apps", "backend", "agents")
    assert os.path.isdir(agents_dir), f"Agents directory not found: {agents_dir}"

    for entry in os.listdir(agents_dir):
        if entry == "executive-assistant-agent":
            continue
        agent_json = os.path.join(agents_dir, entry, "agent.json")
        if not os.path.isfile(agent_json):
            continue

        with open(agent_json, "r", encoding="utf-8") as f:
            data = json.load(f)

        budget = data.get("budget")
        if isinstance(budget, dict):
            # No other agent must have maxRounds configured
            assert "maxRounds" not in budget, f"Agent '{entry}' should not have maxRounds set in budget: {budget}"
            # All other agents resolve to default 4 rounds
            assert resolve_max_rounds(budget) == DEFAULT_MAX_ROUNDS


def test_role_tools_yaml_sync_with_executive_assistant():
    role_tools_path = os.path.join(REPO_ROOT, "apps", "ai-service", "src", "tools", "role_tools.yaml")
    assert os.path.isfile(role_tools_path), f"role_tools.yaml not found: {role_tools_path}"

    with open(role_tools_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify EXECUTIVE_ASSISTANT role block is present
    assert "EXECUTIVE_ASSISTANT" in content, "role_tools.yaml must define EXECUTIVE_ASSISTANT"


if __name__ == "__main__":
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    failed = 0
    print(f"Running {len(tests)} tests for agent budget and limits...\n")
    for name, fn in tests:
        try:
            fn()
            print(f"PASS  {name}")
        except Exception as exc:
            failed += 1
            print(f"FAIL  {name}: {exc}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    sys.exit(1 if failed else 0)
