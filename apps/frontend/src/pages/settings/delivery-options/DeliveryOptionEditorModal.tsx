import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { getNumericValue } from '../components/settingsPageUtils';
import type { DeliveryOption, DeliveryOptionFormState } from './types';

interface DeliveryOptionEditorModalProps {
  dialogOpen: boolean;
  editingOption: DeliveryOption | null;
  formData: DeliveryOptionFormState;
  setFormData: React.Dispatch<React.SetStateAction<DeliveryOptionFormState>>;
  saving: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
}

export const DeliveryOptionEditorModal: React.FC<DeliveryOptionEditorModalProps> = ({
  dialogOpen,
  editingOption,
  formData,
  setFormData,
  saving,
  onClose,
  onSave,
}) => {
  return (
    <Dialog open={dialogOpen} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="max-w-2xl gap-0 overflow-hidden rounded-[28px] border border-border bg-card p-0"
      >
        <DialogHeader className="border-b border-border/70 px-6 py-5 text-right">
          <DialogTitle className="text-lg font-bold text-foreground">
            {editingOption ? 'تعديل خيار التوصيل' : 'إضافة خيار توصيل جديد'}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-7 text-muted-foreground">
            حدّد الاسم الذي يراه العميل، ووقت التوصيل، والسعر، ثم اضبط كونه
            افتراضيًا أو نشطًا.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="delivery-option-name" className="text-sm font-semibold text-foreground">
                اسم الخيار
              </Label>
              <Input
                id="delivery-option-name"
                value={formData.name}
                onChange={(event) =>
                  setFormData((currentFormData) => ({
                    ...currentFormData,
                    name: event.target.value,
                  }))
                }
                placeholder="مثال: توصيل عادي أو توصيل سريع"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-option-time" className="text-sm font-semibold text-foreground">
                وقت التوصيل
              </Label>
              <Input
                id="delivery-option-time"
                value={formData.deliveryTime}
                onChange={(event) =>
                  setFormData((currentFormData) => ({
                    ...currentFormData,
                    deliveryTime: event.target.value,
                  }))
                }
                placeholder="مثال: 1-2 يوم أو نفس اليوم"
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-option-description" className="text-sm font-semibold text-foreground">
              الوصف
            </Label>
            <Textarea
              id="delivery-option-description"
              rows={3}
              value={formData.description}
              onChange={(event) =>
                setFormData((currentFormData) => ({
                  ...currentFormData,
                  description: event.target.value,
                }))
              }
              placeholder="وصف مختصر يساعد العميل على فهم هذا الخيار"
              className="min-h-[110px] rounded-xl border-border"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="delivery-option-price" className="text-sm font-semibold text-foreground">
                السعر (جنيه)
              </Label>
              <Input
                id="delivery-option-price"
                type="number"
                min={0}
                step={5}
                value={formData.price}
                onChange={(event) =>
                  setFormData((currentFormData) => ({
                    ...currentFormData,
                    price: getNumericValue(event.target.value),
                  }))
                }
                className="h-11 rounded-xl font-mono tabular-nums"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-option-sort-order" className="text-sm font-semibold text-foreground">
                ترتيب العرض
              </Label>
              <Input
                id="delivery-option-sort-order"
                type="number"
                min={0}
                value={formData.sortOrder}
                onChange={(event) =>
                  setFormData((currentFormData) => ({
                    ...currentFormData,
                    sortOrder: Math.max(
                      0,
                      Math.trunc(getNumericValue(event.target.value)),
                    ),
                  }))
                }
                className="h-11 rounded-xl font-mono tabular-nums"
              />
              <p className="text-xs leading-5 text-muted-foreground">
                الأصغر يظهر أولًا أمام العميل.
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-border/70 bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    جعله الخيار الافتراضي
                  </p>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground">
                    سيظهر كمقترح أول للعميل عند اختيار وسيلة التوصيل.
                  </p>
                </div>
                <Switch
                  aria-label="جعله الخيار الافتراضي"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData((currentFormData) => ({
                      ...currentFormData,
                      isDefault: checked,
                    }))
                  }
                />
              </div>
            </div>

            <div className="rounded-[22px] border border-border/70 bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    تفعيل الخيار
                  </p>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground">
                    عند الإيقاف يظل محفوظًا لكنه يختفي من واجهة العميل.
                  </p>
                </div>
                <Switch
                  aria-label="تفعيل الخيار"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((currentFormData) => ({
                      ...currentFormData,
                      isActive: checked,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/70 bg-muted/20 px-6 py-4">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            إلغاء
          </Button>
          <Button
            onClick={() => {
              void onSave();
            }}
            disabled={
              saving ||
              !formData.name.trim() ||
              !formData.deliveryTime.trim()
            }
            className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold gap-2"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {editingOption ? 'تحديث الخيار' : 'إضافة الخيار'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
