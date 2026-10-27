import React from "react";
import { Plus, Layers, Eye } from "lucide-react";

interface ProductLandingMobileNavProps {
  mobileTab: "editor" | "preview";
  onSelectTab: (tab: "editor" | "preview") => void;
  sectionsCount: number;
  onOpenElementsDrawer: () => void;
}

export const ProductLandingMobileNav: React.FC<ProductLandingMobileNavProps> = ({
  mobileTab,
  onSelectTab,
  sectionsCount,
  onOpenElementsDrawer,
}) => {
  return (
    <nav className="eo-mobile-tab-nav" aria-label="تبويبات الاستوديو على الجوال">
      <button
        type="button"
        className={`eo-mobile-tab-btn ${mobileTab === "editor" ? "is-active" : ""}`}
        onClick={() => onSelectTab("editor")}
      >
        <Layers size={15} />
        <span>
          المحرر والأقسام (<span className="tabular-nums">{sectionsCount}</span>)
        </span>
      </button>

      <button
        type="button"
        className={`eo-mobile-tab-btn ${mobileTab === "preview" ? "is-active" : ""}`}
        onClick={() => onSelectTab("preview")}
      >
        <Eye size={15} />
        <span>المعاينة الحية</span>
      </button>

      <button
        type="button"
        className="eo-mobile-tab-btn eo-tab-btn-add"
        onClick={onOpenElementsDrawer}
      >
        <Plus size={15} />
        <span>+ إضافة عنصر</span>
      </button>
    </nav>
  );
};
