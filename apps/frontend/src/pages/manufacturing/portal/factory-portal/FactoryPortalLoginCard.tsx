import React from 'react';
import { Building2, AlertCircle } from 'lucide-react';

interface FactoryPortalLoginCardProps {
  authError: string | null;
  inputToken: string;
  setInputToken: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const FactoryPortalLoginCard: React.FC<FactoryPortalLoginCardProps> = ({
  authError,
  inputToken,
  setInputToken,
  onSubmit,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-foreground flex flex-col justify-center items-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-xl space-y-5 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Building2 className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-foreground">بوابة المصنع الشريك</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            يرجى إدخال رمز الدخول الخاص بمصنعك للوصول إلى التكليفات المسندة وتحديث مراحل التشغيل
          </p>
        </div>

        {authError && (
          <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs text-right flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3 text-right">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              رمز الدخول (Token):
            </label>
            <input
              type="text"
              placeholder="أدخل الرمز أو الصق رابط البوابة هنا..."
              value={inputToken}
              onChange={(e) => {
                let val = e.target.value.trim();
                if (val.includes('token=')) {
                  val = val.split('token=')[1]?.split('&')[0] || val;
                }
                setInputToken(val);
              }}
              className="w-full p-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-center"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!inputToken.trim()}
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow hover:bg-primary/95 active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            دخول إلى التكليفات
          </button>
        </form>

        <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/50">
          إذا لم يكن لديك رمز وصول، تواصل مع مسؤول إدارة الإنتاج والتصنيع لتوليد الرابط الآمن.
        </div>
      </div>
    </div>
  );
};
