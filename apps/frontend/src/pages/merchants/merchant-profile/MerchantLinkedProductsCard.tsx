import React from "react";
import { MerchantProduct } from "./types";
import { formatPieces } from "./helpers";

interface MerchantLinkedProductsCardProps {
  isDark: boolean;
  products?: MerchantProduct[];
  fulfillmentModeLabel: string;
}

export const MerchantLinkedProductsCard: React.FC<
  MerchantLinkedProductsCardProps
> = ({ isDark, products, fulfillmentModeLabel }) => {
  const cardClass = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textMutedClass = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`rounded-lg border shadow-sm p-6 ${cardClass}`}>
      <h2
        className={`text-lg font-semibold mb-4 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        المنتجات المرتبطة
      </h2>
      {products && products.length > 0 ? (
        <div className="space-y-3">
          {products.slice(0, 8).map((merchantProduct) => (
            <div
              key={merchantProduct.id}
              className={`rounded-lg border px-4 py-3 ${
                isDark ? "border-gray-700 bg-gray-900/40" : "border-gray-100 bg-gray-50"
              }`}
            >
              <p
                className={`font-medium ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {merchantProduct.product?.name || "منتج غير معروف"}
              </p>
              <div className={`mt-2 space-y-1 text-sm ${textMutedClass}`}>
                <p>
                  سعر التاجر:{" "}
                  <span className="tabular-nums">
                    {merchantProduct.merchantPrice ?? "-"}
                  </span>
                </p>
                <p>
                  قابل للبيع:{" "}
                  <span className="tabular-nums">
                    {formatPieces(
                      merchantProduct.inventorySnapshot?.availableForSale ??
                        merchantProduct.stock,
                    )}
                  </span>{" "}
                  قطعة
                </p>
                <p>
                  فعلي/محجوز:{" "}
                  <span className="tabular-nums">
                    {formatPieces(
                      merchantProduct.inventorySnapshot?.physicalQuantity,
                    )}
                  </span>
                  {" / "}
                  <span className="tabular-nums">
                    {formatPieces(
                      merchantProduct.inventorySnapshot?.reservedQuantity,
                    )}
                  </span>
                </p>
                <p>
                  المكان:{" "}
                  {merchantProduct.inventorySnapshot?.stockLocationLabel ||
                    fulfillmentModeLabel}
                  {merchantProduct.inventorySnapshot?.warehouseNames?.length
                    ? ` - ${merchantProduct.inventorySnapshot.warehouseNames.join("، ")}`
                    : ""}
                </p>
                {merchantProduct.inventorySnapshot &&
                merchantProduct.inventorySnapshot.availableForSale !==
                  merchantProduct.inventorySnapshot.merchantProductStock ? (
                  <p>
                    رصيد الربط:{" "}
                    <span className="tabular-nums">
                      {formatPieces(
                        merchantProduct.inventorySnapshot.merchantProductStock,
                      )}
                    </span>
                  </p>
                ) : null}
                <p>
                  المزامنة: {merchantProduct.syncEnabled ? "مفعلة" : "متوقفة"}
                </p>
                <p>
                  آخر مزامنة:{" "}
                  <span className="tabular-nums">
                    {merchantProduct.lastSyncedAt
                      ? new Date(merchantProduct.lastSyncedAt).toLocaleString(
                          "ar-EG",
                        )
                      : "-"}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={textMutedClass}>لا توجد منتجات مرتبطة بهذا التاجر بعد.</p>
      )}
    </div>
  );
};
