"""Agent budget resolution utilities (pure stdlib).

Handles extraction and safe bounds for per-run tool budgets and rounds limits:
- maxRounds: default 4, min floor 1, safe cap 8.
- maxToolCallsPerRun: default 10, min floor 1.
"""
from __future__ import annotations

from typing import Any

DEFAULT_MAX_ROUNDS = 4
SAFE_CAP_MAX_ROUNDS = 8
MIN_SAFE_ROUNDS = 1

DEFAULT_MAX_TOOL_CALLS = 10
MIN_SAFE_TOOL_CALLS = 1


def resolve_max_rounds(source: Any) -> int:
    """Extract max tool rounds from an agent manifest budget, dict, or object.

    Safe bounds: default 4, min floor 1, safe cap 8.
    """
    if source is None:
        return DEFAULT_MAX_ROUNDS

    budget = source
    if isinstance(source, dict):
        if "maxRounds" not in source and "budget" in source and isinstance(source["budget"], dict):
            budget = source["budget"]
    else:
        agent = getattr(source, "agent", source)
        cfg = getattr(agent, "config", agent)
        b = getattr(cfg, "budget", None)
        if b is None and isinstance(cfg, dict):
            b = cfg.get("budget")
        if b is not None:
            budget = b

    if isinstance(budget, dict):
        try:
            val = int(budget.get("maxRounds", DEFAULT_MAX_ROUNDS))
            return max(MIN_SAFE_ROUNDS, min(val, SAFE_CAP_MAX_ROUNDS))
        except (TypeError, ValueError):
            pass

    return DEFAULT_MAX_ROUNDS


def resolve_max_tool_calls(source: Any) -> int:
    """Extract max tool calls per run from an agent manifest budget, dict, or object.

    Safe bounds: default 10, min floor 1.
    """
    if source is None:
        return DEFAULT_MAX_TOOL_CALLS

    budget = source
    if isinstance(source, dict):
        if "maxToolCallsPerRun" not in source and "budget" in source and isinstance(source["budget"], dict):
            budget = source["budget"]
    else:
        agent = getattr(source, "agent", source)
        cfg = getattr(agent, "config", agent)
        b = getattr(cfg, "budget", None)
        if b is None and isinstance(cfg, dict):
            b = cfg.get("budget")
        if b is not None:
            budget = b

    if isinstance(budget, dict):
        try:
            return max(MIN_SAFE_TOOL_CALLS, int(budget.get("maxToolCallsPerRun", DEFAULT_MAX_TOOL_CALLS)))
        except (TypeError, ValueError):
            pass

    return DEFAULT_MAX_TOOL_CALLS
