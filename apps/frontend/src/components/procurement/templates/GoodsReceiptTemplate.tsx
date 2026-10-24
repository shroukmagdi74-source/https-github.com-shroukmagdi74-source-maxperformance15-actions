import React from "react";
import {
  PackageCheck,
  CheckSquare,
  Square,
  Warehouse,
  ClipboardCheck,
} from "lucide-react";
import { formatShortDate } from "../../../utils/dateFormat";
import { ProcurementTemplateProps } from "./types";

export const GoodsReceiptTemplate: React.FC<ProcurementTemplateProps> = ({
  data,
  isRtl = true,
}) => {
  const isInvoice = data.documentType === "PI";
  const locale = isRtl ? "ar" : "en";
  const linkedRefText = data.linkedReference
    ? `${data.linkedReference.type === "PO" ? "أمر شراء" : "فاتورة"} #${data.linkedReference.number}`
    : isInvoice
    ? "توريد مباشر بدون أمر"
    : "طلب بضاعة للمستودع";

  return (
    <div
      className="printable-commercial-sheet relative text-slate-900 bg-white p-6 sm:p-8 min-w-[700px] w-full max-w-[210mm] mx-auto overflow-hidden font-sans border border-slate-300 print:border-none print:shadow-none print:p-2"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Top Header: Warehouse Inspection Voucher */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b-2 border-slate-800">
        <div className="space-y-1 text-start">
          <div className="flex items-center gap-2">
            <span className="bg-amber-600 text-white px-2.5 py-0.5 rounded text-xs font-black tracking-wide flex items-center gap-1 print:bg-slate-100 print:text-slate-900 print:border print:border-slate-800">
              <PackageCheck className="size-3.5" />
              <span>إذن استلام وفحص بضاعة</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">GOODS RECEIPT (GRN)</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {data.buyer?.name || data.companyName}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            قسم إدارة المخازن والرقابة على الجودة والتسليم
          </p>
        </div>

        {/* Document Tracking Box */}
        <div className="text-end">
          <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/70 min-w-[200px] print:border-slate-400">
            <div className="text-[10px] text-slate-500 font-bold mb-1">بيانات إذن الاستلام</div>
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">رقم الإذن:</span>
                <span className="font-mono font-black text-slate-900">
                  GRN-{data.documentNumber.replace(/\D/g, "") || "2026"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">تاريخ الاستلام:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatShortDate(data.documentDate, locale)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200 print:border-slate-300">
                <span className="text-slate-600 font-medium">المستند المرجعي:</span>
                <span className="font-semibold text-slate-900">{linkedRefText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logistics & Supplier Strip */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
        <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/60 text-start print:border-slate-400">
          <div className="font-bold text-slate-700 text-[10px] uppercase border-b border-slate-200 pb-1 mb-1.5 flex items-center justify-between print:border-slate-300">
            <span>جهة التوريد (المورد)</span>
            <span className="text-slate-400 font-mono">SUPPLIER</span>
          </div>
          <div className="font-bold text-slate-900 text-sm">{data.supplier.name}</div>
          {data.supplier.phone && (
            <div className="text-slate-600 font-mono text-[11px] mt-1">
              الهاتف: <span className="font-semibold">{data.supplier.phone}</span>
            </div>
          )}
        </div>

        <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/60 text-start print:border-slate-400">
          <div className="font-bold text-slate-700 text-[10px] uppercase border-b border-slate-200 pb-1 mb-1.5 flex items-center justify-between print:border-slate-300">
            <span>المستودع المستلم</span>
            <span className="text-slate-400 font-mono">LOCATION</span>
          </div>
          <div className="font-bold text-slate-900 text-sm">
            {data.warehouseName || "المستودع الرئيسي"}
          </div>
          <div className="text-slate-600 text-[11px] mt-1">منطقة الفحص والتسليم المخزني</div>
        </div>

        <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/60 text-start print:border-slate-400">
          <div className="font-bold text-slate-700 text-[10px] uppercase border-b border-slate-200 pb-1 mb-1.5 flex items-center justify-between print:border-slate-300">
            <span>حالة المطابقة الأولية</span>
            <span className="text-slate-400 font-mono">STATUS</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 font-bold text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 print:border-slate-400 print:text-slate-900">
              <span className="size-2 bg-emerald-600 rounded-full inline-block" />
              مطابق
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 print:border-slate-400 print:text-slate-900">
              <span className="size-2 bg-amber-600 rounded-full inline-block" />
              جزئي
            </span>
            <span className="inline-flex items-center gap-1.5 text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 print:border-slate-400 print:text-slate-900">
              <span className="size-2 bg-rose-600 rounded-full inline-block" />
              تالف
            </span>
          </div>
        </div>
      </div>

      {/* Physical Quantities & QC Inspection Table */}
      <div className="border border-slate-300 rounded-lg overflow-hidden mb-4 print:border-slate-400">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white font-bold print:bg-slate-100 print:text-slate-900 print:border-b-2 print:border-slate-800">
              <th className="py-2 px-2 text-center w-8">#</th>
              <th className="py-2 px-3 text-start">بيان الصنف والمواصفات</th>
              <th className="py-2 px-2 text-center w-24">كود الصنف SKU</th>
              <th className="py-2 px-2 text-center w-20">الكمية المطلوبة</th>
              <th className="py-2 px-2 text-center w-20 bg-emerald-700 text-white print:bg-slate-100 print:text-slate-900">
                المستلم فعلياً
              </th>
              <th className="py-2 px-2 text-center w-20 bg-rose-700 text-white print:bg-slate-100 print:text-slate-900">
                الفارق / التالف
              </th>
              <th className="py-2 px-2 text-center w-24">موقع التخزين (Bin)</th>
              <th className="py-2 px-2 text-center w-20">نتيجة الفحص</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white print:divide-slate-300">
            {data.items.map((item, idx) => {
              const reqQty = Number(item.quantity) || 0;
              const recQty = item.receivedQuantity !== undefined ? Number(item.receivedQuantity) : reqQty;
              const diffQty = reqQty - recQty;

              return (
                <tr key={item.id || idx} className="hover:bg-slate-50/70">
                  <td className="py-2 px-2 text-center text-slate-500 font-mono">{idx + 1}</td>
                  <td className="py-2 px-3 text-start">
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    {item.description && (
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.description}</div>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-[11px] text-slate-600">
                    {item.sku || "—"}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-slate-900 tabular-nums">
                    {reqQty}
                  </td>
                  <td className="py-2 px-2 text-center font-black text-emerald-900 bg-emerald-50/60 tabular-nums text-sm print:bg-transparent">
                    {recQty}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-rose-800 bg-rose-50/60 tabular-nums print:bg-transparent">
                    {diffQty > 0 ? diffQty : "0"}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-600 font-mono">
                    <span className="border-b border-dashed border-slate-400 inline-block w-16 pb-0.5">
                      {(item as { binLocation?: string }).binLocation || "______"}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        diffQty === 0
                          ? "bg-emerald-100 text-emerald-900 print:bg-transparent"
                          : "bg-amber-100 text-amber-900 print:bg-transparent"
                      }`}
                    >
                      {diffQty === 0 ? "مطابق" : "عجز جزئي"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Inspection Checklist & Storage Instructions */}
      <div className="grid grid-cols-2 gap-3 mb-4 no-break text-xs">
        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50 text-start space-y-2 print:border-slate-400">
          <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 flex items-center justify-between print:border-slate-300">
            <span className="flex items-center gap-1.5">
              <ClipboardCheck className="size-3.5 text-amber-600 print:text-slate-800" />
              <span>قائمة التحقق والفحص الظاهري (QC Checklist)</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
            <div className="flex items-center gap-1.5 text-slate-700">
              <CheckSquare className="size-3.5 text-emerald-600 shrink-0 print:text-slate-800" />
              <span>سلامة التغليف الخارجي</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <CheckSquare className="size-3.5 text-emerald-600 shrink-0 print:text-slate-800" />
              <span>مطابقة الباركود / الكتالوج</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <CheckSquare className="size-3.5 text-emerald-600 shrink-0 print:text-slate-800" />
              <span>خلو الشحنة من الكسر والرطوبة</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Square className="size-3.5 text-slate-400 shrink-0" />
              <span>مطابقة تواريخ الصلاحية</span>
            </div>
          </div>
        </div>

        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50 text-start space-y-1.5 print:border-slate-400">
          <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 flex items-center gap-1.5 print:border-slate-300">
            <Warehouse className="size-3.5 text-slate-600" />
            <span>ملاحظات أمين المستودع والتوجيه:</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {data.notes ||
              "تم الاستلام المبدئي للأصناف الواردة تحت شرط الفحص والمطابقة المخزنية الدقيقة وجرد العبوات."}
          </p>
        </div>
      </div>

      {/* Warehouse Signoff Strip */}
      <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/60 no-break print:border-slate-400">
        <div className="grid grid-cols-3 gap-6 text-center text-xs text-slate-800">
          <div>
            <p className="font-bold text-slate-900 mb-6">سائق / مندوب التسليم</p>
            <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-600">
              الاسم ورقم المركبة والتوقيع
            </div>
          </div>
          <div>
            <p className="font-bold text-slate-900 mb-6">أمين المستودع المستلم</p>
            <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-600">
              التوقيع وتاريخ التخزين
            </div>
          </div>
          <div>
            <p className="font-bold text-slate-900 mb-6">مسؤول الجودة والاعتماد</p>
            <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-600">
              الختم واعتماد إدخال المخزن
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[10px] text-slate-500 flex justify-between font-mono print:border-slate-300">
        <span>{data.companyName || "مستند استلام وفحص بضاعة مخزني"}</span>
        <span>صفحة 1 من 1</span>
      </div>
    </div>
  );
};
