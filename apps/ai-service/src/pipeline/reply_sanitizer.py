"""Reply sanitizer for LLM agent outputs (AGENT-FIX-0c).

Scrubs leaked technical tool names, bridge capabilities, and raw identifiers
from merchant/customer-facing replies, replacing them with natural Arabic phrasing
('هذه القدرة') without deleting or corrupting the surrounding sentence.
"""

from __future__ import annotations

import re
from typing import Iterable

REPLACEMENT_PHRASE = "هذه القدرة"


def scrub_tool_names(
    text: str,
    known_tool_names: Iterable[str] = (),
) -> tuple[str, list[str]]:
    """Scrub tool names and technical identifiers from agent reply text.

    Args:
        text: The agent reply text to sanitize.
        known_tool_names: An iterable of registered tool/capability names.

    Returns:
        tuple[str, list[str]]: (cleaned_text, list_of_scrubbed_tool_names)
    """
    if not text or not isinstance(text, str):
        return text or "", []

    valid_known: set[str] = set()
    if known_tool_names:
        for item in known_tool_names:
            if isinstance(item, str):
                cleaned_item = item.strip().strip("`")
                if cleaned_item:
                    valid_known.add(cleaned_item)

    # Sort known names by length descending to match longer composite names first
    sorted_known = sorted(valid_known, key=len, reverse=True)
    escaped_known = [re.escape(name) for name in sorted_known]

    # Combine known tools with general bridge pattern (bridge_[a-z0-9_]+)
    if escaped_known:
        tool_core = rf"(?:{'|'.join(escaped_known)}|bridge_[a-zA-Z0-9_]+)"
    else:
        tool_core = r"(?:bridge_[a-zA-Z0-9_]+)"

    # Match tool name either enclosed in backticks or with strict identifier word boundaries
    pattern = re.compile(
        rf"`(?P<bt>{tool_core})`|(?<![a-zA-Z0-9_])(?P<bare>{tool_core})(?![a-zA-Z0-9_])",
        re.IGNORECASE,
    )

    scrubbed_names: list[str] = []

    def _replace(match: re.Match) -> str:
        name = match.group("bt") or match.group("bare") or ""
        if name:
            scrubbed_names.append(name)
        return REPLACEMENT_PHRASE

    cleaned = pattern.sub(_replace, text)

    # If no tool names were found and replaced, return exact original text unchanged
    if not scrubbed_names:
        return text, []

    # Clean up duplicate parentheses caused by replacing enclosed names: (( ... )) -> ( ... )
    cleaned = re.sub(r"\(\s*\(+", "(", cleaned)
    cleaned = re.sub(r"\)\s*\)+", ")", cleaned)
    # Clean up whitespace inside parentheses: ( text ) -> (text)
    cleaned = re.sub(r"\(\s+", "(", cleaned)
    cleaned = re.sub(r"\s+\)", ")", cleaned)
    # Clean up empty parentheses: () or ( )
    cleaned = re.sub(r"\(\s*\)", "", cleaned)
    # Normalize multiple horizontal spaces (preserve newlines and indentations)
    cleaned = re.sub(r"(?<=\S)[^\S\r\n]{2,}", " ", cleaned)

    # Deduplicate while preserving occurrence order
    deduped_names = list(dict.fromkeys(scrubbed_names))
    return cleaned, deduped_names
