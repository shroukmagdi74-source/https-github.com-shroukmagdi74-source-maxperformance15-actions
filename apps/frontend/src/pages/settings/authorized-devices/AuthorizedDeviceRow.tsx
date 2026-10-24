import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Laptop,
  Building2,
  ShieldCheck,
  Trash2,
  Copy,
  Check,
  Smartphone,
  Globe,
} from "lucide-react";
import type { UserDevice } from "./types";

interface AuthorizedDeviceRowProps {
  device: UserDevice;
  updatingId: string | null;
  copiedId: string | null;
  onToggleDeviceType: (device: UserDevice) => void;
  onToggleApproval: (device: UserDevice) => void;
  onDeleteDevice: (device: UserDevice) => void;
  onCopyFingerprint: (fingerprint: string, id: string) => void;
}

export const AuthorizedDeviceRow: React.FC<AuthorizedDeviceRowProps> = ({
  device,
  updatingId,
  copiedId,
  onToggleDeviceType,
  onToggleApproval,
  onDeleteDevice,
  onCopyFingerprint,
}) => {
  const isOffice = device.deviceType === "OFFICE";
  const isUpdating = updatingId === device.id;

  const renderClientIcon = (clientType: string) => {
    switch (clientType?.toUpperCase()) {
      case "DESKTOP":
        return <Laptop className="w-4 h-4 text-sky-500" />;
      case "MOBILE":
        return <Smartphone className="w-4 h-4 text-emerald-500" />;
      default:
        return <Globe className="w-4 h-4 text-violet-500" />;
    }
  };

  return (
    <tr
      className={`hover:bg-muted/20 transition-colors ${
        !device.isApproved ? "opacity-60 bg-red-500/5" : ""
      }`}
    >
      {/* Device Name & OS */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {renderClientIcon(device.clientType)}
          <div>
            <span className="font-semibold text-foreground block">
              {device.deviceName}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
              {device.osVersion || "Windows"}
              {device.appVersion ? ` · v${device.appVersion}` : ""}
            </span>
          </div>
        </div>
      </td>

      {/* Employee */}
      <td className="py-3 px-4">
        {device.user ? (
          <div>
            <span className="font-medium text-foreground block">
              {device.user.firstName} {device.user.lastName}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              {device.user.email}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">غير محدد</span>
        )}
      </td>

      {/* Fingerprint */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
          <span className="truncate max-w-[110px]" title={device.fingerprint}>
            {device.fingerprint.slice(0, 14)}…
          </span>
          <button
            type="button"
            onClick={() => onCopyFingerprint(device.fingerprint, device.id)}
            className="text-muted-foreground hover:text-foreground p-1 rounded"
            title="نسخ البصمة"
          >
            {copiedId === device.id ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </td>

      {/* Device Type Toggle (Clean UI, ZERO EMOJIS) */}
      <td className="py-3 px-4 text-center">
        <button
          type="button"
          onClick={() => onToggleDeviceType(device)}
          disabled={isUpdating}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
            isOffice
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
          }`}
          title="اضغط للتبديل بين مكتب وشخصي"
        >
          {isOffice ? (
            <>
              <Building2 className="w-3 h-3" />
              <span>مكتب</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3 h-3" />
              <span>شخصي</span>
            </>
          )}
        </button>
      </td>

      {/* Approval Status */}
      <td className="py-3 px-4 text-center">
        <div className="inline-flex items-center gap-2">
          <Switch
            checked={device.isApproved}
            onCheckedChange={() => onToggleApproval(device)}
            disabled={isUpdating}
            aria-label="Toggle device approval"
          />
          <span
            className={`text-[10px] font-medium ${
              device.isApproved ? "text-emerald-500" : "text-destructive"
            }`}
          >
            {device.isApproved ? "مفعّل" : "محظور"}
          </span>
        </div>
      </td>

      {/* Last Active */}
      <td className="py-3 px-4 font-mono text-[11px] tabular-nums text-muted-foreground">
        {device.lastActiveAt
          ? new Date(device.lastActiveAt).toLocaleString("ar-EG", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"}
      </td>

      {/* Delete Action */}
      <td className="py-3 px-4 text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDeleteDevice(device)}
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="حذف الجهاز"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </td>
    </tr>
  );
};
