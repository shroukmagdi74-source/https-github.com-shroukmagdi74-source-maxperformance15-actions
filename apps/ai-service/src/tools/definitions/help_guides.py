from __future__ import annotations

import re
from typing import Any

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


HELP_GUIDES: dict[str, dict[str, Any]] = {
    "store": {
        "title_ar": "إضافة منتج وتظبيط المتجر",
        "intents": ["أضيف منتج", "أرفع منتجات", "أعدل سعر", "أغيّر شكل المتجر", "أضيف قسم", "أنشر المتجر"],
        "steps": [
            "من القائمة: المنتجات → «إضافة منتج».",
            "اكتب الاسم والسعر والكمية، وارفع صورة واحدة على الأقل.",
            "حدّد التصنيف والـSKU، واضغط «حفظ» — المنتج بيتحفظ كمسودة",
            "افتح شاشة المتجر (ستوديو) من الإعدادات → المتجر، وظبط الأقسام والألوان.",
            "اضغط «نشر» — من غير النشر التغييرات مش بتظهر للعميل.",
        ],
        "screens": ["/products", "/products/new", "/settings/storefront/studio"],
        "agent": "inventory-pricing-agent",
        "ticket_when": "لو المنتج اتحفظ بس مش ظاهر في المتجر بعد النشر.",
    },
    "order-workflow": {
        "title_ar": "تغيير حالة أوردر وإنشاء مراحل مخصصة",
        "intents": ["أغيّر حالة أوردر", "أعمل مرحلة جديدة", "أفلتر أوردرات", "أعدّل مراحل الشغل"],
        "steps": [
            "الطلبات → افتح الأوردر → غيّر الحالة من القائمة اللي فوق.",
            "لو محتاج مراحل تناسب شغلك: الإعدادات → الطلبات → «قوالب الحالات» وأضف مرحلة.",
            "للتغيير الجماعي: الطلبات → «الطلبات الجماعية» → فلتر → نفّذ.",
            "قوالب رسايل تغيير الحالة بتتبعت تلقائي للعميل لو مفعّلة.",
        ],
        "screens": ["/orders", "/orders/status-templates", "/orders/bulk-status"],
        "agent": "order-confirmation-agent",
        "ticket_when": "لو تغيير الحالة بيرجع إيرور أو الرسالة مش بتوصل للعميل.",
    },
    "whatsapp-business": {
        "title_ar": "ربط واتساب وإرسال رسايل للعملاء",
        "intents": ["أربط واتساب", "أبعت رسالة واتساب", "أعمل قالب", "الواتساب مش بيبعت"],
        "steps": [
            "الإعدادات → واتساب → اربط رقمك عبر WhatsApp Business API.",
            "أضف قالب رسالة معتمد من ميتا قبل أي إرسال جماعي.",
            "من الأوردر: اضغط «إرسال واتساب» واختار القالب.",
            "الرسائل داخل نافذة 24 ساعة من آخر رسالة للعميل مجانية؛ غير كده بتحتاج قالب مدفوع.",
        ],
        "screens": ["/whatsapp", "/conversations"],
        "agent": "customer-service-agent",
        "ticket_when": "لو الربط بيرفض أو الرسالة بتفشل مع إن القالب معتمد.",
    },
    "bot-automation": {
        "title_ar": "ظبط الردود الآلية على واتساب وفيسبوك",
        "intents": ["أعمل رد آلي", "أظبط رسالة الترحيب", "أعمل فلوي", "البوت مش بيرد"],
        "steps": [
            "الأتمتة → «ستوديو البوت».",
            "أضف كلمة مفتاحية (زي: مقاسات) والرد بتاعها.",
            "ظبط رسالة الترحيب والرد الافتراضي.",
            "اختبر من «معاينة» قبل التفعيل، وبعدها فعّل البوت.",
        ],
        "screens": ["/automation/bot-studio"],
        "agent": None,
        "ticket_when": "لو البوت مش بيرد على كلمة موجودة أصلًا في القائمة.",
    },
    "bulk-orders": {
        "title_ar": "تعديل مجموعة أوردرات مرة واحدة",
        "intents": ["أغيّر حالة مجموعة أوردرات", "أطبع بوالص كتير", "تحديث جماعي"],
        "steps": [
            "الطلبات → «الطلبات الجماعية».",
            "فلتر الأوردرات المطلوبة (تاريخ/حالة/شركة شحن).",
            "حدّد الكل أو اختار اللي محتاجه، واختار الإجراء.",
            "راجع العدد اللي هيأتأثر، واضغط تنفيذ — مفيش تراجع تلقائي.",
        ],
        "screens": ["/orders/bulk", "/orders/bulk-status"],
        "agent": "order-confirmation-agent",
        "ticket_when": "لو التنفيذ الجماعي أثر على أوردرات مش في الفلتر.",
    },
    "order-preparation-hold": {
        "title_ar": "متابعة طابور التجهيز والنواقص",
        "intents": ["أشوف أوردرات التجهيز", "أعلّم أوردر مستني توريد", "أرجّع أوردر للتجهيز"],
        "steps": [
            "الطلبات → «تجهيز الطلبات» — بيعرض الأوردرات المعلقة في التجهيز.",
            "افتح الأوردر وحطّه في الانتظار مع سبب (ناقص/مستني توريد).",
            "لما الناقص يوصل: شيل التعليق من نفس الشاشة.",
            "الأوردر المعلّق مش بيتبعت للشحن لحد ما يخرج من الانتظار.",
        ],
        "screens": ["/apps/order-preparation", "/apps/order-preparation-hold"],
        "agent": "inventory-pricing-agent",
        "ticket_when": "لو الأوردر بيفضل معلّق بعد إزالة التعليق.",
    },
    "order-shipping-turbo": {
        "title_ar": "إصدار بوليصة وتتبع الشحنة",
        "intents": ["أطلع بوليصة", "أربط شركة شحن", "أتابع شحنة", "الشحن مش بيتحسب"],
        "steps": [
            "ربط شركة الشحن مرة واحدة: الشحن → الشركات → اربط (Turbo / بوسطة / QP / أرامكس).",
            "من الأوردر: «إصدار بوليصة» — رقم التتبع بيتولد تلقائي.",
            "تابع الحالة من الشحن → التتبع، أو افتح الأوردر نفسه.",
            "أسعار الشحن بتتحسب حسب المحافظة والوزن — راجع إعدادات الأسعار لو الرقم غريب.",
        ],
        "screens": ["/shipping", "/orders"],
        "agent": "order-confirmation-agent",
        "ticket_when": "لو البوليصة بتصدر برقم تتبع مش بيتحدث أو الوزن غلط دايمًا.",
    },
    "inventory-pro": {
        "title_ar": "المخزون والتنبيهات والنواقص",
        "intents": ["أعدّل كمية", "أشوف النواقص", "أضيف مستودع", "تحويل مخزون"],
        "steps": [
            "المخزون → الأصناف → افتح الصنف وعدّل الكمية (بيتسجل حركة).",
            "تنبيه «أوشك على النفاد» بيظهر في لوحة التنبيهات — ظبط الحد من إعدادات الصنف.",
            "للمستودعات: المخزون → المستودعات → أضف مستودع وانقل بينهم.",
            "كل أوردر بيتخصم من المخزون تلقائي لو الربط مفعّل.",
        ],
        "screens": ["/inventory", "/products"],
        "agent": "inventory-pricing-agent",
        "ticket_when": "لو الكمية بتتخصم مرتين أو مش بتتخصم خالص.",
    },
    "returns-settings": {
        "title_ar": "قواعد الإرجاع ومدة السماح",
        "intents": ["أظبط مدة الإرجاع", "أمنع إرجاع منتج", "أوافق على مرتجع"],
        "steps": [
            "المرتجعات → الإعدادات.",
            "حدّد مدة السماح بالإرجاع والشروط.",
            "اختار مين يقدر يوافق على المرتجع.",
            "احفظ — الإعدادات بتتطبق على الطلبات الجديدة، مش المفتوحة.",
        ],
        "screens": ["/returns/settings", "/returns"],
        "agent": "customer-service-agent",
        "ticket_when": "لو المرتجع بيتقبل بعد المدة اللي حددتها.",
    },
    "returns-reasons-analytics": {
        "title_ar": "تحليل أسباب المرتجعات",
        "intents": ["أسباب الإرجاع", "أكتر سبب مرتجع", "نسبة الإرجاع"],
        "steps": [
            "التحليلات → الطلبات → «أسباب المرتجعات».",
            "اختار الفترة (30 يوم افتراضي).",
            "شوف التوزيع حسب السبب والمنتج.",
            "الأسباب الفاضية بتظهر «غير محدد» — علّم الفريق يسجل السبب دايمًا.",
        ],
        "screens": ["/analytics/orders/returns-reasons", "/analytics/orders/returns"],
        "agent": None,
        "ticket_when": "لو الأرقام مختلفة عن عدد المرتجعات في صفحة المرتجعات.",
    },
    "orders-analytics": {
        "title_ar": "قراءة أرقام الطلبات والقمع",
        "intents": ["نسبة الإلغاء", "نسبة التسليم", "تحصيل COD", "توزيع المحافظات"],
        "steps": [
            "التحليلات → الطلبات → النظرة العامة.",
            "اختار الفترة من الفلتر اللي فوق.",
            "القمع بيوريك فين أكبر تسريب (تأكيد → تجهيز → شحن → تسليم).",
            "تقارير COD والتسليم في تبويبات منفصلة.",
        ],
        "screens": ["/analytics/orders", "/analytics/orders/funnel", "/analytics/orders/cod-performance"],
        "agent": None,
        "ticket_when": "لو الأرقام مش متطابقة بين شاشتين.",
    },
    "profit-analytics": {
        "title_ar": "حساب صافي الربح",
        "intents": ["صافي الربح", "ربح المنتج", "تكلفة الشحن من الربح"],
        "steps": [
            "التحليلات → الطلبات → «الأرباح».",
            "اتأكد إن تكلفة المنتج متسجلة لكل صنف.",
            "مصروف الإعلان بيتخصم تلقائي لو الحملة مربوطة.",
            "المنتج اللي مش متسجل له تكلفة بيظهر بربح 0 — مش تقدير.",
        ],
        "screens": ["/analytics/orders/profit", "/analytics/orders/revenue"],
        "agent": "inventory-pricing-agent",
        "ticket_when": "لو الربح ظاهر بالسالب مع إن التكلفة والشحن متسجلين صح.",
    },
    "campaign-attribution": {
        "title_ar": "ربط الأوردر بالحملة",
        "intents": ["أعرف الأوردر جاي منين", "أربط حملة", "UTM"],
        "steps": [
            "التسويق → إسناد الحملات.",
            "اتأكد إن لينكات الإعلان فيها UTM (source/medium/campaign).",
            "الأوردر بيظهر منسوب للحملة تلقائيًا.",
            "الأوردرات بدون UTM بتظهر «مباشر»."
        ],
        "screens": ["/analytics/orders/campaign-attribution"],
        "agent": "facebook-media-buyer-agent",
        "ticket_when": "لو أوردرات حملة معروفة بتظهر «مباشر»."
    },
    "campaign-attribution-analytics": {
        "title_ar": "أداء الحملات بالتكلفة والأوردر",
        "intents": ["تكلفة الأوردر", "أي حملة أحسن", "مصروف الحملة"],
        "steps": [
            "التحليلات → «بيانات الحملة».",
            "شوف كل حملة: عدد الأوردر + التكلفة + تكلفة الأوردر الواحد.",
            "قارن بالربح مش بالكليك.",
            "الحملات المقفولة بتفضل في التقارير التاريخية."
        ],
        "screens": ["/analytics/orders/campaign-attribution"],
        "agent": "facebook-media-buyer-agent",
        "ticket_when": "لو مصروف الحملة مش ظاهر أو مختلف عن فيسبوك."
    },
    "facebook-ads-pro": {
        "title_ar": "إنشاء حملة وإعلان من المنصة",
        "intents": ["أعمل حملة", "أعمل إعلان", "أربط حساب إعلانات", "جمهور مشابه"],
        "steps": [
            "الإعلانات → «ربط الحساب» — اربط حساب إعلاناتك وصفحتك.",
            "الحملات → «حملة جديدة»: الهدف والميزانية.",
            "اختار الجمهور (أو اعمل جمهور مشابه من عملائك).",
            "اعمل الإعلان كمسودة → راجع المعاينة → انشر بعد الموافقة."
        ],
        "screens": [
            "/advertising/facebook-ads/connection",
            "/advertising/facebook-ads/campaigns",
            "/advertising/facebook-ads/audiences",
            "/advertising/facebook-ads/create-full-ad",
        ],
        "agent": "facebook-media-buyer-agent",
        "ticket_when": "لو الحملة مرفوضة من فيسبوك أو الإنفاق مش ظاهر."
    },
    "facebook-pages-connect": {
        "title_ar": "ربط صفحة فيسبوك بالمنصة",
        "intents": ["أربط صفحة", "الرسائل مش بتوصل", "صلاحيات الصفحة"],
        "steps": [
            "الإعدادات → فيسبوك → «ربط صفحة».",
            "سجّل دخول واختار الصفحة، ووافق على صلاحيات الرسائل.",
            "اتأكد إن الصفحة ظاهرة «متصلة».",
            "لو الرسائل مش بتوصل: راجع صلاحية الصفحة في مدير أعمال فيسبوك."
        ],
        "screens": ["/conversations"],
        "agent": "customer-service-agent",
        "ticket_when": "لو الصفحة بتظهر متصلة والرسائل مش بتوصل."
    },
    "unified-inbox": {
        "title_ar": "الصندوق الموحد والرد على العملاء",
        "intents": ["أرد على عميل", "الرسائل فين", "أوزّع محادثات"],
        "steps": [
            "المحادثات → الصندوق الموحد (ماسنجر + واتساب + إنستجرام).",
            "افتح المحادثة ورد من نفس المكان.",
            "علّم المحادثة أو حوّلها لزميل.",
            "الردود بتتأرشف تلقائي."
        ],
        "screens": ["/conversations"],
        "agent": "customer-service-agent",
        "ticket_when": "لو محادثة من قناة مربوطة مش ظاهرة في الصندوق."
    },
}


class HelpGuideInput(BaseModel):
    action: str = Field(
        description="نوع العملية: 'search' للبحث في الأدلة بالسؤال أو الكلمات المفتاحية، أو 'get' لجلب الدليل الكامل بالخطوات والروابط عبر معرف الـ slug."
    )
    query: str | None = Field(
        default=None,
        description="نص السؤال أو الاستفسار أو الكلمات المفتاحية (مطلوب عند action='search')."
    )
    slug: str | None = Field(
        default=None,
        description="معرف الدليل المطلوب جلبه بالكامل (مطلوب عند action='get')."
    )


def _normalize_arabic(text: str) -> str:
    if not text:
        return ""
    t = text.lower()
    t = re.sub(r"[\u064B-\u065F\u0670\u0640]", "", t)
    t = re.sub(r"[إأآٱ]", "ا", t)
    t = re.sub(r"ى", "ي", t)
    t = re.sub(r"ة", "ه", t)
    t = re.sub(r"ؤ", "و", t)
    t = re.sub(r"ئ", "ي", t)
    t = re.sub(r"[^\w\s-]", " ", t)
    return " ".join(t.split())


def _strip_prefix(w: str) -> list[str]:
    candidates = [w]
    if w.startswith("لل") and len(w) > 3:
        candidates.append(w[2:])
    elif w.startswith("ال") and len(w) > 3:
        candidates.append(w[2:])
    elif (w.startswith("ب") or w.startswith("ف") or w.startswith("و") or w.startswith("ك")) and len(w) > 3:
        candidates.append(w[1:])
    return candidates


def _score_guide(guide_slug: str, guide: dict[str, Any], query: str) -> int:
    norm_query = _normalize_arabic(query)
    q_words = norm_query.split()
    if not q_words:
        return 0

    norm_slug = _normalize_arabic(guide_slug.replace("-", " "))
    norm_title = _normalize_arabic(guide.get("title_ar", ""))
    norm_intents = [_normalize_arabic(i) for i in guide.get("intents", [])]

    score = 0

    # 1. Exact phrase matches on intents & title
    for intent in norm_intents:
        if norm_query == intent:
            score += 150
        elif norm_query in intent:
            score += 90
        elif intent in norm_query:
            score += 80

    if norm_query == norm_title:
        score += 120
    elif norm_query in norm_title:
        score += 70
    elif norm_title in norm_query:
        score += 60

    # 2. Token level matching with prefix stripping
    title_words = set(norm_title.split())
    slug_words = set(norm_slug.split())
    all_intent_words: set[str] = set()
    for intent in norm_intents:
        all_intent_words.update(intent.split())

    for qw in q_words:
        qw_forms = _strip_prefix(qw)
        matched_intent = False
        for cand in qw_forms:
            for iw in all_intent_words:
                if cand == iw:
                    score += 30
                    matched_intent = True
                    break
                elif len(cand) >= 3 and len(iw) >= 3 and (cand in iw or iw in cand):
                    score += 15
                    matched_intent = True
                    break
            if matched_intent:
                break

        matched_title = False
        for cand in qw_forms:
            for tw in title_words:
                if cand == tw:
                    score += 25
                    matched_title = True
                    break
                elif len(cand) >= 3 and len(tw) >= 3 and (cand in tw or tw in cand):
                    score += 12
                    matched_title = True
                    break
            if matched_title:
                break

        for cand in qw_forms:
            if cand in slug_words:
                score += 15
                break

    return score


def search_guides(query: str, limit: int = 3) -> dict[str, Any]:
    clean_query = str(query or "").strip()
    if not clean_query:
        message_ar = (
            "مفيش دليل موثّق: نص البحث فارغ. يرجى تزويد سؤال أو كلمات مفتاحية، "
            "أو فتح تذكرة دعم فني عبر support_ticket_link."
        )
        return {
            "action": "search",
            "query": clean_query,
            "count": 0,
            "results": [],
            "message_ar": message_ar,
            "support_ticket_link_suggested": True,
        }

    scored: list[tuple[int, str, dict[str, Any]]] = []
    for slug, guide in HELP_GUIDES.items():
        s = _score_guide(slug, guide, clean_query)
        if s > 0:
            scored.append((s, slug, guide))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_entries = scored[:limit]

    if not top_entries:
        message_ar = (
            "مفيش دليل موثّق بخصوص هذا السؤال في أدلة الاستخدام الحالية.\n"
            "تقدر تقترح على التاجر فتح تذكرة دعم فني باستخدام أداة support_ticket_link لمتابعة طلبه مباشرة مع الفريق."
        )
        return {
            "action": "search",
            "query": clean_query,
            "count": 0,
            "results": [],
            "message_ar": message_ar,
            "support_ticket_link_suggested": True,
        }

    results: list[dict[str, Any]] = []
    lines: list[str] = [f"لقيت {len(top_entries)} أدلة مطابقة:"]
    for s, slug, guide in top_entries:
        first_step = guide["steps"][0] if guide.get("steps") else ""
        results.append({
            "slug": slug,
            "title_ar": guide.get("title_ar", ""),
            "score": s,
            "first_step": first_step,
        })
        lines.append(f"- **{guide.get('title_ar')}** (`{slug}`): {first_step}")

    lines.append("\nاستدعِ `help_guide` بـ `action='get'` و `slug` لجلب الخطوات المرقمة وروابط الشاشات كاملة.")
    return {
        "action": "search",
        "query": clean_query,
        "count": len(results),
        "results": results,
        "message_ar": "\n".join(lines),
    }


def get_guide(slug: str) -> dict[str, Any]:
    clean_slug = str(slug or "").strip().lower()
    guide = HELP_GUIDES.get(clean_slug)
    if not guide:
        message_ar = (
            f"مفيش دليل موثّق بالمعرف '{clean_slug}'.\n"
            "استخدم action='search' للبحث عن الأدلة المتاحة، أو اقترح تذكرة دعم فني عبر support_ticket_link."
        )
        return {
            "action": "get",
            "slug": clean_slug,
            "error": f"الدليل '{clean_slug}' غير موجود",
            "message_ar": message_ar,
            "support_ticket_link_suggested": True,
        }

    raw_steps = guide.get("steps", [])
    numbered_steps: list[str] = []
    for i, step in enumerate(raw_steps):
        st = str(step).strip()
        if re.match(r"^\d+\.", st):
            numbered_steps.append(st)
        else:
            numbered_steps.append(f"{i+1}. {st}")

    raw_screens = guide.get("screens", [])
    full_screens: list[str] = []
    for sc in raw_screens:
        s = str(sc).strip()
        if s.startswith("http://") or s.startswith("https://"):
            full_screens.append(s)
        elif s.startswith("/"):
            full_screens.append(f"https://maxp.online{s}")
        else:
            full_screens.append(f"https://maxp.online/{s}")

    agent = guide.get("agent")
    ticket_when = guide.get("ticket_when")

    lines: list[str] = [
        f"📌 **{guide.get('title_ar')}** (`{clean_slug}`)",
        "",
        "**الخطوات العملية:**",
        *numbered_steps,
        "",
        "**روابط الشاشات المباشرة:**",
        *[f"- {url}" for url in full_screens],
    ]
    if agent:
        lines.append(f"\n**الوكيل المختص:** `{agent}`")
    if ticket_when:
        lines.append(f"**متى تقترح تذكرة دعم؟** {ticket_when}")

    return {
        "action": "get",
        "slug": clean_slug,
        "title_ar": guide.get("title_ar"),
        "steps": numbered_steps,
        "screens": full_screens,
        "agent": agent,
        "ticket_when": ticket_when,
        "message_ar": "\n".join(lines),
    }


def execute_help_guide(
    action: str,
    query: str | None = None,
    slug: str | None = None,
) -> dict[str, Any]:
    act = str(action or "").strip().lower()
    if act == "search":
        return search_guides(query=query or "")
    elif act == "get":
        return get_guide(slug=slug or "")
    else:
        return {
            "error": f"الإجراء '{action}' غير صالح. الإجراءات المتاحة: 'search' أو 'get'.",
            "message_ar": "إجراء غير معروف. استخدم action='search' للبحث أو action='get' لجلب الدليل بالـ slug.",
        }


async def help_guide(
    input_data: HelpGuideInput | dict[str, Any] | None = None,
    **kwargs: Any,
) -> dict[str, Any]:
    if input_data is None:
        raw = kwargs
    elif isinstance(input_data, dict):
        raw = {**input_data, **kwargs}
    elif isinstance(input_data, HelpGuideInput):
        raw = {
            "action": input_data.action,
            "query": input_data.query,
            "slug": input_data.slug,
        }
    else:
        raw = getattr(input_data, "__dict__", {})

    return execute_help_guide(
        action=raw.get("action", ""),
        query=raw.get("query"),
        slug=raw.get("slug"),
    )


def _format_help_guide(result: dict[str, Any]) -> str:
    return str(result.get("message_ar") or "")


help_guide_tool = FunctionTool(
    name="help_guide",
    description=(
        "البحث في أدلة الاستخدام وشاشات المنصة الموثقة («إزاي/فين/منين») وجلب خطوات مرقمة وروابط شاشات مباشرة والوكيل المختص. "
        "استخدم action='search' للبحث بالكلمات المفتاحية، و action='get' لجلب الخطوات وروابط الشاشات الكاملة بمعرف الدليل (slug)."
    ),
    func=help_guide,
    input_model=HelpGuideInput,
    format_result=_format_help_guide,
    approval_mode="never_require",
)

__all_tools__ = [
    help_guide_tool,
]
