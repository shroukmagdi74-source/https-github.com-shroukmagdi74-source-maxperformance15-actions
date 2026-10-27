# تقرير تنفيذ تيكت CHECKOUT-1: عناصر سلة وشيك أوت للصفحات المخصصة

**التاريخ:** 2026-10-27  
**المنفذ:** Antigravity (agy)  
**الحالة:** ✅ مكتمل وجاهز للإنتاج (PASS)

---

## 1. المشكلة وسياق التعديل
- كانت أقسام السلة والشيك أوت (`CartDrawer`, `cart-items`, `checkout-form`) محصورة في قوالب وأقسام كاملة وجاهزة، مما يجبر التاجر في الصفحات المخصصة أو البريستات على استخدام قوالب ثابتة دون إمكانية توزيع مكونات السلة (البنود، الإجماليات، كود الخصم، زر الشيك أوت) كعناصر مستقلة في أي مكان داخل الكانفس.
- المطلوب: إنشاء 4 عناصر مستقلة تستهلك نفس API وسلة المتجر الحالية (`storefrontApi` + `useCartStore`) بصفر backend جديد، مع دعم رسائل السلة الفارغة وإخفاء الأزرار عند الفراغ، واختبارها عبر vitest بـ ≥7 حالات مع التحقق من الأرقام الصريحة.

---

## 2. ملخص التغييرات الهندسية

1. **العناصر المستقلة الجديدة (`apps/frontend/src/storefront/sections/elements/`):**
   - **`CartItemsElement`:** يعرض بنود السلة مع أزرار تعديل الكمية (+ / -) وحذف البند. يستدعي مباشرة `storefrontApi.updateCartItem` و `storefrontApi.removeCartItem` مع مزامنة `useCartStore`. في حالة السلة الفارغة: يعرض رسالة توضيحية «سلة التسوق فارغة» مع صفر أزرار (`button = 0`).
   - **`CartTotalsElement`:** يعرض المجموع الفرعي، مصاريف الشحن، الخصم، والإجمالي الكلي بالاعتماد على نفس معادلات السلة الحالية. في السلة الفارغة: يعرض إشعار «لا توجد منتجات لاحتساب الإجمالي» مع إخفاء أزرار الطلب بالكامل.
   - **`CheckoutButtonElement`:** زر إتمام الطلب الرئيسي (`الانتقال للدفع` أو مخصص) مع توجيه مباشر لمسار `/checkout` أو مسار مخصص. عند فراغ السلة: يخفي نفسه تماماً (`return null`).
   - **`CouponElement`:** حقل إدخال قسيمة التخفيض مع فحص الصلاحية عبر `storefrontApi.validateCoupon`، وإظهار شارة الكوبون المفعل مع إمكانية حذفه. عند فراغ السلة: يخفي نفسه تماماً (`return null`).
   - **`cartElementHelpers.ts`:** دوال حسابية نقية (`calculateCartTotals`, `formatStorefrontCurrency`) متوافقة 100% مع حسابات المنصة دون تغيير منطق الإجمالي أو الشحن.

2. **التسجيل والتكامل في الاستوديو:**
   - **`ComponentRegistry.ts`:** تسجيل المكونات عبر التحميل الكسول: `'cart-items-element'`, `'cart-totals'`, `'checkout-button'`, `'coupon'`, `'cart-coupon'`.
   - **`manifest.ts`:** إضافة إعدادات التحكم والـ schema لكل عنصر.
   - **`StudioTypes.ts`:** تعريف `StudioCartElementType` و `STUDIO_CART_ELEMENTS` وتحديث `StudioElementType`.
   - **`StudioElementsPanel.tsx`:** إضافة قسم «عناصر السلة والشيك أوت (ديناميكي)» يدعم السحب والإفلات والنقر للإضافة.

---

## 3. نتائج الاختبارات والبوابات الإلزامية

1. **Vitest Unit Tests (`apps/frontend/src/storefront/__tests__/studioCartElements.test.tsx`):**
   - **النتيجة:** 10/10 حالات اختبار ناجحة (PASS) في بيئة `jsdom` (المطلوب كان ≥7).
   - **اختبار الحسبة الرقمية (Fixture 100 + 50 + شحن 30):**
     - تم التحقق صراحة من أن `CartTotalsElement` يعرض المجموع الفرعي 150، والشحن 30، والإجمالي النهائي **180** (عبر DOM text و data-attributes).
   - **اختبار تعديل الكمية (Qty Update Spy):**
     - تم التحقق من استدعاء `storefrontApi.updateCartItem` بالقيمة الجديدة عند النقر على زر زيادة الكمية.
   - **اختبار السلة الفارغة (Empty State):**
     - تم فحص `CartItemsElement` عند فراغ السلة وتأكيد ظهور رسالة واضحة وصفر أزرار نهائياً (`expect(container.querySelectorAll('button').length).toBe(0)`).
     - تم فحص `CartTotalsElement` وتأكيد إخفاء الأزرار.
     - تم فحص `CheckoutButtonElement` وتأكيد إرجاع `null` عند فراغ السلة.
     - تم فحص `CouponElement` وتأكيد إرجاع `null` عند فراغ السلة.
   - **اختبار تفعيل وحذف الكوبون:**
     - استدعاء `validateCoupon` وعرض الخصم، وزر إزالة الكوبون.

2. **بوابة Oxlint الصارمة (`oxlint --config .oxlintrc.json`):**
   - **النتيجة:** `Found 0 warnings and 0 errors` عبر كافة الملفات المعدلة والجديدة.

3. **بوابة الأنواع (`tsc --noEmit`):**
   - **النتيجة:** صفر أخطاء من التعديلات في مسارات الواجهة المحدثة.

4. **القيود والعزل التام:**
   - صفر تغييرات في الباك إند (`apps/backend`).
   - الملفات المحظورة `apps/backend/tests/services/whatsappMetaParamGuard.test.js` و `scripts/local_dns_proxy.py` لم يتم لمسها إطلاقاً.
   - الالتزام بنظام `git add` الصريح للملفات المحددة بالاسم وتجنب أي `git add -A`.

---

## 4. قائمة الملفات في التكت

1. `apps/frontend/src/storefront/sections/elements/cartElementHelpers.ts` (جديد)
2. `apps/frontend/src/storefront/sections/elements/CartItemsElement.tsx` (جديد)
3. `apps/frontend/src/storefront/sections/elements/CartTotalsElement.tsx` (جديد)
4. `apps/frontend/src/storefront/sections/elements/CheckoutButtonElement.tsx` (جديد)
5. `apps/frontend/src/storefront/sections/elements/CouponElement.tsx` (جديد)
6. `apps/frontend/src/storefront/sections/elements/index.ts` (محدث)
7. `apps/frontend/src/storefront/engine/ComponentRegistry.ts` (محدث)
8. `apps/frontend/src/storefront/sections/manifest.ts` (محدث)
9. `apps/frontend/src/storefront/studio/StudioTypes.ts` (محدث)
10. `apps/frontend/src/storefront/studio/StudioElementsPanel.tsx` (محدث)
11. `apps/frontend/src/storefront/__tests__/studioCartElements.test.tsx` (جديد)
12. `_reports/2026-10-27-agy-checkout1-status.md` (تقرير)
