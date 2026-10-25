import React from "react";
import { Key, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { ApiKeyItem } from "./types";

interface HRApiKeysTabProps {
  loading: boolean;
  keys: ApiKeyItem[];
  onRevokeKey: (id: string) => void;
}

export const HRApiKeysTab: React.FC<HRApiKeysTabProps> = ({
  loading,
  keys,
  onRevokeKey,
}) => {
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="p-8 text-center text-muted-foreground">جاري تحميل المفاتيح…</div>
      ) : keys.length === 0 ? (
        <div className="border border-dashed border-border/60 rounded-xl p-8 text-center space-y-3">
          <Key className="h-10 w-10 text-muted-foreground/60 mx-auto" />
          <div className="text-sm font-medium">لا توجد مفاتيح API حتى الآن</div>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            قم بإنشاء مفتاح للربط مع أجهزة البصمة، أو التكامل مع أنظمة ERP، أو تفويض وكلاء الذكاء الاصطناعي.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {keys.map((k) => (
            <div
              key={k.id}
              className="bg-card border border-border/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{k.name}</span>
                  <Badge variant={k.isActive ? "default" : "secondary"} className="text-xs">
                    {k.isActive ? "نشط" : "ملغي"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>البادئة:</span>
                  <code className="bg-muted px-2 py-0.5 rounded text-foreground font-semibold font-mono tabular-nums">
                    {k.keyPrefix}****
                  </code>
                </div>
                <div className="text-xs text-muted-foreground">
                  تاريخ الإنشاء:{" "}
                  <span className="font-mono tabular-nums">
                    {new Date(k.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                  {k.lastUsedAt && (
                    <>
                      {" — آخر استخدام: "}
                      <span className="font-mono tabular-nums">
                        {new Date(k.lastUsedAt).toLocaleDateString("ar-EG")}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {k.isActive && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onRevokeKey(k.id)}
                    className="text-xs flex items-center gap-1 active:scale-95"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>إلغاء المفتاح</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
