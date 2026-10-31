import React from 'react';

interface FiltersSidebarRatingAndSizeProps {
  isZenOrganic: boolean;
  isKhemetLuxe: boolean;
  showSizeFilter?: boolean;
  shellClassName: string;
  headingClassName: string;
  prefersArabicCopy: boolean;
  searchParams: URLSearchParams;
  onSizeChange: (size: string) => void;
}

export const FiltersSidebarRatingAndSize: React.FC<FiltersSidebarRatingAndSizeProps> = ({
  isZenOrganic,
  isKhemetLuxe,
  showSizeFilter = true,
  shellClassName,
  headingClassName,
  prefersArabicCopy,
  searchParams,
  onSizeChange,
}) => {
  return (
    <>
      {/* Size (khemet-luxe shoes) */}
      {isKhemetLuxe && showSizeFilter !== false ? (
        <div className={shellClassName} data-testid="filters-sidebar-size">
          <h3 className={`font-heading uppercase ${headingClassName}`}>
            {prefersArabicCopy ? 'المقاس' : 'Size'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {['35', '36', '37', '38', '39', '40', '41', '42'].map((size) => {
              const isSelected = searchParams.get('size') === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onSizeChange(size)}
                  className={`h-9 min-w-[2.5rem] rounded-full px-3 text-sm font-medium transition-all tabular-nums ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'border border-border text-foreground hover:border-primary hover:bg-accent/10'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Filter by Rating (ZenOrganic) */}
      {isZenOrganic && (
        <div className="pt-2" data-testid="filters-sidebar-rating">
          <h3 className="text-sm font-semibold font-heading text-[#1a3328] mb-5 uppercase tracking-wide">
            {prefersArabicCopy ? 'التقييم' : 'Filter by Rating'}
          </h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                type="button"
                className="flex items-center gap-2 text-[#ffb800] hover:opacity-80 transition-all group"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < stars ? 'fill-current' : 'fill-[#e9ebe5] text-[#e9ebe5]'
                      }`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs font-bold text-[#1a3328]/40 group-hover:text-[#1a3328] transition-colors tabular-nums">
                  ({stars}.0)
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default FiltersSidebarRatingAndSize;
