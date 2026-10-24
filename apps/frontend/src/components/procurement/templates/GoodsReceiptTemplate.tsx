import React from "react";
import { formatShortDate } from "../../../utils/dateFormat";
import { ProcurementTemplateProps } from "./types";

export const GoodsReceiptTemplate: React.FC<ProcurementTemplateProps> = ({
  data,
  isRtl = true,
}) => {
  const locale = isRtl ? "ar" : "en";
  const linkedRefText = data.linkedReference
    ? `${data.linkedReference.type === "PO" ? "أمر شراء" : "فاتورة"} رقم ${data.linkedReference.number}`
    : data.documentNumber;

  return (
    <div className="printable-commercial-sheet text-slate-900 bg-white" dir={isRtl ? "rtl" : "ltr"}>
      {/* Industrial Warehouse Header */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1 text-start">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {data.companyName}
            </h1>
            <p className="text-xs font-bold text-slate-700">
              إدارة المستودعات وسلسلة الإمداد — إذن استلام وفحص مخزني
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              WAREHOUSE RECEIPT & QUALITY INSPECTION NOTE
            </div>
          </div>

          <div className="text-end">
            <div className="border-2 border-slate-900 rounded px-3 py-1.5 bg-slate-50 min-w-[200px] text-start text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">رقم الإذن:</span>
                <span className="font-mono font-bold text-slate-900">{data.documentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">تاريخ الاستلام:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatShortDate(data.documentDate, locale)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">المستند المرجعي:</span>
                <span className="font-mono text-slate-900">{linkedRefText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logistics & Supplier Strip */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
        <div className="border border-slate-300 rounded p-2 bg-slate-50/50 text-start">
          <div className="font-bold text-slate-700 text-[10px] uppercase border-b border-slate-200 pb-0.5 mb-1">
            جهة التوريد (المورد)
          </div>
          <div className="font-bold text-slate-900">{data.supplier.name}</div>
          {data.supplier.phone && (
            <div className="text-slate-600 font-mono text-[11px] mt-0.5">{data.supplier.phone}</div>
          )}
        </div>

        <div className="border border-slate-300 rounded p-2 bg-slate-50/50 text-start">
          <div className="font-bold text-slate-700 text-[10px] uppercase border-b border-slate-200 pb-0.5 mb-1">
            المستودع المستلم
          </div>
          <div className="font-bold text-slate-900">المستودع الرئيسي — رصيف الاستلام 1</div>
          <div className="text-slate-600 text-[11px] mt-0.5">منطقة الفحص والتسليم الأولي</div>
        </div>

        <div className="border border-slate-300 rounded p-2 bg-slate-50/50 text-start">
          <div className="font-bold text-slate-700 text-[10px] uppercase border-b border-slate-200 pb-0.5 mb-1">
            حالة المطابقة الأولية
          </div>
          <div className="flex items-center gap-3 mt-1 font-semibold text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-800">
              <span className="size-3 border border-slate-800 rounded-sm inline-block"></span> مطابق
            </span>
            <span className="inline-flex items-center gap-1 text-amber-800">
              <span className="size-3 border border-slate-800 rounded-sm inline-block"></span> جزئي
            </span>
            <span className="inline-flex items-center gap-1 text-rose-800">
              <span className="size-3 border border-slate-800 rounded-sm inline-block"></span> تالف
            </span>
          </div>
        </div>
      </div>

      {/* Physical Quantities & QC Inspection Table */}
      <div className="mb-4">
        <table className="w-full text-xs border border-slate-400">
          <thead>
            <tr className="bg-slate-200 border-b-2 border-slate-400 text-slate-900 font-bold">
              <th className="py-1.5 px-2 text-center w-8 border-e border-slate-300">#</th>
              <th className="py-1.5 px-2 text-start border-e border-slate-300">بيان الصنف والمواصفات</th>
              <th className="py-1.5 px-2 text-center w-24 border-e border-slate-300">كود الصنف SKU</th>
              <th className="py-1.5 px-2 text-center w-20 border-e border-slate-300">الكمية المطلوبة</th>
              <th className="py-1.5 px-2 text-center w-20 border-e border-slate-300 bg-emerald-50 text-emerald-950">
                المستلم فعلياً
              </th>
              <th className="py-1.5 px-2 text-center w-20 border-e border-slate-300 bg-rose-50 text-rose-950">
                الفارق / التالف
              </th>
              <th className="py-1.5 px-2 text-center w-24 border-e border-slate-300">موقع التخزين (Bin)</th>
              <th className="py-1.5 px-2 text-center w-20">نتيجة الفحص</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => {
              const reqQty = Number(item.quantity) || 0;
              const recQty = item.receivedQuantity !== undefined ? Number(item.receivedQuantity) : reqQty;
              const diffQty = reqQty - recQty;

              return (
                <tr key={item.id} className="border-b border-slate-300 even:bg-slate-50">
                  <td className="py-2 px-2 text-center font-mono border-e border-slate-300">{idx + 1}</td>
                  <td className="py-2 px-2 border-e border-slate-300 text-start">
                    <div className="font-bold text-slate-900">{item.productName || "صنف بدون اسم"}</div>
                    {item.description && (
                      <div className="text-[10px] text-slate-500">{item.description}</div>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-[11px] text-slate-600 border-e border-slate-300">
                    {item.sku || "—"}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold border-e border-slate-300">
                    {reqQty}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-black text-emerald-900 bg-emerald-50/50 border-e border-slate-300">
                    {recQty}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-rose-800 bg-rose-50/50 border-e border-slate-300">
                    {diffQty > 0 ? diffQty : "0"}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-slate-600 border-e border-slate-300">
                    [ ______ ]
                  </td>
                  <td className="py-2 px-2 text-center text-[10px] font-bold text-slate-700">
                    {diffQty === 0 ? "سليم ومطابق" : diffQty > 0 ? "عجز جزئي" : "سليم"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Inspection Checklist & Storage Instructions */}
      <div className="grid grid-cols-2 gap-3 mb-4 no-break text-xs">
        <div className="border border-slate-300 rounded p-2.5 bg-slate-50/40 text-start space-y-1.5">
          <div className="font-bold text-slate-800 border-b border-slate-200 pb-1">
            قائمة التحقق والفحص الظاهري (QC Checklist):
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <label className="flex items-center gap-1.5">
              <span className="size-3 border border-slate-600 rounded-sm inline-block"></span>
              <span>سلامة التغليف الخارجي</span>
            </label>
            <label className="flex items-center gap-1.5">
              <span className="size-3 border border-slate-600 rounded-sm inline-block"></span>
              <span>مطابقة الباركود / الكتالوج</span>
            </label>
            <label className="flex items-center gap-1.5">
              <span className="size-3 border border-slate-600 rounded-sm inline-block"></span>
              <span>خلو الشحنة من الكسر والرطوبة</span>
            </label>
            <label className="flex items-center gap-1.5">
              <span className="size-3 border border-slate-600 rounded-sm inline-block"></span>
              <span>مطابقة تواريخ الصلاحية</span>
            </label>
          </div>
        </div>

        <div className="border border-slate-300 rounded p-2.5 bg-slate-50/40 text-start space-y-1">
          <div className="font-bold text-slate-800 border-b border-slate-200 pb-1">
            ملاحظات أمين المستودع والتوجيه:
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {data.notes || "تم الاستلام المبدئي للأصناف تحت شرط الفحص والمطابقة المخزنية الدقيقة."}
          </p>
        </div>
      </div>

      {/* Warehouse Signoff Strip */}
      <div className="border border-slate-400 rounded p-3 bg-slate-50/50 no-break">
        <div className="grid grid-cols-3 gap-6 text-center text-xs text-slate-800">
          <div>
            <p className="font-bold text-slate-900 mb-8">سائق / مندوب التسليم</p>
            <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-600">
              الاسم ورقم المركبة والتوقيع
            </div>
          </div>
          <div>
            <p className="font-bold text-slate-900 mb-8">أمين المستودع المستلم</p>
            <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-600">
              التوقيع وتاريخ التخزين
            </div>
          </div>
          <div>
            <p className="font-bold text-slate-900 mb-8">مسؤول الجودة والاعتماد</p>
            <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-600">
              الختم واعتماد إدخال المخزن
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2 border-t border-slate-300 text-center text-[10px] text-slate-500 flex justify-between font-mono">
        <span>MAXP INVENTORY & WAREHOUSE MANAGEMENT</span>
        <span>صفحة 1 من 1</span>
      </div>
    </div>
  );
};
