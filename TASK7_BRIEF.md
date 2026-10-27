# TASK7 — ملاحظات الأوردر: «أول ملاحظة تتحفظ، والتانية بتقولي خطأ»

## 0) قيود صارمة (HARD CONSTRAINTS) — تُقرأ أولاً

1. **ممنوع أي أمر git إطلاقاً** — لا `add` ولا `commit` ولا `checkout` ولا `stash` ولا `push` ولا `reset`. الشغل على شغلة موجودة مسبقاً على الفرع `fix/order-notes`، وممنوع تغيير الـ branch أو الـ worktree.
2. **ممنوع `npm install` / `npm ci` / `pip install`** — أي حلول بمكتبات جديدة مرفوضة. المسار المسموح: تعديل كود موجود فقط.
3. **ممنوع أي deploy أو أي كتابة على production** — لا `curl` بـ POST/PATCH/DELETE على `maxp.online` ولا أي DB كتابة. الاختبار على بيئة محلية/DB اختبار فقط. حل الـ DB (لو مطلوب) من `POSTGRES_URL` في `.env` المحلي، وبدون أي `UPDATE/INSERT/DELETE` على بيانات حقيقية.
4. **التعديل مسموح فقط داخل** `C:/Users/ali wazery/maxp-qa/wt-order-notes` — ولا حاجة تخرج عن الـ worktree ده. وشغلة `C:/Users/ali wazery/.gemini/antigravity/scratch/maxperformance14` مش من شغلك.
5. لو الـ shell واقع/مش موجود: **عدّل الملفات بالمحرر فقط**، وابدأ `node --check` لو أمكن، ولو مش أمكن اكتب في التقرير «shell غير متاح — لم يُنفَّذ --check» بصراحة. ممنوع تخترع نتائج تشغيل.
6. لا تُغيّر أي endpoint تاني غير الثلاثة المذكورة في الجدول، ولا تشيل أي `assertOrderStatusEditable` بره بلوك الملاحظات (6163–6379).

---

## 1) السبب الجذري (Root Cause)

**الكول اللي بيفشل هو `POST /api/v1/orders-new/simple/:orderNumber/notes`** (الباك إند: `apps/backend/routes/orders.js:6163`)، والسبب المباشر إن إنشاء الملاحظة مربوط بقفل تعديل بيانات الأوردر لكل حالة:

- `apps/backend/routes/orders.js:6190-6192` (طلب عادي) و `6224-6226` (طلب ضيف) بينادوا
  `assertOrderStatusEditable(prisma, companyId, order.customStatusCode || order.status)`.
- `apps/backend/utils/orderStatusLock.js:49-66` بتقرأ `orderStatusConfig.allowStatusEdit` للحالة الحالية، و `74-78` بترمي Error بـ `statusCode = 403` ورسالة `34-41`.
- يعني: طالما حالة الأوردر الحالية مضبوطة «غير مسموح بالتعديل» في `settings/orders?tab=status`، **كل** ملاحظة جديدة تترفض بـ 403. القفل ده مربوط بالحالة لحظة الطلب مش بعدد الملاحظات — فأول ملاحظة كانت بتُحفظ وقت ما الحالة كانت مفتوحة (أو قبل تفعيل القفل)، وبعد ما الأوردر دخل حالة مقفولة (تسليم/إلغاء/مرتجع/تجهيز) بقت كل المحاولات تفشل. ده بالظبط سيناريو «مرة بتشتغل والتانية لأ» على نفس الأوردر.
- نفس القفل موجود كمان على `PATCH` (`orders.js:6299-6303`) و `DELETE` (`6362-6366`) — يعني حتى مسح/تعديل الملاحظة القديمة بيقع بنفس 403.
- القفل ده **مقصود بالتصميم القديم** ومكتوب صريح في `apps/backend/docs/orders/order-status-editing-lock-2026-08-17.md:33-35` — فمش regression عرضي، ده قرار تصميم محتاج يتغيّر (شوف §3).

**وليه المستخدمة شافت «خطأ» ومش تفسير القفل:** مسار الخطأ بيضيّع السبب الحقيقي:
- `orders.js:6250-6255` (وبنفس الشكل `6318-6323` و `6373-6378`): أي خطأ مش 403 بيتحوّل لـ **500** برسالة ثابتة `'خطأ في إضافة الملاحظة'` (`6253`)، والسبب الأصلي بيتكتب في `error` فقط.
- الفرونت بيطلّع **توستين**: واحد من الـ interceptor `apps/frontend/src/services/apiClient.ts:628-657` + `695` بصيغة `⚠️ خطأ في إضافة البيانات: ...` (أو `670` «خطأ داخلي في الخادم»)، وواحد من الهوك `useOrderDetailsNotes.ts:31`. النتيجة على الشاشة: «خطأ» بدون أي تفصيل.

### باقي مسارات الفشل المُتحقَّق منها بالكود (كل واحدة ممكن تحصل فعلياً)

| # | المسار | الملف:السطر | النتيجة | ملاحظة |
|---|---|---|---|---|
| 1 | قفل الحالة على الإنشاء | `orders.js:6191-6192`, `6225-6226` + `orderStatusLock.js:74-78` | 403 برسالة القفل | **السبب الأساسي** |
| 2 | قفل الحالة على التعديل/الحذف | `orders.js:6299-6303`, `6362-6366` | 403 | نفس السبب |
| 3 | رسالة خطأ مزيّفة لأي فشل غير 403 | `orders.js:6253`, `6321`, `6376` | 500 «خطأ في إضافة الملاحظة» | بتمنع التشخيص |
| 4 | توست عام من الـ interceptor | `apiClient.ts:628-657`, `695` | «⚠️ خطأ في إضافة البيانات» | توست مكرر/عام |
| 5 | `authorId` مش موجود في `users` (مستخدم تاجر/حساب فرعي) → P2003 FK | `orders.js:6198`, `6232` + `prisma/schema/orders.prisma:250,253` | 500 مغطّى | بيحصّل من أول ملاحظة، فمش تفسير العرض |
| 6 | `content` مش string (مثلاً object) → `content.trim is not a function` | `orders.js:6175`, `6200` | 500 مغطّى | تحصين مطلوب |
| 7 | ملاحظة على أوردر له توأم (Order + GuestOrder): الكتابة بتروح للـ Order والقراءة من `guestOrder.orderNotes` | `orders.js:6180-6211` مقابل `6214-6245` | الملاحظة «مش ظاهرة» | مش خطأ API بس بيدفع المستخدم يعيد |
| 8 | تعديل/حذف ملاحظة لمستخدم مش الكاتب ومش `COMPANY_ADMIN`/`SUPER_ADMIN` | `orders.js:6295-6297`, `6358-6360` | 403 «يمكنك تعديل ملاحظاتك فقط» | ثاني مستخدم بيفشل |
| 9 | `findUnique` + التحقق من الشركة عبر العلاقة، والحذف/التعديل بالـ id فقط بدون `companyId` | `orders.js:6276-6282`, `6306`, `6339-6345`, `6368` | 403 مضلّل / ثغرة عزل شركات | تحصين أمني |
| 10 | مفيش قيد unique على `OrderNote` غير الـ PK | `orders.prisma:245-261` | P2002 مستبعد من الـ schema | لو الـ DB فيه index قديم لازم يتأكد بـ SQL قراءة فقط |
| 11 | ضغطة مزدوجة: `addingNote` متثبّت `false` في الـ Sidebar | `OrderDetailsSidebar.tsx:193` | توستين + ملاحظتين متزامنتين | إصلاح واجهة |

**ملاحظة أمانة:** الـ worktree مفيهوش `node_modules` ولا `.env`، فمفيش إعادة إنتاج حقيقية على DB هنا؛ التشخيص مبني على قراءة الكود + سجل الـ commits (`a4fe02961` وسّع تغطية القفل) + توثيق التصميم. أي اختبار حقيقي لازم يتم على بيئة اختبار.

---

## 2) جدول الملفات المطلوب تعديلها

| # | الملف:السطر | قبل | بعد |
|---|---|---|---|
| 1 | `apps/backend/routes/orders.js:6190-6192` | `require('../utils/orderStatusLock')` + `await assertOrderStatusEditable(..., regularOrder.customStatusCode \|\| regularOrder.status)` قبل `orderNote.create` | يُحذف البلوك بالكامل + كومنت: `// الملاحظات توثيق وليست تعديل بيانات أوردر — لا يخضع لقفل الحالة` |
| 2 | `apps/backend/routes/orders.js:6224-6226` | نفس القفل على مسار الضيف | يُحذف بالكامل |
| 3 | `apps/backend/routes/orders.js:6299-6303` | `lockOrder` / `lockStatus` + `await assertOrderStatusEditable` | يُحذف بالكامل (يُبقى فحص الملكية 6289-6297 كما هو) |
| 4 | `apps/backend/routes/orders.js:6362-6366` | `lockOrderDelete` / `lockStatusDelete` + `await assertOrderStatusEditable` | يُحذف بالكامل |
| 5 | `apps/backend/routes/orders.js:6250-6255` | `message = statusCode === 403 ? error.message : 'خطأ في إضافة الملاحظة'` | `message = error.message \|\| 'تعذر إضافة الملاحظة'` مع `code: error.code` في الـ JSON؛ الحالات 400/403/404 بترجع قبل الـ catch فمفيش تغيير في عقدها |
| 6 | `apps/backend/routes/orders.js:6318-6323` | نفس القناع على PATCH | نفس المعالجة (`error.message` الحقيقي + `code`) |
| 7 | `apps/backend/routes/orders.js:6373-6378` | نفس القناع على DELETE | نفس المعالجة |
| 8 | `apps/backend/routes/orders.js:6175-6177` | `if (!content \|\| !content.trim())` | `if (typeof content !== 'string' \|\| !content.trim())` → 400، وحد أقصى `content.trim().length > 4000` → 400 برسالة واضحة (يمنع 500 غامض) |
| 9 | `apps/backend/routes/orders.js:6305-6307` و `6368` | `update/delete({ where: { id: noteId } })` | `updateMany`/`deleteMany({ where: { id: noteId, OR: [{ order: { companyId } }, { guestOrder: { companyId } }] } })` والتحقق من `count` — منع تعديل/حذف عبر شركة تانية |
| 10 | `apps/frontend/src/pages/orders/hooks/useOrderDetailsNotes.ts:20-35` | `apiClient.post(url, { content })` + `toast.error(... \|\| "فشل إضافة الملاحظة")` (توست مكرر مع الـ interceptor) | `apiClient.post(url, { content }, { _skipErrorToast: true })`، ولو `success === false` ارمِ `Error(message)`، والتوست يظهر `error.response?.data?.message ?? error.message` فقط — مرة واحدة |
| 11 | `apps/frontend/src/pages/orders/hooks/useOrderDetailsNotes.ts:42-59` | نفس النمط في PATCH | نفس المعالجة + `_skipErrorToast` |
| 12 | `apps/frontend/src/pages/orders/hooks/useOrderDetailsNotes.ts:65-79` | نفس النمط في DELETE | نفس المعالجة + `_skipErrorToast` |
| 13 | `apps/frontend/src/pages/orders/components/OrderActivityLog.tsx:51-55` + `:20` | `handleAddNote` بينادي `onAddNote(note)` بدون await ويفضي الخانة فوراً (`54`) | `async` + `const ok = await onAddNote(note); if (ok) setNote("")` — النص مبيضيعش لو فشل؛ نوع الـ prop يبقى `(note: string) => Promise<boolean>` |
| 14 | `apps/frontend/src/pages/orders/components/OrderDetailsSidebar.tsx:42-49` و `:193` | `addingNote={false}` متثبّت | prop جديد `addingNote: boolean` في الواجهة، و `addingNote={addingNote}` (بيمنع الضغط المزدوج — الزر أصلاً `disabled={addingNote}` في `OrderActivityLogAddNote.tsx:38`) |
| 15 | `apps/frontend/src/pages/orders/OrderDetails.tsx:199-208` | مش بيتمرر `addingNote` | `addingNote={addingNote}` |
| 16 | `apps/frontend/src/pages/orders/hooks/useOrderDetailsController.ts:52-62` و `:246-251` | مش بياخد/يرجّع `addingNote` | يضيف `addingNote` في الـ destructure والـ return (موجود أصلاً في `useOrderDetails.ts:32,280`) |
| 17 | `apps/backend/docs/orders/order-status-editing-lock-2026-08-17.md:33-35` | بيسجّل إن الملاحظات داخل نطاق القفل | يتحوّل لجدول «مستثنى»: الملاحظات (إضافة/تعديل/حذف) **خارج** نطاق القفل، مع سبب القرار |

---

## 3) قرار المنتج (إلزامي — يمشي كما هو)

**الملاحظة توثيق، مش تعديل بيانات أوردر.** لذلك:

- الملاحظات (إنشاء/تعديل/حذف) **لازم تشتغل على أي حالة أوردر**، بما فيها الحالات المقفولة `allowStatusEdit = false`.
- القفل يستمر يمنع **تعديل بيانات الأوردر والحالة** فقط: `PUT /simple/:orderNumber`، `PUT /simple/:orderNumber/items`، `POST /simple/:orderNumber/schedule`، `PATCH /:id/validation`، discount-approval، والـ import services. **ممنوع** أي تغيير فيهم.
- الواجهة لازم تعرض **سبب الفشل الحقيقي** القادم من السيرفر (رسالة + كود) بدل «خطأ» العامة، وتوست واحد فقط لكل فشل (الـ interceptor يتخطاه بـ `_skipErrorToast`)، والنص المكتوب في الخانة مبيضيعش عند الفشل.

---

## 4) معايير القبول (قابلة للفحص الميكانيكي)

1. `node --check apps/backend/routes/orders.js` يرجّع `exit 0` (وكذلك أي ملف `.js` تاني اتعدّل).
2. `grep -c "assertOrderStatusEditable" apps/backend/routes/orders.js` = **14** (كان 18 قبل التعديل: حذف 4 مواضع × سطرين).
3. `git diff -U0 apps/backend/routes/orders.js` مفيش فيه أي hunk خارج النطاق **6163–6379** (يعني مفيش endpoint تاني فقد القفل).
4. ** ملاحظتين ورا بعض على نفس الأوردر:** `POST` مرتين → الاتنين `200` و `success:true` و `data.id` مختلفين، و`GET /simple/:orderNumber` يرجّع 2 في `orderNotes` مرتبين `createdAt desc`.
5. **أوردر حالته مقفولة** (`orderStatusConfig.allowStatusEdit = false` للحالة الحالية): `POST .../notes` → `200`، و`PATCH /simple/notes/:noteId` → `200`، و`DELETE /simple/notes/:noteId` → `200`.
6. **القفل لسه شغال على بيانات الأوردر:** على نفس الأوردر المقفول `PUT /simple/:orderNumber` (`orders.js:9871`) لسه بيرجّع `403` بنفس رسالة `orderStatusLock.js:34-41`.
7. **رسالة الخطأ الحقيقية:** لو الـ DB/السيرفر رجّع خطأ، الـ response يبقى فيه `message` الحقيقي و`code`، والتوست في الواجهة يعرض نفس النص (مش «خطأ في إضافة الملاحظة» ولا «⚠️ خطأ في إضافة البيانات»)، وتوست واحد بس.
8. `apps/frontend/src/pages/orders/hooks/useOrderDetailsNotes.test.ts`: يضيف كيس «إضافة مرتين» (اللستة فيها 2) وكيس «الفشل يعرض رسالة السيرفر» — ويعدّوا.
9. مفيش أي كتابة على production، ومفيش `git`/`npm install`/deploy في سجل الأوامر.

---

## 5) التقرير المطلوب من المنفّذ (ابدأ الرد بالحقول دي بالترتيب)

- `files_changed`: كل ملف + أرقام السطور اللي اتغيّرت.
- `node_check`: ناتج `node --check` لكل ملف `.js` اتعدّل (أو «shell غير متاح»).
- `lock_grep`: عدد `assertOrderStatusEditable` قبل/بعد + تأكيد إن الـ diff محصور في 6163–6379.
- `evidence_two_notes`: كود الـ HTTP + الـ JSON المختصر للـ POST الأول والتاني على نفس الأوردر.
- `evidence_locked_status`: كود الـ HTTP لـ POST/PATCH/DELETE على أوردر حالته `allowStatusEdit=false`.
- `evidence_lock_intact`: كود الـ HTTP لـ `PUT /simple/:orderNumber` على نفس الأوردر (لازم 403).
- `ui_message`: نص التوست قبل/بعد على فشل مُفتعَل (500).
- `gaps`: أي بند من معايير القبول مش اتنفّذ وليه، وأي حاجة اكتشفتها خارج النطاق.
