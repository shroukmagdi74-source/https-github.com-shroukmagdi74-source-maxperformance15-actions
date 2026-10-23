"""Compatibility shim re-exporting agent budget helpers."""
from __future__ import annotations

from src.tools.agent_budget import (
    DEFAULT_MAX_ROUNDS,
    DEFAULT_MAX_TOOL_CALLS,
    MIN_SAFE_ROUNDS,
    MIN_SAFE_TOOL_CALLS,
    SAFE_CAP_MAX_ROUNDS,
    resolve_max_rounds,
    resolve_max_tool_calls,
)

__all__ = [
    "DEFAULT_MAX_ROUNDS",
    "DEFAULT_MAX_TOOL_CALLS",
    "MIN_SAFE_ROUNDS",
    "MIN_SAFE_TOOL_CALLS",
    "SAFE_CAP_MAX_ROUNDS",
    "resolve_max_rounds",
    "resolve_max_tool_calls",
]
