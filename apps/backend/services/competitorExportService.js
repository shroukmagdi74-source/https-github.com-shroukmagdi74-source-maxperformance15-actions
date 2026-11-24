const path = require('path');
const PDFDocument = require('pdfkit');
const { shapeArabic } = require('../utils/arabicShaping');

const FONT_PATH = path.join(__dirname, '..', 'fonts', 'NotoSansArabic-Regular.ttf');
const AR = (s) => shapeArabic(String(s ?? ''));

function escapeCsvCell(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

class CompetitorExportService {
  /**
   * توليد ملف CSV منسّق مع UTF-8 BOM
   */
  static generateCsv({ competitor, report, ads = [], products = [], features = [] }) {
    const BOM = '\ufeff';
    const lines = [];

    // --- 1. ملخص المنافس والتقرير ---
    lines.push('=== تقرير تحليل المنافس (MaxP Competitor Analysis) ===');
    lines.push(['اسم المنافس', 'الموقع الإلكتروني', 'السوق', 'اكتمال البروفايل', 'تاريخ التقرير'].map(escapeCsvCell).join(','));
    lines.push([
      competitor.name,
      competitor.website || '—',
      competitor.market || '—',
      competitor.profileCompletion ? `${competitor.profileCompletion}%` : '—',
      report?.createdAt ? new Date(report.createdAt).toLocaleDateString('ar-EG') : new Date().toLocaleDateString('ar-EG'),
    ].map(escapeCsvCell).join(','));

    if (report?.summary) {
      lines.push('');
      lines.push(['ملخص تحليلي', report.summary].map(escapeCsvCell).join(','));
    }

    // --- 2. إعلانات المنافس ---
    lines.push('');
    lines.push(`=== إعلانات المنافس (${ads.length}) ===`);
    lines.push(['عنوان الإعلان / النص', 'المنصة', 'الحالة', 'معرف المكتبة Library ID', 'الإنفاق التقديري', 'مدة التشغيل', 'تاريخ البدء', 'رابط الكريتف'].map(escapeCsvCell).join(','));

    if (ads.length === 0) {
      lines.push(['لا توجد إعلانات مسجلة'].map(escapeCsvCell).join(','));
    } else {
      ads.forEach((ad) => {
        lines.push([
          ad.title || ad.content || 'إعلان بدون عنوان',
          ad.platform || 'Meta',
          ad.status === 'ACTIVE' || ad.status === 'نشط' ? 'نشط' : (ad.status || 'متوقف'),
          ad.libraryId || '—',
          ad.spend || '—',
          ad.runTime || '—',
          ad.startDate ? new Date(ad.startDate).toLocaleDateString('ar-EG') : '—',
          ad.creativeUrl || '—',
        ].map(escapeCsvCell).join(','));
      });
    }

    // --- 3. الباقات والمنتجات ---
    lines.push('');
    lines.push(`=== الباقات والمنتجات (${products.length}) ===`);
    lines.push(['اسم الباقة / المنتج', 'الفئة', 'السعر', 'العملة', 'دورة الدفع', 'الرابط'].map(escapeCsvCell).join(','));

    if (products.length === 0) {
      lines.push(['لا توجد باقات أو منتجات مسجلة'].map(escapeCsvCell).join(','));
    } else {
      products.forEach((prod) => {
        const cycle = prod.metadata?.billingCycle || (prod.category === 'باقة' ? 'شهري' : '—');
        lines.push([
          prod.name,
          prod.category || 'عام',
          prod.price !== undefined && prod.price !== null ? prod.price : '—',
          prod.currency || 'EGP',
          cycle,
          prod.url || '—',
        ].map(escapeCsvCell).join(','));
      });
    }

    // --- 4. المزايا التنافسية ---
    lines.push('');
    lines.push(`=== المزايا التنافسية (${features.length}) ===`);
    lines.push(['اسم الميزة', 'الفئة', 'ميزة تفضيلية (Differentiator)', 'الوصف'].map(escapeCsvCell).join(','));

    if (features.length === 0) {
      lines.push(['لا توجد مزايا مسجلة'].map(escapeCsvCell).join(','));
    } else {
      features.forEach((feat) => {
        lines.push([
          feat.name,
          feat.category || 'عام',
          feat.isDifferentiator ? 'نعم (ميزة حصرية)' : 'لا',
          feat.description || '—',
        ].map(escapeCsvCell).join(','));
      });
    }

    return BOM + lines.join('\r\n');
  }

  /**
   * توليد ملف PDF رسمي ومشكّل بالعربية
   */
  static generatePdf({ competitor, report, ads = [], products = [], features = [] }) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 36,
          bufferPages: true,
          info: {
            Title: `تقرير منافس - ${competitor.name}`,
            Author: 'MaxP Platform',
          },
        });

        const chunks = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const fs = require('fs');
        const hasFont = fs.existsSync(FONT_PATH);
        if (hasFont) {
          doc.registerFont('Noto', FONT_PATH);
          doc.font('Noto');
        }

        const primaryColor = '#1e293b';
        const accentColor = '#2563eb';
        const mutedColor = '#64748b';

        // --- Header ---
        doc.fontSize(18).fillColor(accentColor).text(AR('منصة MaxP — تقرير تحليل المنافس الشامل'), { align: 'right' });
        doc.moveDown(0.3);
        doc.fontSize(12).fillColor(primaryColor).text(AR(`المنافس: ${competitor.name}`), { align: 'right' });
        doc.fontSize(9).fillColor(mutedColor).text(AR(`الموقع: ${competitor.website || '—'}  |  السوق: ${competitor.market || 'عام'}  |  تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}`), { align: 'right' });
        doc.moveDown(0.6);

        // Divider
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(36, doc.y).lineTo(559, doc.y).stroke();
        doc.moveDown(0.6);

        // Summary box
        if (report?.summary) {
          doc.rect(36, doc.y, 523, 38).fillAndStroke('#f8fafc', '#e2e8f0');
          doc.fillColor(primaryColor).fontSize(10).text(AR(`الملخص التنفيذي: ${report.summary}`), 46, doc.y - 28, {
            width: 503,
            align: 'right',
          });
          doc.moveDown(1);
        }

        // --- Section: إحصائيات سريعة ---
        doc.fontSize(12).fillColor(accentColor).text(AR('1. مؤشرات الأداء والبيانات المرصودة'), { align: 'right' });
        doc.moveDown(0.3);
        const statsText = `الإعلانات المرصودة: ${ads.length}  |  الباقات والمنتجات: ${products.length}  |  المزايا التنافسية: ${features.length}  |  اكتمال البروفايل: ${competitor.profileCompletion || 0}%`;
        doc.fontSize(10).fillColor(primaryColor).text(AR(statsText), { align: 'right' });
        doc.moveDown(0.8);

        // --- Section: الباقات والمنتجات ---
        doc.fontSize(12).fillColor(accentColor).text(AR(`2. الباقات والأسعار (${products.length})`), { align: 'right' });
        doc.moveDown(0.3);

        if (products.length === 0) {
          doc.fontSize(9).fillColor(mutedColor).text(AR('لا توجد باقات أو منتجات مسجلة لهذا المنافس حالياً.'), { align: 'right' });
        } else {
          products.slice(0, 15).forEach((p, idx) => {
            const cycle = p.metadata?.billingCycle || (p.category === 'باقة' ? 'شهري' : '');
            const priceStr = p.price !== undefined && p.price !== null ? `${p.price} ${p.currency || 'EGP'} ${cycle ? `/${cycle}` : ''}` : 'غير محدد';
            doc.fontSize(9).fillColor(primaryColor).text(
              AR(`${idx + 1}. ${p.name} [${p.category || 'منتج'}] — السعر: ${priceStr}`),
              { align: 'right' }
            );
          });
          if (products.length > 15) {
            doc.fontSize(8).fillColor(mutedColor).text(AR(`... بالإضافة إلى ${products.length - 15} منتج آخر في السجل.`), { align: 'right' });
          }
        }
        doc.moveDown(0.8);

        // --- Section: الإعلانات ---
        doc.fontSize(12).fillColor(accentColor).text(AR(`3. إعلانات مكتبة ميتا والحملات النشطة (${ads.length})`), { align: 'right' });
        doc.moveDown(0.3);

        if (ads.length === 0) {
          doc.fontSize(9).fillColor(mutedColor).text(AR('لا توجد إعلانات مسجلة في رادار الإعلانات.'), { align: 'right' });
        } else {
          ads.slice(0, 10).forEach((ad, idx) => {
            const statusLabel = ad.status === 'ACTIVE' || ad.status === 'نشط' ? 'نشط' : 'متوقف';
            const libId = ad.libraryId ? `(ID: ${ad.libraryId})` : '';
            const title = (ad.title || ad.content || 'إعلان').substring(0, 60);
            doc.fontSize(9).fillColor(primaryColor).text(
              AR(`${idx + 1}. [${statusLabel}] ${title} ${libId}`),
              { align: 'right' }
            );
          });
          if (ads.length > 10) {
            doc.fontSize(8).fillColor(mutedColor).text(AR(`... بالإضافة إلى ${ads.length - 10} إعلان آخر.`), { align: 'right' });
          }
        }
        doc.moveDown(0.8);

        // --- Section: المزايا التنافسية ---
        doc.fontSize(12).fillColor(accentColor).text(AR(`4. المزايا التنافسية (${features.length})`), { align: 'right' });
        doc.moveDown(0.3);

        if (features.length === 0) {
          doc.fontSize(9).fillColor(mutedColor).text(AR('لا توجد مزايا تنافسية مرصودة.'), { align: 'right' });
        } else {
          features.slice(0, 10).forEach((f, idx) => {
            const diffTag = f.isDifferentiator ? '★ ميزة تفضيلية' : '';
            doc.fontSize(9).fillColor(primaryColor).text(
              AR(`${idx + 1}. ${f.name} ${diffTag ? `[${diffTag}]` : ''} - ${f.description || f.category || ''}`),
              { align: 'right' }
            );
          });
        }

        // Footer on all pages
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).fillColor(mutedColor).text(
            AR(`منصة MaxP الذكية لتحليل المنافسين — صفحة ${i + 1} من ${pages.count}`),
            36,
            792 - 36,
            { align: 'center', width: 523 }
          );
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = CompetitorExportService;
