export const normalizeColorString = (str: string): string =>
  String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ');

export const resolveNamedColorSwatch = (value: string): string => {
  const normalizedValue = normalizeColorString(value);

  if (!normalizedValue) return '#f6ddd7';
  if (normalizedValue.includes('اسود') || normalizedValue.includes('black')) return '#2f232d';
  if (normalizedValue.includes('ابيض') || normalizedValue.includes('white')) return '#fff8f6';
  if (normalizedValue.includes('اوف') || normalizedValue.includes('off')) return '#f7efe8';
  if (normalizedValue.includes('عنابي') || normalizedValue.includes('burgundy')) return '#7d3d4b';
  if (normalizedValue.includes('وردي') || normalizedValue.includes('pink')) return '#eaa3ae';
  if (normalizedValue.includes('بيج') || normalizedValue.includes('beige')) return '#d6b59a';
  if (normalizedValue.includes('بني') || normalizedValue.includes('brown')) return '#8b5e52';
  if (normalizedValue.includes('ازرق') || normalizedValue.includes('blue')) return '#7f9cc7';
  if (normalizedValue.includes('اخضر') || normalizedValue.includes('green')) return '#8cab8a';

  return '#f2d5cf';
};

export const translateZenCategoryLabel = (value: string): string => {
  const normalizedValue = value.trim().toLowerCase();

  switch (normalizedValue) {
    case 'plants':
    case 'plant':
      return 'نباتات';
    case 'pots':
    case 'pot':
    case 'planters':
      return 'أواني';
    case 'seeds':
    case 'seed':
      return 'بذور';
    case 'care':
    case 'plant care':
      return 'عناية بالنبات';
    case 'decor':
    case 'home decor':
      return 'ديكور طبيعي';
    case 'gifts':
    case 'gift':
      return 'هدايا طبيعية';
    case 'skincare':
      return 'عناية طبيعية';
    default:
      return value;
  }
};

export const translateRtlRetailCategoryLabel = (value: string): string => {
  const normalizedValue = value.trim().toLowerCase();

  switch (normalizedValue) {
    case 'footwear':
    case 'shoes':
    case 'shoe':
      return 'أحذية';
    case 'sneakers':
    case 'sneaker':
      return 'سنيكرز';
    case 'heels':
    case 'heel':
    case 'pumps':
    case 'pump':
      return 'كعب';
    case 'sandals':
    case 'sandal':
      return 'صنادل';
    case 'boots':
    case 'boot':
      return 'بوت';
    case 'flats':
    case 'flat':
    case 'loafers':
    case 'loafer':
      return 'لوفر وفلات';
    case 'accessories':
    case 'accessory':
      return 'اكسسوارات';
    case "women's clothing":
    case 'womens clothing':
      return 'ملابس نسائية';
    case "men's clothing":
    case 'mens clothing':
      return 'ملابس رجالية';
    default:
      return value;
  }
};
