from __future__ import annotations

import re
from typing import Any
from urllib.parse import quote

try:
    from agent_framework import FunctionTool
except ImportError:
    class FunctionTool:  # type: ignore
        def __init__(
            self,
            name: str,
            description: str,
            func: Any,
            input_model: Any = None,
            format_result: Any = None,
            approval_mode: str = "never_require",
            **kwargs: Any,
        ):
            self.name = name
            self.description = description
            self.func = func
            self.input_model = input_model
            self.format_result = format_result
            self.approval_mode = approval_mode

try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:  # type: ignore
        def __init__(self, **kwargs: Any):
            for k, v in kwargs.items():
                setattr(self, k, v)

    def Field(default=None, description=""):  # type: ignore
        return default


ALLOWED_CATEGORIES: frozenset[str] = frozenset({
    "technical",
    "billing",
    "inquiry",
    "suggestion",
    "complaint",
})

MAX_SUBJECT_LENGTH = 120


class SupportTicketLinkInput(BaseModel):
    reason: str = Field(
        description="سبب مختصر لطلب الدعم (سطر أو سطرين)",
    )
    category: str = Field(
        default="technical",
        description="تصنيف التذكرة (technical, billing, inquiry, suggestion, complaint)",
    )
    summary: str | None = Field(
        default=None,
        description="ملخص ما حصل أو خطوات جرّبها التاجر أو رسالة الإيرور",
    )


def normalize_category(raw_category: str | None) -> str:
    if not raw_category:
        return "technical"
    cat = str(raw_category).strip().lower()
    return cat if cat in ALLOWED_CATEGORIES else "technical"


def build_support_ticket_link(
    reason: str,
    category: str = "technical",
    summary: str | None = None,
) -> dict[str, Any]:
    raw_reason = str(reason or "").strip()
    clean_reason = re.sub(r"<[^>]+>", "", raw_reason)
    clean_reason = " ".join(clean_reason.split())
    if len(clean_reason) <= MAX_SUBJECT_LENGTH:
        subject = clean_reason
    else:
        subject = clean_reason[: MAX_SUBJECT_LENGTH - 3].rstrip() + "..."

    final_category = normalize_category(category)

    clean_summary = str(summary).strip() if summary is not None else None
    if clean_summary:
        body = f"{raw_reason}\n\n{clean_summary}"
    else:
        body = raw_reason

    encoded_subject = quote(subject, safe="")
    encoded_category = quote(final_category, safe="")
    encoded_body = quote(body, safe="")

    url = (
        f"https://maxp.online/support/tickets/new"
        f"?subject={encoded_subject}&category={encoded_category}&body={encoded_body}"
    )

    message_ar = (
        "الموضوع ده محتاج متابعة مباشرة من فريق MaxP.\n"
        f"تقدر تفتح تذكرة بالبيانات دي وتراجع التفاصيل قبل الإرسال من الرابط ده: {url}"
    )

    return {
        "url": url,
        "subject": subject,
        "message_ar": message_ar,
        "category": final_category,
        "body": body,
    }


async def support_ticket_link(
    input_data: SupportTicketLinkInput | dict[str, Any] | None = None,
    **kwargs: Any,
) -> dict[str, Any]:
    if input_data is None:
        raw = kwargs
    elif isinstance(input_data, dict):
        raw = {**input_data, **kwargs}
    elif isinstance(input_data, SupportTicketLinkInput):
        raw = {
            "reason": input_data.reason,
            "category": input_data.category,
            "summary": input_data.summary,
        }
    else:
        raw = getattr(input_data, "__dict__", {})

    return build_support_ticket_link(
        reason=str(raw.get("reason") or ""),
        category=str(raw.get("category") or "technical"),
        summary=raw.get("summary"),
    )


def _format_support_ticket_link(result: dict[str, Any]) -> str:
    return str(result.get("message_ar") or "")


support_ticket_link_tool = FunctionTool(
    name="support_ticket_link",
    description=(
        "اقتراح فتح تذكرة دعم فني جديدة للتاجر وتزويده برابط مباشر مسبق التجهيز "
        "بالموضوع والسبب والتصنيف. الأداة لا تنشئ تذكرة بنفسها، بل تتيح للتاجر مراجعة البيانات وإرسالها بنفسه."
    ),
    func=support_ticket_link,
    input_model=SupportTicketLinkInput,
    format_result=_format_support_ticket_link,
    approval_mode="never_require",
)

__all_tools__ = [
    support_ticket_link_tool,
]
