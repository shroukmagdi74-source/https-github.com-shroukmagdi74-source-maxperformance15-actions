import React from "react";
import { CubeIcon } from "@heroicons/react/24/outline";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface OrderPreparationHeaderProps {
  enabled: boolean;
  defaultWarehouseName: string;
}

export const OrderPreparationHeader: React.FC<OrderPreparationHeaderProps> = ({
  enabled,
  defaultWarehouseName,
}) => {
  return (
    <Card className="border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/90">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300">
            <CubeIcon className="h-4 w-4" />
            <span>Fulfillment Settings</span>
          </div>
          <CardTitle className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            إعدادات تجهيز الطلبات
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            تحكم في قواعد تشغيل صفحة التجهيز، سياسات المخزون، فحص الجودة، والإجراءات الجماعية الخاصة بالمخزن.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={enabled ? "default" : "secondary"}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                enabled ? "bg-emerald-400 animate-pulse" : "bg-slate-400"
              }`}
            />
            <span>{enabled ? "المسار مفعل" : "المسار متوقف"}</span>
          </Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {defaultWarehouseName}
          </span>
        </div>
      </CardHeader>
    </Card>
  );
};
