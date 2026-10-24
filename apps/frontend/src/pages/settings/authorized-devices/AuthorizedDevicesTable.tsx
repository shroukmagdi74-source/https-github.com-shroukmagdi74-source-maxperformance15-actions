import React from "react";
import type { UserDevice } from "./types";
import { AuthorizedDeviceRow } from "./AuthorizedDeviceRow";
import { AuthorizedDevicesEmptyState } from "./AuthorizedDevicesEmptyState";

interface AuthorizedDevicesTableProps {
  devices: UserDevice[];
  loading: boolean;
  updatingId: string | null;
  copiedId: string | null;
  onToggleDeviceType: (device: UserDevice) => void;
  onToggleApproval: (device: UserDevice) => void;
  onDeleteDevice: (device: UserDevice) => void;
  onCopyFingerprint: (fingerprint: string, id: string) => void;
}

export const AuthorizedDevicesTable: React.FC<AuthorizedDevicesTableProps> = ({
  devices,
  loading,
  updatingId,
  copiedId,
  onToggleDeviceType,
  onToggleApproval,
  onDeleteDevice,
  onCopyFingerprint,
}) => {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
      {devices.length === 0 ? (
        <AuthorizedDevicesEmptyState loading={loading} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">الجهاز والنظام</th>
                <th className="py-3 px-4">الموظف المالك</th>
                <th className="py-3 px-4">بصمة الجهاز</th>
                <th className="py-3 px-4 text-center">نوع الجهاز</th>
                <th className="py-3 px-4 text-center">الحالة</th>
                <th className="py-3 px-4">آخر نشاط</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {devices.map((device) => (
                <AuthorizedDeviceRow
                  key={device.id}
                  device={device}
                  updatingId={updatingId}
                  copiedId={copiedId}
                  onToggleDeviceType={onToggleDeviceType}
                  onToggleApproval={onToggleApproval}
                  onDeleteDevice={onDeleteDevice}
                  onCopyFingerprint={onCopyFingerprint}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
