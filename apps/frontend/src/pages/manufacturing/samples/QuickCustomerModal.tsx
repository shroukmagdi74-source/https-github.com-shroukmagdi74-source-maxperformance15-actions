import React, { useState } from 'react';
import { X, UserPlus, Phone, MapPin, User, AlertCircle, Check, Loader2 } from 'lucide-react';
import { manufacturingApi } from '../manufacturingApi';

export interface QuickCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (customer: { id: string; name: string; phone?: string }) => void;
}

export const QuickCustomerModal: React.FC<QuickCustomerModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [resolvingExisting, setResolvingExisting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setPhone('');
    setCity('');
    setError(null);
    setIsDuplicate(false);
    setLoading(false);
    setResolvingExisting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('اسم العميل إلزامي');
      return;
    }
    if (!phone.trim()) {
      setError('رقم الهاتف إلزامي');
      return;
    }

    setLoading(true);
    setError(null);
    setIsDuplicate(false);

    try {
      const created = await manufacturingApi.createCustomerQuick({
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim() || undefined,
      });

      const customerObj = {
        id: String(created.id),
        name: [created.firstName, created.lastName].filter(Boolean).join(' ').trim() || name.trim(),
        phone: created.phone || phone.trim(),
      };

      onCreated(customerObj);
      handleClose();
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || 'حدث خطأ أثناء حفظ بيانات العميل';

      if (status === 409 || String(msg).includes('مسجل بالفعل')) {
        setIsDuplicate(true);
        setError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseExisting = async () => {
    if (!phone.trim()) return;
    setResolvingExisting(true);
    setError(null);

    try {
      const existing = await manufacturingApi.getCustomerByPhone(phone.trim());
      if (existing) {
        const customerObj = {
          id: String(existing.id),
          name: [existing.firstName, existing.lastName].filter(Boolean).join(' ').trim() || existing.name || name.trim(),
          phone: existing.phone || phone.trim(),
        };
        onCreated(customerObj);
        handleClose();
      } else {
        setError('لم نتمكن من جلب بيانات العميل بالرقم المدخل');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'فشل جلب العميل المسجل');
    } finally {
      setResolvingExisting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">إضافة عميل سريع</h3>
              <p className="text-[11px] text-muted-foreground">تسجيل عميل جديد وربطه بالعينة فورًا</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div
              className={`p-3 rounded-lg text-xs flex flex-col gap-2 ${
                isDuplicate
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400'
                  : 'bg-destructive/10 border border-destructive/20 text-destructive'
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {isDuplicate && (
                <button
                  type="button"
                  onClick={handleUseExisting}
                  disabled={resolvingExisting}
                  className="mt-1 self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition"
                >
                  {resolvingExisting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>استخدم العميل الموجود</span>
                </button>
              )}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              اسم العميل <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: سلمى فتحي"
                className="w-full pr-9 pl-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              <User className="w-4 h-4 text-muted-foreground absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              رقم الهاتف <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01099887766"
                className="w-full pr-3 pl-9 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-right"
              />
              <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">يُستخدم لمنع تكرار الحسابات وتسهيل التواصل</p>
          </div>

          {/* City Field */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              المدينة <span className="text-muted-foreground text-[10px]">(اختياري)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="مثال: القاهرة / الإسكندرية"
                className="w-full pr-9 pl-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              <MapPin className="w-4 h-4 text-muted-foreground absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/80">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading || resolvingExisting}
              className="px-3.5 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || resolvingExisting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>حفظ العميل واختياره</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
