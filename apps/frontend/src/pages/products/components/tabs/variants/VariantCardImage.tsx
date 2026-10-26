import React from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { getImageUrl } from "../../../../../utils/imageUrl";
import { ProductVariant, VariantColorGroup } from "./types";

interface VariantCardImageProps {
  idx: number;
  variant: ProductVariant;
  updateVariant: (idx: number, field: keyof ProductVariant, value: any) => void;
  handleVariantImageChange: (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  group?: VariantColorGroup;
  copiedGroupToast: { idx: number; message: string } | null;
  setCopiedGroupToast: React.Dispatch<
    React.SetStateAction<{ idx: number; message: string } | null>
  >;
  applyImageToGroup: (group: VariantColorGroup, imageUrl: string) => void;
}

export const VariantCardImage: React.FC<VariantCardImageProps> = ({
  idx,
  variant,
  updateVariant,
  handleVariantImageChange,
  group,
  copiedGroupToast,
  setCopiedGroupToast,
  applyImageToGroup,
}) => {
  const availImg = group?.currentImage || group?.savedAttributeImage;
  const isCopied = copiedGroupToast?.idx === idx;

  return (
    <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
        <PhotoIcon className="h-4 w-4 ml-1" />
        صورة المتغير
      </h5>
      <div className="flex items-center gap-4">
        {variant.image ? (
          <div className="relative group">
            <img
              src={getImageUrl(variant.image) || variant.image}
              alt=""
              className="h-24 w-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={() => updateVariant(idx, "image", undefined)}
              className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 dark:hover:bg-red-700"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="h-24 w-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
            <PhotoIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              رفع صورة
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleVariantImageChange(idx, e)}
              className="hidden"
            />
          </label>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={variant.image || ""}
              onChange={(e) => updateVariant(idx, "image", e.target.value)}
              placeholder="أو أدخل رابط الصورة"
              className="flex-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <label className="px-3 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md text-sm cursor-pointer hover:bg-indigo-700 dark:hover:bg-indigo-800 flex items-center gap-1">
              <PhotoIcon className="h-4 w-4" />
              رفع
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleVariantImageChange(idx, e)}
                className="hidden"
              />
            </label>
          </div>

          {/* Quick batch action for this specific color */}
          {group && group.items.length > 1 && (
            <>
              {!variant.image && availImg && (
                <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    صورة لون "{group.name}" المتاحة:
                  </span>
                  <button
                    type="button"
                    onClick={() => updateVariant(idx, "image", availImg)}
                    className="inline-flex items-center gap-1 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800/60 rounded px-2 py-0.5 hover:bg-indigo-100"
                  >
                    استخدام لهذا المقاس
                  </button>
                  <button
                    type="button"
                    onClick={() => applyImageToGroup(group, availImg)}
                    className="inline-flex items-center gap-1 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded px-2.5 py-0.5 hover:bg-emerald-100 font-semibold"
                  >
                    ⚡ تطبيق على كل مقاسات "{group.name}" ({group.items.length})
                  </button>
                </div>
              )}

              {variant.image && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      applyImageToGroup(group, variant.image!);
                      setCopiedGroupToast({
                        idx,
                        message: `✓ تم تطبيق الصورة على جميع مقاسات "${group.name}" (${group.items.length})`,
                      });
                      setTimeout(() => setCopiedGroupToast(null), 3500);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 rounded-md px-2.5 py-1.5 transition-colors shadow-sm active:scale-[0.98]"
                    title={`نسخ هذه الصورة إلى جميع مقاسات ${group.name}`}
                  >
                    <PhotoIcon className="h-3.5 w-3.5" />
                    <span>
                      {isCopied
                        ? copiedGroupToast.message
                        : `تطبيق هذه الصورة على جميع مقاسات "${group.name}" (${group.items.length} مقاسات)`}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            صورة مختلفة لهذا المتغير (اختياري)
          </p>
        </div>
      </div>
    </div>
  );
};
