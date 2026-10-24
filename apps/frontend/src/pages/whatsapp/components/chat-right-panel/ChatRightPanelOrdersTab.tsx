import React from 'react';
import {
  ExternalLink,
  ShoppingBag,
  Wrench,
} from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { getStatusDisplay } from '../../../../utils/statusRegistry';
import type { OrderContextMenuState } from './types';

interface ChatRightPanelOrdersTabProps {
  orders: any[];
  ltv: number;
  onOpenOrder: () => void;
  onOpenServiceOrder?: () => void;
  onOrderContextMenu: (state: OrderContextMenuState) => void;
}

const sectionStyle = {
  borderRadius: '0.75rem',
  border: '1px solid color-mix(in srgb, var(--shell-control-border) 60%, transparent)',
  backgroundColor: 'var(--whatsapp-surface-strong)',
  padding: '0.875rem',
};

export const ChatRightPanelOrdersTab: React.FC<ChatRightPanelOrdersTabProps> = ({
  orders,
  ltv,
  onOpenOrder,
  onOpenServiceOrder,
  onOrderContextMenu,
}) => {
  return (
    <div className="space-y-3">
      {orders.length > 0 ? (
        <>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
            <ShoppingBag className="mx-auto mb-1 size-5 text-primary" />
            <p className="text-xs font-bold text-primary">سجل الطلبات</p>
            <p className="mt-0.5 text-[11px] font-mono tabular-nums text-muted-foreground">
              {orders.length} طلب — بإجمالي {ltv.toLocaleString()} ج.م
            </p>
          </div>

          {orders.map((order) => {
            const statusDisplay = getStatusDisplay(order.status);
            const isServiceOrder = order.type === 'SERVICE';

            return (
              <div key={order.id} style={sectionStyle}>
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onOrderContextMenu({
                            mouseX: e.clientX + 2,
                            mouseY: e.clientY - 6,
                            orderNumber: order.orderNumber,
                          });
                        }}
                        className="cursor-pointer font-mono font-bold text-xs sm:text-sm text-foreground hover:text-primary hover:underline"
                        title={order.orderNumber}
                      >
                        #{order.orderNumber}
                      </button>

                      {isServiceOrder && (
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 rounded bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                            <Wrench className="size-2.5" />
                            <span>خدمة</span>
                          </span>
                          <a
                            href={`/admin/service-orders/${order.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                            title="تفاصيل طلب الخدمة"
                          >
                            <span>تفاصيل</span>
                            <ExternalLink className="size-2.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      <span className="font-mono tabular-nums">
                        {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: arSA })}
                      </span>
                      {isServiceOrder && order.serviceName && (
                        <span className="mr-1 text-purple-600 dark:text-purple-400 font-medium">
                          • {order.serviceName}
                        </span>
                      )}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusDisplay.colorClass}`}
                  >
                    {statusDisplay.label}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-1.5 text-xs">
                  <span className="text-muted-foreground">
                    {isServiceOrder
                      ? order.serviceName || 'طلب خدمة'
                      : `${order.items?.length || 0} منتجات`}
                  </span>
                  <div className="text-end">
                    <span className="font-mono font-bold tabular-nums text-primary">
                      {order.total?.toLocaleString() || 0} ج.م
                    </span>
                    {isServiceOrder && order.paid > 0 && (
                      <span className="block font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                        (مدفوع: {order.paid} ج.م)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          <ShoppingBag className="mx-auto mb-2 size-10 opacity-20" />
          <p className="text-xs">لا توجد طلبات سابقة</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 text-xs font-semibold"
          onClick={onOpenOrder}
        >
          <ShoppingBag className="size-3.5" />
          <span>طلب متجر</span>
        </Button>
        {onOpenServiceOrder && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-xs font-semibold border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900/30"
            onClick={onOpenServiceOrder}
          >
            <Wrench className="size-3.5 text-purple-600 dark:text-purple-400" />
            <span>طلب خدمة</span>
          </Button>
        )}
      </div>
    </div>
  );
};
