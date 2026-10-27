const { buildPublicCodePrefix, generatePublicCode } = require('../../utils/companyPublicCode');

describe('companyPublicCode — بادئة الكود من الاسم العربي', () => {
  const prefixOf = (name, slug, email) => buildPublicCodePrefix({ name, slug, email });

  it('بياخد حروف من الاسم العربي مش من الإيميل', () => {
    expect(prefixOf('شركة النور للتجارة', 'alnour', 'info@alnour.com')).toBe('NWR');
    expect(prefixOf('ريد لاين', 'redline', 'billing@redline.com')).toMatch(/^RYD/);
    expect(prefixOf('شركة سوان', 'swan', 'swan@h2m.com')).toBe('SWAN');
  });

  it('بيشيل الكلمات القانونية وأداة التعريف وأول كلمة بس', () => {
    expect(prefixOf('شركة النور للتجارة')).toHaveLength(3);
    expect(prefixOf('مؤسسة الأمل', 'alamal')).not.toMatch(/XXX/);
  });

  it('الاسم اللاتيني زي ما هو', () => {
    expect(prefixOf('Layla Cosmetics', 'layla-cosmetics')).toMatch(/^AYA/);
  });

  it('لو الاسم العربي قصير جدًا بيرجع للـslug مش للإيميل', () => {
    const p = prefixOf('أمل', 'amal-store', 'x@y.com');
    expect(p).toMatch(/^AMA/);
  });

  it('نتيجة الاسم العربي الحقيقي مش XXX', () => {
    for (const name of ['شركة النور للتجارة', 'ريد لاين', 'معمل ابتسامة', 'بيتزا روماني']) {
      expect(prefixOf(name, null, 'noreply@example.com')).not.toBe('XXX');
    }
  });

  it('الكود الكامل مطابق للنمط والمفتاح الفريد', () => {
    const code = generatePublicCode('شركة النور للتجارة');
    expect(code).toMatch(/^[A-HJ-KM-NP-Z]{3,4}-[A-HJ-KM-NP-Z2-9]{6}$/);
    expect(code.startsWith('NWR-')).toBe(true);
  });

  it('البادئة ثابتة لنفس الاسم (deterministic)', () => {
    const a = prefixOf('شركة النور للتجارة');
    const b = prefixOf('شركة النور للتجارة');
    expect(a).toBe(b);
  });
});
