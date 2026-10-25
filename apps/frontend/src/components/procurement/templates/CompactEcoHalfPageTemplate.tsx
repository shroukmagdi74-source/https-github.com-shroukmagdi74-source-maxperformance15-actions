import React from "react";
import { formatCurrency } from "../../../utils/currency";
import { formatShortDate } from "../../../utils/dateFormat";
import { ProcurementTemplateProps } from "./types";
import { Leaf, CheckCircle2 } from "lucide-react";

export const CompactEcoHalfPageTemplate: React.FC<ProcurementTemplateProps> = ({
  data,
  isRtl = true,
}) => {
  const isInvoice = data.documentType === "PI";
  const docTitle = isInvoice ? "فاتورة توريد مختصرة" : "أمر شراء مختصر";
  const locale = isRtl ? "ar" : "en";

  const totalAmount = Number(data.financialSummary?.totalAmount || 0);
  const discountAmount = Number(data.financialSummary?.discountAmount || 0);
  const taxAmount = Number(data.financialSummary?.taxAmount || 0);
  const subtotal = Number(data.financialSummary?.subtotal || totalAmount);

  return (
    <div
      className="printable-commercial-sheet relative text-slate-900 bg-white p-3 sm:p-5 min-w-[650px] w-full max-w-[210mm] mx-auto overflow-hidden font-sans border border-slate-200 rounded-sm text-[11px] leading-tight print:p-2 print:border-none print:shadow-none"
      dir={isRtl ? "rtl" : "ltr"}
      style={{ minHeight: "135mm", maxHeight: "145mm" }}
    >
      {/* Eco Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-slate-800">
        {/* Company & Document Title */}
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 text-white font-black px-2 py-0.5 rounded text-[10px] tracking-wide flex items-center gap-1">
            <Leaf className="size-3" />
            <span>{docTitle}</span>
          </div>
          <span className="font-black text-sm text-slate-900 tracking-tight">
            {data.buyer?.name || data.companyName}
          </span>
          {data.buyer?.taxNumber && (
            <span className="text-[10px] text-slate-500 font-mono">
              ضريبي: {data.buyer.taxNumber}
            </span>
          )}
        </div>

        {/* Document Number & Date */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div>
            <span className="text-slate-500 font-sans">الرقم: </span>
            <span className="font-bold text-slate-900">{data.documentNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 font-sans">التاريخ: </span>
            <span className="font-semibold">{formatShortDate(data.documentDate, locale)}</span>
          </div>
          <div className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold print:border print:border-slate-300">
            {data.statusLabel}
          </div>
        </div>
      </div>

      {/* Compact 1-Row Metadata Strip */}
      <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 mb-2.5 text-[10px] print:border-slate-300">
        <div>
          <span className="text-slate-500">المورّد: </span>
          <span className="font-bold text-slate-900">{data.supplier.name}</span>
        </div>
        <div>
          <span className="text-slate-500">هاتف المورد: </span>
          <span className="font-mono">{data.supplier.phone || "—"}</span>
        </div>
        <div>
          <span className="text-slate-500">شروط الدفع: </span>
          <span className="font-semibold text-slate-800">
            {data.paymentTerms || "سداد نقدي / آجل"}
          </span>
        </div>
        <div>
          <span className="text-slate-500">المخزن: </span>
          <span className="font-semibold text-slate-800">
            {data.warehouseName || "المخزن الرئيسي"}
          </span>
        </div>
      </div>

      {/* Ultra-Dense Table */}
      <div className="border border-slate-300 rounded overflow-hidden mb-2 print:border-slate-400">
        <table className="w-full text-start border-collapse text-[10.5px]">
          <thead>
            <tr className="bg-slate-800 text-white font-bold print:border-b-2 print:border-slate-800">
              <th className="py-1 px-2 text-center w-8">#</th>
              <th className="py-1 px-2 text-start">الصنف والمواصفات</th>
              <th className="py-1 px-2 text-center w-16">الكمية</th>
              <th className="py-1 px-2 text-center w-16">الوحدة</th>
              <th className="py-1 px-2 text-end w-20">السعر</th>
              <th className="py-1 px-2 text-end w-24">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white print:divide-slate-300">
            {data.items.slice(0, 7).map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-slate-50">
                <td className="py-1 px-2 text-center text-slate-500 font-mono">{idx + 1}</td>
                <td className="py-1 px-2">
                  <span className="font-bold text-slate-900">{item.productName}</span>
                  {item.sku && (
                    <span className="text-[9px] text-slate-400 font-mono ms-1.5">[{item.sku}]</span>
                  )}
                </td>
                <td className="py-1 px-2 text-center font-bold text-slate-900">{item.quantity}</td>
                <td className="py-1 px-2 text-center text-slate-600">
                  {item.packagingUnit || (item as { unit?: string }).unit || "—"}
                </td>
                <td className="py-1 px-2 text-end font-mono">
                  {formatCurrency(Number(item.unitPrice || 0))}
                </td>
                <td className="py-1 px-2 text-end font-mono font-bold text-slate-900">
                  {formatCurrency(Number(item.totalPrice || 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mini Financial Row */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-2.5 py-1 mb-2 text-[10.5px] print:border-slate-300">
        <div className="text-slate-600">
          عدد الأصناف: <span className="font-bold font-mono">{data.items.length}</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <div>
            <span className="text-slate-500 font-sans">المجموع: </span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div>
              <span className="text-slate-500 font-sans">خصم: </span>
              <span className="font-semibold text-red-600">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div>
              <span className="text-slate-500 font-sans">ضريبة: </span>
              <span className="font-semibold">+{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="bg-slate-900 text-white px-2 py-0.5 rounded font-black text-xs">
            {formatCurrency(totalAmount)}
          </div>
        </div>
      </div>

      {/* Single-Line Signoff Strip */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px] text-slate-600 font-medium print:border-slate-300">
        <div className="flex items-center gap-2">
          <span>{data.signatures?.purchasingTitle || "اعتماد المشتريات / الإدارة"}:</span>
          <span className="text-slate-400">...................................</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{data.signatures?.warehouseTitle || "استلام المورد / المستودع"}:</span>
          <span className="text-slate-400">...................................</span>
        </div>
        <div className="text-[9px] text-emerald-700 font-bold flex items-center gap-1">
          <CheckCircle2 className="size-3" />
          <span>قالب موفر للطاقة والورق (A5)</span>
        </div>
      </div>
    </div>
  );
};
