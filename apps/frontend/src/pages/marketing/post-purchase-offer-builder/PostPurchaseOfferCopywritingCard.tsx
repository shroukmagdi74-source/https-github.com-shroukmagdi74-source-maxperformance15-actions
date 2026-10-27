import React from "react";
import { Sparkles, Clock, Plus, CheckCircle2, Trash2 } from "lucide-react";
import type { PostPurchaseOfferConfig } from "../../../types/postPurchaseOffer";

interface PostPurchaseOfferCopywritingCardProps {
  offer: PostPurchaseOfferConfig;
  setOffer: React.Dispatch<React.SetStateAction<PostPurchaseOfferConfig>>;
  onAddFeature: () => void;
  onRemoveFeature: (index: number) => void;
  onUpdateFeature: (index: number, val: string) => void;
}

export const PostPurchaseOfferCopywritingCard: React.FC<
  PostPurchaseOfferCopywritingCardProps
> = ({
  offer,
  setOffer,
  onAddFeature,
  onRemoveFeature,
  onUpdateFeature,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-base text-foreground flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        تخصيص نصوص العرض والعداد
      </h3>

      <div className="space-y-3 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-foreground">
            شريط التنبيه العلوي (Badge):
          </label>
          <input
            type="text"
            value={offer.badgeText}
            onChange={(e) =>
              setOffer((prev) => ({ ...prev, badgeText: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-xl border border-border bg-background"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-foreground">العنوان الرئيسي:</label>
          <input
            type="text"
            value={offer.title}
            onChange={(e) =>
              setOffer((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-xl border border-border bg-background font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-foreground">العنوان الفرعي:</label>
          <input
            type="text"
            value={offer.subtitle}
            onChange={(e) =>
              setOffer((prev) => ({ ...prev, subtitle: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-xl border border-border bg-background"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-foreground">
            وصف العرض / تفاصيل المنتج:
          </label>
          <textarea
            rows={2}
            value={offer.description}
            onChange={(e) =>
              setOffer((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label className="font-bold text-foreground">نص زر القبول (CTA):</label>
            <input
              type="text"
              value={offer.acceptButtonText}
              onChange={(e) =>
                setOffer((prev) => ({
                  ...prev,
                  acceptButtonText: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-xl border border-border bg-background font-bold text-emerald-700 dark:text-emerald-300"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-foreground">
              نص زر الرفض / المتابعة:
            </label>
            <input
              type="text"
              value={offer.declineButtonText}
              onChange={(e) =>
                setOffer((prev) => ({
                  ...prev,
                  declineButtonText: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-muted-foreground"
            />
          </div>
        </div>

        <div className="space-y-1 pt-1">
          <label className="font-bold text-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            مدة العداد التنازلي بالدقائق:
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={offer.timerMinutes}
            onChange={(e) =>
              setOffer((prev) => ({
                ...prev,
                timerMinutes: Math.max(1, Number(e.target.value) || 5),
              }))
            }
            className="w-32 px-3 py-2 rounded-xl border border-border bg-background font-bold tabular-nums"
          />
        </div>
      </div>

      {/* Feature Bullets List */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground">
            ميزات وضمانات العرض:
          </label>
          <button
            type="button"
            onClick={onAddFeature}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة ميزة
          </button>
        </div>

        <div className="space-y-2">
          {offer.features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="text"
                value={feat}
                onChange={(e) => onUpdateFeature(idx, e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-background"
              />
              <button
                type="button"
                onClick={() => onRemoveFeature(idx)}
                className="p-1.5 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                aria-label="حذف الميزة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
