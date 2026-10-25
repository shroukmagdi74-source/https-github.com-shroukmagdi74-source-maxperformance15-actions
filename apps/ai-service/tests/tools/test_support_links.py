"""Unit tests for support_ticket_link tool (SUP-2).

Pure stdlib + asserts, runnable both ways:
  * CI:            pytest apps/ai-service/tests/tools/test_support_links.py
  * standalone:    python apps/ai-service/tests/tools/test_support_links.py
"""

from __future__ import annotations

import ast
import asyncio
import os
import sys
from urllib.parse import parse_qs, urlsplit

# Ensure apps/ai-service is on sys.path
_AI_SERVICE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _AI_SERVICE_DIR not in sys.path:
    sys.path.insert(0, _AI_SERVICE_DIR)

# Reconfigure stdout to utf-8 if supported on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from src.tools.definitions.support_links import (
    ALLOWED_CATEGORIES,
    MAX_SUBJECT_LENGTH,
    SupportTicketLinkInput,
    build_support_ticket_link,
    normalize_category,
    support_ticket_link,
    support_ticket_link_tool,
)


def test_url_encoding_arabic_ampersand_and_spaces():
    """Verify that Arabic text, '&' ampersands, and spaces are properly percent-encoded."""
    reason = "مشكلة في بوابات الدفع & ربط المتجر"
    summary = "جربت أعمل تأكيد للطلب ORD-100 وطلع خطأ 500 & لم يتم خصم المخزون"
    result = build_support_ticket_link(
        reason=reason,
        category="technical",
        summary=summary,
    )

    url = result["url"]
    assert url.startswith("https://maxp.online/support/tickets/new?")

    # Raw URL should NOT contain literal unencoded spaces
    assert " " not in url

    split_url = urlsplit(url)
    qs = parse_qs(split_url.query, keep_blank_values=True)

    assert "subject" in qs
    assert "category" in qs
    assert "body" in qs

    # When decoded, it should match the original values exactly
    assert qs["subject"][0] == result["subject"]
    assert qs["category"][0] == "technical"
    assert qs["body"][0] == result["body"]

    # Verify that '&' inside the reason was encoded as %26 and did not split into extra query params
    assert qs["subject"][0] == "مشكلة في بوابات الدفع & ربط المتجر"
    assert "ربط المتجر" not in qs  # Must not become a standalone query param


def test_invalid_category_fallback_to_technical():
    """Verify that any unrecognized category (like 'hack') safely falls back to 'technical'."""
    invalid_cases = ["hack", "INVALID", "malicious_script", "", "   ", "sql_injection", "unknown"]
    for raw_cat in invalid_cases:
        res = build_support_ticket_link(reason="طلب فحص النظام", category=raw_cat)
        assert res["category"] == "technical", f"Expected 'technical' for '{raw_cat}', got '{res['category']}'"
        assert "category=technical" in res["url"]

    # Valid categories must be preserved
    for valid_cat in ALLOWED_CATEGORIES:
        res = build_support_ticket_link(reason="طلب استفسار", category=valid_cat)
        assert res["category"] == valid_cat
        assert f"category={valid_cat}" in res["url"]

    # Case-insensitivity check (e.g. BILLING -> billing)
    res_upper = build_support_ticket_link(reason="استفسار فاتورة", category="BILLING")
    assert res_upper["category"] == "billing"
    assert "category=billing" in res_upper["url"]


def test_summary_none_body_has_reason_only():
    """Verify that when summary=None, body contains only the reason."""
    reason = "استفسار بخصوص تفعيل بوابة شحن بوستا"
    res = build_support_ticket_link(reason=reason, summary=None)

    assert res["body"] == reason
    split_url = urlsplit(res["url"])
    qs = parse_qs(split_url.query)
    assert qs["body"][0] == reason
    assert "None" not in res["body"]

    # Also test with empty string summary
    res_empty = build_support_ticket_link(reason=reason, summary="")
    assert res_empty["body"] == reason

    # Test with provided summary
    res_with_summary = build_support_ticket_link(
        reason=reason,
        summary="جربت الربط بمفتاح API وطلع خطأ في الاعتماد",
    )
    assert reason in res_with_summary["body"]
    assert "جربت الربط بمفتاح API" in res_with_summary["body"]
    assert res_with_summary["body"] == f"{reason}\n\nجربت الربط بمفتاح API وطلع خطأ في الاعتماد"


def test_message_ar_contains_ticket_word_and_url():
    """Verify that message_ar is a 2-line message containing 'تذكرة', MaxP team reference, and the link."""
    reason = "مشكلة في إرسال رسائل الواتساب للعملاء"
    res = build_support_ticket_link(reason=reason, category="technical")

    message_ar = res["message_ar"]
    assert "تذكرة" in message_ar, "message_ar must contain the word 'تذكرة'"
    assert res["url"] in message_ar, "message_ar must include the prefilled url"
    assert "MaxP" in message_ar, "message_ar must mention MaxP team"

    # Must be 2 lines
    lines = [line.strip() for line in message_ar.strip().split("\n") if line.strip()]
    assert len(lines) == 2, f"Expected 2 lines in message_ar, got {len(lines)} lines"


def test_no_http_client_imports_in_tool_file():
    """Strict security guard: support_links.py must be a pure generator with NO HTTP client imports."""
    tool_file_path = os.path.join(
        _AI_SERVICE_DIR, "src", "tools", "definitions", "support_links.py"
    )
    assert os.path.exists(tool_file_path), f"File missing at {tool_file_path}"

    with open(tool_file_path, "r", encoding="utf-8") as f:
        tree = ast.parse(f.read(), filename=tool_file_path)

    banned_modules = {"httpx", "requests", "aiohttp", "urllib.request", "http.client", "urllib3"}
    imported_modules: set[str] = set()

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imported_modules.add(alias.name.split(".")[0])
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imported_modules.add(node.module.split(".")[0])

    forbidden = imported_modules & banned_modules
    assert not forbidden, f"Forbidden HTTP client imports found in support_links.py: {forbidden}"


def test_subject_length_bounded():
    """Verify that subject length is constrained to <= 120 characters."""
    very_long_reason = "سبب طويل جداً " * 30  # > 300 characters
    res = build_support_ticket_link(reason=very_long_reason)

    assert len(res["subject"]) <= MAX_SUBJECT_LENGTH
    assert res["subject"].endswith("...")


def test_async_support_ticket_link_pydantic_input():
    """Verify that async support_ticket_link works properly with SupportTicketLinkInput."""
    inp = SupportTicketLinkInput(
        reason="عطل في مزامنة الرصيد",
        category="billing",
        summary="الرصيد يظهر سالباً بعد إلغاء الطلب",
    )

    res = asyncio.run(support_ticket_link(inp))
    assert res["category"] == "billing"
    assert res["subject"] == "عطل في مزامنة الرصيد"
    assert "https://maxp.online/support/tickets/new?" in res["url"]
    assert res["url"] in res["message_ar"]
    assert support_ticket_link_tool.name == "support_ticket_link"


if __name__ == "__main__":
    test_functions = [
        (name, func)
        for name, func in sorted(globals().items())
        if name.startswith("test_") and callable(func)
    ]
    failed = 0
    print(f"Running {len(test_functions)} standalone support_links tests...\n")
    for name, fn in test_functions:
        try:
            fn()
            print(f"  PASS  {name}")
        except Exception as exc:
            failed += 1
            print(f"  FAIL  {name}: {exc}")

    print(f"\nResult: {len(test_functions) - failed}/{len(test_functions)} tests passed.")
    sys.exit(1 if failed else 0)
