# OPENCODE_FIXES — 621f2800

سجل جولات مراجعة OpenCode والإصلاحات المنفذة. آخر مراجعة على `672e71832` أعطت:
**0 BLOCKER · 0 BUG · 1 RISK** — الـRISK هو عدم إمكانية إعادة إنتاج أعداد الإنتاج/الـcheckout من بيئة المراجع (مفيش DATABASE_URL عندها). مفيش عيب كود متبقّي.

## الجولات

| الجولة | الكوميت | النتيجة | الإصلاح |
|---|---|---|---|
| ١ | `f1fad1e27` | FIX_FIRST — 2 BLOCKER/3 BUG/1 RISK | dry-run fail-closed + bundleSlug + bundleSafety لكل باقة + شيل `plan:"999"` + تصحيح بصمة النسخة الاحتياطية + الأدلة الخام في الريبو |
| ٢ | `3481695ee` | FIX_FIRST — 0 BLOCKER/2 BUG/3 RISK | شيل fallback الباقات القديمة من `SuperAdminLandingPages` + تجميع لقطة الاشتراكات (بدون IDs) + LF |
| ٣ | `70a53ad7c` | FIX_FIRST — 0 BLOCKER/1 BUG/1 RISK | رفض أعضاء `appIds` غير النصية + توحيد عدّ البندل المنشور (9 سكربتات/985,041 حرف) |
| ٤ | `a9122677a` | FIX_FIRST — 0 BLOCKER/1 BUG/1 RISK | رفض `appIds=[]` و`"[]"` + شيل 999 من `translation.json` |
| ٥ | `9d95439c0` | FIX_FIRST — 1 BLOCKER/2 BUG/1 RISK | تسوية 8→7 + رفض مرجع تطبيق غير معروف + شيل 999 من `MessagingCheckout.tsx` |
| ٦ | `672e71832` | FIX_FIRST — 0 BLOCKER/0 BUG/1 RISK | لا شيء — الـRISK بيئي (مفيش DB URL عند المراجع) |

## الـRISK المتبقي (بيئي — مش كود)

المراجع شغال في worktree منفصل بدون `DATABASE_URL`/`POSTGRES_URL`، فسكربت الـdry-run بيخرج fail-closed
بكود 1 (`app_bundles: DATABASE_URL/POSTGRES_URL is not set`) ومش بيقدر يعيد عدّ الإنتاج.
الحل: تشغيل المراجعة بنفس متغيرات البيئة على **لقطة الإنتاج المحلية**:

```
DATABASE_URL="postgresql://postgres:***@127.0.0.1:5433/maxp_621f_snap" \
POSTGRES_URL="postgresql://postgres:***@127.0.0.1:5433/maxp_621f_snap" \
python oc_review_task.py review 621f2800 --commit 672e71832
```

اللقطة فيها نفس بيانات الإنتاج (8 باقات · 121 اشتراك · 11 صفحة · 261 تطبيق · 2,386 ربط) وتم التحقق منها في الجولة ٧.

## أدلة إضافية

- `_reports/621f2800-evidence/dryrun.json` — مخرج dry-run على اللقطة.
- `_reports/621f2800-evidence/checkout.json` + `guards.json` — اختبارا الرسائل وصفحة الهبوط (QA محلي).
- `_reports/621f2800-evidence/platform_subscriptions_summary.json` — تسوية 87→121 و8→7.
- `_reports/621f2800-evidence/g2_live.json` — فحص الموقع الحي (4 LP + API + البندل المنشور).
