/**
 * Turbo Governorate Mapper Utilities
 * دوال مطابقة وتطبيع المحافظات والمدن لشحن Turbo
 * تم تزويدها بمعالج توحيد الحروف العربية وقاموس الأحياء المصرية والتعامل الذكي مع المناطق المركبة
 */

const {
  GOVERNORATE_MAP,
  CITY_TO_GOVERNMENT_MAP,
  DISTRICT_TO_GOVERNMENT_MAP,
  COMPOUND_SHIPPING_ZONES,
  FALLBACK_GOVERNMENTS
} = require('./constants');
const { cleanLocationName } = require('./addressParser');

/**
 * توحيد ومعالجة النصوص والحروف العربية لضمان دقة المطابقة
 * يعالج الهمزات، التاء المربوطة والهاء، الياء والألف المقصورة، التشكيل والتطويل
 */
function normalizeArabic(text) {
  if (!text) return '';
  return String(text).toLowerCase().trim()
    .replace(/[\u0660-\u0669]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48))
    .replace(/[\u06F0-\u06F9]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x06F0 + 48))
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[\u064B-\u065F\u0670]/g, '') // تنوين وتشكيل
    .replace(/\u0640/g, '') // تطويل
    .replace(/[^a-z0-9\u0600-\u06FF\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * فحص ما إذا كان النص يشير لمنطقة شحن مركبة (مثل أطراف القاهرة والجيزة)
 */
function isCompoundShippingZone(text) {
  if (!text) return false;
  const normalized = normalizeArabic(text);
  if (!normalized) return false;

  for (const zone of (COMPOUND_SHIPPING_ZONES || [])) {
    if (normalized === normalizeArabic(zone) || normalized.includes(normalizeArabic(zone))) {
      return true;
    }
  }

  if (normalized === '28') {
    return true;
  }

  // كشف إضافي بالكلمات الدلالية
  if (normalized.includes('اطراف') && (normalized.includes('قاهره') || normalized.includes('جيزه'))) {
    return true;
  }
  if (normalized.includes('قاهره') && normalized.includes('جيزه')) {
    return true;
  }

  return false;
}

/**
 * فحص ما إذا كانت القيمة المدخلة فارغة أو تدل على عدم التحديد
 */
function isUnspecified(val) {
  if (!val) return true;
  const n = normalizeArabic(val);
  const invalidKeywords = ['غير محدد', 'غيرمعروف', 'غير معروف', 'unknown', 'none', 'null', 'undefined', 'لا يوجد', 'بدون'];
  return invalidKeywords.includes(n) || n.length < 2;
}

/**
 * استنتاج المحافظة من النص الكامل للعنوان أو المدينة باستخدام قاموس الأحياء والمدن
 */
function inferGovernorateFromText(text, allowedGovs = null) {
  if (!text) return null;
  const nText = normalizeArabic(text);
  if (!nText || nText.length < 2) return null;

  // 1. فحص قاموس الأحياء (الأطول فالأقصر لدقة المطابقة مثل "مدينة نصر" قبل "نصر")
  let districtEntries = Object.entries(DISTRICT_TO_GOVERNMENT_MAP || {})
    .sort(([a], [b]) => b.length - a.length);

  if (allowedGovs && Array.isArray(allowedGovs)) {
    districtEntries = districtEntries.filter(([_, gov]) => allowedGovs.includes(gov));
  }

  for (const [district, gov] of districtEntries) {
    const nDist = normalizeArabic(district);
    if (nDist.length >= 3 && nText.includes(nDist)) {
      return gov;
    }
  }

  // 2. فحص قاموس المدن
  let cityEntries = Object.entries(CITY_TO_GOVERNMENT_MAP || {})
    .sort(([a], [b]) => b.length - a.length);

  if (allowedGovs && Array.isArray(allowedGovs)) {
    cityEntries = cityEntries.filter(([_, gov]) => allowedGovs.includes(gov));
  }

  for (const [city, gov] of cityEntries) {
    const nCity = normalizeArabic(city);
    if (nCity.length >= 3 && nText.includes(nCity)) {
      return gov;
    }
  }

  // 3. فحص أسماء المحافظات المباشرة
  let govEntries = Object.entries(GOVERNORATE_MAP || {})
    .sort(([a], [b]) => b.length - a.length);

  if (allowedGovs && Array.isArray(allowedGovs)) {
    govEntries = govEntries.filter(([_, gov]) => allowedGovs.includes(gov));
  }

  for (const [key, gov] of govEntries) {
    const nKey = normalizeArabic(key);
    if (nKey.length >= 4 && nText.includes(nKey)) {
      return gov;
    }
  }

  return null;
}

/**
 * استخراج الاسم الرسمي لمحافظة تربو مع دعم التطبيع والاستنتاج وحل المناطق المركبة
 */
function getTurboGovernorateName(governorate, contextCity = '', fullAddress = '') {
  const cleanedGov = cleanLocationName(governorate);
  const trimmed = String(cleanedGov || '').trim();

  // 1. إذا كانت المحافظة المدخلة هي منطقة مركبة في تربو (مثل أطراف القاهرة والجيزة أو أطراف الجيزة والقاهرة أو 28)
  if (isCompoundShippingZone(cleanedGov) || trimmed === '28') {
    const combinedContext = `${contextCity || ''} ${fullAddress || ''}`;
    // التحقق إذا كان العميل أدخل محافظة أخرى بعيدة صراحة في العنوان (مثل الإسكندرية، الدقهلية، سوهاج)
    const otherGov = inferGovernorateFromText(combinedContext);
    if (otherGov && !['القاهرة', 'الجيزة', 'أطراف القاهرة والجيزة'].includes(otherGov)) {
      return otherGov;
    }
    return 'أطراف القاهرة والجيزة';
  }

  // 2. فحص استباقي: إذا كان العنوان أو المدينة يحتوي على مناطق تتبع أطراف القاهرة والجيزة في تربو
  // (مثل 6 أكتوبر، الشيخ زايد، حدائق الأهرام، حدائق أكتوبر، العاصمة الإدارية، دريم لاند، القرية الذكية...)
  if (contextCity || fullAddress) {
    const combined = `${contextCity || ''} ${fullAddress || ''}`;
    const compoundDistricts = [
      'حدائق الاهرام', 'حدائق الأهرام', 'هضبة الاهرام', 'هضبة الأهرام',
      'حدائق اكتوبر', 'حدائق أكتوبر', 'حدائق المهندسين', 'حدائق العاصمة',
      'سكن مصر حدائق اكتوبر', 'كمباوند الواحه حدائق اكتوبر',
      '6 اكتوبر', '6 أكتوبر', 'اكتوبر', 'أكتوبر', 'مدينة 6 اكتوبر', 'مدينة 6 أكتوبر', 'أكتوبر الجديدة', 'اكتوبر الجديدة',
      'اكتوبر الحي الرابع', '6 أكتوبر الحي المتميز', 'اكتوبر حي الاندلس', '6اكتوبر مساكن الشباب',
      'الشيخ زايد', 'زايد', 'مدينة الشيخ زايد', 'الياسمين الشيخ زايد', 'دار مصر زايد', 'جنه زايد', 'جنة زايد',
      'بيفرلي هيلز', 'بفيلرى هيلز', 'الربوة', 'بالم هيلز', 'بالم هليز', 'الخمائل', 'سوديك', 'زايد 2000',
      'العاصمة الادارية', 'العاصمة الإدارية', 'العاصمة الادارية الجديدة', 'العاصمة الإدارية الجديدة',
      'الحي الحكومي العاصمة', 'حي المال العاصمة', 'حى المال العاصمة', 'الاحياء السكنية العاصمة', 'البرج الايقونى', 'البرج الأيقوني',
      'القرية الذكية', 'نيو جيزة', 'وصلة دهشور', 'طريق الواحات', 'الحزام الاخضر', 'الحزام الأخضر',
      'دريم لاند', 'هرم سيتي', 'مدينة الفردوس', 'حي الاشجار', 'حي الأشجار', 'اشجار سيتي', 'أشجار سيتي', 'ابني بيتك',
      'المناشي', 'المنصورية', 'منشأة القناطر', 'كفر حكيم', 'بهرمس', 'برقاش', 'برطس',
      'القاهرة الجديدة', 'القاهره الجديده', 'التجمع', 'التجمع الاول', 'التجمع الأول', 'التجمع الثالث', 'التجمع الخامس', 'تجمع اول', 'تجمع ثالث', 'تجمع خامس',
      'مدينتي', 'مدينتى', 'الرحاب', 'الرحاب 2', 'الرحاب2', 'الشروق', 'مدينة الشروق', 'بدر', 'مدينة بدر',
      'العبور', 'مدينة العبور', 'سوق العبور', 'المستقبل', 'مدينة المستقبل', 'هليوبوليس الجديدة', 'القطامية', 'القطاميه',
      'البدرشين', 'الحوامدية', 'الحوامديه', 'العياط', 'الصف', 'اطفيح', 'أطفيح', 'شبرامنت', 'ابو النمرس', 'أبو النمرس', 'دهشور', 'سقارة', 'سقاره', 'المنوات'
    ];
    const nCombined = normalizeArabic(combined);
    // استبعاد كباري القاهرة (مثل كوبري 6 أكتوبر أو كوبري أكتوبر أو السادس من أكتوبر) حتى لا تلتقط خطأ كمدينة
    const textWithoutBridges = nCombined.replace(/كوبري\s*(?:6\s*|السادس\s*من\s*)?اكتوبر/g, ' ');
    if (compoundDistricts.some(d => textWithoutBridges.includes(normalizeArabic(d)))) {
      return 'أطراف القاهرة والجيزة';
    }
  }

  // Direct key check in GOVERNORATE_MAP (handles numeric IDs '1', '2' and exact keys)
  if (trimmed && GOVERNORATE_MAP[trimmed]) {
    return GOVERNORATE_MAP[trimmed];
  }

  // 3. إذا كانت المحافظة فارغة أو غير محددة، نستنتجها من المدينة والعنوان
  if (!trimmed || isUnspecified(trimmed)) {
    const combinedContext = `${contextCity || ''} ${fullAddress || ''}`;
    const inferred = inferGovernorateFromText(combinedContext);
    if (inferred) return inferred;
    if (contextCity && !isUnspecified(contextCity)) {
      return findGovernmentByCity(contextCity, null, fullAddress);
    }
    return null;
  }

  const nGov = normalizeArabic(cleanedGov);

  // 3. مطابقة مباشرة وتطبيعية دقيقة مع GOVERNORATE_MAP
  for (const [key, value] of Object.entries(GOVERNORATE_MAP)) {
    if (normalizeArabic(key) === nGov || normalizeArabic(value) === nGov) {
      return value;
    }
  }

  // 4. مطابقة مع قاموس الأحياء والمدن
  if (DISTRICT_TO_GOVERNMENT_MAP) {
    for (const [district, gov] of Object.entries(DISTRICT_TO_GOVERNMENT_MAP)) {
      if (normalizeArabic(district) === nGov) {
        return gov;
      }
    }
  }

  // 5. مطابقة جزئية مع أسماء المحافظات مرتبة بالأطول
  const sortedEntries = Object.entries(GOVERNORATE_MAP)
    .sort(([a], [b]) => b.length - a.length);

  for (const [key, value] of sortedEntries) {
    const nKey = normalizeArabic(key);
    if (nKey.length >= 3 && (nGov.includes(nKey) || nKey.includes(nGov))) {
      return value;
    }
  }

  // 6. استنتاج من سياق المدينة أو العنوان كحل احتياطي
  if (contextCity || fullAddress) {
    const inferred = inferGovernorateFromText(`${contextCity} ${fullAddress}`);
    if (inferred) return inferred;
  }

  return cleanedGov || null;
}

/**
 * استخراج المحافظة بدلالة المدينة أو الحي
 */
function findGovernmentByCity(cityName, governments = null, fullAddress = '') {
  if (!cityName && !fullAddress) return 'القاهرة';

  const cleanCity = cleanLocationName(cityName);
  const nCleanCity = normalizeArabic(cleanCity);

  // إذا كانت المدينة تشير لمنطقة مركبة
  if (isCompoundShippingZone(cleanCity)) {
    const inferred = inferGovernorateFromText(fullAddress);
    return inferred || 'القاهرة';
  }

  // محاولة الاستنتاج من قاموس الأحياء أولاً
  if (DISTRICT_TO_GOVERNMENT_MAP) {
    for (const [dist, gov] of Object.entries(DISTRICT_TO_GOVERNMENT_MAP)) {
      const nDist = normalizeArabic(dist);
      if (nCleanCity === nDist || (nDist.length >= 3 && nCleanCity.includes(nDist))) {
        if (governments && governments.length > 0) {
          const matchGov = governments.find(g => normalizeArabic(g.name) === normalizeArabic(gov));
          if (matchGov) return matchGov.name;
        }
        return gov;
      }
    }
  }

  // فحص قاموس المدن
  for (const [city, gov] of Object.entries(CITY_TO_GOVERNMENT_MAP)) {
    const nCity = normalizeArabic(city);
    if (nCleanCity === nCity || nCleanCity.includes(nCity) || nCity.includes(nCleanCity)) {
      if (governments && governments.length > 0) {
        const foundGov = governments.find(g => {
          const nG = normalizeArabic(g.name);
          const nTarget = normalizeArabic(gov);
          return nG === nTarget || nG.includes(nTarget) || nTarget.includes(nG);
        });
        if (foundGov) return foundGov.name;
      }
      return gov;
    }
  }

  // لو تم تمرير قائمة المحافظات من تربو
  if (governments && governments.length > 0) {
    for (const gov of governments) {
      const nG = normalizeArabic(gov.name);
      if (nG === nCleanCity) return gov.name;
    }

    for (const gov of governments) {
      const nG = normalizeArabic(gov.name);
      if (nG.includes(nCleanCity) || nCleanCity.includes(nG)) return gov.name;
    }

    const cityWords = nCleanCity.split(' ').filter(w => w.length > 2);
    for (const gov of governments) {
      const nG = normalizeArabic(gov.name);
      for (const word of cityWords) {
        if (nG.includes(word)) return gov.name;
      }
    }
  }

  return getTurboGovernorateName(cityName, '', fullAddress) || 'القاهرة';
}

module.exports = {
  normalizeArabic,
  isCompoundShippingZone,
  isUnspecified,
  inferGovernorateFromText,
  getTurboGovernorateName,
  findGovernmentByCity
};
