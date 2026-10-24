import React from "react";
import { formatCurrency } from "../../../utils/currency";
import { formatShortDate } from "../../../utils/dateFormat";
import { ProcurementTemplateProps } from "./types";

export const OfficialTaxTemplate: React.FC<ProcurementTemplateProps> = ({
  data,
  isRtl = true,
}) => {
  const isInvoice = data.documentType === "PI";
  const docTitleAr = isInvoice ? "فاتورة شراء وتوريد" : "أمر شراء وتوريد";
  const docTitleEn = isInvoice ? "TAX PURCHASE INVOICE" : "OFFICIAL PURCHASE ORDER";
  const locale = isRtl ? "ar" : "en";

  return (
    <div className="printable-commercial-sheet relative text-slate-900 bg-white p-6 sm:p-8 min-w-[700px] w-full max-w-[210mm] mx-auto font-sans" dir={isRtl ? "rtl" : "ltr"}>
      {/* Formal Commercial Header */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4">
        <div className="flex justify-between items-start">
          {/* Company / Buyer info */}
          <div className="space-y-1 text-start">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {data.buyer?.name || data.companyName}
            </h1>
            <p className="text-xs font-semibold text-slate-600">
              {isInvoice
                ? "فاتورة شراء وتوريد ضريبية معتمدة للشركات"
                : "أمر شراء تجاري معتمد - إدارة المشتريات والتوريدات"}
            </p>
            <div className="text-[11px] text-slate-500 space-y-0.5 pt-0.5">
              <p>
                تاريخ الطباعة:{" "}
                <span className="font-mono">
                  {formatShortDate(new Date().toISOString(), locale)}
                </span>
              </p>
            </div>
          </div>

          {/* Document Title & Reference Box */}
          <div className="text-end">
            <div className="inline-block text-end">
              <div className="text-lg font-black text-slate-900">{docTitleAr}</div>
              <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase font-mono">
                {docTitleEn}
              </div>
              <div className="mt-1.5 border border-slate-300 rounded px-2.5 py-1 bg-slate-50 text-xs space-y-0.5 min-w-[220px] text-start">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-600">رقم المستند:</span>
                  <span className="font-mono font-bold text-slate-900">{data.documentNumber}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-600">تاريخ الإصدار:</span>
                  <span className="font-mono tabular-nums">
                    {formatShortDate(data.documentDate, locale)}
                  </span>
                </div>
                {data.dueDate && (
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-600">تاريخ الاستحقاق:</span>
                    <span className="font-mono tabular-nums">
                      {formatShortDate(data.dueDate, locale)}
                    </span>
                  </div>
                )}
                {data.expectedDelivery && (
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-600">التسليم المتوقع:</span>
                    <span className="font-mono tabular-nums">
                      {formatShortDate(data.expectedDelivery, locale)}
                    </span>
                  </div>
                )}
                {data.linkedReference && (
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-600">
                      {data.linkedReference.type === "PO" ? "أمر الشراء المرتبط:" : "الفاتورة المرتبطة:"}
                    </span>
                    <span className="font-mono font-semibold text-slate-900">
                      {data.linkedReference.number}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <span className="text-slate-600">الحالة:</span>
                  <span className="font-semibold">{data.statusLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parties Information Strip (2-Column Box) */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        {/* Supplier Data */}
        <div className="border border-slate-300 rounded p-2.5 bg-slate-50/50 text-start">
          <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 flex justify-between">
            <span>بيانات المورّد (المُسلِّم):</span>
            <span className="text-[10px] text-slate-500 font-normal font-mono">SUPPLIER</span>
          </div>
          <div className="space-y-1">
            <div className="font-bold text-sm text-slate-900">{data.supplier.name}</div>
            {data.supplier.phone && (
              <div className="text-slate-700">
                الهاتف: <span className="font-mono font-semibold">{data.supplier.phone}</span>
              </div>
            )}
            {data.supplier.email && (
              <div className="text-slate-600">
                البريد: <span>{data.supplier.email}</span>
              </div>
            )}
            {data.supplier.taxNumber && (
              <div className="text-slate-600">
                الرقم الضريبي: <span className="font-mono">{data.supplier.taxNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Buyer & Billing Data */}
        <div className="border border-slate-300 rounded p-2.5 bg-slate-50/50 text-start">
          <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-1.5 flex justify-between">
            <span>بيانات المشتري (الفوترة والاستلام):</span>
            <span className="text-[10px] text-slate-500 font-normal font-mono">BUYER / BILL TO</span>
          </div>
          <div className="space-y-1">
            <div className="font-bold text-sm text-slate-900">{data.buyer?.name || data.companyName}</div>
            {data.buyer?.taxNumber && (
              <div className="text-slate-700">
                الرقم الضريبي: <span className="font-mono font-semibold">{data.buyer.taxNumber}</span>
              </div>
            )}
            {data.buyer?.crNumber && (
              <div className="text-slate-700">
                السجل التجاري: <span className="font-mono font-semibold">{data.buyer.crNumber}</span>
              </div>
            )}
            <div className="text-slate-700">
              المقر: <span className="font-semibold">{data.buyer?.address || "المقر الرئيسي المعتمد"}</span>
            </div>
            {data.buyer?.phone && (
              <div className="text-slate-600">
                الهاتف: <span className="font-mono">{data.buyer.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accounting Items Table */}
      <div className="mb-4">
        <table className="w-full text-xs border border-slate-300">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
              <th className="py-1.5 px-2 text-center w-8 border-e border-slate-300">#</th>
              <th className="py-1.5 px-2 text-start border-e border-slate-300">بيان الصنف والمواصفات</th>
              <th className="py-1.5 px-2 text-center w-24 border-e border-slate-300">كود / SKU</th>
              <th className="py-1.5 px-2 text-center w-16 border-e border-slate-300">
                {isInvoice ? "الكمية" : "المطلوب"}
              </th>
              {!isInvoice && (
                <th className="py-1.5 px-2 text-center w-16 border-e border-slate-300">المستلم</th>
              )}
              <th className="py-1.5 px-2 text-center w-24 border-e border-slate-300">سعر الوحدة</th>
              <th className="py-1.5 px-2 text-center w-16 border-e border-slate-300">الخصم</th>
              <th className="py-1.5 px-2 text-center w-16 border-e border-slate-300">الضريبة</th>
              <th className="py-1.5 px-2 text-end w-24">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={item.id} className="border-b border-slate-200 even:bg-slate-50/50">
                <td className="py-1.5 px-2 text-center font-mono border-e border-slate-200">{idx + 1}</td>
                <td className="py-1.5 px-2 font-medium border-e border-slate-200 text-start">
                  <div>{item.productName || "صنف بدون اسم"}</div>
                  {item.description && <div className="text-[10px] text-slate-500">{item.description}</div>}
                </td>
                <td className="py-1.5 px-2 text-center font-mono text-[11px] text-slate-600 border-e border-slate-200">
                  {item.sku || "—"}
                </td>
                <td className="py-1.5 px-2 text-center font-mono font-bold border-e border-slate-200">
                  {item.quantity}
                </td>
                {!isInvoice && (
                  <td className="py-1.5 px-2 text-center font-mono border-e border-slate-200 text-slate-600">
                    {item.receivedQuantity ?? 0}
                  </td>
                )}
                <td className="py-1.5 px-2 text-center font-mono tabular-nums border-e border-slate-200">
                  {formatCurrency(item.unitPrice, { locale })}
                </td>
                <td className="py-1.5 px-2 text-center font-mono border-e border-slate-200 text-slate-500">
                  {Number(item.discountRate) > 0 ? `${item.discountRate}%` : "—"}
                </td>
                <td className="py-1.5 px-2 text-center font-mono border-e border-slate-200 text-slate-500">
                  {Number(item.taxRate) > 0 ? `${item.taxRate}%` : "—"}
                </td>
                <td className="py-1.5 px-2 text-end font-mono font-bold tabular-nums">
                  {formatCurrency(item.totalPrice, { locale })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & Notes Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6 no-break">
        {/* Terms & Notes */}
        <div className="border border-slate-300 rounded p-2.5 bg-slate-50/30 text-xs space-y-1.5 text-start">
          <div className="font-bold text-slate-800 border-b border-slate-200 pb-1">
            {isInvoice ? "ملاحظات الفاتورة والتسوية:" : "شروط التوريد والسداد:"}
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            {data.notes ||
              (isInvoice
                ? "تعتبر هذه الفاتورة سند التزام مالي معتمد بعد اكتمال التوريد ومطابقة الأصناف."
                : "يلتزم المورد بتسليم الأصناف الموضحة أعلاه وفقاً لأعلى معايير الجودة والمواصفات المتفق عليها.")}
          </p>
          {data.paymentTerms && (
            <p className="text-[11px] text-slate-700 pt-1 border-t border-slate-200">
              <strong>شروط الدفع:</strong> {data.paymentTerms}
            </p>
          )}
          {data.dueDate && (
            <p className="text-[11px] text-slate-700 pt-1 border-t border-slate-200">
              <strong>تاريخ الاستحقاق النهائي:</strong> {formatShortDate(data.dueDate, locale)}
            </p>
          )}
        </div>

        {/* Financial Summary Box */}
        <div className="border border-slate-300 rounded overflow-hidden text-xs">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1 px-3 text-slate-600 text-start">المجموع قبل الخصم:</td>
                <td className="py-1 px-3 text-end font-mono font-medium tabular-nums">
                  {formatCurrency(data.financialSummary.subtotal, { locale })}
                </td>
              </tr>
              {Number(data.financialSummary.discountAmount) > 0 && (
                <tr className="border-b border-slate-200 text-rose-700">
                  <td className="py-1 px-3 text-start">الخصم التجاري:</td>
                  <td className="py-1 px-3 text-end font-mono font-medium tabular-nums">
                    -{formatCurrency(data.financialSummary.discountAmount, { locale })}
                  </td>
                </tr>
              )}
              {Number(data.financialSummary.taxAmount) > 0 && (
                <tr className="border-b border-slate-200 text-slate-700">
                  <td className="py-1 px-3 text-start">ضريبة القيمة المضافة:</td>
                  <td className="py-1 px-3 text-end font-mono font-medium tabular-nums">
                    +{formatCurrency(data.financialSummary.taxAmount, { locale })}
                  </td>
                </tr>
              )}
              {Number(data.financialSummary.shippingCost) > 0 && (
                <tr className="border-b border-slate-200 text-slate-700">
                  <td className="py-1 px-3 text-start">مصاريف الشحن / النقل:</td>
                  <td className="py-1 px-3 text-end font-mono font-medium tabular-nums">
                    +{formatCurrency(data.financialSummary.shippingCost, { locale })}
                  </td>
                </tr>
              )}
              <tr className="bg-slate-100 font-black text-sm border-t-2 border-slate-800">
                <td className="py-1.5 px-3 text-slate-900 text-start">المبلغ الإجمالي للمستند:</td>
                <td className="py-1.5 px-3 text-end font-mono text-slate-900 tabular-nums">
                  {formatCurrency(data.financialSummary.totalAmount, { locale })}
                </td>
              </tr>
              {data.financialSummary.paidAmount !== undefined && Number(data.financialSummary.paidAmount) > 0 && (
                <tr className="border-t border-slate-200 text-emerald-700 font-semibold">
                  <td className="py-1 px-3 text-start">المبلغ المدفوع:</td>
                  <td className="py-1 px-3 text-end font-mono tabular-nums">
                    {formatCurrency(data.financialSummary.paidAmount, { locale })}
                  </td>
                </tr>
              )}
              {data.financialSummary.remainingAmount !== undefined && (
                <tr className="border-t border-slate-200 text-rose-700 font-bold">
                  <td className="py-1 px-3 text-start">المبلغ المتبقي:</td>
                  <td className="py-1 px-3 text-end font-mono tabular-nums">
                    {formatCurrency(data.financialSummary.remainingAmount, { locale })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-Signature Official Approvals Block */}
      {data.signatures?.showBlock !== false && (
        <div className="border border-slate-300 rounded p-3 bg-slate-50/40 no-break">
          <div className="text-[11px] font-bold text-slate-500 mb-4 pb-1 border-b border-slate-200 flex justify-between">
            <span>الاعتمادات والتواقيع الرسمية</span>
            <span className="font-mono">OFFICIAL APPROVALS & SIGNATURES</span>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center text-xs text-slate-800">
            <div>
              <p className="font-bold text-slate-900 mb-8">
                {data.signatures?.purchasingTitle || (isInvoice ? "إعداد المحاسب المسؤول" : "مسؤول المشتريات")}
              </p>
              <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-600">
                الاسم والتوقيع
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-900 mb-8">
                {data.signatures?.financeTitle || "اعتماد المدير المالي / الإدارة"}
              </p>
              <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-600">
                {data.signatures?.showStamp !== false ? "الختم الرسمي والاعتماد" : "الاعتماد والتاريخ"}
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-900 mb-8">
                {data.signatures?.warehouseTitle || (isInvoice ? "تأكيد واستلام المورد / المستودع" : "اعتماد المورد وتأكيد التوريد")}
              </p>
              <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-600">
                توقيع المستلم والتاريخ
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formal Footer */}
      <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[10px] text-slate-500 flex justify-between">
        <span>مستند شراء وتوريد رسمي صادر إلكترونياً من منصة MaxP لإدارة التجارة والمشتريات</span>
        <span>صفحة 1 من 1</span>
      </div>
    </div>
  );
};
