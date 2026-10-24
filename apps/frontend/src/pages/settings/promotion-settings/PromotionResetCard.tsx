import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export interface PromotionResetCardProps {
  onReset: () => void;
}

export function PromotionResetCard({ onReset }: PromotionResetCardProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-5 shadow-xs sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900/70">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-500/30">
        <RotateCcw className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-950 dark:text-slate-100">
          {t("promotionSettings.resetTitle")}
        </p>
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          {t("promotionSettings.resetDesc")}
        </p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger
          className={cn(
            buttonVariants({ variant: "outline" }),
            "rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/50",
          )}
        >
          <RotateCcw className="size-4" />
          {t("promotionSettings.resetAction")}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("promotionSettings.resetModalTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("promotionSettings.resetModalBody")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("promotionSettings.resetModalCancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onReset}
              className="bg-rose-700 text-white hover:bg-rose-800"
            >
              {t("promotionSettings.resetModalConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
