import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { useStorefrontTheme } from '../../engine/ThemeProvider';
import { isKhemetLuxeTheme } from '../../utils/navigationGuards';
import {
  CatalogSortValue,
  applyCatalogFilters,
  clearCatalogFilters,
  getCatalogSortOptions,
  getCatalogProductQuery,
  resolveSortValue,
} from '../../utils/catalogFilters';
import {
  ShopCommandBarProps,
  normalizeShopCommandBarVariant,
} from './types';

export const useShopCommandBarController = (
  section?: ShopCommandBarProps['section'],
  settings?: ShopCommandBarProps['settings'],
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { theme } = useStorefrontTheme();
  const controlId = React.useId();
  const prefersArabicCopy = theme?.direction === 'rtl';
  const { categories } = useCategories();
  const selectedSort = resolveSortValue(searchParams);
  const selectedCategory = searchParams.get('category') || 'all';
  const activeSearch = searchParams.get('search') || '';
  const [searchValue, setSearchValue] = useState(activeSearch);
  const searchInputId = `${controlId}-search`;
  const sortSelectId = `${controlId}-sort`;
  const variant = normalizeShopCommandBarVariant(section?.variant);
  const isBiteRush = theme.id === 'restaurant-demo';
  const isMenShoes = theme.id === 'men-shoes-eg';
  const isBoutiqueDiscovery = variant === 'boutique-discovery';
  const isFitFinder = variant === 'fit-finder';
  const isSoftSortBar = variant === 'soft-sort-bar';
  const isOccasionPlanner = variant === 'occasion-planner';
  const isSoftFashionDiscovery = isBoutiqueDiscovery || isFitFinder || isSoftSortBar;
  const isElessiBagToolbar = variant === 'elessi-bag-toolbar';
  const isElessiFilterDeck = variant === 'elessi-filter-deck';
  const isElessiCategoryRibbon = variant === 'elessi-category-ribbon';
  const isElessiSpecToolbar = variant === 'elessi-spec-toolbar';
  const isElessiGiftToolbar = variant === 'elessi-gift-toolbar';
  const isElessiOrganicToolbar = variant === 'elessi-organic-toolbar';
  const isElessiPlantToolbar = variant === 'elessi-plant-toolbar';
  const isElessiDigitalToolbar = variant === 'elessi-digital-toolbar';
  const isElessiBikeToolbar = variant === 'elessi-bike-toolbar';
  const isButcherCutConsole = variant === 'butcher-cut-console';
  const isGracefulBar = variant === 'graceful-bar';
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const chipLimit =
    typeof settings?.chipLimit === 'number' && settings.chipLimit > 0
      ? settings.chipLimit
      : variant === 'marketplace-dense'
      ? 8
      : variant === 'menu-quick-order'
      ? 5
      : isSoftFashionDiscovery
      ? 7
      : variant === 'fragrance-console'
      ? 7
      : isElessiBagToolbar || isElessiFilterDeck || isElessiCategoryRibbon || isElessiSpecToolbar || isElessiGiftToolbar || isElessiOrganicToolbar || isElessiPlantToolbar || isElessiDigitalToolbar || isElessiBikeToolbar
      ? 6
      : variant === 'spec-console'
      ? 7
      : isButcherCutConsole
      ? 8
      : variant === 'decision-deck'
      ? 8
      : isOccasionPlanner
      ? 7
      : 6;

  useEffect(() => {
    setSearchValue(activeSearch);
  }, [activeSearch]);

  const handleClearFilters = () => {
    setSearchValue('');
    setSearchParams((prev) => clearCatalogFilters(prev));
  };

  const catalogLimit = useMemo(() => {
    const isSale = location.pathname.endsWith('/sale');
    const sections = (isSale ? theme.pages?.sale?.sections : theme.pages?.shop?.sections) as
      | Array<{ type?: string; settings?: { limit?: number } }>
      | undefined;
    const gridSection = sections?.find((s) => s.type === 'product-grid');
    if (typeof gridSection?.settings?.limit === 'number' && gridSection.settings.limit > 0) {
      return gridSection.settings.limit;
    }
    return isKhemetLuxeTheme(theme.id) ? (isSale ? 12 : 16) : 12;
  }, [theme, location.pathname]);

  const productQuery = useMemo(
    () => ({
      limit: catalogLimit,
      ...getCatalogProductQuery(searchParams),
    }),
    [catalogLimit, searchParams],
  );
  const { pagination = { total: 0, page: 1, limit: 12, pages: 0 }, isLoading } = useProducts(productQuery);

  const visibleCategories = categories.slice(0, chipLimit);
  const title =
    settings?.title ||
    (isElessiBagToolbar
      ? 'تسوّق الحقائب حسب الاستخدام'
      : isElessiOrganicToolbar
      ? 'ابدأ من الخضار أو الفاكهة أو الصندوق المناسب'
      : isElessiDigitalToolbar
      ? 'واجهتك الأسرع للأجهزة والملحقات'
      : isElessiGiftToolbar
      ? 'مرشحات الهدية والاختيار'
      : isElessiBikeToolbar
        ? 'اختَر الدراجة أو القطعة بسرعة'
      : isButcherCutConsole
        ? 'كونسول التقطيع والوزن'
      : isOccasionPlanner
        ? 'ابدئي من نوع المناسبة'
      : isSoftSortBar
        ? 'ترتيب سريع وواضح'
        : isElessiSpecToolbar
          ? 'تصفح المواصفات والمسارات'
        : isElessiCategoryRibbon
        ? 'شريط الأقسام السريع'
        : isElessiPlantToolbar
          ? 'تصفح النباتات'
        : isBoutiqueDiscovery
          ? 'اكتشفي القطع بهدوء'
        : isElessiFilterDeck
          ? 'لوحة تصفح أقرب للقرار'
          : 'تحكم أسرع في التصفح');

  const subtitle =
    settings?.subtitle ||
    (isElessiBagToolbar
      ? 'ابدأ من حقيبة يومية أو سفر أو هدية، ثم بدّل اللون والحجم وكمّل الطلب من نفس الصفحة.'
      : isElessiOrganicToolbar
      ? 'ابحث باسم المنتج أو العبوة، ثم تنقّل بين الأقسام والنتائج داخل رف عضوي أخف وأوضح.'
      : isElessiDigitalToolbar
      ? 'ابحث بالموديل أو فئة الاستخدام، ثم بدّل بين الأقسام والنتائج داخل شريط سريع يقرّبك من المنتج المناسب بدون زحام.'
      : isElessiGiftToolbar
      ? 'ابحث عن المجموعة أو الهدية أو الحجم، ثم بدّل بين الأقسام بدون مغادرة الشبكة.'
      : isElessiBikeToolbar
        ? 'ابحث بالموديل أو الفئة أو القطعة، ثم راجع النتائج في شبكة بيضاء أخف تشبه متاجر الدراجات الجاهزة للبيع.'
      : isButcherCutConsole
        ? 'ابحث باسم القطعية، اضبط القسم، وخلي القرار مبني على الوزن والتجهيز بدل تصفح منتجات عام.'
      : isOccasionPlanner
        ? 'ابدئي من دعوة الخطوبة أو عشاء المساء أو الإطلالة المستعجلة، ثم ضيقي النتيجة حسب القسم والترتيب من نفس السطح.'
      : isSoftSortBar
        ? 'اختاري القسم أو رتّبي الرف مباشرة، ثم ادخلي على القطعة أو quick view بدون زحمة أدوات.'
        : isElessiSpecToolbar
          ? 'فلترة أسرع للمسارات التقنية والقطع المرتبطة بدل شبكة عامة متشابهة.'
        : isElessiCategoryRibbon
        ? 'الأقسام والفلاتر الأساسية في شريط واضح، سريع، ومباشر من أول نظرة.'
        : isElessiPlantToolbar
          ? 'ابحث باسم النبات أو الأصيص، بدّل بين الأقسام، واحتفظ بالشبكة مفتوحة حتى تصل للقطعة المناسبة بسرعة.'
        : isBoutiqueDiscovery
          ? 'ابدئي من اسم القطعة أو القسم المفتوح، ثم اتركي الرف أخف وأوضح من أول نظرة.'
          : isElessiFilterDeck
            ? 'ابحث بسرعة، فلتر حسب التصنيف، ثم غيّر الترتيب داخل لوحة خفيفة تقرّب المنتج المناسب.'
            : 'ابحث بسرعة، فلتر حسب التصنيف، ثم غيّر الترتيب بدون مغادرة الشبكة.');

  const searchPlaceholder = settings?.searchPlaceholder || 'ابحث داخل المنتجات';
  const allCategoriesLabel = settings?.allCategoriesLabel || 'كل المنتجات';
  const resultsLabel = settings?.resultsLabel || 'منتج متاح';
  const clearButtonText = settings?.clearButtonText || 'إزالة الفلاتر';
  const stickyLabel =
    settings?.stickyLabel ||
    (variant === 'marketplace-dense'
      ? 'أدوات السوق'
      : variant === 'minimal-toolbar'
        ? 'أدوات التصفح'
        : variant === 'menu-quick-order'
          ? 'اطلب بسرعة'
        : isBoutiqueDiscovery
          ? 'دليل البوتيك'
        : isFitFinder
          ? 'Fit Finder'
        : isOccasionPlanner
          ? 'مخطط المناسبة'
        : isSoftSortBar
          ? 'ترتيب سريع'
        : variant === 'fragrance-console'
            ? 'أدوات العطر'
          : isElessiBagToolbar
          ? 'دليل الحقائب'
          : isElessiOrganicToolbar
            ? prefersArabicCopy
              ? 'مسار التسوق'
              : 'Organic routing'
          : isElessiDigitalToolbar
            ? 'أدوات المتجر'
          : isElessiGiftToolbar
          ? prefersArabicCopy
            ? 'دليل الهدايا'
            : 'Gift routing'
          : isElessiBikeToolbar
            ? prefersArabicCopy
              ? 'فلترة أسرع'
              : 'Ride filters'
          : isButcherCutConsole
            ? 'Black cut console'
          : isElessiSpecToolbar
          ? prefersArabicCopy
            ? 'دليل المواصفات'
            : 'Spec routing'
        : isElessiCategoryRibbon
          ? prefersArabicCopy
            ? 'شريط الأقسام'
            : 'Category ribbon'
          : isElessiPlantToolbar
            ? prefersArabicCopy
              ? 'أدوات النباتات'
              : 'Plant toolbar'
          : isElessiFilterDeck
            ? prefersArabicCopy
              ? 'دليل التصفح'
              : 'Browse filters'
          : variant === 'spec-console'
            ? 'أدوات التصفح'
          : variant === 'decision-deck'
            ? prefersArabicCopy
              ? 'غرفة القرار'
              : 'Decision deck'
          : prefersArabicCopy
            ? 'أدوات التصفح'
            : 'Browse tools');

  const hideHeader = settings?.hideHeader === true;
  const hideDesktopCategoryChips = settings?.hideDesktopCategoryChips === true;
  const hideSearch = settings?.hideSearch === true;
  const simpleToolbar = settings?.simpleToolbar === true;
  const sortOptions = useMemo(
    () => getCatalogSortOptions(theme.direction),
    [theme.direction],
  );
  const isSpecConsole = variant === 'spec-console';
  const isDecisionDeck = variant === 'decision-deck';
  const isFragranceConsole = variant === 'fragrance-console';
  const selectedSortLabel =
    sortOptions.find((option) => option.value === selectedSort)?.label || '';
  const activeCategoryLabel =
    selectedCategory === 'all'
      ? allCategoriesLabel
      : categories.find((category) => category.id === selectedCategory)?.name ||
        allCategoriesLabel;
  const shouldShowMobileCategoryChips =
    (isMenShoes || isDecisionDeck || isElessiFilterDeck || isElessiCategoryRibbon || isFitFinder || isButcherCutConsole) &&
    !hideDesktopCategoryChips;

  const hasActiveControls =
    selectedCategory !== 'all' || Boolean(activeSearch) || selectedSort !== 'featured';
  const decisionModeLabel = activeSearch
    ? prefersArabicCopy
      ? 'بحث مباشر'
      : 'Live search'
    : hasActiveControls
      ? prefersArabicCopy
        ? 'فلترة مركزة'
        : 'Focused filtering'
      : prefersArabicCopy
        ? 'جاهز للاستكشاف'
        : 'Ready to explore';

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchParams(
      applyCatalogFilters(searchParams, {
        searchTerm: searchValue.trim() || null,
      }),
    );
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSearchParams(
      applyCatalogFilters(searchParams, {
        categoryId,
      }),
    );
  };

  const handleSortChange = (sortValue: CatalogSortValue) => {
    setSearchParams(
      applyCatalogFilters(searchParams, {
        sortValue,
      }),
    );
  };

  return {
    searchParams,
    setSearchParams,
    theme,
    prefersArabicCopy,
    categories,
    selectedSort,
    selectedCategory,
    activeSearch,
    searchValue,
    setSearchValue,
    searchInputId,
    sortSelectId,
    variant,
    isBiteRush,
    isMenShoes,
    isBoutiqueDiscovery,
    isFitFinder,
    isSoftSortBar,
    isOccasionPlanner,
    isSoftFashionDiscovery,
    isElessiBagToolbar,
    isElessiFilterDeck,
    isElessiCategoryRibbon,
    isElessiSpecToolbar,
    isElessiGiftToolbar,
    isElessiOrganicToolbar,
    isElessiPlantToolbar,
    isElessiDigitalToolbar,
    isElessiBikeToolbar,
    isButcherCutConsole,
    isGracefulBar,
    filterPanelOpen,
    setFilterPanelOpen,
    chipLimit,
    visibleCategories,
    title,
    subtitle,
    searchPlaceholder,
    allCategoriesLabel,
    resultsLabel,
    clearButtonText,
    stickyLabel,
    hideHeader,
    hideDesktopCategoryChips,
    hideSearch,
    simpleToolbar,
    sortOptions,
    isSpecConsole,
    isDecisionDeck,
    isFragranceConsole,
    selectedSortLabel,
    activeCategoryLabel,
    shouldShowMobileCategoryChips,
    hasActiveControls,
    decisionModeLabel,
    pagination,
    isLoading,
    handleClearFilters,
    handleSearchSubmit,
    handleCategorySelect,
    handleSortChange,
  };
};

export type ShopCommandBarController = ReturnType<typeof useShopCommandBarController>;
