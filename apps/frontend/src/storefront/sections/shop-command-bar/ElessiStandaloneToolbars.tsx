import React from 'react';
import { CatalogSortValue } from '../../utils/catalogFilters';
import { ShopCommandBarController } from './useShopCommandBarController';

export const ElessiDigitalToolbar: React.FC<{ ctrl: ShopCommandBarController }> = ({ ctrl }) => {
  const {
    hideHeader,
    stickyLabel,
    title,
    subtitle,
    hideDesktopCategoryChips,
    selectedCategory,
    handleCategorySelect,
    allCategoriesLabel,
    visibleCategories,
    hideSearch,
    handleSearchSubmit,
    searchInputId,
    searchValue,
    setSearchValue,
    searchPlaceholder,
    prefersArabicCopy,
    isLoading,
    pagination,
    resultsLabel,
    sortSelectId,
    selectedSort,
    handleSortChange,
    sortOptions,
    hasActiveControls,
    handleClearFilters,
    clearButtonText,
    activeCategoryLabel,
    selectedSortLabel,
    decisionModeLabel,
    activeSearch,
  } = ctrl;

  return (
    <section className="mb-7 border-b border-[#e4e9f0] bg-white py-4">
      <div className="flex flex-col gap-5">
        {!hideHeader ? (
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit text-[11px] font-black uppercase tracking-[0.22em] text-[#7a8595]">
              {stickyLabel}
            </span>
            <div className="space-y-2">
              <h2 className="font-heading text-[1.9rem] font-black tracking-tight text-[#161c26] md:text-[2.2rem]">
                {title}
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-[#536172] md:text-base">
                {subtitle}
              </p>
            </div>
          </div>
        ) : null}

        {!hideDesktopCategoryChips ? (
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto border-b border-[#edf1f6] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => handleCategorySelect(null)}
              className={`inline-flex shrink-0 items-center border px-4 py-2 text-sm font-bold transition-colors ${
                selectedCategory === 'all'
                  ? 'border-[#161c26] bg-[#161c26] text-white'
                  : 'border-[#dce3ec] bg-white text-[#516170] hover:border-[#f59e0b] hover:text-[#161c26]'
              }`}
            >
              {allCategoriesLabel}
            </button>
            {visibleCategories.map((category, index) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={`inline-flex shrink-0 items-center gap-2 border px-4 py-2 text-sm font-bold transition-colors ${
                  selectedCategory === category.id
                    ? 'border-[#161c26] bg-[#161c26] text-white'
                    : 'border-[#dce3ec] bg-white text-[#516170] hover:border-[#f59e0b] hover:text-[#161c26]'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-75 font-mono">
                  {`0${index + 1}`}
                </span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 border-b border-[#edf1f6] pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {!hideSearch ? (
              <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2">
                <input
                  id={searchInputId}
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-11 flex-1 border border-[#dce3ec] bg-[#fbfcfe] px-4 text-sm text-[#161c26] outline-none transition focus:border-[#f59e0b]"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 shrink-0 items-center justify-center bg-[#161c26] px-5 text-sm font-bold text-white transition-colors hover:bg-[#0d1219]"
                >
                  {prefersArabicCopy ? 'بحث' : 'Search'}
                </button>
              </form>
            ) : null}

            <div className="flex items-center gap-2 text-sm text-[#607184]">
              <span className="font-bold text-[#161c26] tabular-nums font-mono">{isLoading ? '...' : pagination.total}</span>
              <span>{resultsLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor={sortSelectId} className="text-sm font-bold text-[#607184]">
              {prefersArabicCopy ? 'الترتيب' : 'Sort'}
            </label>
            <select
              id={sortSelectId}
              value={selectedSort}
              onChange={(event) => handleSortChange(event.target.value as CatalogSortValue)}
              className="h-11 border border-[#dce3ec] bg-white px-4 text-sm font-bold text-[#161c26] outline-none transition focus:border-[#f59e0b]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              {['2', '3', '4'].map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className={`inline-flex h-10 w-10 items-center justify-center border text-xs font-black font-mono ${
                    index === 1
                      ? 'border-[#161c26] bg-[#161c26] text-white'
                      : 'border-[#dce3ec] bg-white text-[#7a8595]'
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>

            {hasActiveControls ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex h-11 items-center justify-center border border-[#dce3ec] bg-white px-4 text-sm font-bold text-[#516170] transition-colors hover:border-[#f59e0b] hover:text-[#161c26]"
              >
                {clearButtonText}
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center border border-[#dce3ec] bg-[#fbfcfe] px-4 py-2 font-bold text-[#243042]">
            {activeCategoryLabel}
          </span>
          <span className="inline-flex items-center border border-[#e8edf5] bg-white px-4 py-2 font-bold text-[#607184]">
            {selectedSortLabel}
          </span>
          <span className="inline-flex items-center border border-[#eef2f7] bg-[#f7f9fc] px-4 py-2 font-bold text-[#7a8595]">
            {decisionModeLabel}
          </span>
          {activeSearch ? (
            <span className="inline-flex items-center border border-[#fae5bf] bg-[#fff8ea] px-4 py-2 font-bold text-[#b45309]">
              {`“${activeSearch}”`}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export const ElessiBikeToolbar: React.FC<{ ctrl: ShopCommandBarController }> = ({ ctrl }) => {
  const {
    hideHeader,
    stickyLabel,
    title,
    subtitle,
    hideSearch,
    handleSearchSubmit,
    searchInputId,
    searchValue,
    setSearchValue,
    searchPlaceholder,
    prefersArabicCopy,
    isLoading,
    pagination,
    resultsLabel,
    sortSelectId,
    selectedSort,
    handleSortChange,
    sortOptions,
    hasActiveControls,
    handleClearFilters,
    clearButtonText,
    hideDesktopCategoryChips,
    selectedCategory,
    handleCategorySelect,
    allCategoriesLabel,
    visibleCategories,
    activeSearch,
  } = ctrl;

  return (
    <section className="mb-7 border-b border-[#e3e7eb] bg-white py-4">
      <div className="flex flex-col gap-5">
        {!hideHeader ? (
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit text-[11px] font-black uppercase tracking-[0.22em] text-[#7d8894]">
              {stickyLabel}
            </span>
            <div className="space-y-2">
              <h2 className="font-heading text-[1.9rem] font-black tracking-tight text-[#1d2a33] md:text-[2.2rem]">
                {title}
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-[#60717f] md:text-base">
                {subtitle}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 border-y border-[#edf1f4] py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {!hideSearch ? (
              <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2">
                <input
                  id={searchInputId}
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-11 flex-1 border border-[#d9dee4] bg-white px-4 text-sm text-[#1d2a33] outline-none transition focus:border-[#d97706]"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 shrink-0 items-center justify-center bg-[#1d2a33] px-5 text-sm font-bold text-white transition-colors hover:bg-[#121d24]"
                >
                  {prefersArabicCopy ? 'بحث' : 'Search'}
                </button>
              </form>
            ) : null}

            <div className="flex items-center gap-2 text-sm text-[#60717f]">
              <span className="font-bold text-[#1d2a33] tabular-nums font-mono">
                {isLoading ? '...' : pagination.total}
              </span>
              <span>{resultsLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor={sortSelectId} className="text-sm font-bold text-[#60717f]">
              {prefersArabicCopy ? 'الترتيب' : 'Sort'}
            </label>
            <select
              id={sortSelectId}
              value={selectedSort}
              onChange={(event) => handleSortChange(event.target.value as CatalogSortValue)}
              className="h-11 border border-[#d9dee4] bg-white px-4 text-sm font-bold text-[#1d2a33] outline-none transition focus:border-[#d97706]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              {['2', '3', '4'].map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className={`inline-flex h-10 w-10 items-center justify-center border text-xs font-black font-mono ${
                    index === 2
                      ? 'border-[#1d2a33] bg-[#1d2a33] text-white'
                      : 'border-[#d9dee4] bg-white text-[#677684]'
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>

            {hasActiveControls ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex h-11 items-center justify-center border border-[#d9dee4] bg-white px-4 text-sm font-bold text-[#516170] transition-colors hover:border-[#bfc9d2] hover:text-[#1d2a33]"
              >
                {clearButtonText}
              </button>
            ) : null}
          </div>
        </div>

        {!hideDesktopCategoryChips ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCategorySelect(null)}
              className={`inline-flex items-center border px-4 py-2 text-sm font-bold transition-colors ${
                selectedCategory === 'all'
                  ? 'border-[#1d2a33] bg-[#1d2a33] text-white'
                  : 'border-[#d9dee4] bg-white text-[#516170] hover:border-[#bfc9d2] hover:text-[#1d2a33]'
              }`}
            >
              {allCategoriesLabel}
            </button>
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={`inline-flex items-center border px-4 py-2 text-sm font-bold transition-colors ${
                  selectedCategory === category.id
                    ? 'border-[#1d2a33] bg-[#1d2a33] text-white'
                    : 'border-[#d9dee4] bg-white text-[#516170] hover:border-[#bfc9d2] hover:text-[#1d2a33]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        ) : null}

        {activeSearch ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center border border-[#fde7c2] bg-[#fff7eb] px-4 py-2 font-bold text-[#b45309]">
              {`“${activeSearch}”`}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export const ElessiOrganicToolbar: React.FC<{ ctrl: ShopCommandBarController }> = ({ ctrl }) => {
  const {
    hideHeader,
    stickyLabel,
    title,
    subtitle,
    selectedCategory,
    handleCategorySelect,
    allCategoriesLabel,
    visibleCategories,
    hideSearch,
    handleSearchSubmit,
    searchInputId,
    searchValue,
    setSearchValue,
    searchPlaceholder,
    prefersArabicCopy,
    isLoading,
    pagination,
    resultsLabel,
    sortSelectId,
    selectedSort,
    handleSortChange,
    sortOptions,
    hasActiveControls,
    handleClearFilters,
    clearButtonText,
    activeSearch,
  } = ctrl;

  return (
    <section className="mb-7 border-b border-[#eadfcd] bg-white py-4">
      <div className="flex flex-col gap-5">
        {!hideHeader ? (
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit text-[11px] font-black uppercase tracking-[0.22em] text-[#8a6546]">
              {stickyLabel}
            </span>
            <div className="space-y-2">
              <h2 className="font-heading text-[1.9rem] font-black tracking-tight text-[#2d3b27] md:text-[2.2rem]">
                {title}
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-[#67705e] md:text-base">
                {subtitle}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 overflow-x-auto border-b border-[#f1e8dc] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => handleCategorySelect(null)}
            className={`inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
              selectedCategory === 'all'
                ? 'border-[#2d3b27] bg-[#2d3b27] text-white'
                : 'border-[#eadfcd] bg-white text-[#6c5b49] hover:border-[#d39c4d] hover:text-[#8c5d1e]'
            }`}
          >
            {allCategoriesLabel}
          </button>
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategorySelect(category.id)}
              className={`inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                selectedCategory === category.id
                  ? 'border-[#2d3b27] bg-[#2d3b27] text-white'
                  : 'border-[#eadfcd] bg-white text-[#6c5b49] hover:border-[#d39c4d] hover:text-[#8c5d1e]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {!hideSearch ? (
              <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2">
                <input
                  id={searchInputId}
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-11 flex-1 rounded-full border border-[#e4d9cb] bg-[#fffdf9] px-5 text-sm text-[#2d3b27] outline-none transition focus:border-[#d39c4d]"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#2d3b27] px-5 text-sm font-bold text-white transition-colors hover:bg-[#202a1c]"
                >
                  {prefersArabicCopy ? 'بحث' : 'Search'}
                </button>
              </form>
            ) : null}

            <div className="flex items-center gap-2 text-sm text-[#7d6c58]">
              <span className="font-bold text-[#2d3b27] tabular-nums font-mono">
                {isLoading ? '...' : pagination.total}
              </span>
              <span>{resultsLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor={sortSelectId} className="text-sm font-bold text-[#6c5b49]">
              {prefersArabicCopy ? 'الترتيب' : 'Sort'}
            </label>
            <select
              id={sortSelectId}
              value={selectedSort}
              onChange={(event) => handleSortChange(event.target.value as CatalogSortValue)}
              className="h-11 rounded-full border border-[#e4d9cb] bg-white px-4 text-sm font-bold text-[#2d3b27] outline-none transition focus:border-[#d39c4d]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {hasActiveControls ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#eadfcd] bg-white px-4 text-sm font-bold text-[#6c5b49] transition-colors hover:border-[#d39c4d] hover:text-[#8c5d1e]"
              >
                {clearButtonText}
              </button>
            ) : null}
          </div>
        </div>

        {activeSearch ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center rounded-full border border-[#f5dfba] bg-[#fff8e9] px-4 py-2 font-bold text-[#a16207]">
              {`“${activeSearch}”`}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export const ElessiBagToolbar: React.FC<{ ctrl: ShopCommandBarController }> = ({ ctrl }) => {
  const {
    hideHeader,
    stickyLabel,
    title,
    subtitle,
    selectedCategory,
    handleCategorySelect,
    allCategoriesLabel,
    visibleCategories,
    hideSearch,
    handleSearchSubmit,
    searchInputId,
    searchValue,
    setSearchValue,
    searchPlaceholder,
    prefersArabicCopy,
    isLoading,
    pagination,
    resultsLabel,
    sortSelectId,
    selectedSort,
    handleSortChange,
    sortOptions,
    hasActiveControls,
    handleClearFilters,
    clearButtonText,
    activeCategoryLabel,
    activeSearch,
    selectedSortLabel,
    decisionModeLabel,
  } = ctrl;

  return (
    <section className="mb-7 border-b border-[#ece1d5] bg-white py-4">
      <div className="flex flex-col gap-5">
        {!hideHeader ? (
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit text-[11px] font-black uppercase tracking-[0.22em] text-[#9a7666]">
              {stickyLabel}
            </span>
            <div className="space-y-2">
              <h2 className="font-heading text-[1.9rem] font-black tracking-tight text-[#241815] md:text-[2.2rem]">
                {title}
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-[#705a50] md:text-base">
                {subtitle}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 overflow-x-auto border-b border-[#f2e8de] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => handleCategorySelect(null)}
            className={`inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
              selectedCategory === 'all'
                ? 'border-[#241815] bg-[#241815] text-white'
                : 'border-[#eadfd4] bg-white text-[#6f5a50] hover:border-[#c9ab95] hover:text-[#241815]'
            }`}
          >
            {allCategoriesLabel}
          </button>
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategorySelect(category.id)}
              className={`inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                selectedCategory === category.id
                  ? 'border-[#241815] bg-[#241815] text-white'
                  : 'border-[#eadfd4] bg-white text-[#6f5a50] hover:border-[#c9ab95] hover:text-[#241815]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {!hideSearch ? (
              <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2">
                <input
                  id={searchInputId}
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-11 flex-1 rounded-full border border-[#e4d8cd] bg-[#fffdfb] px-5 text-sm text-[#241815] outline-none transition focus:border-[#caa48f]"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-[#241815] bg-[#241815] px-5 text-sm font-bold text-white transition-colors hover:bg-[#3a2a25]"
                >
                  {prefersArabicCopy ? 'بحث' : 'Search'}
                </button>
              </form>
            ) : null}

            <div className="flex items-center gap-2 text-sm text-[#7f685d]">
              <span className="font-bold text-[#241815] tabular-nums font-mono">
                {isLoading ? '...' : pagination.total}
              </span>
              <span>{resultsLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor={sortSelectId} className="text-sm font-bold text-[#6f5a50]">
              {prefersArabicCopy ? 'الترتيب' : 'Sort'}
            </label>
            <select
              id={sortSelectId}
              value={selectedSort}
              onChange={(event) => handleSortChange(event.target.value as CatalogSortValue)}
              className="h-11 rounded-full border border-[#e4d8cd] bg-[#fffdfb] px-4 text-sm font-bold text-[#241815] outline-none transition focus:border-[#caa48f]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {hasActiveControls ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#eadfd4] bg-white px-4 text-sm font-bold text-[#6f5a50] transition-colors hover:border-[#c9ab95] hover:text-[#241815]"
              >
                {clearButtonText}
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center rounded-full bg-[#f7efe7] px-4 py-2 font-bold text-[#6f5a50]">
            {activeCategoryLabel}
          </span>
          {activeSearch ? (
            <span className="inline-flex items-center rounded-full bg-[#fff4ec] px-4 py-2 font-bold text-[#8f5d47]">
              {`“${activeSearch}”`}
            </span>
          ) : null}
          <span className="inline-flex items-center rounded-full bg-[#f5f0ea] px-4 py-2 font-bold text-[#7d665b]">
            {selectedSortLabel}
          </span>
          <span className="inline-flex items-center rounded-full bg-[#fcf8f4] px-4 py-2 font-bold text-[#9a7666]">
            {decisionModeLabel}
          </span>
        </div>
      </div>
    </section>
  );
};

export const ElessiPlantToolbar: React.FC<{ ctrl: ShopCommandBarController }> = ({ ctrl }) => {
  const {
    hideHeader,
    stickyLabel,
    title,
    subtitle,
    prefersArabicCopy,
    selectedCategory,
    handleCategorySelect,
    allCategoriesLabel,
    visibleCategories,
    handleSearchSubmit,
    searchInputId,
    searchValue,
    setSearchValue,
    searchPlaceholder,
    isLoading,
    pagination,
    resultsLabel,
    sortSelectId,
    selectedSort,
    handleSortChange,
    sortOptions,
    hasActiveControls,
    handleClearFilters,
    clearButtonText,
    hideDesktopCategoryChips,
  } = ctrl;

  return (
    <section className="mb-7 border-b border-[#e7efe4] bg-white py-4">
      <div className="flex flex-col gap-5">
        {!hideHeader ? (
          <div className="flex flex-col gap-3 lg:items-center">
            <span className="inline-flex w-fit self-end text-[11px] font-black uppercase tracking-[0.22em] text-[#99a392]">
              {stickyLabel}
            </span>
            <div className="space-y-2 text-center">
              <h2 className="font-heading text-[1.95rem] font-black tracking-tight text-[#203528]">
                {title}
              </h2>
              <p className="mx-auto max-w-3xl text-sm leading-7 text-[#56715e]">
                {subtitle}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-y border-[#e7efe4] py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-[#6d7568]">
              {prefersArabicCopy ? 'فلترة حسب:' : 'Filter by:'}
            </span>
            <select
              value={selectedCategory}
              onChange={(event) =>
                handleCategorySelect(event.target.value === 'all' ? null : event.target.value)
              }
              className="rounded-full border border-[#d8e6d8] bg-white px-4 py-2.5 text-sm font-bold text-[#203528] outline-none"
            >
              <option value="all">{allCategoriesLabel}</option>
              {visibleCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <input
                id={searchInputId}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={searchPlaceholder}
                className="min-w-[15rem] rounded-full border border-[#d8e6d8] bg-white px-4 py-2.5 text-sm text-[#203528] outline-none transition focus:border-[#7fa178]"
              />
              <button
                type="submit"
                className="rounded-full border border-[#d8e6d8] bg-white px-4 py-2.5 text-sm font-bold text-[#203528] transition-colors hover:border-[#7fa178]"
              >
                {prefersArabicCopy ? 'بحث' : 'Search'}
              </button>
            </form>
            <span className="text-sm font-bold text-[#8a9383] tabular-nums font-mono">
              {isLoading ? '...' : pagination.total} {resultsLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor={sortSelectId} className="text-sm font-bold text-[#6d7568]">
              {prefersArabicCopy ? 'الترتيب' : 'Sort by'}
            </label>
            <select
              id={sortSelectId}
              value={selectedSort}
              onChange={(event) => handleSortChange(event.target.value as CatalogSortValue)}
              className="rounded-full border border-[#d8e6d8] bg-white px-4 py-2.5 text-sm font-bold text-[#203528] outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              {['II', 'III', 'IIII'].map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-[0.4rem] border text-xs font-black font-mono ${
                    index === 2
                      ? 'border-[#203528] bg-[#203528] text-white'
                      : 'border-[#d8e6d8] bg-white text-[#798371]'
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>

            {hasActiveControls ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-full border border-[#d8e6d8] bg-white px-4 py-2.5 text-sm font-bold text-[#56715e]"
              >
                {clearButtonText}
              </button>
            ) : null}
          </div>
        </div>

        {!hideDesktopCategoryChips ? (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <button
              type="button"
              onClick={() => handleCategorySelect(null)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                selectedCategory === 'all'
                  ? 'border-[#203528] bg-[#203528] text-[#f4fbf5]'
                  : 'border-[#d8e6d8] bg-white text-[#43604b]'
              }`}
            >
              {allCategoriesLabel}
            </button>
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                  selectedCategory === category.id
                    ? 'border-[#203528] bg-[#203528] text-[#f4fbf5]'
                    : 'border-[#d8e6d8] bg-white text-[#43604b]'
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
