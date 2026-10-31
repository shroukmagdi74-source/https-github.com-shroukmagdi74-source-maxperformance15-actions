import React from 'react';
import { CatalogSortValue } from '../../utils/catalogFilters';
import { ShopCommandBarController } from './useShopCommandBarController';

export const StandardDeckVariant: React.FC<{ ctrl: ShopCommandBarController }> = ({ ctrl }) => {
  const {
    isBiteRush,
    isElessiFilterDeck,
    isElessiCategoryRibbon,
    isElessiSpecToolbar,
    isElessiGiftToolbar,
    isSpecConsole,
    isDecisionDeck,
    variant,
    isFragranceConsole,
    isSoftFashionDiscovery,
    isMenShoes,
    hideHeader,
    stickyLabel,
    isLoading,
    pagination,
    resultsLabel,
    hasActiveControls,
    handleClearFilters,
    clearButtonText,
    title,
    subtitle,
    activeCategoryLabel,
    selectedSortLabel,
    decisionModeLabel,
    prefersArabicCopy,
    isBoutiqueDiscovery,
    isFitFinder,
    hideSearch,
    handleSearchSubmit,
    searchInputId,
    searchValue,
    setSearchValue,
    searchPlaceholder,
    sortSelectId,
    selectedSort,
    handleSortChange,
    sortOptions,
    shouldShowMobileCategoryChips,
    selectedCategory,
    handleCategorySelect,
    allCategoriesLabel,
    visibleCategories,
    hideDesktopCategoryChips,
  } = ctrl;

  return (
    <section className={`sticky ${isBiteRush ? 'top-24' : 'top-20'} z-30 mb-6 rounded-[calc(var(--radius)+0.35rem)] border px-4 py-4 backdrop-blur md:px-5 ${
      isElessiFilterDeck
        ? 'border-[#ead8cb] bg-[linear-gradient(180deg,rgba(255,253,249,0.98),rgba(248,239,231,0.96))] shadow-[0_30px_90px_-56px_rgba(91,57,40,0.26)]'
        : isElessiCategoryRibbon
        ? 'border-[#ead8cb] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(251,244,237,0.96))] shadow-[0_28px_86px_-58px_rgba(91,57,40,0.22)]'
        : isElessiSpecToolbar
        ? 'border-[#ddd3c6] bg-[linear-gradient(180deg,rgba(255,254,249,0.98),rgba(245,236,218,0.96))] shadow-[0_30px_92px_-58px_rgba(40,31,24,0.24)]'
        : isElessiGiftToolbar
        ? 'border-[#ead8cb] bg-[linear-gradient(180deg,rgba(255,252,248,0.98),rgba(248,239,233,0.96))] shadow-[0_30px_92px_-58px_rgba(91,57,40,0.24)]'
      : isSpecConsole
        ? 'border-[#1f242c]/12 bg-[linear-gradient(180deg,rgba(255,252,244,0.98),rgba(247,239,221,0.98))] shadow-[0_28px_92px_-52px_rgba(31,36,44,0.34)]'
        : isDecisionDeck
        ? 'border-[#1f242c]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,239,221,0.96))] shadow-[0_30px_96px_-54px_rgba(31,36,44,0.32)]'
        : variant === 'minimal-toolbar'
        ? 'border-border/70 bg-background/88 shadow-[0_14px_46px_-40px_rgba(15,23,42,0.25)]'
        : isFragranceConsole
          ? 'border-[#e6d8cf] bg-[linear-gradient(180deg,rgba(255,253,250,0.98),rgba(251,246,242,0.96))] shadow-[0_28px_86px_-58px_rgba(61,41,44,0.22)]'
        : isSoftFashionDiscovery
          ? 'border-[#ead8cf] bg-[linear-gradient(180deg,rgba(255,253,250,0.98),rgba(250,242,236,0.96))] shadow-[0_30px_90px_-60px_rgba(76,42,44,0.26)]'
        : variant === 'marketplace-dense'
          ? 'border-primary/12 bg-background/95 shadow-[0_24px_80px_-46px_rgba(15,23,42,0.42)]'
          : isBiteRush
            ? 'border-[#171717]/10 bg-white shadow-[0_24px_50px_-34px_rgba(17,17,17,0.28)]'
          : isMenShoes
            ? 'border-[#ded0c2] bg-[linear-gradient(180deg,rgba(255,252,248,0.98),rgba(250,243,236,0.96))] shadow-[0_28px_78px_-52px_rgba(31,38,43,0.34)]'
          : variant === 'menu-quick-order'
            ? 'border-accent/16 bg-background/95 shadow-[0_22px_66px_-44px_rgba(124,45,18,0.28)]'
            : 'border-border bg-background/92 shadow-[0_20px_70px_-46px_rgba(15,23,42,0.35)]'
    }`}>
      <div className={`flex flex-col ${hideHeader ? 'gap-3' : 'gap-4'}`}>
        <div className="flex items-center justify-between gap-3 md:hidden">
          <span className={`inline-flex w-fit rounded-[var(--button-radius)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${
            isBiteRush
              ? 'bg-[#fff1ea] text-[#dc2626]'
              : isElessiFilterDeck
                ? 'border border-[#ead8cb] bg-white text-[#8f5c44]'
              : isElessiCategoryRibbon
                ? 'border border-[#ead8cb] bg-[#fff7f1] text-[#8f5c44]'
              : isElessiSpecToolbar
                ? 'border border-[#1f242c]/10 bg-[#2d241f] text-[#f6dec3]'
              : isElessiGiftToolbar
                ? 'border border-[#ead8cb] bg-[#fff5ef] text-[#7d4d40]'
              : isSoftFashionDiscovery
                ? 'border border-[#ead8cf] bg-white text-[#8f4d41]'
              : isSpecConsole
                ? 'border border-[#1f242c]/10 bg-[#1f242c] text-[#fff1b8]'
                : isDecisionDeck
                  ? 'border border-[#1f242c]/10 bg-[#1f242c] text-[#fff4d1]'
                : isFragranceConsole
                  ? 'border border-[#eadfd7] bg-[#fff7f1] text-[#5b3940]'
                  : isSoftFashionDiscovery
                    ? 'border border-[#ead8cf] bg-[#fff7f3] text-[#8f4d41]'
                  : isMenShoes
                    ? 'border border-[#e6d8cb] bg-white text-[#1f262b]'
                  : 'border border-primary/10 bg-primary/5 text-primary'
          }`}>
            {stickyLabel}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`rounded-[var(--button-radius)] px-3 py-1.5 font-semibold tabular-nums font-mono ${
              isBiteRush
                ? 'border border-[#171717]/10 bg-white text-[#171717]'
                : isElessiFilterDeck
                  ? 'border border-[#ead8cb] bg-white text-[#6b4a3c]'
                : isElessiCategoryRibbon
                  ? 'border border-[#ead8cb] bg-white text-[#6b4a3c]'
                : isElessiSpecToolbar
                  ? 'border border-[#1f242c]/10 bg-white/88 text-[#2d241f]'
                : isElessiGiftToolbar
                  ? 'border border-[#ead8cb] bg-white text-[#7d4d40]'
                : isSpecConsole
                  ? 'border border-[#1f242c]/10 bg-white/84 text-[#1f242c]'
                : isDecisionDeck
                  ? 'border border-[#1f242c]/10 bg-white text-[#1f242c]'
                : isFragranceConsole
                  ? 'border border-[#eadfd7] bg-white text-[#5b3940]'
                : isSoftFashionDiscovery
                  ? 'border border-[#ead8cf] bg-white text-[#8f4d41]'
                : isMenShoes
                  ? 'border border-[#e6d8cb] bg-white text-[#4f4034]'
                  : 'border border-border bg-card'
            }`}>
              {isLoading ? '...' : pagination.total} {resultsLabel}
            </span>
            {hasActiveControls ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className={`rounded-[var(--button-radius)] border px-3 py-1.5 font-semibold transition-colors ${
                  isBiteRush
                    ? 'border-[#171717]/10 text-[#171717] hover:border-[#ff6b2c] hover:text-[#dc2626]'
                    : isElessiFilterDeck || isElessiCategoryRibbon
                      ? 'border-[#ead8cb] text-[#6b4a3c] hover:border-[#c79f8b] hover:text-[#8f5c44]'
                    : isElessiSpecToolbar
                      ? 'border-[#1f242c]/10 text-[#2d241f] hover:border-[#cda56d] hover:text-[#2d241f]'
                    : isElessiGiftToolbar
                      ? 'border-[#ead8cb] text-[#7d4d40] hover:border-[#c79f8b] hover:text-[#7d4d40]'
                    : isSpecConsole
                      ? 'border-[#1f242c]/10 text-[#1f242c] hover:border-[#ffd400] hover:text-[#1f242c]'
                    : isDecisionDeck
                      ? 'border-[#1f242c]/10 text-[#1f242c] hover:border-[#facc15] hover:text-[#1f242c]'
                    : isSoftFashionDiscovery
                      ? 'border-[#ead8cf] text-[#8f4d41] hover:border-[#d86b55] hover:text-[#d86b55]'
                    : isFragranceConsole
                      ? 'border-[#eadfd7] text-[#5b3940] hover:border-[#c79f8b] hover:text-[#5b3940]'
                    : isMenShoes
                      ? 'border-[#e6d8cb] text-[#4f4034] hover:border-[#f57a1d] hover:text-[#f57a1d]'
                      : 'border-border text-foreground hover:border-primary/30 hover:text-primary'
                }`}
              >
                {clearButtonText}
              </button>
            ) : null}
          </div>
        </div>

        {hideHeader ? (
          <div className="hidden items-center justify-between gap-3 md:flex">
            <span className={`inline-flex w-fit rounded-[var(--button-radius)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${
              isBiteRush
                ? 'bg-[#fff1ea] text-[#dc2626]'
                : isElessiFilterDeck
                  ? 'border border-[#ead8cb] bg-white text-[#8f5c44]'
                : isElessiCategoryRibbon
                  ? 'border border-[#ead8cb] bg-[#fff7f1] text-[#8f5c44]'
                : isElessiSpecToolbar
                  ? 'border border-[#1f242c]/10 bg-[#2d241f] text-[#f6dec3]'
                : isElessiGiftToolbar
                  ? 'border border-[#ead8cb] bg-[#fff5ef] text-[#7d4d40]'
                : isSpecConsole
                  ? 'border border-[#1f242c]/10 bg-[#1f242c] text-[#fff1b8]'
                : isDecisionDeck
                  ? 'border border-[#1f242c]/10 bg-[#1f242c] text-[#fff4d1]'
                  : isSoftFashionDiscovery
                    ? 'border border-[#ead8cf] bg-[#fff7f3] text-[#8f4d41]'
                  : isFragranceConsole
                    ? 'border border-[#eadfd7] bg-[#fff7f1] text-[#5b3940]'
                  : 'border border-primary/10 bg-primary/5 text-primary'
            }`}>
              {stickyLabel}
            </span>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className={`rounded-[var(--button-radius)] px-3 py-1.5 font-semibold tabular-nums font-mono ${
                isBiteRush
                  ? 'border border-[#171717]/10 bg-white text-[#171717]'
                  : isElessiFilterDeck
                    ? 'border border-[#ead8cb] bg-white text-[#6b4a3c]'
                  : isElessiCategoryRibbon
                    ? 'border border-[#ead8cb] bg-white text-[#6b4a3c]'
                  : isElessiSpecToolbar
                    ? 'border border-[#1f242c]/10 bg-white/88 text-[#2d241f]'
                  : isElessiGiftToolbar
                    ? 'border border-[#ead8cb] bg-white text-[#7d4d40]'
                  : isSpecConsole
                    ? 'border border-[#1f242c]/10 bg-white/84 text-[#1f242c]'
                  : isDecisionDeck
                    ? 'border border-[#1f242c]/10 bg-white text-[#1f242c]'
                  : isSoftFashionDiscovery
                    ? 'border border-[#ead8cf] bg-white text-[#8f4d41]'
                  : 'border border-border bg-card'
              }`}>
                {isLoading ? '...' : pagination.total} {resultsLabel}
              </span>
              {hasActiveControls ? (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className={`rounded-[var(--button-radius)] border px-3 py-1.5 font-semibold transition-colors ${
                    isBiteRush
                      ? 'border-[#171717]/10 text-[#171717] hover:border-[#ff6b2c] hover:text-[#dc2626]'
                      : isElessiFilterDeck || isElessiCategoryRibbon
                        ? 'border-[#ead8cb] text-[#6b4a3c] hover:border-[#c79f8b] hover:text-[#8f5c44]'
                      : isElessiSpecToolbar
                        ? 'border-[#1f242c]/10 text-[#2d241f] hover:border-[#cda56d] hover:text-[#2d241f]'
                      : isElessiGiftToolbar
                        ? 'border-[#ead8cb] text-[#7d4d40] hover:border-[#c79f8b] hover:text-[#7d4d40]'
                      : isSpecConsole
                        ? 'border-[#1f242c]/10 text-[#1f242c] hover:border-[#ffd400] hover:text-[#1f242c]'
                      : isDecisionDeck
                        ? 'border-[#1f242c]/10 text-[#1f242c] hover:border-[#facc15] hover:text-[#1f242c]'
                      : isSoftFashionDiscovery
                        ? 'border-[#ead8cf] text-[#8f4d41] hover:border-[#d86b55] hover:text-[#d86b55]'
                      : 'border-border text-foreground hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {clearButtonText}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="hidden flex-col gap-3 md:flex xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-2">
              <span className={`inline-flex w-fit rounded-[var(--button-radius)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${
                isBiteRush
                  ? 'bg-[#fff1ea] text-[#dc2626]'
                  : isElessiFilterDeck
                    ? 'border border-[#ead8cb] bg-white text-[#8f5c44]'
                  : isElessiCategoryRibbon
                    ? 'border border-[#ead8cb] bg-[#fff7f1] text-[#8f5c44]'
                  : isElessiSpecToolbar
                    ? 'border border-[#1f242c]/10 bg-[#2d241f] text-[#f6dec3]'
                  : isElessiGiftToolbar
                    ? 'border border-[#ead8cb] bg-[#fff5ef] text-[#7d4d40]'
                  : isSpecConsole
                    ? 'border border-[#1f242c]/10 bg-[#1f242c] text-[#fff1b8]'
                  : isDecisionDeck
                    ? 'border border-[#1f242c]/10 bg-[#1f242c] text-[#fff4d1]'
                  : isSoftFashionDiscovery
                    ? 'border border-[#ead8cf] bg-[#fff7f3] text-[#8f4d41]'
                  : 'border border-primary/10 bg-primary/5 text-primary'
              }`}>
                {stickyLabel}
              </span>
              <div className="space-y-1">
                <h2 className={`font-heading font-black tracking-tight ${
                  isBiteRush
                    ? 'text-3xl uppercase italic text-[#171717]'
                    : isElessiFilterDeck || isElessiCategoryRibbon
                      ? 'text-[1.45rem] text-[#2d211e] md:text-[1.6rem]'
                    : isElessiSpecToolbar
                      ? 'text-[1.4rem] text-[#2d241f] md:text-[1.55rem]'
                    : isElessiGiftToolbar
                      ? 'text-[1.4rem] text-[#3d292c] md:text-[1.55rem]'
                    : isDecisionDeck
                      ? 'text-[1.35rem] text-[#1f242c] md:text-[1.5rem]'
                      : isFragranceConsole
                        ? 'text-[1.35rem] text-[#3d292c] md:text-[1.55rem]'
                      : 'text-xl text-foreground'
                }`}>
                  {title}
                </h2>
                <p className={`max-w-2xl text-sm leading-6 ${
                  isBiteRush
                    ? 'text-[#5f5f5f]'
                    : isElessiFilterDeck || isElessiCategoryRibbon
                      ? 'text-[#7b645b]'
                    : isElessiSpecToolbar
                      ? 'text-[#70655d]'
                    : isElessiGiftToolbar
                      ? 'text-[#7a5d60]'
                    : isDecisionDeck
                      ? 'text-[#646b77]'
                      : isSoftFashionDiscovery
                        ? 'text-[#7a6268]'
                      : isFragranceConsole
                        ? 'text-[#7a5d60]'
                      : 'text-muted-foreground'
                }`}>
                  {subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className={`rounded-[var(--button-radius)] px-3 py-1.5 font-semibold tabular-nums font-mono ${
                isBiteRush
                  ? 'border border-[#171717]/10 bg-white text-[#171717]'
                  : isElessiFilterDeck
                    ? 'border border-[#ead8cb] bg-white text-[#6b4a3c]'
                  : isElessiCategoryRibbon
                    ? 'border border-[#ead8cb] bg-white text-[#6b4a3c]'
                  : isElessiSpecToolbar
                    ? 'border border-[#1f242c]/10 bg-white/88 text-[#2d241f]'
                  : isElessiGiftToolbar
                    ? 'border border-[#ead8cb] bg-white text-[#5b3940]'
                  : isSpecConsole
                    ? 'border border-[#1f242c]/10 bg-white/84 text-[#1f242c]'
                  : isDecisionDeck
                    ? 'border border-[#1f242c]/10 bg-white text-[#1f242c]'
                  : isSoftFashionDiscovery
                    ? 'border border-[#ead8cf] bg-white text-[#8f4d41]'
                  : isFragranceConsole
                    ? 'border border-[#eadfd7] bg-white text-[#5b3940]'
                  : 'border border-border bg-card'
              }`}>
                {isLoading ? '...' : pagination.total} {resultsLabel}
              </span>
              {hasActiveControls && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className={`rounded-[var(--button-radius)] border px-3 py-1.5 font-semibold transition-colors ${
                    isBiteRush
                      ? 'border-[#171717]/10 text-[#171717] hover:border-[#ff6b2c] hover:text-[#dc2626]'
                      : isElessiFilterDeck || isElessiCategoryRibbon
                        ? 'border-[#ead8cb] text-[#6b4a3c] hover:border-[#c79f8b] hover:text-[#8f5c44]'
                      : isElessiSpecToolbar
                        ? 'border-[#1f242c]/10 text-[#2d241f] hover:border-[#cda56d] hover:text-[#2d241f]'
                      : isElessiGiftToolbar
                        ? 'border-[#ead8cb] text-[#5b3940] hover:border-[#c79f8b] hover:text-[#5b3940]'
                      : isSpecConsole
                        ? 'border-[#1f242c]/10 text-[#1f242c] hover:border-[#ffd400] hover:text-[#1f242c]'
                      : isDecisionDeck
                        ? 'border-[#1f242c]/10 text-[#1f242c] hover:border-[#facc15] hover:text-[#1f242c]'
                      : isSoftFashionDiscovery
                        ? 'border-[#ead8cf] text-[#8f4d41] hover:border-[#d86b55] hover:text-[#d86b55]'
                      : isFragranceConsole
                        ? 'border-[#eadfd7] text-[#5b3940] hover:border-[#c79f8b] hover:text-[#5b3940]'
                      : 'border-border text-foreground hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {clearButtonText}
                </button>
              )}
            </div>
          </div>
        )}

        {isDecisionDeck ? (
          <div className="grid gap-3 rounded-[1.5rem] border border-[#1f242c]/10 bg-white/82 p-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1rem] border border-[#1f242c]/8 bg-[#fffdf7] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7c818b]">
                {prefersArabicCopy ? 'المسار الحالي' : 'Current path'}
              </p>
              <p className="mt-2 text-sm font-black text-[#1f242c]">
                {activeCategoryLabel}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#1f242c]/8 bg-[#fffdf7] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7c818b]">
                {prefersArabicCopy ? 'المعروض الآن' : 'Showing now'}
              </p>
              <p className="mt-2 text-sm font-black text-[#1f242c] tabular-nums font-mono">
                {isLoading ? '...' : `${pagination.total} ${resultsLabel}`}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#1f242c]/8 bg-[#fffdf7] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7c818b]">
                {prefersArabicCopy ? 'ترتيب الفحص' : 'Sort review'}
              </p>
              <p className="mt-2 text-sm font-black text-[#1f242c]">
                {selectedSortLabel}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#1f242c]/8 bg-[#1f242c] px-4 py-3 text-[#fff4d1] shadow-[0_24px_60px_-48px_rgba(31,36,44,0.72)]">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ffd400]">
                {prefersArabicCopy ? 'جاهزية القرار' : 'Decision readiness'}
              </p>
              <p className="mt-2 text-sm font-black">
                {decisionModeLabel}
              </p>
            </div>
          </div>
        ) : isSpecConsole ? (
          <div className="grid gap-3 rounded-[1.45rem] border border-[#1f242c]/10 bg-white/76 p-3 sm:grid-cols-3">
            <div className="rounded-[1rem] border border-[#1f242c]/8 bg-[#fffdf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7c818b]">
                {prefersArabicCopy ? 'التصنيف الحالي' : 'Current category'}
              </p>
              <p className="mt-2 text-sm font-black text-[#1f242c]">
                {activeCategoryLabel}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#1f242c]/8 bg-[#fffdf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7c818b]">
                {prefersArabicCopy ? 'المطابق الآن' : 'Matching now'}
              </p>
              <p className="mt-2 text-sm font-black text-[#1f242c] tabular-nums font-mono">
                {isLoading ? '...' : `${pagination.total} ${resultsLabel}`}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#1f242c]/8 bg-[#1f242c] px-4 py-3 text-[#fff4d1] shadow-[0_24px_60px_-48px_rgba(31,36,44,0.72)]">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ffd400]">
                {prefersArabicCopy ? 'ترتيب القراءة' : 'Read order'}
              </p>
              <p className="mt-2 text-sm font-black">
                {selectedSortLabel}
              </p>
            </div>
          </div>
        ) : isElessiFilterDeck ? (
          <div className="grid gap-3 rounded-[1.45rem] border border-[#ead8cb] bg-white/82 p-3 sm:grid-cols-3">
            <div className="rounded-[1rem] border border-[#efe0d4] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8f5c44]">
                القسم المفتوح
              </p>
              <p className="mt-2 text-sm font-black text-[#2d211e]">
                {activeCategoryLabel}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#efe0d4] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8f5c44]">
                {prefersArabicCopy ? 'المعروض الآن' : 'Showing now'}
              </p>
              <p className="mt-2 text-sm font-black text-[#2d211e] tabular-nums font-mono">
                {isLoading ? '...' : `${pagination.total} ${resultsLabel}`}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#ead8cb] bg-[#2d211e] px-4 py-3 text-[#f8e5d3] shadow-[0_24px_60px_-48px_rgba(45,33,30,0.72)]">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#f0c9ab]">
                إيقاع التصفح
              </p>
              <p className="mt-2 text-sm font-black">
                {hasActiveControls ? 'قرار أقرب' : 'جاهز للاكتشاف'}
              </p>
            </div>
          </div>
        ) : isElessiSpecToolbar ? (
          <div className="grid gap-3 rounded-[1.45rem] border border-[#d8cdbd] bg-white/78 p-3 sm:grid-cols-3">
            <div className="rounded-[1rem] border border-[#e7dccd] bg-[#fffdf7] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8a6a48]">
                المسار المفتوح
              </p>
              <p className="mt-2 text-sm font-black text-[#2d241f]">
                {activeCategoryLabel}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#e7dccd] bg-[#fffdf7] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8a6a48]">
                {prefersArabicCopy ? 'المطابق الآن' : 'Matching now'}
              </p>
              <p className="mt-2 text-sm font-black text-[#2d241f] tabular-nums font-mono">
                {isLoading ? '...' : `${pagination.total} ${resultsLabel}`}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#d8cdbd] bg-[#2d241f] px-4 py-3 text-[#f6dec3] shadow-[0_24px_60px_-48px_rgba(45,36,31,0.7)]">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#e7c08d]">
                الفرز الحالي
              </p>
              <p className="mt-2 text-sm font-black">
                {selectedSortLabel}
              </p>
            </div>
          </div>
        ) : isElessiCategoryRibbon ? (
          <div className="grid gap-3 rounded-[1.4rem] border border-[#ead8cb] bg-white/82 p-3 sm:grid-cols-3">
            <div className="rounded-[1rem] border border-[#efe0d4] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8f5c44]">
                دخول أسرع
              </p>
              <p className="mt-2 text-sm font-bold text-[#2d211e]">
                اختَر القسم أو ابحث، ثم ادخل إلى الشبكة بدون دوران زائد.
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#efe0d4] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8f5c44]">
                {prefersArabicCopy ? 'المعروض الآن' : 'Showing now'}
              </p>
              <p className="mt-2 text-sm font-bold text-[#2d211e] tabular-nums font-mono">
                {isLoading ? '...' : `${pagination.total} ${resultsLabel}`}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#efe0d4] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8f5c44]">
                الترتيب الحالي
              </p>
              <p className="mt-2 text-sm font-bold text-[#2d211e]">
                {selectedSortLabel}
              </p>
            </div>
          </div>
        ) : isElessiGiftToolbar ? (
          <div className="grid gap-3 rounded-[1.4rem] border border-[#ead8cb] bg-white/82 p-3 sm:grid-cols-3">
            <div className="rounded-[1rem] border border-[#f0e4dd] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8b623e]">
                المجموعة المفتوحة
              </p>
              <p className="mt-2 text-sm font-bold text-[#3d292c]">
                {activeCategoryLabel}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#f0e4dd] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8b623e]">
                {prefersArabicCopy ? 'المعروض الآن' : 'Showing now'}
              </p>
              <p className="mt-2 text-sm font-bold text-[#3d292c] tabular-nums font-mono">
                {isLoading ? '...' : `${pagination.total} ${resultsLabel}`}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#f0e4dd] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8b623e]">
                الفرز الحالي
              </p>
              <p className="mt-2 text-sm font-bold text-[#3d292c]">
                {selectedSortLabel}
              </p>
            </div>
          </div>
        ) : isBoutiqueDiscovery ? (
          <div className="grid gap-3 rounded-[1.4rem] border border-[#eddcd4] bg-white/76 p-3 sm:grid-cols-3">
            <div className="rounded-[1rem] border border-[#f0e2db] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8f4d41]">
                الإيقاع المفتوح
              </p>
              <p className="mt-2 text-sm font-bold text-[#3d2a2f]">
                ابدئي من الفساتين أو البلوزات أو الإكسسوار، ثم ضيّقي الطريق من غير ما تثقلي الرف.
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#f0e2db] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8f4d41]">
                {prefersArabicCopy ? 'المعروض الآن' : 'Showing now'}
              </p>
              <p className="mt-2 text-sm font-bold text-[#3d2a2f] tabular-nums font-mono">
                {isLoading ? '...' : `${pagination.total} ${resultsLabel}`}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#f0e2db] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8f4d41]">
                اللمسة الأخيرة
              </p>
              <p className="mt-2 text-sm font-bold text-[#3d2a2f]">
                {selectedSortLabel}
              </p>
            </div>
          </div>
        ) : isFitFinder ? (
          <>
            <div className="flex flex-wrap items-center gap-2 rounded-[1.2rem] border border-[#eddcd4] bg-white/88 p-3 sm:hidden">
              <span className="inline-flex rounded-full bg-[linear-gradient(135deg,#2f232d_0%,#8f4d41_100%)] px-3 py-1 text-xs font-black text-white tabular-nums font-mono">
                {isLoading ? '...' : `${pagination.total} ${resultsLabel}`}
              </span>
              <span className="inline-flex rounded-full border border-[#ead8cf] bg-[#fffaf6] px-3 py-1 text-xs font-bold text-[#5b4950]">
                {activeCategoryLabel}
              </span>
              {selectedSortLabel ? (
                <span className="inline-flex rounded-full border border-[#ead8cf] bg-[#fffaf6] px-3 py-1 text-xs font-bold text-[#8f4d41]">
                  {selectedSortLabel}
                </span>
              ) : null}
            </div>
            <div className="hidden gap-3 rounded-[1.4rem] border border-[#eddcd4] bg-white/75 p-3 sm:grid sm:grid-cols-3">
            <div className="rounded-[1rem] border border-[#f0e2db] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8f4d41]">
                أقرب مقاس
              </p>
              <p className="mt-2 text-sm font-bold text-[#3d2a2f]">
                فلترة أسرع حسب المقاس واللون بدل التنقل الطويل داخل الشبكة.
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#f0e2db] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8f4d41]">
                السعر أولًا
              </p>
              <p className="mt-2 text-sm font-bold text-[#3d2a2f]">
                اعرفي عدد النتائج والفرز الحالي قبل ما تدخلي أي منتج.
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#f0e2db] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8f4d41]">
                طريق أقصر
              </p>
              <p className="mt-2 text-sm font-bold text-[#3d2a2f]">
                ابدئي من الفستان أو الحذاء أو المقاس المطلوب مباشرة.
              </p>
            </div>
            </div>
          </>
        ) : isFragranceConsole ? (
          <div className="grid gap-3 rounded-[1.4rem] border border-[#eadfd7] bg-white/82 p-3 sm:grid-cols-3">
            <div className="rounded-[1rem] border border-[#f0e4dd] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8b623e]">
                العائلة المفتوحة
              </p>
              <p className="mt-2 text-sm font-bold text-[#3d292c]">
                {activeCategoryLabel}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#f0e4dd] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8b623e]">
                {prefersArabicCopy ? 'المعروض الآن' : 'Showing now'}
              </p>
              <p className="mt-2 text-sm font-bold text-[#3d292c] tabular-nums font-mono">
                {isLoading ? '...' : `${pagination.total} ${resultsLabel}`}
              </p>
            </div>
            <div className="rounded-[1rem] border border-[#f0e4dd] bg-[#fffaf6] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8b623e]">
                الفرز الحالي
              </p>
              <p className="mt-2 text-sm font-bold text-[#3d292c]">
                {selectedSortLabel}
              </p>
            </div>
          </div>
        ) : null}

        <div className={hideSearch ? 'flex justify-end' : 'grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_220px]'}>
          {!hideSearch ? (
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id={searchInputId}
                name="catalogSearch"
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={searchPlaceholder}
                className={`h-12 w-full rounded-[var(--button-radius)] px-5 pe-28 text-sm outline-none transition-colors ${
                  isBiteRush
                    ? 'border border-[#171717]/10 bg-[#fffaf6] text-[#171717] placeholder:text-[#8c766a] focus:border-[#ff6b2c] focus:ring-2 focus:ring-[#ff6b2c]/15'
                  : isMenShoes
                    ? 'border border-[#ded0c2] bg-white text-[#1f262b] placeholder:text-[#8d7768] focus:border-[#f57a1d] focus:ring-2 focus:ring-[#f57a1d]/12'
                  : isElessiFilterDeck || isElessiCategoryRibbon
                    ? 'border border-[#ead8cb] bg-white text-[#2d211e] placeholder:text-[#94786f] focus:border-[#c79f8b] focus:ring-2 focus:ring-[#c79f8b]/12'
                  : isElessiSpecToolbar
                    ? 'border border-[#d8cdbd] bg-white/92 text-[#2d241f] placeholder:text-[#8a7b71] focus:border-[#cda56d] focus:ring-2 focus:ring-[#cda56d]/12'
                  : isElessiGiftToolbar
                    ? 'border border-[#ead8cb] bg-white text-[#3d292c] placeholder:text-[#8b756f] focus:border-[#c79f8b] focus:ring-2 focus:ring-[#c79f8b]/12'
                  : isFragranceConsole
                    ? 'border border-[#e6d8cf] bg-white text-[#3d292c] placeholder:text-[#8b756f] focus:border-[#c79f8b] focus:ring-2 focus:ring-[#c79f8b]/12'
                  : isSpecConsole
                      ? 'border border-[#1f242c]/10 bg-white/88 text-[#1f242c] placeholder:text-[#7c818b] focus:border-[#ffd400] focus:ring-2 focus:ring-[#ffd400]/15'
                    : isDecisionDeck
                      ? 'border border-[#1f242c]/10 bg-white text-[#1f242c] placeholder:text-[#818792] focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/15'
                    : isSoftFashionDiscovery
                      ? 'border border-[#ead8cf] bg-white text-[#3d2a2f] placeholder:text-[#90797f] focus:border-[#d86b55] focus:ring-2 focus:ring-[#d86b55]/12'
                    : 'border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary/35 focus:ring-2 focus:ring-primary/10'
                }`}
              />
              <button
                type="submit"
                className={`absolute inset-y-1 end-1 rounded-[var(--button-radius)] px-5 text-sm font-bold transition-opacity hover:opacity-95 ${
                  isBiteRush
                    ? 'bg-[#171717] text-white'
                  : isMenShoes
                    ? 'bg-[#1f262b] text-white'
                  : isElessiFilterDeck || isElessiCategoryRibbon
                    ? 'bg-[linear-gradient(135deg,#8f5c44_0%,#6b4a3c_100%)] text-white'
                  : isElessiSpecToolbar
                    ? 'bg-[#2d241f] text-[#f6dec3]'
                  : isElessiGiftToolbar
                    ? 'bg-[linear-gradient(135deg,#5b3940_0%,#8b623e_100%)] text-white'
                  : isFragranceConsole
                    ? 'bg-[linear-gradient(135deg,#3d292c_0%,#6d4c4a_100%)] text-white'
                  : isSpecConsole
                      ? 'bg-[#1f242c] text-[#fff4d1]'
                    : isDecisionDeck
                      ? 'bg-[#1f242c] text-[#fff4d1]'
                    : isSoftFashionDiscovery
                      ? 'bg-[linear-gradient(135deg,#2f232d_0%,#8f4d41_100%)] text-white'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {prefersArabicCopy ? 'بحث' : 'Search'}
              </button>
            </form>
          ) : null}

          <select
            id={sortSelectId}
            name="catalogSort"
            value={selectedSort}
            onChange={(event) => handleSortChange(event.target.value as CatalogSortValue)}
            className={`h-12 ${hideSearch ? 'min-w-[220px]' : 'w-full'} rounded-[var(--button-radius)] px-4 text-sm font-semibold outline-none transition-colors ${
                isBiteRush
                  ? 'border border-[#171717]/10 bg-[#fffaf6] text-[#171717] focus:border-[#ff6b2c] focus:ring-2 focus:ring-[#ff6b2c]/15'
                : isMenShoes
                  ? 'border border-[#ded0c2] bg-white text-[#1f262b] focus:border-[#f57a1d] focus:ring-2 focus:ring-[#f57a1d]/12'
                : isElessiFilterDeck || isElessiCategoryRibbon
                  ? 'border border-[#ead8cb] bg-white text-[#2d211e] focus:border-[#c79f8b] focus:ring-2 focus:ring-[#c79f8b]/12'
                : isElessiSpecToolbar
                  ? 'border border-[#d8cdbd] bg-white/92 text-[#2d241f] focus:border-[#cda56d] focus:ring-2 focus:ring-[#cda56d]/12'
                : isElessiGiftToolbar
                  ? 'border border-[#ead8cb] bg-white text-[#3d292c] focus:border-[#c79f8b] focus:ring-2 focus:ring-[#c79f8b]/12'
                : isFragranceConsole
                  ? 'border border-[#e6d8cf] bg-white text-[#3d292c] focus:border-[#c79f8b] focus:ring-2 focus:ring-[#c79f8b]/12'
                : isSpecConsole
                    ? 'border border-[#1f242c]/10 bg-white/88 text-[#1f242c] focus:border-[#ffd400] focus:ring-2 focus:ring-[#ffd400]/15'
                  : isDecisionDeck
                    ? 'border border-[#1f242c]/10 bg-white text-[#1f242c] focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/15'
                  : isSoftFashionDiscovery
                    ? 'border border-[#ead8cf] bg-white text-[#3d2a2f] focus:border-[#d86b55] focus:ring-2 focus:ring-[#d86b55]/12'
                  : 'border border-border bg-card text-foreground focus:border-primary/35 focus:ring-2 focus:ring-primary/10'
            }`}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {shouldShowMobileCategoryChips ? (
          <div className="md:hidden -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => handleCategorySelect(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                selectedCategory === 'all'
                  ? isElessiFilterDeck || isElessiCategoryRibbon
                    ? 'bg-[linear-gradient(135deg,#8f5c44_0%,#6b4a3c_100%)] text-white shadow-[0_18px_36px_-24px_rgba(107,74,60,0.58)]'
                    : isFitFinder
                      ? 'bg-[linear-gradient(135deg,#2f232d_0%,#8f4d41_100%)] text-white shadow-[0_18px_36px_-24px_rgba(107,33,49,0.44)]'
                    : 'bg-[#1f262b] text-white shadow-[0_18px_36px_-24px_rgba(31,38,43,0.8)]'
                  : isDecisionDeck
                    ? 'border border-[#d6dbe2] bg-white text-[#1f242c]'
                  : isFitFinder
                    ? 'border border-[#ead8cf] bg-white text-[#5b4950]'
                  : isElessiFilterDeck || isElessiCategoryRibbon
                    ? 'border border-[#ead8cb] bg-white text-[#6b4a3c]'
                  : 'border border-[#ded0c2] bg-white text-[#4f4034]'
              }`}
            >
              {allCategoriesLabel}
            </button>

            {visibleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  selectedCategory === category.id
                    ? isDecisionDeck
                      ? 'bg-[#1f242c] text-[#fff4d1] shadow-[0_20px_40px_-24px_rgba(31,36,44,0.72)]'
                      : isFitFinder
                        ? 'bg-[linear-gradient(135deg,#d86b55_0%,#8f4d41_100%)] text-white shadow-[0_20px_40px_-24px_rgba(107,33,49,0.44)]'
                      : isElessiFilterDeck || isElessiCategoryRibbon
                        ? 'bg-[linear-gradient(135deg,#8f5c44_0%,#6b4a3c_100%)] text-white shadow-[0_20px_40px_-24px_rgba(107,74,60,0.58)]'
                      : 'bg-[linear-gradient(135deg,#f57a1d_0%,#d65700_100%)] text-white shadow-[0_20px_40px_-24px_rgba(245,122,29,0.7)]'
                    : isDecisionDeck
                      ? 'border border-[#d6dbe2] bg-white text-[#1f242c]'
                      : isFitFinder
                        ? 'border border-[#ead8cf] bg-white text-[#5b4950]'
                      : isElessiFilterDeck || isElessiCategoryRibbon
                        ? 'border border-[#ead8cb] bg-white text-[#6b4a3c]'
                      : 'border border-[#ded0c2] bg-white text-[#4f4034]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        ) : null}

        {!hideDesktopCategoryChips ? (
          <div className={`hidden flex-wrap md:flex ${variant === 'marketplace-dense' ? 'gap-1.5' : 'gap-2'}`}>
            <button
              type="button"
              onClick={() => handleCategorySelect(null)}
              className={`rounded-[var(--button-radius)] px-3 py-2 text-sm font-semibold transition-colors ${
                selectedCategory === 'all'
                  ? isBiteRush
                    ? 'bg-[#171717] text-white'
                    : isElessiFilterDeck || isElessiCategoryRibbon
                      ? 'bg-[linear-gradient(135deg,#8f5c44_0%,#6b4a3c_100%)] text-white shadow-[0_18px_40px_-24px_rgba(143,92,68,0.52)]'
                    : isElessiSpecToolbar
                      ? 'bg-[#2d241f] text-[#f6dec3] shadow-[0_18px_40px_-24px_rgba(45,36,31,0.62)]'
                    : isElessiGiftToolbar
                      ? 'bg-[linear-gradient(135deg,#5b3940_0%,#8b623e_100%)] text-white shadow-[0_18px_40px_-24px_rgba(91,57,64,0.42)]'
                    : isMenShoes
                      ? 'bg-[#1f262b] text-white'
                    : isSpecConsole
                      ? 'bg-[#1f242c] text-[#fff4d1]'
                    : isDecisionDeck
                      ? 'bg-[#1f242c] text-[#fff4d1]'
                    : isFragranceConsole
                      ? 'bg-[linear-gradient(135deg,#3d292c_0%,#6d4c4a_100%)] text-white'
                    : isSoftFashionDiscovery
                      ? 'bg-[linear-gradient(135deg,#2f232d_0%,#8f4d41_100%)] text-white'
                    : 'bg-primary text-primary-foreground'
                  : isBiteRush
                    ? 'border border-[#171717]/10 bg-white text-[#171717] hover:border-[#ff6b2c] hover:text-[#dc2626]'
                    : isElessiFilterDeck || isElessiCategoryRibbon
                      ? 'border border-[#ead8cb] bg-white text-[#6b4a3c] hover:border-[#c79f8b] hover:text-[#8f5c44]'
                    : isElessiSpecToolbar
                      ? 'border border-[#d8cdbd] bg-white/92 text-[#2d241f] hover:border-[#cda56d] hover:text-[#2d241f]'
                    : isElessiGiftToolbar
                      ? 'border border-[#ead8cb] bg-white text-[#6d4c4a] hover:border-[#c79f8b] hover:text-[#5b3940]'
                    : isMenShoes
                      ? 'border border-[#ded0c2] bg-white text-[#4f4034] hover:border-[#f57a1d] hover:text-[#f57a1d]'
                    : isSpecConsole
                      ? 'border border-[#1f242c]/10 bg-white/84 text-[#1f242c] hover:border-[#ffd400] hover:text-[#1f242c]'
                    : isDecisionDeck
                      ? 'border border-[#d6dbe2] bg-white text-[#1f242c] hover:border-[#facc15] hover:text-[#1f242c]'
                    : isFragranceConsole
                      ? 'border border-[#eadfd7] bg-white text-[#6d4c4a] hover:border-[#c79f8b] hover:text-[#5b3940]'
                    : isSoftFashionDiscovery
                      ? 'border border-[#ead8cf] bg-white text-[#5b4950] hover:border-[#d86b55] hover:text-[#d86b55]'
                    : 'border border-border bg-card text-foreground hover:border-primary/25 hover:text-primary'
              }`}
            >
              {allCategoriesLabel}
            </button>

            {visibleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={`rounded-[var(--button-radius)] px-3 py-2 text-sm font-semibold transition-colors ${
                  selectedCategory === category.id
                    ? isBiteRush
                      ? 'bg-[#dc2626] text-white'
                      : isElessiFilterDeck || isElessiCategoryRibbon
                        ? 'bg-[linear-gradient(135deg,#8f5c44_0%,#6b4a3c_100%)] text-white shadow-[0_18px_40px_-24px_rgba(143,92,68,0.52)]'
                      : isElessiSpecToolbar
                        ? 'bg-[#2d241f] text-[#f6dec3] shadow-[0_18px_40px_-24px_rgba(45,36,31,0.62)]'
                      : isElessiGiftToolbar
                        ? 'bg-[linear-gradient(135deg,#5b3940_0%,#8b623e_100%)] text-white shadow-[0_18px_40px_-24px_rgba(91,57,64,0.42)]'
                      : isMenShoes
                        ? 'bg-[linear-gradient(135deg,#f57a1d_0%,#d65700_100%)] text-white'
                        : isSpecConsole
                          ? 'bg-[#ffd400] text-[#1f242c] shadow-[0_18px_40px_-24px_rgba(255,212,0,0.68)]'
                        : isDecisionDeck
                          ? 'bg-[#1f242c] text-[#fff4d1] shadow-[0_18px_40px_-24px_rgba(31,36,44,0.72)]'
                        : isFragranceConsole
                          ? 'bg-[linear-gradient(135deg,#5b3940_0%,#8b623e_100%)] text-white shadow-[0_18px_40px_-24px_rgba(91,57,64,0.42)]'
                        : isSoftFashionDiscovery
                          ? 'bg-[linear-gradient(135deg,#d86b55_0%,#8f4d41_100%)] text-white'
                      : 'bg-primary text-primary-foreground'
                    : isBiteRush
                      ? 'border border-[#171717]/10 bg-white text-[#171717] hover:border-[#ff6b2c] hover:text-[#dc2626]'
                      : isElessiFilterDeck || isElessiCategoryRibbon
                        ? 'border border-[#ead8cb] bg-white text-[#6b4a3c] hover:border-[#c79f8b] hover:text-[#8f5c44]'
                      : isElessiSpecToolbar
                        ? 'border border-[#d8cdbd] bg-white/92 text-[#2d241f] hover:border-[#cda56d] hover:text-[#2d241f]'
                      : isElessiGiftToolbar
                        ? 'border border-[#ead8cb] bg-white text-[#6d4c4a] hover:border-[#c79f8b] hover:text-[#5b3940]'
                      : isMenShoes
                        ? 'border border-[#ded0c2] bg-white text-[#4f4034] hover:border-[#f57a1d] hover:text-[#f57a1d]'
                        : isSpecConsole
                          ? 'border border-[#1f242c]/10 bg-white/84 text-[#1f242c] hover:border-[#ffd400] hover:text-[#1f242c]'
                        : isDecisionDeck
                          ? 'border border-[#d6dbe2] bg-white text-[#1f242c] hover:border-[#facc15] hover:text-[#1f242c]'
                        : isFragranceConsole
                          ? 'border border-[#eadfd7] bg-white text-[#6d4c4a] hover:border-[#c79f8b] hover:text-[#5b3940]'
                        : isSoftFashionDiscovery
                          ? 'border border-[#ead8cf] bg-white text-[#5b4950] hover:border-[#d86b55] hover:text-[#d86b55]'
                      : 'border border-border bg-card text-foreground hover:border-primary/25 hover:text-primary'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};
