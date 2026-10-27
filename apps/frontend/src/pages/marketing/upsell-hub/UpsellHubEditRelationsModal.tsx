import React from "react";
import {
  Link2,
  X,
  ArrowUp,
  ArrowDown,
  Search,
  Plus,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  CatalogProduct,
  ManagedRelationType,
  RelationBuckets,
  RELATION_TABS,
} from "./types";

interface UpsellHubEditRelationsModalProps {
  selectedProduct: CatalogProduct | null;
  activeTab: ManagedRelationType;
  editRelations: RelationBuckets;
  relationSearch: string;
  saving: boolean;
  candidatesToAdd: CatalogProduct[];
  catalogMap: Map<string, CatalogProduct>;
  setActiveTab: (tab: ManagedRelationType) => void;
  setRelationSearch: (query: string) => void;
  closeEditModal: () => void;
  handleAddRelation: (targetId: string) => void;
  handleRemoveRelation: (targetId: string) => void;
  handleMoveRelation: (targetId: string, direction: "up" | "down") => void;
  handleSaveRelations: () => Promise<void>;
}

export const UpsellHubEditRelationsModal: React.FC<
  UpsellHubEditRelationsModalProps
> = ({
  selectedProduct,
  activeTab,
  editRelations,
  relationSearch,
  saving,
  candidatesToAdd,
  catalogMap,
  setActiveTab,
  setRelationSearch,
  closeEditModal,
  handleAddRelation,
  handleRemoveRelation,
  handleMoveRelation,
  handleSaveRelations,
}) => {
  if (!selectedProduct) return null;

  const currentTabMeta = RELATION_TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-6">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-5 dark:border-gray-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                <Link2 className="h-4 w-4" />
              </span>
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                تخصيص عروض المنتج
              </h3>
            </div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {selectedProduct.name}{" "}
              {selectedProduct.price
                ? `(${selectedProduct.price.toLocaleString("en-US")} ج.م)`
                : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={closeEditModal}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-gray-100 px-4 dark:border-gray-800">
          {RELATION_TABS.map((tab) => {
            const count = editRelations[tab.id].length;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-black transition cursor-pointer ${
                  isActive
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                    isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {/* Active Tab Explanation Banner */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs leading-5 text-blue-900 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-200">
            <div className="flex items-center justify-between font-bold">
              <span>{currentTabMeta.subtitle}</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {currentTabMeta.placementBadge}
              </span>
            </div>
            <p className="mt-1 text-[11px] opacity-80">{currentTabMeta.helpText}</p>
          </div>

          {/* Attached Items List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
              <span>
                المنتجات المرتبطة حالياً (
                <span className="tabular-nums">
                  {editRelations[activeTab].length}
                </span>
                )
              </span>
              <span className="text-[11px] text-gray-400">
                يمكنك تغيير ترتيب الظهور بالأسهم
              </span>
            </div>

            {editRelations[activeTab].length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-xs text-gray-400 dark:border-gray-800">
                لم يتم ربط أي منتج في هذا القسم بعد. اختر من المنتجات المقترحة بالأسفل لإضافتها.
              </div>
            ) : (
              <div className="space-y-1.5">
                {editRelations[activeTab].map((id, index) => {
                  const item = catalogMap.get(id);
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/70 p-2.5 text-xs dark:border-gray-800 dark:bg-gray-800/60"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-black text-gray-700 dark:bg-gray-700 dark:text-gray-200 tabular-nums">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-black text-gray-900 dark:text-white">
                            {item?.name || `منتج #${id}`}
                          </p>
                          {item?.price !== null && item?.price !== undefined && (
                            <p className="text-[11px] text-gray-500 tabular-nums">
                              {item.price.toLocaleString("en-US")} ج.م
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveRelation(id, "up")}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200 cursor-pointer"
                          title="تحريك لأعلى"
                          aria-label="تحريك لأعلى"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === editRelations[activeTab].length - 1}
                          onClick={() => handleMoveRelation(id, "down")}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 dark:hover:text-gray-200 cursor-pointer"
                          title="تحريك لأسفل"
                          aria-label="تحريك لأسفل"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveRelation(id)}
                          className="mr-1 rounded-lg p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="إزالة"
                          aria-label="إزالة"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add New Relation Picker */}
          <div className="space-y-2 pt-3">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              إضافة منتجات جديدة للربط:
            </label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={relationSearch}
                onChange={(e) => setRelationSearch(e.target.value)}
                placeholder="ابحث عن منتج من الكتالوج لإضافته..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-gray-100 p-1 dark:border-gray-800">
              {candidatesToAdd.length === 0 ? (
                <p className="p-3 text-center text-xs text-gray-400">
                  لا توجد منتجات إضافية مطابقة
                </p>
              ) : (
                candidatesToAdd.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between rounded-lg p-2 transition hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {candidate.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        {candidate.price !== null && (
                          <span className="tabular-nums">
                            {candidate.price.toLocaleString("en-US")} ج.م
                          </span>
                        )}
                        {candidate.categoryName && (
                          <span>• {candidate.categoryName}</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddRelation(candidate.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      إضافة
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 p-4 dark:border-gray-800">
          <button
            type="button"
            onClick={closeEditModal}
            className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSaveRelations()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
