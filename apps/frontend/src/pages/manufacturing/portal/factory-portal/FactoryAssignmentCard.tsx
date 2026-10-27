import React from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock,
  Play,
} from 'lucide-react';
import { FactoryPortalAssignment } from '../../manufacturingApi';
import { FactoryAgreementCard } from './FactoryAgreementCard';
import { FactoryTechPackCard } from './FactoryTechPackCard';
import { FactorySizeChartCard } from './FactorySizeChartCard';
import { FactoryDeliveredMaterialsCard } from './FactoryDeliveredMaterialsCard';
import { FactoryStageMediaGallery } from './FactoryStageMediaGallery';

interface FactoryAssignmentCardProps {
  asg: FactoryPortalAssignment;
  isExpanded: boolean;
  submitting: boolean;
  onToggleExpandMaterials: (asgId: string) => void;
  onConfirmReceipt: (asg: FactoryPortalAssignment) => void;
  onStart: (asg: FactoryPortalAssignment) => void;
  onOpenUpdateModal: (asg: FactoryPortalAssignment) => void;
  onOpenMediaModal: (asg: FactoryPortalAssignment) => void;
  onOpenApprovalModal: (asg: FactoryPortalAssignment) => void;
  onOpenIssueModal: (asg: FactoryPortalAssignment) => void;
}

export const FactoryAssignmentCard: React.FC<FactoryAssignmentCardProps> = ({
  asg,
  isExpanded,
  submitting,
  onToggleExpandMaterials,
  onConfirmReceipt,
  onStart,
  onOpenUpdateModal,
  onOpenMediaModal,
  onOpenApprovalModal,
  onOpenIssueModal,
}) => {
  const isReceived = asg.factoryAckReceiptAt != null;
  const isSent = asg.sentToFactoryAt != null;
  const isCompleted =
    asg.status === 'COMPLETED' || asg.factoryCompletedAt != null;

  return (
    <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm hover:border-primary/40 transition-all space-y-4 p-4">
      {/* Card Header: Order and Stage */}
      <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              {asg.order?.orderNumber}
            </span>
            {asg.order?.brandName && (
              <span className="text-xs font-semibold text-foreground">
                {asg.order.brandName}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              · مرحلة #{asg.sequence}
            </span>
          </div>
          <h3 className="font-bold text-sm sm:text-base text-foreground">
            {asg.name}
          </h3>
          {asg.order?.productModel && (
            <p className="text-xs text-muted-foreground">
              الموديل: {asg.order.productModel}
            </p>
          )}
        </div>

        {/* Timeline Stage Badge */}
        <div>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>مكتملة</span>
            </span>
          ) : isReceived ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
              <Play className="w-3 h-3" />
              <span>قيد التشغيل</span>
            </span>
          ) : isSent ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              <Clock className="w-3 h-3" />
              <span>بانتظار الاستلام</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
              <span>قيد التجهيز</span>
            </span>
          )}
        </div>
      </div>

      {/* Quantities & Agreement Value Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-muted/30 p-3 rounded-xl border border-border/50 text-xs">
        <div>
          <span className="text-[11px] text-muted-foreground block">
            الكمية المطلوبة:
          </span>
          <strong className="text-sm font-bold text-foreground tabular-nums">
            {asg.order?.plannedQuantity} {asg.order?.unit || 'قطعة'}
          </strong>
        </div>

        <div>
          <span className="text-[11px] text-muted-foreground block">
            الكمية المنفذة:
          </span>
          <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {asg.completedQuantity} {asg.order?.unit || 'قطعة'}
          </strong>
        </div>

        <div>
          <span className="text-[11px] text-muted-foreground block">
            تاريخ التسليم المستهدف:
          </span>
          <span className="font-medium text-foreground tabular-nums">
            {asg.order?.dueDate
              ? new Date(asg.order.dueDate).toLocaleDateString('ar-EG', {
                  month: 'short',
                  day: 'numeric',
                })
              : 'غير محدد'}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-muted-foreground block">
            قيمة اتفاق المصنع:
          </span>
          <strong className="text-sm font-bold text-primary tabular-nums">
            {asg.agreement.partnerAgreedCost.toLocaleString('en-US')}{' '}
            {asg.agreement.currency}
          </strong>
          <span className="text-[10px] text-muted-foreground block tabular-nums">
            ({asg.agreement.ratePerPiece} ج.م / للقطعة)
          </span>
        </div>
      </div>

      {/* Wave 7: Factory Agreement & Payments Schedule */}
      {asg.agreementSummary && (
        <FactoryAgreementCard agreementSummary={asg.agreementSummary} />
      )}

      {/* Technical Pack & Size Chart Section (Wave 4) */}
      {(asg.techPack || asg.sizeChart) && (
        <div className="border border-border/70 rounded-xl overflow-hidden bg-card space-y-3 p-3.5 shadow-2xs">
          {asg.techPack && <FactoryTechPackCard techPack={asg.techPack} />}
          {asg.sizeChart && <FactorySizeChartCard sizeChart={asg.sizeChart} />}
        </div>
      )}

      {/* Delivered Materials Section */}
      <FactoryDeliveredMaterialsCard
        deliveredMaterials={asg.deliveredMaterials}
        isExpanded={isExpanded}
        onToggle={() => onToggleExpandMaterials(asg.id)}
      />

      {/* Uploaded Media Gallery */}
      <FactoryStageMediaGallery attachments={asg.attachments} />

      {/* Stage Cycle Buttons (Mobile First Big Touch Targets) */}
      <div className="pt-2 border-t border-border/70 space-y-2">
        {!isReceived ? (
          <button
            type="button"
            onClick={() => onConfirmReceipt(asg)}
            disabled={submitting || !isSent}
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow hover:bg-primary/95 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>تأكيد استلام الخامات والتشغيل</span>
          </button>
        ) : asg.status === 'PENDING' ? (
          <button
            type="button"
            onClick={() => onStart(asg)}
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm shadow hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span>بدء مرحلة التشغيل الفعلي</span>
          </button>
        ) : null}

        {/* Operational Action Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => onOpenUpdateModal(asg)}
            disabled={!isReceived}
            className="py-2.5 px-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            <ClipboardList className="w-3.5 h-3.5 text-primary" />
            <span>تحديث الكميات</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenMediaModal(asg)}
            className="py-2.5 px-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span>رفع صورة / فيديو</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenApprovalModal(asg)}
            disabled={!isReceived}
            className="py-2.5 px-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>طلب اعتماد</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenIssueModal(asg)}
            className="py-2.5 px-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>تسجيل ملاحظة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
