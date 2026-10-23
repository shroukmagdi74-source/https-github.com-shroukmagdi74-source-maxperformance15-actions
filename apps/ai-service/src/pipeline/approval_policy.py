from __future__ import annotations

from typing import Any

CONDITIONAL_READ_ACTIONS: dict[str, frozenset[str]] = {
    "returns_settings_manage": frozenset({"GET_SETTINGS", "GET_REASONS"}),
    "bot_automation_manage": frozenset({"READ"}),
}


def is_read_action(tool_name: str, arguments: dict[str, Any] | Any) -> bool:
    """True only when the call is provably a read.

    Fail-closed:
    - arguments not a dict -> False
    - tool_name not in CONDITIONAL_READ_ACTIONS -> False
    - action missing, not a string, or not in allowed set (after strip + upper) -> False
    """
    if not isinstance(arguments, dict):
        return False
    allowed = CONDITIONAL_READ_ACTIONS.get(tool_name)
    if allowed is None:
        return False
    raw_action = arguments.get("action")
    if not isinstance(raw_action, str):
        return False
    normalized = raw_action.strip().upper()
    return normalized in allowed
