import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Tag, ShoppingBag, Search, X, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { broadcastService } from "../../../../services/broadcastService";
import {
  CriteriaType,
  SMART_PRESETS,
  ORDER_STATUSES,
  RETURN_STATUSES,
  PAYMENT_STATUSES,
  RATINGS,
  STATUS_LABELS,
} from "./types";

interface ProductItem {
  id: string;
  name: string;
  sku?: string | null;
}

interface ProductCriteriaPickerProps {
  selectedProducts: ProductItem[];
  status?: string;
  days?: number | null;
  onUpdate: (data: {
    productIds: string[];
    products: ProductItem[];
    status: string;
    days: number | null;
  }) => void;
  showGuestWarning?: boolean;
}

const ProductCriteriaPicker: React.FC<ProductCriteriaPickerProps> = ({
  selectedProducts = [],
  status = "DELIVERED",
  days = null,
  onUpdate,
  showGuestWarning = false,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced product search (strictly local state, does not trigger form preview)
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await broadcastService.searchCustomerListProducts(query, 20);
        if (!cancelled && res?.data) {
          setResults(res.data);
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleToggleProduct = (product: ProductItem) => {
    const isSelected = selectedProducts.some((p) => p.id === product.id);
    let nextProducts: ProductItem[];
    if (isSelected) {
      nextProducts = selectedProducts.filter((p) => p.id !== product.id);
    } else {
      nextProducts = [
        ...selectedProducts,
        { id: product.id, name: product.name, sku: product.sku },
      ];
    }
    onUpdate({
      productIds: nextProducts.map((p) => p.id),
      products: nextProducts,
      status: status || "DELIVERED",
      days: days ?? null,
    });
  };

  const handleRemoveProduct = (productId: string) => {
    const nextProducts = selectedProducts.filter((p) => p.id !== productId);
    onUpdate({
      productIds: nextProducts.map((p) => p.id),
      products: nextProducts,
      status: status || "DELIVERED",
      days: days ?? null,
    });
  };

  const handleStatusChange = (newStatus: string) => {
    onUpdate({
      productIds: selectedProducts.map((p) => p.id),
      products: selectedProducts,
      status: newStatus,
      days: days ?? null,
    });
  };

  const handleDaysChange = (val: string) => {
    const trimmed = val.trim();
    const parsed = trimmed === "" ? null : parseInt(trimmed, 10);
    const validDays = Number.isInteger(parsed) && parsed! > 0 ? parsed : null;
    onUpdate({
      productIds: selectedProducts.map((p) => p.id),
      products: selectedProducts,
      status: status || "DELIVERED",
      days: validDays,
    });
  };

  return (
    <div className="space-y-3">
      {/* Search Input & Dropdown */}
      <div className="space-y-1.5" ref={containerRef}>
        <Label>اختيار المنتجات</Label>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-muted-foreground)]" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            placeholder="ابحث بالاسم أو الـ SKU..."
            className="h-10 pr-9 pl-9"
          />
          {loading && (
            <Loader2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-[color:var(--color-muted-foreground)]" />
          )}

          {dropdownOpen && (
            <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-card)] p-1 shadow-lg">
              {results.length === 0 ? (
                <div className="p-3 text-center text-xs text-[color:var(--color-muted-foreground)]">
                  {loading ? "جاري البحث..." : "لا توجد منتجات مطابقة"}
                </div>
              ) : (
                results.map((item) => {
                  const isSelected = selectedProducts.some((p) => p.id === item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleProduct(item)}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[color:var(--color-muted)]"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <div
                          className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                            isSelected
                              ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white"
                              : "border-[color:var(--shell-control-border)]"
                          }`}
                        >
                          {isSelected && <Check className="size-3" />}
                        </div>
                        <span className="truncate font-medium text-[color:var(--color-foreground)]">
                          {item.name}
                        </span>
                      </div>
                      {item.sku && (
                        <span className="shrink-0 font-mono text-xs text-[color:var(--color-muted-foreground)]">
                          ({item.sku})
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Selected products chips */}
        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {selectedProducts.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:color-mix(in_srgb,var(--color-primary)_25%,transparent)] bg-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-card))] px-2.5 py-1 text-xs font-medium text-[color:var(--color-primary)]"
              >
                <span>{p.name}</span>
                {p.sku && (
                  <span className="font-mono text-[10px] opacity-75">({p.sku})</span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(p.id)}
                  className="rounded-full p-0.5 hover:bg-[color:color-mix(in_srgb,var(--color-primary)_20%,transparent)]"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Status & Days Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>حالة الطلب</Label>
          <Select
            value={status || "DELIVERED"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s] || s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>خلال آخر (يوم)</Label>
            <span className="text-[11px] text-[color:var(--color-muted-foreground)]">
              (اتركه فارغاً = بدون حد زمني)
            </span>
          </div>
          <Input
            type="number"
            min={1}
            value={days != null && days > 0 ? days : ""}
            onChange={(e) => handleDaysChange(e.target.value)}
            placeholder="بدون حد زمني"
          />
        </div>
      </div>

      {showGuestWarning && (
        <p className="text-xs text-[color:var(--color-muted-foreground)]">
          أوردرات الضيوف (Guest Orders) مش داخلة في الشرط ده — مفيش ربط productId فيها.
        </p>
      )}
    </div>
  );
};

interface CustomerListCriteriaFieldsProps {
  formCriteriaType: CriteriaType;
  formCriteria: any;
  onCriteriaFieldChange: (key: string, value: any) => void;
  availableTags: string[] | undefined;
}

export const CustomerListCriteriaFields: React.FC<CustomerListCriteriaFieldsProps> = ({
  formCriteriaType,
  formCriteria,
  onCriteriaFieldChange,
  availableTags = [],
}) => {
  // Find product exclusion in exclusions array
  const productExclusion = Array.isArray(formCriteria.exclusions)
    ? formCriteria.exclusions.find((e: any) => e && e.type === "purchasedProduct")
    : null;

  const handleExclusionUpdate = (val: {
    productIds: string[];
    products: ProductItem[];
    status: string;
    days: number | null;
  }) => {
    if (val.productIds.length === 0) {
      onCriteriaFieldChange("exclusions", []);
    } else {
      onCriteriaFieldChange("exclusions", [
        {
          type: "purchasedProduct",
          productIds: val.productIds,
          products: val.products,
          status: val.status,
          days: val.days,
        },
      ]);
    }
  };

  const handleMainProductUpdate = (val: {
    productIds: string[];
    products: ProductItem[];
    status: string;
    days: number | null;
  }) => {
    onCriteriaFieldChange("productIds", val.productIds);
    onCriteriaFieldChange("products", val.products);
    onCriteriaFieldChange("status", val.status);
    onCriteriaFieldChange("days", val.days);
  };

  return (
    <>
      {formCriteria.type !== "preset" ? (
        <div className="rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-muted)]/30 p-4">
          {formCriteriaType === "purchasedProduct" && (
            <ProductCriteriaPicker
              selectedProducts={formCriteria.products || []}
              status={formCriteria.status || "DELIVERED"}
              days={formCriteria.days}
              onUpdate={handleMainProductUpdate}
              showGuestWarning
            />
          )}
          {formCriteriaType === "active" && (
            <div className="space-y-1.5">
              <Label>خلال آخر (ساعة)</Label>
              <Input
                type="number"
                min={1}
                value={formCriteria.hours ?? 24}
                onChange={(e) => onCriteriaFieldChange("hours", parseInt(e.target.value) || 1)}
              />
            </div>
          )}
          {formCriteriaType === "inactive" && (
            <div className="space-y-1.5">
              <Label>غير نشط منذ (يوم)</Label>
              <Input
                type="number"
                min={1}
                value={formCriteria.days ?? 7}
                onChange={(e) => onCriteriaFieldChange("days", parseInt(e.target.value) || 1)}
              />
            </div>
          )}
          {formCriteriaType === "tag" && (
            <div className="space-y-1.5">
              <Label>الوسم (Tag)</Label>
              {availableTags && availableTags.length > 0 ? (
                <Select
                  value={formCriteria.tag || ""}
                  onValueChange={(v) => onCriteriaFieldChange("tag", v ?? "")}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="اختر وسماً" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        <span className="flex items-center gap-1.5">
                          <Tag className="size-3.5 text-[color:var(--color-muted-foreground)]" />
                          {tag}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={formCriteria.tag || ""}
                  onChange={(e) => onCriteriaFieldChange("tag", e.target.value)}
                  placeholder="اسم الوسم"
                />
              )}
            </div>
          )}
          {(formCriteriaType === "orderStatus" ||
            formCriteriaType === "returnRequest" ||
            formCriteriaType === "paymentStatus") && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>
                  {formCriteriaType === "returnRequest"
                    ? "حالة المرتجع"
                    : formCriteriaType === "paymentStatus"
                    ? "حالة الدفع"
                    : "حالة الطلب"}
                </Label>
                <Select
                  value={formCriteria.status || ""}
                  onValueChange={(v) => onCriteriaFieldChange("status", v ?? "")}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formCriteriaType === "returnRequest"
                      ? RETURN_STATUSES
                      : formCriteriaType === "paymentStatus"
                      ? PAYMENT_STATUSES
                      : ORDER_STATUSES
                    ).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s] || s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>خلال آخر (يوم)</Label>
                <Input
                  type="number"
                  min={1}
                  value={formCriteria.days ?? 30}
                  onChange={(e) => onCriteriaFieldChange("days", parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          )}
          {formCriteriaType === "city" && (
            <div className="space-y-1.5">
              <Label>المدينة / المحافظة</Label>
              <Input
                value={formCriteria.city || ""}
                onChange={(e) => onCriteriaFieldChange("city", e.target.value)}
                placeholder="مثال: القاهرة"
              />
            </div>
          )}
          {formCriteriaType === "product" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>معرّف المنتج (Product ID)</Label>
                <Input
                  value={formCriteria.productId || ""}
                  onChange={(e) => onCriteriaFieldChange("productId", e.target.value)}
                  placeholder="معرّف المنتج"
                />
              </div>
              <div className="space-y-1.5">
                <Label>حالة الطلب</Label>
                <Select
                  value={formCriteria.orderStatus || formCriteria.status || "DELIVERED"}
                  onValueChange={(v) => {
                    onCriteriaFieldChange("orderStatus", v);
                    onCriteriaFieldChange("status", v);
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s] || s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {formCriteriaType === "customerRating" && (
            <div className="space-y-1.5">
              <Label>التقييم</Label>
              <Select
                value={formCriteria.rating || "EXCELLENT"}
                onValueChange={(v) => onCriteriaFieldChange("rating", v ?? "EXCELLENT")}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RATINGS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {STATUS_LABELS[r] || r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {(formCriteriaType === "latest" || formCriteriaType === "oldest") && (
            <div className="space-y-1.5">
              <Label>عدد العملاء</Label>
              <Input
                type="number"
                min={1}
                value={formCriteria.limit ?? 100}
                onChange={(e) => onCriteriaFieldChange("limit", parseInt(e.target.value) || 1)}
              />
            </div>
          )}
          {formCriteriaType === "minTotalSpent" && (
            <div className="space-y-1.5">
              <Label>إجمالي إنفاق ≥ (جنيه / وحدة العملة)</Label>
              <Input
                type="number"
                min={0}
                value={formCriteria.amount ?? 1000}
                onChange={(e) => onCriteriaFieldChange("amount", parseFloat(e.target.value) || 0)}
              />
            </div>
          )}
          {formCriteriaType === "minOrdersCount" && (
            <div className="space-y-1.5">
              <Label>عدد الطلبات ≥</Label>
              <Input
                type="number"
                min={1}
                value={formCriteria.count ?? 2}
                onChange={(e) => onCriteriaFieldChange("count", parseInt(e.target.value) || 1)}
              />
            </div>
          )}
          {formCriteriaType === "all" && (
            <p className="text-sm text-[color:var(--color-muted-foreground)]">
              ستشمل هذه القائمة جميع العملاء النشطين.
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-2xl border border-[color:color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--color-primary)_6%,var(--color-card))] px-4 py-3">
          {(() => {
            const preset = SMART_PRESETS.find((p) => p.value === formCriteria.preset);
            return (
              <>
                {preset ? (
                  <preset.icon className="size-4 text-[color:var(--color-primary)]" />
                ) : (
                  <Sparkles className="size-4 text-[color:var(--color-primary)]" />
                )}
                <span className="text-sm font-medium text-[color:var(--color-foreground)]">
                  {preset ? preset.label : "قالب جاهز"} —{" "}
                  {preset ? preset.hint : "سيتم تطبيق المعايير الذكية تلقائياً"}
                </span>
              </>
            );
          })()}
        </div>
      )}

      {/* Exclusion window: Contacted recently */}
      <div className="rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-muted)]/30 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label>استثناء المراسَلين حديثاً</Label>
            <p className="text-xs text-[color:var(--color-muted-foreground)]">
              استبعد العملاء الذين أرسلوا إليك أو أُرسل إليهم خلال آخر (يوم). يمنع إزعاج عملاء تواصلوا مؤخراً.
            </p>
          </div>
          <div className="w-32 shrink-0">
            <Select
              value={formCriteria.excludeContactedInDays ? String(formCriteria.excludeContactedInDays) : "0"}
              onValueChange={(v) =>
                onCriteriaFieldChange(
                  "excludeContactedInDays",
                  v === "0" ? undefined : parseInt(v || "0", 10),
                )
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="بدون استثناء" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">بدون استثناء</SelectItem>
                <SelectItem value="1">يوم واحد</SelectItem>
                <SelectItem value="3">3 أيام</SelectItem>
                <SelectItem value="7">7 أيام</SelectItem>
                <SelectItem value="14">14 يوم</SelectItem>
                <SelectItem value="30">30 يوم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Exclusion window: Product Purchase */}
      <div className="rounded-2xl border border-[color:var(--shell-control-border)] bg-[color:var(--color-muted)]/30 p-4 space-y-3">
        <div className="space-y-1">
          <Label className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-[color:var(--color-primary)]" />
            <span>استبعاد مشتري منتج</span>
          </Label>
          <p className="text-xs text-[color:var(--color-muted-foreground)]">
            استبعد من القائمة أي عميل اشترى منتجاً أو أكثر بحالة معينة وفترة زمنية اختيارية.
          </p>
        </div>

        <ProductCriteriaPicker
          selectedProducts={productExclusion?.products || []}
          status={productExclusion?.status || "DELIVERED"}
          days={productExclusion?.days}
          onUpdate={handleExclusionUpdate}
          showGuestWarning={false}
        />
      </div>
    </>
  );
};
