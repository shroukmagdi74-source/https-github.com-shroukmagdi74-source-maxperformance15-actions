import React from "react";
import {
  Calendar,
  User,
  Home,
  ShoppingCart,
  FileText,
  Truck,
  Percent,
  Tag,
  Coins,
  MapPin,
} from "lucide-react";
import { formatCurrency } from "../../../utils/currency";
import { formatShortDate } from "../../../utils/dateFormat";
import { ProcurementTemplateProps } from "./types";

export const CommercialFactoryTemplate: React.FC<ProcurementTemplateProps> = ({
  data,
  isRtl = true,
}) => {
  const isInvoice = data.documentType === "PI";
  const docTitle = isInvoice ? "فاتورة شراء مورد" : "أمر شراء مورد";
  const locale = isRtl ? "ar" : "en";

  const totalAmount = Number(data.financialSummary?.totalAmount || 0);
  const discountAmount = Number(data.financialSummary?.discountAmount || 0);
  const taxAmount = Number(data.financialSummary?.taxAmount || 0);
  const shippingCost = Number(data.financialSummary?.shippingCost || 0);

  return (
    <div
      className="printable-commercial-sheet relative text-slate-900 bg-white p-6 sm:p-8 min-w-[700px] w-full max-w-[210mm] mx-auto overflow-hidden font-sans"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Decorative Brand Accent (Top Corner Angles) */}
      <div className="absolute top-0 end-0 w-36 h-8 pointer-events-none overflow-hidden print:block">
        <div className="absolute -top-6 -end-6 w-24 h-24 bg-red-600 rotate-45 transform origin-bottom-left" />
        <div className="absolute -top-8 -end-12 w-24 h-24 bg-slate-800 rotate-45 transform origin-bottom-left opacity-80" />
      </div>

      {/* Top Header: Company Legal Name & Logo */}
      <div className="flex justify-between items-start pb-5 mb-5 border-b border-slate-200">
        {/* Right (in RTL): Company Name & Address */}
        <div className="space-y-1.5 text-start pt-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {data.buyer?.name || data.companyName}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <MapPin className="size-3.5 text-red-600 shrink-0" />
            <span>{data.buyer?.address || "شارع الصفا و المروة، جسر السويس، القاهرة، مصر"}</span>
          </div>
          {data.buyer?.phone && (
            <div className="text-[11px] text-slate-500 font-mono">
              هاتف: <span className="font-semibold">{data.buyer.phone}</span>
              {data.buyer?.taxNumber && (
                <span className="ms-3">
                  الرقم الضريبي: <span className="font-semibold">{data.buyer.taxNumber}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Left (in RTL): Brand Logo Box */}
        <div className="flex flex-col items-center justify-center text-center ps-4">
          {data.buyer?.logoUrl ? (
            <img
              src={data.buyer.logoUrl}
              alt="Company Logo"
              className="h-14 max-w-[160px] object-contain mb-1"
            />
          ) : (
            <div className="flex flex-col items-center">
              {/* Stylized Huinzo Red Eagle Crest */}
              <div className="relative mb-1">
                <svg
                  className="w-12 h-10 text-red-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="text-sm font-black tracking-widest text-slate-900 uppercase">
                H U I N Z O
              </div>
              <div className="text-[9px] font-bold text-slate-600 tracking-tight">
                {data.companyName || "مصنع هونزو للملابس الرياضية"}
              </div>
            </div>
          )}
          <div className="text-[8px] font-bold tracking-wider text-slate-400 mt-1 uppercase">
            QUALITY &bull; PRECISION &bull; PERFORMANCE
          </div>
        </div>
      </div>

      {/* Document Bar: Order Number Card + Red Pill Banner */}
      <div className="flex items-center justify-between gap-3 mb-5">
        {/* Left: Document ID Card */}
        <div className="flex items-center gap-2.5 border border-slate-200 bg-slate-50/80 rounded-lg px-3.5 py-2 shadow-2xs">
          <div className="size-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
            <ShoppingCart className="size-4 text-slate-700" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium">
              {isInvoice ? "رقم فاتورة الشراء" : "رقم أمر الشراء"}
            </div>
            <div className="text-sm font-black text-slate-900 font-mono tracking-tight">
              {data.documentNumber}
            </div>
          </div>
        </div>

        {/* Right: Red Order Banner */}
        <div className="bg-red-600 text-white rounded-lg px-4 py-2 text-end shadow-xs min-w-[220px]">
          <div className="flex items-center justify-end gap-1.5 font-bold text-sm">
            <FileText className="size-4" />
            <span>{docTitle}</span>
          </div>
          <div className="text-[10px] text-red-100 font-normal">
            تم إنشاء هذه الفاتورة تلقائياً من نظام إدارة المخزون
          </div>
        </div>
      </div>

      {/* 2-Column Side-by-Side Data Cards */}
      <div className="grid grid-cols-2 gap-4 mb-5 text-xs">
        {/* Right Card (in RTL): Document Metadata */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2 flex items-center justify-between font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-red-600" />
              <span>{isInvoice ? "بيانات الفاتورة" : "بيانات أمر الشراء"}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">DOC DETAILS</span>
          </div>
          <div className="p-3 space-y-1.5">
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">
                {isInvoice ? "تاريخ الفاتورة:" : "تاريخ أمر الشراء:"}
              </span>
              <span className="font-mono font-semibold text-slate-900">
                {formatShortDate(data.documentDate, locale)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">تاريخ الاستلام المتوقع:</span>
              <span className="font-mono font-semibold text-slate-900">
                {data.expectedDelivery
                  ? formatShortDate(data.expectedDelivery, locale)
                  : data.dueDate
                  ? formatShortDate(data.dueDate, locale)
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">شروط الدفع:</span>
              <span className="font-medium text-slate-900">
                {data.paymentTerms || "سداد آجل معتمد"}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-slate-100">
              <span className="text-slate-500 flex items-center gap-1">
                <Home className="size-3 text-slate-400" />
                المخزن:
              </span>
              <span className="font-bold text-slate-900">
                {data.warehouseName || "المخزن الرئيسي"}
              </span>
            </div>
          </div>
        </div>

        {/* Left Card (in RTL): Supplier Information */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2 flex items-center justify-between font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5 text-red-600" />
              <span>بيانات المورد</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">SUPPLIER INFO</span>
          </div>
          <div className="p-3 space-y-1.5">
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">اسم المورد:</span>
              <span className="font-bold text-slate-900">{data.supplier.name}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">رقم المورد:</span>
              <span className="font-mono font-semibold text-slate-900">
                {data.supplier.code || data.supplier.id.slice(0, 8)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="text-slate-500">رقم الهاتف:</span>
              <span className="font-mono font-semibold text-slate-900">
                {data.supplier.phone || "—"}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-slate-100">
              <span className="text-slate-500">العنوان:</span>
              <span className="text-slate-700 truncate max-w-[200px]">
                {data.supplier.address || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Products & Items Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 shadow-2xs">
        <table className="w-full text-xs text-start border-collapse">
          <thead>
            <tr className="bg-[#1E293B] text-white">
              <th className="py-2.5 px-3 text-center w-10 font-bold">م</th>
              <th className="py-2.5 px-3 text-start font-bold">الصنف</th>
              <th className="py-2.5 px-3 text-center w-20 font-bold">الكمية</th>
              <th className="py-2.5 px-3 text-center w-28 font-bold">تعبئة الوحدة</th>
              <th className="py-2.5 px-3 text-end w-28 font-bold">سعر الوحدة</th>
              <th className="py-2.5 px-3 text-end w-32 font-bold">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {data.items.map((item, idx) => {
              const packaging =
                item.packagingUnit ||
                (idx === 0
                  ? "كرتونة"
                  : idx === 1
                  ? "كيس"
                  : idx === 2
                  ? "باكت"
                  : "علبة");

              return (
                <tr key={item.id || idx} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    {item.sku && (
                      <div className="text-[10px] text-slate-500 font-mono">كود: {item.sku}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-900 text-sm">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200/60">
                      {packaging}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-end font-mono font-medium text-slate-700">
                    {formatCurrency(Number(item.unitPrice || 0))}
                  </td>
                  <td className="py-2.5 px-3 text-end font-mono font-bold text-slate-900 text-sm">
                    {formatCurrency(Number(item.totalPrice || 0))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Horizontal Financial Summary Bar */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
        {/* Discount Card */}
        <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
            <span className="flex items-center gap-1">
              <Tag className="size-3 text-slate-400" />
              الخصم
            </span>
          </div>
          <div className="font-mono font-bold text-slate-900 text-sm">
            {formatCurrency(discountAmount)}
          </div>
        </div>

        {/* Taxes Card */}
        <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
            <span className="flex items-center gap-1">
              <Percent className="size-3 text-slate-400" />
              الضرائب
            </span>
            <span className="text-[10px] text-slate-400">14%</span>
          </div>
          <div className="font-mono font-bold text-slate-900 text-sm">
            {formatCurrency(taxAmount)}
          </div>
        </div>

        {/* Shipping Card */}
        <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
            <span className="flex items-center gap-1">
              <Truck className="size-3 text-slate-400" />
              الشحن
            </span>
          </div>
          <div className="font-mono font-bold text-slate-900 text-sm">
            {formatCurrency(shippingCost)}
          </div>
        </div>

        {/* Grand Total Card (Highlighted Dark) */}
        <div className="bg-[#1E293B] text-white rounded-lg p-2.5 flex items-center justify-between shadow-xs">
          <div className="size-8 rounded-md bg-white/10 flex items-center justify-center text-amber-400">
            <Coins className="size-4" />
          </div>
          <div className="text-end">
            <div className="text-[10px] text-slate-300 font-medium">
              {isInvoice ? "إجمالي الفاتورة" : "إجمالي أمر الشراء"}
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-white tracking-tight">
              {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Notes Box */}
      <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 mb-5 text-xs text-start">
        <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
          <FileText className="size-3.5 text-slate-500" />
          <span>ملاحظات:</span>
        </div>
        <p className="text-slate-600 text-[11px] leading-relaxed">
          {data.notes ||
            "يرجى التأكد من مطابقة الكميات والمواصفات القياسية المعتمدة قبل التوقيع والاستلام."}
        </p>
      </div>

      {/* Dual Signature Section */}
      <div className="grid grid-cols-2 gap-8 pt-4 pb-4 border-t border-slate-200 text-xs">
        {/* Responsible Manager Signature */}
        <div className="text-center space-y-1">
          <div className="font-bold text-slate-900">
            {data.signatures?.purchasingTitle || "توقيع المسؤول"}
          </div>
          <div className="text-[11px] text-slate-500">(المدير المسؤول)</div>
          <div className="border-b-2 border-dotted border-slate-300 w-44 mx-auto pt-8" />
        </div>

        {/* Supplier / Warehouse Signature */}
        <div className="text-center space-y-1">
          <div className="font-bold text-slate-900">
            {data.signatures?.warehouseTitle || "توقيع المورد"}
          </div>
          <div className="text-[11px] text-slate-500">(الاسم والتوقيع)</div>
          <div className="border-b-2 border-dotted border-slate-300 w-44 mx-auto pt-8" />
        </div>
      </div>

      {/* Bottom Brand Slogan & Accents */}
      <div className="relative pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] font-bold tracking-widest text-slate-400 uppercase">
        <span>QUALITY</span>
        <span className="text-red-600">&bull;</span>
        <span>PRECISION</span>
        <span className="text-red-600">&bull;</span>
        <span>PERFORMANCE</span>
      </div>

      {/* Bottom Decorative Angles */}
      <div className="absolute bottom-0 start-0 w-32 h-4 pointer-events-none overflow-hidden print:block">
        <div className="absolute -bottom-4 -start-4 w-16 h-16 bg-red-600 rotate-45 transform" />
        <div className="absolute -bottom-6 -start-8 w-16 h-16 bg-slate-800 rotate-45 transform opacity-80" />
      </div>
    </div>
  );
};
