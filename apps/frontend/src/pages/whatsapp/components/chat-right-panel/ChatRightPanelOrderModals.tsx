import React from 'react';
import { FileText, Pencil, Undo2 } from 'lucide-react';
import EnhancedOrderModal from '../../../../components/orders/EnhancedOrderModal';
import ReturnDetailsModal from '../../../returns/ReturnDetailsModal';
import type { ReturnRequest } from '../../../../services/returnService';
import type { OrderContextMenuState } from './types';

interface ChatRightPanelOrderModalsProps {
  orderMenu: OrderContextMenuState | null;
  onCloseOrderMenu: () => void;
  orderDetailsLoading: boolean;
  onViewOrderDetails: (orderNumber: string) => void;
  onOpenReturnReason: (orderNumber: string) => void;
  previewOrder: any | null;
  onClosePreviewOrder: () => void;
  orderStatuses: Array<{ code: string; name: string; color?: string }>;
  selectedReturn: ReturnRequest | null;
  onCloseSelectedReturn: () => void;
}

export const ChatRightPanelOrderModals: React.FC<ChatRightPanelOrderModalsProps> = ({
  orderMenu,
  onCloseOrderMenu,
  orderDetailsLoading,
  onViewOrderDetails,
  onOpenReturnReason,
  previewOrder,
  onClosePreviewOrder,
  orderStatuses,
  selectedReturn,
  onCloseSelectedReturn,
}) => {
  return (
    <>
      {orderMenu && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={onCloseOrderMenu}
            aria-label="Close order menu"
          />
          <div
            className="fixed z-50 w-52 rounded-2xl border border-[color:var(--shell-overlay-border)] bg-[var(--shell-overlay-bg)] p-1.5 shadow-[var(--shell-overlay-shadow)] ring-1 ring-[color:var(--shell-overlay-edge)]"
            style={{
              left: Math.min(
                orderMenu.mouseX,
                (typeof window !== 'undefined' ? window.innerWidth : 0) - 240,
              ),
              top: Math.min(
                orderMenu.mouseY,
                (typeof window !== 'undefined' ? window.innerHeight : 0) - 200,
              ),
            }}
            role="menu"
          >
            <p className="mx-1 mb-1 border-b border-[color:var(--shell-control-border)] px-1 pb-1 text-[10px] font-mono font-semibold text-muted-foreground">
              {orderMenu.orderNumber}
            </p>
            <button
              type="button"
              onClick={() => {
                const code = orderMenu.orderNumber;
                onCloseOrderMenu();
                window.open(`/orders/${encodeURIComponent(code)}?edit=1`, '_blank');
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-[color:var(--shell-control-hover)]"
            >
              <Pencil className="size-3.5" />
              <span>تعديل</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const code = orderMenu.orderNumber;
                onCloseOrderMenu();
                onViewOrderDetails(code);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-[color:var(--shell-control-hover)]"
            >
              <FileText className="size-3.5" />
              <span>{orderDetailsLoading ? 'جاري التحميل...' : 'عرض التفاصيل'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const code = orderMenu.orderNumber;
                onCloseOrderMenu();
                onOpenReturnReason(code);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-[color:var(--shell-control-hover)]"
            >
              <Undo2 className="size-3.5" />
              <span>سبب المرتجع</span>
            </button>
          </div>
        </>
      )}

      {previewOrder && (
        <EnhancedOrderModal
          order={previewOrder}
          isOpen={Boolean(previewOrder)}
          onClose={onClosePreviewOrder}
          orderStatuses={orderStatuses.map((s) => ({
            code: s.code,
            name: s.name,
            color: s.color,
          }))}
        />
      )}

      {selectedReturn && (
        <ReturnDetailsModal
          request={selectedReturn}
          onClose={onCloseSelectedReturn}
          onUpdate={() => {}}
        />
      )}
    </>
  );
};
