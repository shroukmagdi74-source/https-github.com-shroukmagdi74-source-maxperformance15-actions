import React from 'react';
import { AlertCircle, Check, Mail, MapPin, SquarePen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import type { Contact } from '../../../../hooks/useWhatsAppQueries';

interface CustomerPhoneSectionProps {
  contact: Contact;
  customer: any;
  isGroup: boolean;
  isLinkedCustomer: boolean;
  displayPhone: string;
  editingPhone: boolean;
  phoneDraft: string;
  setPhoneDraft: (v: string) => void;
  savingPhone: boolean;
  phoneUpdateMessage: string | null;
  onStartEditPhone: () => void;
  onCancelEditPhone: () => void;
  onSavePhone: () => void;
  displayPhone2: string;
  editingPhone2: boolean;
  phone2Draft: string;
  setPhone2Draft: (v: string) => void;
  savingPhone2: boolean;
  onStartEditPhone2: () => void;
  onCancelEditPhone2: () => void;
  onSavePhone2: () => void;
  sectionStyle: React.CSSProperties;
}

export const CustomerPhoneSection: React.FC<CustomerPhoneSectionProps> = ({
  contact,
  customer,
  isGroup,
  isLinkedCustomer,
  displayPhone,
  editingPhone,
  phoneDraft,
  setPhoneDraft,
  savingPhone,
  phoneUpdateMessage,
  onStartEditPhone,
  onCancelEditPhone,
  onSavePhone,
  displayPhone2,
  editingPhone2,
  phone2Draft,
  setPhone2Draft,
  savingPhone2,
  onStartEditPhone2,
  onCancelEditPhone2,
  onSavePhone2,
  sectionStyle,
}) => {
  return (
    <>
      {/* Phone Numbers & Contact Details */}
      <div style={sectionStyle}>
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground">بيانات الاتصال</h4>
        <div className="space-y-3">
          {/* Phone 1 */}
          {isGroup ? (
            <p className="text-xs text-muted-foreground">مجموعة واتساب (لا يوجد رقم هاتف مباشر)</p>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                {editingPhone ? (
                  <input
                    autoFocus
                    type="tel"
                    dir="ltr"
                    value={phoneDraft}
                    onChange={(e) => setPhoneDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSavePhone();
                      if (e.key === 'Escape') onCancelEditPhone();
                    }}
                    className="flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-xs font-mono font-medium"
                    placeholder="01xxxxxxxxx"
                    disabled={savingPhone}
                  />
                ) : displayPhone ? (
                  <span className="font-mono tabular-nums flex-1 truncate text-foreground" dir="ltr">
                    {displayPhone}
                  </span>
                ) : (
                  <span className="flex-1 text-xs text-muted-foreground">لم يتم إضافة رقم هاتف</span>
                )}

                {editingPhone ? (
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon-sm"
                      onClick={onSavePhone}
                      disabled={savingPhone}
                      className="size-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                    >
                      <Check className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={onCancelEditPhone}
                      disabled={savingPhone}
                      className="size-7 rounded-md text-destructive hover:bg-destructive/10"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ) : displayPhone ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onStartEditPhone}
                    className="size-7 rounded-md text-muted-foreground hover:bg-muted"
                  >
                    <SquarePen className="size-3.5" />
                  </Button>
                ) : null}
              </div>

              {phoneUpdateMessage && (
                <div className="flex items-center gap-1 text-[11px]">
                  {phoneUpdateMessage.includes('تم') ? (
                    <Check className="size-3 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="size-3 text-destructive shrink-0" />
                  )}
                  <span
                    className={
                      phoneUpdateMessage.includes('تم')
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-destructive'
                    }
                  >
                    {phoneUpdateMessage.replace(/^[❌✅]\s*/, '')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Phone 2 */}
          {isLinkedCustomer && (
            <div className="flex items-center gap-2 text-xs pt-1 border-t border-border/40">
              {editingPhone2 ? (
                <input
                  type="tel"
                  dir="ltr"
                  value={phone2Draft}
                  onChange={(e) => setPhone2Draft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSavePhone2();
                    if (e.key === 'Escape') onCancelEditPhone2();
                  }}
                  className="flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-xs font-mono font-medium"
                  placeholder="01xxxxxxxxx"
                  disabled={savingPhone2}
                />
              ) : displayPhone2 ? (
                <span className="font-mono tabular-nums flex-1 truncate text-foreground" dir="ltr">
                  {displayPhone2}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onStartEditPhone2}
                  className="flex-1 cursor-pointer text-start text-xs font-semibold text-primary hover:underline"
                >
                  إضافة رقم إضافي
                </button>
              )}

              {editingPhone2 ? (
                <div className="flex items-center gap-1">
                  <Button
                    size="icon-sm"
                    onClick={onSavePhone2}
                    disabled={savingPhone2}
                    className="size-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                  >
                    <Check className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onCancelEditPhone2}
                    disabled={savingPhone2}
                    className="size-7 rounded-md text-destructive hover:bg-destructive/10"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ) : displayPhone2 ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onStartEditPhone2}
                  className="size-7 rounded-md text-muted-foreground hover:bg-muted"
                >
                  <SquarePen className="size-3.5" />
                </Button>
              ) : null}
            </div>
          )}

          {customer?.email && (
            <div className="flex items-center gap-2 text-xs pt-1 border-t border-border/40">
              <Mail className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate text-foreground font-mono">{customer.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Location & Last Seen */}
      <div style={sectionStyle}>
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground">بيانات أخرى</h4>
        <div className="space-y-1.5 text-xs">
          {(customer?.city || customer?.country) && (
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-foreground">
                {customer.city}
                {customer.city && customer.country ? '، ' : ''}
                {customer.country}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-muted-foreground">
            <span>آخر ظهور:</span>
            <span className="font-mono tabular-nums text-foreground">
              {contact.lastMessageAt
                ? format(new Date(contact.lastMessageAt), 'MMM d, HH:mm', { locale: arSA })
                : 'غير معروف'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
