import React from "react";
import { Loader2 } from "lucide-react";
import { getDirection } from "../../../i18n";

export const PostPurchaseOfferLoading: React.FC = () => {
  const isRtl = getDirection() === "rtl";

  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
      <p className="text-sm font-medium text-muted-foreground">
        جارٍ تحميل أداة العرض الخاص بعد الطلب...
      </p>
    </div>
  );
};
