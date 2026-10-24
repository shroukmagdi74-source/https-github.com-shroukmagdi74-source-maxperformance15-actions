import React from "react";
import type { OrderStatus } from "./types";
import { StatusCardView } from "./StatusCardView";
import { StatusCardEdit } from "./StatusCardEdit";

export interface StatusCardProps {
  status: OrderStatus;
  index: number;
  totalCount: number;
  isEditing: boolean;
  editingStatus: OrderStatus | null;
  setEditingStatus: (status: OrderStatus | null) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onUpdate: (status: OrderStatus) => void;
  onDelete: (id: string) => void;
  onToggleAllowEdit: (status: OrderStatus) => void;
}

export function StatusCard({
  status,
  index,
  totalCount,
  isEditing,
  editingStatus,
  setEditingStatus,
  onMove,
  onUpdate,
  onDelete,
  onToggleAllowEdit,
}: StatusCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/80 p-4 shadow-xs hover:shadow-sm transition-shadow">
      {isEditing && editingStatus ? (
        <StatusCardEdit
          editingStatus={editingStatus}
          setEditingStatus={setEditingStatus}
          onSave={onUpdate}
          onCancel={() => setEditingStatus(null)}
        />
      ) : (
        <StatusCardView
          status={status}
          index={index}
          totalCount={totalCount}
          onMove={onMove}
          onEdit={(s) => setEditingStatus(s)}
          onDelete={onDelete}
          onToggleAllowEdit={onToggleAllowEdit}
        />
      )}
    </div>
  );
}