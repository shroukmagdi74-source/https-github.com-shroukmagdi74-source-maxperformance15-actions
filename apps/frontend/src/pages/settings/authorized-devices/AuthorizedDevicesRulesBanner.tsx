import React from "react";
import { Building2, ShieldCheck } from "lucide-react";

export const AuthorizedDevicesRulesBanner: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3">
        <div className="p-2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <span className="font-semibold text-foreground block text-sm">جهاز مكتب (OFFICE)</span>
          <p className="text-muted-foreground">
            كامل الصلاحيات التشغيلية، رنين إنذار الطلبات الجديدة، طباعة البوليصات الحرارية، وتسجيل الحضور المكتبي التلقائي.
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
        <div className="p-2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <span className="font-semibold text-foreground block text-sm">جهاز شخصي (PERSONAL)</span>
          <p className="text-muted-foreground">
            صلاحيات مقيّدة، حجب تصدير البيانات (Excel)، كتم أصوات الإنذارات المزعجة، وعزل الحضور المكتبي لتفادي الساعات الخاطئة.
          </p>
        </div>
      </div>
    </div>
  );
};
