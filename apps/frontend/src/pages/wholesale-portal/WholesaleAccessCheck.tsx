import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WholesaleAccessCheckProps {
  error: string | null;
  errorCode?: string | null;
}

export const WholesaleAccessCheck: React.FC<WholesaleAccessCheckProps> = ({ error, errorCode }) => {
  const isInactive = errorCode === 'WHOLESALE_INACTIVE' || error?.includes('معطل') || error?.includes('موقوف');

  return (
    <div dir="rtl" className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isInactive ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
        {isInactive ? <AlertTriangle size={32} /> : <ShieldAlert size={32} />}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {isInactive ? 'حساب الموزع موقوف مؤقتاً' : 'قسم خاص بالموزعين وتجار الجملة'}
      </h2>

      <p className="text-gray-600 text-sm leading-relaxed mb-6">
        {isInactive
          ? 'حساب الجملة الخاص بك غير مفعّل أو تم إيقافه من قِبل إدارة الشركة. يرجى التواصل مع مسؤول المبيعات لإعادة التفعيل واستئناف الطلبات.'
          : (error || 'هذه الصفحة مخصصة لعملاء وتجار الجملة المعتمدين فقط. إذا كنت ترغب في الانضمام إلى شبكة موزعينا، يرجى التواصل مع إدارة المتجر لتفعيل حساب الجملة الخاص بك.')}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/account"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium transition-colors"
        >
          <ArrowRight size={16} />
          العودة لحسابي
        </Link>
        <a
          href="tel:+201000000000"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
        >
          <Phone size={16} />
          تواصل مع إدارة المبيعات
        </a>
      </div>
    </div>
  );
};
