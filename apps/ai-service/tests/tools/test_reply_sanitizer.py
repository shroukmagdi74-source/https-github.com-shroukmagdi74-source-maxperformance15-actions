"""Unit tests for src/pipeline/reply_sanitizer.py (AGENT-FIX-0c).

Validates scrubbing of technical tool names and bridge identifiers from agent replies.
Pure stdlib + assertions, runs both with pytest and as a standalone script:
    python apps/ai-service/tests/tools/test_reply_sanitizer.py
"""

from __future__ import annotations

import os
import sys

# Ensure apps/ai-service is on sys.path
_AI_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, _AI_SERVICE_DIR)

try:
    from src.pipeline.reply_sanitizer import scrub_tool_names
except ModuleNotFoundError:
    # Standalone direct import fallback when third-party packages (like structlog in pipeline/__init__.py) are not installed
    import importlib.util
    _sanitizer_path = os.path.join(_AI_SERVICE_DIR, "src", "pipeline", "reply_sanitizer.py")
    _spec = importlib.util.spec_from_file_location("reply_sanitizer", _sanitizer_path)
    _mod = importlib.util.module_from_spec(_spec)
    _spec.loader.exec_module(_mod)
    scrub_tool_names = _mod.scrub_tool_names


def test_backtick_tool_name_scrubbed_with_intact_sentence() -> None:
    """Requirement 4.1: `returns_requests_list` in backticks -> 'هذه القدرة' with sentence intact."""
    raw = "يمكنك استخدام `returns_requests_list` للاطلاع على طلبات الاسترجاع المسجلة."
    cleaned, scrubbed = scrub_tool_names(raw, known_tool_names=["returns_requests_list", "order_lookup"])

    assert scrubbed == ["returns_requests_list"]
    assert "returns_requests_list" not in cleaned
    assert "`" not in cleaned
    assert "يمكنك استخدام هذه القدرة للاطلاع على طلبات الاسترجاع المسجلة." == cleaned


def test_plain_bridge_tool_name_scrubbed() -> None:
    """Requirement 4.2: bridge_get_analytics_returns in plain text -> scrubbed."""
    raw = "تقرير المبيعات متاح عبر bridge_get_analytics_returns وسيعطيك كل التفاصيل."
    # bridge_* must be scrubbed even if not passed explicitly in known_tool_names
    cleaned, scrubbed = scrub_tool_names(raw, known_tool_names=[])

    assert scrubbed == ["bridge_get_analytics_returns"]
    assert "bridge_get_analytics_returns" not in cleaned
    assert "تقرير المبيعات متاح عبر هذه القدرة وسيعطيك كل التفاصيل." == cleaned


def test_word_returns_alone_is_untouched() -> None:
    """Requirement 4.3: The bare word 'returns' without underscore must NOT be touched."""
    raw = "قسم returns متاح ويمكنك فحص سياسة returns الخاصة بالمتجر."
    cleaned, scrubbed = scrub_tool_names(raw, known_tool_names=["returns_requests_list", "order_lookup"])

    assert scrubbed == []
    assert cleaned == raw


def test_clean_text_returns_exact_as_is() -> None:
    """Requirement 4.4: Clean text with no tool names returns unchanged with empty list."""
    raw = "أهلاً بك يا فندم! كل أمورك تمام والطلبات جاهزة للشحن اليوم."
    cleaned, scrubbed = scrub_tool_names(raw, known_tool_names=["product_search", "order_lookup"])

    assert scrubbed == []
    assert cleaned == raw


def test_product_or_number_with_underscore_is_untouched() -> None:
    """Requirement 4.5: hoodie_classic or 123_456 with underscores must NOT be touched."""
    raw = "المنتج hoodie_classic_v2 متوفر في المخزن وكود الصنف 998_102 بسعر 450 جنيه."
    cleaned, scrubbed = scrub_tool_names(raw, known_tool_names=["returns_requests_list", "product_search"])

    assert scrubbed == []
    assert cleaned == raw


def test_live_incident_markdown_table_scrubbed() -> None:
    """Matches the exact failure mode from _reports/2026-10-23-selim-live-test.md."""
    raw = (
        "| القدرة | الوصف |\n"
        "|---|---|\n"
        "| `returns_requests_list` | سرد طلبات المرتجعات… |\n"
        "| `bridge_get_analytics_returns` | تحليلات المرتجعات… |\n"
    )
    cleaned, scrubbed = scrub_tool_names(
        raw,
        known_tool_names=["returns_requests_list", "order_lookup"],
    )

    assert "returns_requests_list" not in cleaned
    assert "bridge_get_analytics_returns" not in cleaned
    assert scrubbed == ["returns_requests_list", "bridge_get_analytics_returns"]
    assert "| هذه القدرة | سرد طلبات المرتجعات… |" in cleaned
    assert "| هذه القدرة | تحليلات المرتجعات… |" in cleaned


def test_duplicate_tool_names_deduplicated_in_log_list() -> None:
    """Multiple mentions of the same tool scrub both occurrences but deduplicate returned list."""
    raw = "يمكن استخدام order_lookup أولاً ثم order_lookup لاحقاً للتأكيد."
    cleaned, scrubbed = scrub_tool_names(raw, known_tool_names=["order_lookup"])

    assert scrubbed == ["order_lookup"]
    assert "order_lookup" not in cleaned
    assert "يمكن استخدام هذه القدرة أولاً ثم هذه القدرة لاحقاً للتأكيد." == cleaned


def test_parentheses_and_spaces_cleaned() -> None:
    """Duplicate parentheses or spaces around replaced tool names are cleaned."""
    raw = "استخدم أداة (( `returns_requests_list` )) لفحص الطلب."
    cleaned, scrubbed = scrub_tool_names(raw, known_tool_names=["returns_requests_list"])

    assert scrubbed == ["returns_requests_list"]
    assert "((" not in cleaned
    assert "))" not in cleaned
    assert "استخدم أداة (هذه القدرة) لفحص الطلب." == cleaned


def test_empty_and_non_string_inputs_handled_safely() -> None:
    """Empty or None text returns safely without error."""
    assert scrub_tool_names("", ["returns_requests_list"]) == ("", [])
    assert scrub_tool_names(None, ["returns_requests_list"]) == ("", [])  # type: ignore[arg-type]


if __name__ == "__main__":
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    failed = 0
    for name, fn in tests:
        try:
            fn()
            print(f"PASS  {name}")
        except AssertionError as exc:
            failed += 1
            print(f"FAIL  {name}: {exc}")
        except Exception as exc:
            failed += 1
            print(f"ERROR {name}: {type(exc).__name__}: {exc}")

    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    sys.exit(1 if failed else 0)
