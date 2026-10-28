# خطة الرجوع والتعافي لتطبيقات Meta (Meta Multi-App Rollback Plan)
## التاسك: T13 — بنية تطبيقين فيسبوك (Primary + Growth)

---

### 1. الهدف من الخطة
توفر هذه الوثيقة إجراءات تشغيلية واضحة وفورية للرجوع الكامل والآمن إلى تطبيق فيسبوك الأساسي (`Primary App`) وتعطيل تطبيق النمو (`Growth App`) عند حدوث أي خلل، دون المساس باتصالات العملاء القائمة أو إيقاف الويب هوك الأساسي.

---

### 2. ضمانات التصميم وعدم التأثير (Zero Production Impact)
1. **لا تغيير في التوكنات القائمة:** كافة توكنات العملاء القديمة مربوطة بالتطبيق الأساسي (`Primary`) وتحمل القيمة الافتراضية `facebookAppKey='primary'`.
2. **عزل الأسرار:** لا توجد أسرار مشفرة أو نصوص حساسة مخزنة في قاعدة البيانات؛ جميعها تقرأ عبر المراجع `appSecretRef` من بيئة التشغيل أو الخزنة المشفرة.
3. **التراجع التلقائي (Automatic Fallback):** في حال تعطل تطبيق Growth أو تم ضبطه على `isActive: false`، تعود جميع استدعاءات النظام والموجّهات تلقائياً إلى `Primary`.

---

### 3. خطوات الرجوع الفوري (Instant Emergency Rollback)

#### الخطوة 1: تعطيل تطبيق Growth برمجياً
يمكن تنفيذ التعطيل بأحد طريقين:
- **من لوحة تحكم السوبر أدمن:**
  الانتقال إلى `/super-admin/meta-apps` وتحويل مفتاح التبديل (Toggle Switch) لتطبيق `Growth` إلى وضع الإيقاف (`معطل`).
  أو إرسال الطلب:
  ```http
  PATCH /api/v1/super-admin/platform/meta-apps/growth/toggle
  Content-Type: application/json
  Authorization: Bearer <SUPER_ADMIN_TOKEN>

  {
    "isActive": false
  }
  ```
- **من متغيرات البيئة (Environment Level):**
  ضبط المتغير في ملف البيئة أو في إدارة السيرفر:
  ```bash
  META_GROWTH_ACTIVE=false
  ```
  وإعادة تشغيل خدمات الباك إند:
  ```bash
  pm2 reload maxp-backend
  ```

#### الخطوة 2: التحقق من التراجع التلقائي إلى Primary
بمجرد التعطيل:
- تعود الدالة `isGrowthActive()` بالقيمة `false`.
- الدالة `getFacebookAppKeyConfig('growth')` تُرجع تلقائياً إعدادات التطبيق الأساسي (`primary`).
- استدعاء `getFacebookWebhookVerifyTokens()` و `getAllFacebookAppSecrets()` يستبعد أسرار Growth ويتعامل مع Primary فقط.
- تفحص خدمة `featureRequiresGrowth()` الميزات وتمنعها مع كود `REAUTH_REQUIRED` ورسالة عربية واضحة للعميل («اربط الصفحة تاني لتفعيل الميزة»).

#### الخطوة 3: التحقق من قاعدة البيانات وتحويل أي صفحات تجريبية
للتأكد من عدم بقاء أي صفحة مسجلة على تطبيق Growth:
```sql
-- فحص عدد الصفحات المرتبطة بـ growth
SELECT id, pageName, facebookAppKey FROM facebook_pages WHERE facebookAppKey = 'growth';

-- إعادة توجيهها للتطبيق الأساسي إذا لزم الأمر
UPDATE facebook_pages SET facebookAppKey = 'primary' WHERE facebookAppKey = 'growth';

-- فحص اتصالات الحسابات
UPDATE facebook_account_connections SET facebookAppKey = 'primary' WHERE facebookAppKey = 'growth';

-- فحص حسابات الإعلانات
UPDATE facebook_ad_accounts SET facebookAppKey = 'primary' WHERE facebookAppKey = 'growth';
```

#### الخطوة 4: مسح أو تفريغ متغيرات Growth في السيرفر (اختياري)
في حال الرغبة في إزالة المتغيرات بالكامل من السيرفر:
```bash
unset FACEBOOK_GROWTH_APP_ID
unset FACEBOOK_GROWTH_APP_SECRET
unset FACEBOOK_GROWTH_LOGIN_CONFIG_ID
unset FACEBOOK_GROWTH_WEBHOOK_VERIFY_TOKEN
```

---

### 4. مصفوفة التحقق بعد الرجوع (Post-Rollback Verification)
| الفحص | الأداة | النتيجة المتوقعة |
|---|---|---|
| فحص إعدادات التطبيق | `GET /api/v1/facebook/integration/facebook/config` | يرجع `appId` الخاص بالـ Primary |
| فحص توقيع الويب هوك | إرسال طلب Webhook تجريبي بتوقيع Primary | `200 OK` |
| فحص رسائل ماسنجر | إرسال رسالة من صفحة تجريبية | استلام ومعالجة طبيعية في الشات |
| فحص صفحات وميزات Growth | طلب ميزة مقيدة مثل `growth_ad_management` | استجابة بـ `REAUTH_REQUIRED` |

---

### 5. جهة الاتصال والمسؤولية
- مسؤول النظام: سوبر أدمن المنصة
- تاريخ الاعتماد: 2026-10-28
- التوثيق المرتبط: `C:/Users/ali wazery/maxp-qa/run-1028/briefs/T13.md`
