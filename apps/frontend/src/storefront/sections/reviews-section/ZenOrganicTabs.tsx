import React from 'react';
import { sanitizeStorefrontHtml } from '../../utils/html';

interface ZenOrganicTabsProps {
  isZenOrganic: boolean;
  activeTab: 'description' | 'additional' | 'reviews';
  setActiveTab: (tab: 'description' | 'additional' | 'reviews') => void;
  prefersArabicCopy: boolean;
  productDescription?: string;
  categoryName?: string;
  tagsValue: string;
  notAvailableText: string;
}

export const ZenOrganicTabs: React.FC<ZenOrganicTabsProps> = ({
  isZenOrganic,
  activeTab,
  setActiveTab,
  prefersArabicCopy,
  productDescription,
  categoryName,
  tagsValue,
  notAvailableText,
}) => {
  if (!isZenOrganic) return null;

  return (
    <>
      <div className="mb-12 flex items-center justify-center gap-8 border-b border-[#e9ebe5] md:gap-12">
        {[
          { id: 'description', label: prefersArabicCopy ? 'الوصف' : 'Description' },
          {
            id: 'additional',
            label: prefersArabicCopy ? 'معلومات إضافية' : 'Additional Information',
          },
          { id: 'reviews', label: prefersArabicCopy ? 'المراجعات' : 'Review' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as 'description' | 'additional' | 'reviews')}
            className={`relative pb-4 text-sm font-bold transition-all md:text-base ${
              activeTab === tab.id
                ? 'text-[#1a3328]'
                : 'text-[#1a3328]/30 hover:text-[#1a3328]/60'
            }`}
          >
            {tab.label}
            {activeTab === tab.id ? (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#88a876]" />
            ) : null}
          </button>
        ))}
      </div>

      {activeTab === 'description' ? (
        <div className="mx-auto max-w-4xl py-4">
          <div
            className="prose prose-sm max-w-none leading-relaxed text-[#1a3328]/60"
            dangerouslySetInnerHTML={{
              __html:
                sanitizeStorefrontHtml(productDescription) ||
                (prefersArabicCopy ? 'لا يوجد وصف متاح.' : 'No description available.'),
            }}
          />
        </div>
      ) : null}

      {activeTab === 'additional' ? (
        <div className="mx-auto max-w-4xl py-4">
          <table className="w-full border-collapse">
            <tbody>
              {[
                {
                  label: prefersArabicCopy ? 'الفئة' : 'Category',
                  value: categoryName || notAvailableText,
                },
                {
                  label: prefersArabicCopy ? 'الوسوم' : 'Tags',
                  value: tagsValue || notAvailableText,
                },
                {
                  label: prefersArabicCopy ? 'العلامة التجارية' : 'Brand',
                  value: prefersArabicCopy ? 'زين أورجانيك' : 'Zen Organic',
                },
                {
                  label: prefersArabicCopy ? 'الوزن' : 'Weight',
                  value: prefersArabicCopy ? '150 جم' : '150g',
                },
                {
                  label: prefersArabicCopy ? 'الأبعاد' : 'Dimensions',
                  value: '10 x 5 x 5 cm',
                },
                {
                  label: prefersArabicCopy ? 'بلد المنشأ' : 'Origin',
                  value: prefersArabicCopy ? 'صنع في الولايات المتحدة' : 'Made in USA',
                },
              ].map((row, index) => (
                <tr key={index} className="border-b border-[#e9ebe5] last:border-0">
                  <td className="w-1/3 py-4 text-sm font-bold text-[#1a3328]">{row.label}</td>
                  <td className="py-4 text-sm text-[#1a3328]/60">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
};

export default ZenOrganicTabs;
