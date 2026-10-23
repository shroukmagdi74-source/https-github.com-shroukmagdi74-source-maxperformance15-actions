"""Pure capability description generator for store_capability discovery.

Stdlib only, side-effect free, no IO. Generates localized Arabic usage hints,
natural English descriptions, search aliases, and safe input schemas for
auto-discovered catalog endpoints.
"""

from __future__ import annotations

import re
from typing import Any

# 13 standard domain translations + aliases
DOMAIN_ARABIC: dict[str, tuple[str, list[str], list[str]]] = {
    # domain: (primary_ar, ar_synonyms, en_synonyms)
    "returns": (
        "المرتجعات",
        ["مرتجعات", "استرجاع", "إرجاع", "ارتجاع", "طلب إرجاع", "استبدال", "مرتجع"],
        ["returns", "return", "refund", "refunds"],
    ),
    "invoices": (
        "الفواتير",
        ["فواتير", "فاتورة", "مبيعات", "حسابات", "تحصيل"],
        ["invoices", "invoice", "billing", "bills"],
    ),
    "coupons": (
        "الكوبونات",
        ["كوبونات", "كوبون", "خصم", "تخفيض", "قسائم", "بروموكود"],
        ["coupons", "coupon", "discounts", "discount", "promo", "voucher"],
    ),
    "loyalty": (
        "ولاء العملاء",
        ["ولاء العملاء", "نقاط الولاء", "ولاء", "نقاط", "مكافآت", "رصيد نقاط", "برنامج ولاء"],
        ["loyalty", "points", "rewards", "loyalty program"],
    ),
    "treasury": (
        "الخزينة ونفقات",
        ["خزينة ونفقات", "خزينة", "مصروفات", "نفقات", "مالية", "صندوق"],
        ["treasury", "expenses", "cash", "finance", "vault"],
    ),
    "staff": (
        "الموظفين",
        ["موظفين", "موظف", "فريق عمل", "صلاحيات", "طاقم العمل", "أذونات"],
        ["staff", "employees", "team", "permissions", "roles"],
    ),
    "webhooks": (
        "الويب هوك",
        ["ويب هوك", "إشعارات فورية", "تكاملات", "أحداث النظام", "ربط خارجي"],
        ["webhooks", "webhook", "events", "integrations", "endpoints"],
    ),
    "reviews": (
        "التقييمات",
        ["تقييمات", "تقييم", "آراء العملاء", "مراجعات", "تعليقات"],
        ["reviews", "review", "ratings", "feedback", "comments"],
    ),
    "import_export": (
        "استيراد وتصدير",
        ["استيراد وتصدير", "استيراد", "تصدير", "ملفات البيانات", "تحميل بيانات", "تنزيل بيانات"],
        ["import_export", "import", "export", "csv", "excel", "backup"],
    ),
    "order_workflow": (
        "دورة الطلبات",
        ["دورة الطلبات", "مسار الطلب", "حالات الطلب", "مراحل الشحن", "تدفق الطلب"],
        ["order_workflow", "orders", "workflow", "fulfillment", "order status"],
    ),
    "affiliates": (
        "التسويق بالعمولة",
        ["تسويق بالعمولة", "أفلييت", "مسوقين", "عمولات", "روابط تسويقية", "إحالات"],
        ["affiliates", "affiliate", "commissions", "referrals", "marketers"],
    ),
    "pixels": (
        "بيكسل تتبع",
        ["بيكسل تتبع", "بيكسل", "تتبع الحملات", "فيسبوك بيكسل", "سناب بيكسل", "تيك توك بيكسل"],
        ["pixels", "pixel", "tracking", "meta pixel", "analytics tags"],
    ),
    "landing_pages": (
        "صفحات الهبوط",
        ["صفحات هبوط", "صفحة هبوط", "حملات تسويقية", "صفحات العروض", "لاندنج بيج"],
        ["landing_pages", "landing pages", "landing page", "funnels", "campaign pages"],
    ),
}

# Vocabulary for path segments
SEGMENT_TRANSLATIONS: dict[str, tuple[str, list[str], list[str]]] = {
    "coupons": ("كوبون", ["كوبونات", "كوبون", "خصومات"], ["coupons", "coupon"]),
    "coupon": ("كوبون", ["كوبون", "خصم"], ["coupon"]),
    "invoices": ("فاتورة", ["فواتير", "فاتورة"], ["invoices", "invoice"]),
    "invoice": ("فاتورة", ["فاتورة"], ["invoice"]),
    "order_invoices": ("فواتير الطلبات", ["فواتير", "طلبات", "فاتورة"], ["order_invoices", "invoices"]),
    "returns": ("مرتجع", ["مرتجعات", "مرتجع", "إرجاع", "ارتجاع"], ["returns", "return"]),
    "return": ("مرتجع", ["مرتجع"], ["return"]),
    "return_requests": ("طلبات المرتجعات", ["طلبات", "مرتجعات", "إرجاع"], ["return_requests", "returns"]),
    "reviews": ("تقييم", ["تقييمات", "تقييم"], ["reviews", "review"]),
    "review": ("تقييم", ["تقييم"], ["review"]),
    "webhooks": ("ويب هوك", ["ويب هوك"], ["webhooks", "webhook"]),
    "webhook": ("ويب هوك", ["ويب هوك"], ["webhook"]),
    "pixels": ("بيكسل تتبع", ["بيكسل"], ["pixels", "pixel"]),
    "pixel": ("بيكسل", ["بيكسل"], ["pixel"]),
    "staff": ("موظفين", ["موظفين", "موظف"], ["staff"]),
    "requests": ("طلبات", ["طلبات", "طلب"], ["requests", "request"]),
    "request": ("طلب", ["طلب"], ["request"]),
    "list": ("قائمة", ["قائمة", "عرض"], ["list", "all"]),
    "stats": ("إحصائيات", ["إحصائيات", "تقرير", "مؤشرات"], ["stats", "statistics"]),
    "statistics": ("إحصائيات", ["إحصائيات", "تقرير"], ["statistics", "stats"]),
    "summary": ("ملخص", ["ملخص", "موجز"], ["summary"]),
    "details": ("تفاصيل", ["تفاصيل", "معلومات"], ["details", "info"]),
    "settings": ("إعدادات", ["إعدادات", "ضبط"], ["settings", "config"]),
    "config": ("إعدادات", ["إعدادات", "تكوين"], ["config", "configuration"]),
    "configuration": ("إعدادات", ["إعدادات"], ["configuration"]),
    "history": ("سجل", ["سجل", "سجل تاريخي"], ["history", "log"]),
    "logs": ("سجلات", ["سجلات", "سجل أحداث"], ["logs", "log"]),
    "log": ("سجل", ["سجل"], ["log"]),
    "categories": ("تصنيفات", ["تصنيفات", "أقسام"], ["categories", "category"]),
    "category": ("تصنيف", ["تصنيف", "قسم"], ["category"]),
    "items": ("عناصر", ["عناصر"], ["items", "item"]),
    "item": ("عنصر", ["عنصر"], ["item"]),
    "rules": ("قواعد", ["قواعد", "شروط"], ["rules", "rule"]),
    "rule": ("قاعدة", ["قاعدة", "شرط"], ["rule"]),
    "templates": ("قوالب", ["قوالب"], ["templates", "template"]),
    "template": ("قالب", ["قالب"], ["template"]),
    "balance": ("رصيد", ["رصيد", "أموال"], ["balance"]),
    "transactions": ("حركات", ["حركات", "معاملات", "تحويلات"], ["transactions", "transaction"]),
    "transaction": ("حركة", ["حركة", "معاملة"], ["transaction"]),
    "vouchers": ("قسائم", ["قسائم", "كوبونات"], ["vouchers", "voucher"]),
    "voucher": ("قسيمة", ["قسيمة", "كوبون"], ["voucher"]),
    "points": ("نقاط", ["نقاط", "رصيد نقاط", "نقاط الولاء"], ["points", "point"]),
    "point": ("نقطة", ["نقطة"], ["point"]),
    "members": ("أعضاء", ["أعضاء", "عملاء"], ["members", "member"]),
    "member": ("عضو", ["عضو", "عميل"], ["member"]),
    "tiers": ("مستويات وفئات", ["مستويات", "فئات"], ["tiers", "tier"]),
    "tier": ("مستوى", ["مستوى", "فئة"], ["tier"]),
    "rewards": ("مكافآت", ["مكافآت", "جوائز"], ["rewards", "reward"]),
    "reward": ("مكافأة", ["مكافأة", "جائزة"], ["reward"]),
    "expenses": ("مصروفات ونفقات", ["مصروفات", "نفقات"], ["expenses", "expense"]),
    "expense": ("مصروف", ["مصروف", "نفقة"], ["expense"]),
    "payouts": ("مدفوعات ومستحقات", ["مدفوعات", "مستحقات"], ["payouts", "payout"]),
    "payout": ("دفعة", ["دفعة", "مستحق"], ["payout"]),
    "events": ("أحداث", ["أحداث"], ["events", "event"]),
    "event": ("حدث", ["حدث"], ["event"]),
    "campaigns": ("حملات", ["حملات"], ["campaigns", "campaign"]),
    "campaign": ("حملة", ["حملة"], ["campaign"]),
    "export": ("تصدير", ["تصدير"], ["export"]),
    "import": ("استيراد", ["استيراد"], ["import"]),
    "analytics": ("تحليلات", ["تحليلات", "أداء"], ["analytics"]),
    "status": ("حالة", ["حالة"], ["status"]),
    "workflow": ("مسار العمل", ["مسار العمل", "دورة العمل"], ["workflow"]),
    "rates": ("أسعار ونسب", ["أسعار", "نسب"], ["rates", "rate"]),
    "commissions": ("عمولات", ["عمولات", "نسب"], ["commissions", "commission"]),
    "commission": ("عمولة", ["عمولة"], ["commission"]),
    "links": ("روابط", ["روابط", "روابط تتبع"], ["links", "link"]),
    "link": ("رابط", ["رابط"], ["link"]),
    "clicks": ("نقرات", ["نقرات"], ["clicks", "click"]),
    "conversions": ("تحويلات", ["تحويلات"], ["conversions", "conversion"]),
    "discounts": ("خصومات", ["خصومات", "تخفيضات"], ["discounts", "discount"]),
    "discount": ("خصم", ["خصم", "تخفيض"], ["discount"]),
    "usage": ("استخدام", ["استخدام", "استهلاك"], ["usage"]),
    "verify": ("تحقق", ["تحقق", "فحص"], ["verify"]),
    "validate": ("تحقق وصحة", ["تحقق", "صحة"], ["validate"]),
    "apply": ("تطبيق", ["تطبيق"], ["apply"]),
    "claim": ("مطالبة", ["مطالبة"], ["claim"]),
    "approve": ("اعتماد", ["اعتماد", "موافقة"], ["approve"]),
    "reject": ("رفض", ["رفض"], ["reject"]),
    "cancel": ("إلغاء", ["إلغاء"], ["cancel"]),
    "retry": ("إعادة محاولة", ["إعادة"], ["retry"]),
    "sync": ("مزامنة", ["مزامنة"], ["sync"]),
    "send": ("إرسال", ["إرسال"], ["send"]),
    "download": ("تحميل", ["تحميل", "تنزيل"], ["download"]),
    "upload": ("رفع", ["رفع"], ["upload"]),
    "preview": ("معاينة", ["معاينة"], ["preview"]),
    "test": ("اختبار", ["اختبار"], ["test"]),
    "active": ("نشط", ["نشط"], ["active"]),
    "archived": ("مؤرشف", ["مؤرشف", "أرشيف"], ["archived"]),
    "products": ("منتجات", ["منتجات", "سلع"], ["products", "product"]),
    "product": ("منتج", ["منتج", "سلعة"], ["product"]),
    "orders": ("طلبات", ["طلبات", "أوردرات"], ["orders", "order"]),
    "order": ("طلب", ["طلب", "أوردر"], ["order"]),
    "customers": ("عملاء", ["عملاء", "زبائن"], ["customers", "customer"]),
    "customer": ("عميل", ["عميل", "زبون"], ["customer"]),
}

# Standard optional parameters for GET queries (safe bridge translation)
GET_PROPERTIES: dict[str, dict[str, str]] = {
    "page": {
        "type": "integer",
        "description": "رقم الصفحة للنتائج (اختياري، يبدأ من 1)",
    },
    "limit": {
        "type": "integer",
        "description": "عدد النتائج في الصفحة الواحدة (اختياري، افتراضي 10 إلى 50)",
    },
    "search": {
        "type": "string",
        "description": "كلمة بحث للفلترة بالاسم أو الكود أو النص (اختياري)",
    },
    "status": {
        "type": "string",
        "description": "فلترة النتائج بحالة معينة (اختياري)",
    },
    "dateFrom": {
        "type": "string",
        "description": "تاريخ البداية للفلترة بصيغة YYYY-MM-DD (اختياري)",
    },
    "dateTo": {
        "type": "string",
        "description": "تاريخ النهاية للفلترة بصيغة YYYY-MM-DD (اختياري)",
    },
}


def _clean_segment(seg: str) -> str:
    return seg.replace("-", "_").strip()


def _is_placeholder(seg: str) -> bool:
    return seg.startswith(":") or seg in ("param", "id") or bool(re.match(r"^[0-9a-f-]{4,}$", seg))


def _extract_segments(path: str) -> list[str]:
    raw = [s for s in path.strip("/").split("/") if s]
    # strip /api/v1 prefix
    if len(raw) >= 2 and raw[0] == "api" and raw[1] == "v1":
        raw = raw[2:]
    return raw


def describe_capability(
    *,
    method: str,
    path: str,
    domain: str,
    permission_key: str | None,
    app_slug: str | None,
    existing_hint: str | None = None,
) -> dict[str, Any]:
    """Describe a store capability with Arabic usage hint, English description,
    search aliases, and safe input parameters schema.

    Pure function: stdlib only, side-effect free, idempotent.
    """
    method_upper = (method or "GET").upper().strip()
    norm_domain = (domain or "other").strip().lower().replace("-", "_")

    # Domain translation
    domain_meta = DOMAIN_ARABIC.get(norm_domain)
    if domain_meta:
        domain_ar_primary, domain_ar_syns, domain_en_syns = domain_meta
    else:
        # Fallback for unknown domain: ensure domain_ar_primary has no raw Latin characters
        domain_ar_primary = "النظام"
        fallback_label = norm_domain.replace("_", " ")
        domain_ar_syns = [fallback_label]
        domain_en_syns = [fallback_label]

    segments = _extract_segments(path)
    meaningful = [s for s in segments if not _is_placeholder(s)]

    # Identify tail resource and whether this is a single-item by ID lookup
    is_item_lookup = bool(segments and _is_placeholder(segments[-1]))
    tail_seg = meaningful[-1] if meaningful else norm_domain
    tail_seg_clean = _clean_segment(tail_seg)

    tail_meta = SEGMENT_TRANSLATIONS.get(tail_seg_clean)
    if tail_meta:
        tail_ar, tail_ar_syns, tail_en_syns = tail_meta
    elif tail_seg_clean in DOMAIN_ARABIC:
        tail_ar, tail_ar_syns, tail_en_syns = DOMAIN_ARABIC[tail_seg_clean]
    else:
        pretty_tail = tail_seg_clean.replace("_", " ")
        tail_ar = pretty_tail
        tail_ar_syns = [pretty_tail]
        tail_en_syns = [pretty_tail]

    # Rule: Zero leaked English in usage_hint_ar.
    # If tail_ar contains any Latin characters (untranslated path segment),
    # strictly discard it and use the Arabic domain name only.
    tail_is_arabic = not bool(re.search(r"[A-Za-z]", tail_ar))

    # Build Arabic usage hint (if not already set with a custom human hint)
    custom_human_hint = False
    if existing_hint and str(existing_hint).strip():
        stripped = str(existing_hint).strip()
        if not stripped.lower().startswith("auto-discovered"):
            usage_hint_ar = stripped
            custom_human_hint = True

    if not custom_human_hint:
        if method_upper == "GET":
            if is_item_lookup:
                if tail_is_arabic and tail_ar != domain_ar_primary:
                    usage_hint_ar = f"تفاصيل {tail_ar} — استعلام عن بيانات وسجل {domain_ar_primary} بواسطة المعرف"
                else:
                    usage_hint_ar = f"تفاصيل عنصر في {domain_ar_primary} — استعلام عن البيانات بواسطة المعرف"
            elif tail_seg_clean in ("stats", "statistics", "analytics", "summary"):
                usage_hint_ar = f"إحصائيات {domain_ar_primary} — عرض تقارير ومؤشرات الأداء مع فلترة بالفترة والحالة"
            elif tail_seg_clean in ("settings", "config", "configuration"):
                usage_hint_ar = f"إعدادات {domain_ar_primary} — استعلام وعرض إعدادات وتكوين النظام"
            else:
                # E.g. GET /api/v1/returns/requests → «قائمة طلبات المرتجعات — اعرض المرتجعات مع فلترة بالفترة والحالة»
                if tail_is_arabic and tail_ar != domain_ar_primary and tail_seg_clean != norm_domain:
                    title = f"قائمة {tail_ar} {domain_ar_primary}"
                else:
                    title = f"قائمة {domain_ar_primary}"
                usage_hint_ar = f"{title} — اعرض {domain_ar_primary} مع فلترة بالفترة والحالة"
        elif method_upper == "POST":
            if tail_is_arabic and tail_ar != domain_ar_primary and tail_seg_clean != norm_domain:
                usage_hint_ar = f"إنشاء {tail_ar} في {domain_ar_primary} — تسجيل وحفظ بيانات جديدة"
            else:
                usage_hint_ar = f"إنشاء عنصر جديد في {domain_ar_primary} — تسجيل وحفظ بيانات جديدة"
        elif method_upper in ("PUT", "PATCH"):
            if tail_is_arabic and tail_ar != domain_ar_primary and tail_seg_clean != norm_domain:
                usage_hint_ar = f"تحديث {tail_ar} في {domain_ar_primary} — تعديل وحفظ بيانات السجل"
            else:
                usage_hint_ar = f"تحديث بيانات في {domain_ar_primary} — تعديل وحفظ بيانات السجل"
        elif method_upper == "DELETE":
            if tail_is_arabic and tail_ar != domain_ar_primary and tail_seg_clean != norm_domain:
                usage_hint_ar = f"حذف {tail_ar} من {domain_ar_primary} — إزالة أو إلغاء السجل نهائيًا"
            else:
                usage_hint_ar = f"حذف عنصر من {domain_ar_primary} — إزالة أو إلغاء السجل نهائيًا"
        else:
            usage_hint_ar = f"عملية على {domain_ar_primary}"

    # Build English description
    pretty_tail_en = tail_seg_clean.replace("_", " ")
    pretty_domain_en = norm_domain.replace("_", " ")
    if method_upper == "GET":
        if is_item_lookup:
            description_en = f"Get {pretty_tail_en} details in {pretty_domain_en} by id"
        else:
            description_en = f"List {pretty_tail_en} in {pretty_domain_en} with filtering"
    elif method_upper == "POST":
        description_en = f"Create {pretty_tail_en} in {pretty_domain_en}"
    elif method_upper in ("PUT", "PATCH"):
        description_en = f"Update {pretty_tail_en} in {pretty_domain_en}"
    elif method_upper == "DELETE":
        description_en = f"Delete {pretty_tail_en} from {pretty_domain_en}"
    else:
        description_en = f"{method_upper} {pretty_tail_en} in {pretty_domain_en}"

    # Collect deduplicated aliases (Arabic + English)
    aliases_list: list[str] = []
    seen: set[str] = set()

    def _add(tok: str | None) -> None:
        if not tok:
            return
        t = str(tok).strip().lower()
        if t and t not in seen:
            seen.add(t)
            aliases_list.append(t)

    # 1) Domain synonyms
    for item in domain_ar_syns:
        _add(item)
    for item in domain_en_syns:
        _add(item)

    # 2) Tail segment synonyms
    for item in tail_ar_syns:
        _add(item)
    for item in tail_en_syns:
        _add(item)

    # 3) Method action keywords
    if method_upper == "GET":
        for k in ("قائمة", "عرض", "استعلام", "list"):
            _add(k)
    elif method_upper == "POST":
        for k in ("إنشاء", "إضافة", "create"):
            _add(k)
    elif method_upper in ("PUT", "PATCH"):
        for k in ("تحديث", "تعديل", "update"):
            _add(k)
    elif method_upper == "DELETE":
        for k in ("حذف", "إلغاء", "delete"):
            _add(k)

    # Safe input schema: GET endpoints accept standard query parameters;
    # writes (POST/PUT/PATCH/DELETE) remain strictly parameterless (no guessing).
    if method_upper == "GET":
        input_schema: dict[str, Any] = {
            "type": "object",
            "properties": {k: dict(v) for k, v in GET_PROPERTIES.items()},
            "required": [],
        }
    else:
        input_schema = {
            "type": "object",
            "properties": {},
        }

    return {
        "usage_hint_ar": usage_hint_ar,
        "description_en": description_en,
        "aliases": aliases_list,
        "input_schema": input_schema,
    }
