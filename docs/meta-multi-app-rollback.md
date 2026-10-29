# خطة الرجوع المعيارية لبنية تطبيقي Meta (Multi-App Rollback Plan)
**المهمة:** T13 (`3da37115-b24b-4407-81cb-2a70820928dd`)  
**التاريخ:** 2026-10-29  
**النطاق:** التحول الآمن من بنية التطبيقين (Primary + Growth) إلى التطبيق الأساسي الفردي (Primary) دون انقطاع الخدمة أو المساس باتصالات العملاء القائمة.

---

## 1. مبادئ خطة الرجوع
1. **صفر تغيير على التوكنات القائمة:** التوكنات المسجلة للعملاء على تطبيق Primary لا تتطلب أي إعادة ترخيص (Re-auth) أو ترحيل بيانات.
2. **عزل Growth التام:** أي تعطيل لتطبيق Growth لا يؤثر إطلاقًا على عمل تطبيق Primary (رسائل، ويب هوك، إعلانات، بيكسل).
3. **التراجع التلقائي (Zero-Downtime Fallback):** الـ resolvers والـ wrappers مبرمجة للتراجع التلقائي إلى `primary` فور تعطيل `growth`.

---

## 2. خطوات الرجوع الفورية (Step-by-Step Rollback)

### الخطوة 1: تعطيل تطبيق Growth في السجل (Admin Toggle)
يمكن تنفيذها فورًا وبدون إعادة تشغيل الخادم عبر شاشة السوبر أدمن أو من خلال استدعاء API المباشر:

```bash
# تعطيل تطبيق Growth من خلال Super Admin API
curl -X PATCH "http://127.0.0.1:3100/api/v1/super-admin/platform/meta-apps/growth/toggle" \
  -H "Authorization: Bearer <SUPER_ADMIN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

أو مباشرة عبر قاعدة البيانات:
```sql
UPDATE facebook_apps 
SET "isActive" = false, "updatedAt" = NOW() 
WHERE key = 'growth';
```

**الأثر الفوري:**
- أي طلب قادم برابط Growth يتحول تلقائيًا إلى Primary.
- أي حدث ويب هوك موقّع بـ Primary يستمر بالعمل 100%.

---

### الخطوة 2: إيقاف متغيرات البيئة الخاصة بـ Growth (Environment Revert)
في ملف `.env` على السيرفر (أو مدير المتغيرات في PM2 / Docker):

```ini
# إيقاف تفعيل تطبيق النمو
META_GROWTH_ACTIVE="false"

# تفريغ أو تعليق مفاتيح Growth
# FACEBOOK_GROWTH_APP_ID=""
# FACEBOOK_GROWTH_APP_SECRET=""
# FACEBOOK_GROWTH_LOGIN_CONFIG_ID=""
# FACEBOOK_GROWTH_WEBHOOK_VERIFY_TOKEN=""
```

ثم إعادة تشغيل الخدمات بسلاسة:
```bash
pm2 reload maxp-backend --update-env
```

---

### الخطوة 3: التأكد من توجيه كافة الاتصالات إلى Primary
التحقق من أن كافة الصفحات وحسابات الربط تقرأ إعدادات Primary:

```sql
-- فحص الاتصالات القائمة للتأكد من استقرارها
SELECT "facebookAppKey", COUNT(*) 
FROM facebook_pages 
GROUP BY "facebookAppKey";

-- في حال رغبة المشرف في تحويل أي صفحة كانت مسجلة كـ growth إلى primary:
UPDATE facebook_pages 
SET "facebookAppKey" = 'primary' 
WHERE "facebookAppKey" = 'growth';

UPDATE facebook_account_connections 
SET "facebookAppKey" = 'primary' 
WHERE "facebookAppKey" = 'growth';
```

---

### الخطوة 4: التحقق من استقرار الويب هوك (Webhook Health Check)
1. التأكد من استقبال أحداث Webhook بتوقيع Primary:
   - يجب أن يُرجع `GET /api/v1/webhook` كود `200` مع الـ challenge عند إرسال `hub.verify_token` الأساسي.
   - يجب أن تُقبل رسائل `POST /api/v1/webhook` الموقعة بـ `FACEBOOK_APP_SECRET` الأساسي بدون أدنى مشكلة.
2. التحقق من سجلات الخادم:
   ```bash
   grep -E "\[WEBHOOK\]|\[WEBHOOK-EVENT\]" /var/log/maxp/backend.log | tail -n 50
   ```

---

### الخطوة 5: التحقق من عدم تأثر حسابات وتوكنات العملاء القائمة (Zero-Impact Guarantee)
- تشغيل استعلام التحقق من صحة التوكنات لـ `qa-lab` أو أي شركة تجريبية:
```sql
SELECT id, "pageId", "pageName", status, "facebookAppKey" 
FROM facebook_pages 
WHERE "companyId" = 'qa-lab';
```
- التأكد من استمرار عمل نشر المنشورات واستقبال رسائل ماسنجر للعملاء المتصلين سابقًا.

---

## 3. قائمة التحقق بعد الرجوع (Post-Rollback Checklist)
- [ ] تطبيق Growth معطّل (`isActive: false` في جدول `facebook_apps`).
- [ ] طلبات OAuth الافتراضية تولّد رابط تسجيل الدخول بمعرّف التطبيق الأساسي (`762328696481583`).
- [ ] الويب هوك يستقبل الرسائل ويتحقق من التوقيع بالسر الأساسي بنجاح.
- [ ] لا توجد استثناءات أو أخطاء `P2022` أو `UNKNOWN_META_APP` في سجلات النظام.
- [ ] خدمة Gating ترجع رسالة التنبيه المناسبة لأي محاولة استخدام ميزات النمو المعطلة.
