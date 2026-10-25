import React from "react";
import { AlertTriangle, Check, Copy } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { HR_API_SCOPES } from "./helpers";

interface HRApiCreateKeyModalProps {
  open: boolean;
  newKeyName: string;
  onNewKeyNameChange: (val: string) => void;
  selectedScopes: string[];
  onSelectedScopesChange: (scopes: string[]) => void;
  newlyCreatedRawKey: string | null;
  copiedKey: boolean;
  onCopyToClipboard: (text: string) => void;
  onCreateKey: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const HRApiCreateKeyModal: React.FC<HRApiCreateKeyModalProps> = ({
  open,
  newKeyName,
  onNewKeyNameChange,
  selectedScopes,
  onSelectedScopesChange,
  newlyCreatedRawKey,
  copiedKey,
  onCopyToClipboard,
  onCreateKey,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <h3 className="font-bold text-base">إنشاء مفتاح API جديد</h3>

        {!newlyCreatedRawKey ? (
          <form onSubmit={onCreateKey} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">
                اسم المفتاح (مثال: بصمة الفرع الرئيسي أو AI Assistant)
              </label>
              <input
                type="text"
                required
                value={newKeyName}
                onChange={(e) => onNewKeyNameChange(e.target.value)}
                placeholder="اسم تعريفي واضح"
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">الصلاحيات الممنوحة</label>
              <select
                value={selectedScopes[0] || "*"}
                onChange={(e) => onSelectedScopesChange([e.target.value])}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none font-mono"
              >
                {HR_API_SCOPES.map((scope) => (
                  <option key={scope.value} value={scope.value}>
                    {scope.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit" size="sm">
                توليد المفتاح
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600 dark:text-amber-400 text-xs flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                يرجى نسخ هذا المفتاح وحفظه الآن، فلن تتمكن من رؤيته مرة أخرى لأسباب أمنية.
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">مفتاح الـ API:</span>
                <button
                  type="button"
                  onClick={() => onCopyToClipboard(newlyCreatedRawKey)}
                  className="text-xs text-primary flex items-center gap-1"
                >
                  {copiedKey ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedKey ? "تم النسخ" : "نسخ المفتاح"}</span>
                </button>
              </div>
              <pre className="bg-muted p-2.5 rounded-lg text-xs font-mono break-all text-foreground select-all">
                {newlyCreatedRawKey}
              </pre>
            </div>

            <div className="flex justify-end">
              <Button size="sm" onClick={onClose}>
                تم الحفظ وإغلاق
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
