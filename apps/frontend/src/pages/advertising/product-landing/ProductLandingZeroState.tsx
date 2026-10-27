import React from "react";
import { Plus } from "lucide-react";

interface ProductLandingZeroStateProps {
  onOpenCreateModal: () => void;
}

export const ProductLandingZeroState: React.FC<ProductLandingZeroStateProps> = ({
  onOpenCreateModal,
}) => {
  return (
    <div className="eo-zero-state-container">
      <div className="eo-zero-state-card">
        <div className="eo-zero-state-icon">🚀</div>
        <h2>ابدأ بإنشاء أول صفحة هبوط لمنتجاتك!</h2>
        <p>
          لم تقم بإنشاء أي صفحات هبوط بعد. اختر منتجاً من كتالوج متجرك
          وسيتولى الذكاء الاصطناعي تجهيز صفحة تحويل وبيانات بيع احترافية
          بشكل فوري.
        </p>
        <button
          type="button"
          className="eo-btn eo-btn-new-page eo-btn-lg"
          onClick={onOpenCreateModal}
        >
          <Plus size={18} />
          <span>+ إنشاء أول صفحة هبوط الآن</span>
        </button>
      </div>
    </div>
  );
};
