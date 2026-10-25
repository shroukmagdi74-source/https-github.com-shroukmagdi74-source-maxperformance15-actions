import React from "react";
import {
  CheckIcon,
  TrashIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { BULK_STATUS_OPTIONS } from "./helpers";

interface AssetListBulkActionsBarProps {
  selectedIds: string[];
  onDeleteSelected: (ids: string[]) => void;
  onStatusChangeSelected: (statusKey: string, statusLabel: string) => void;
  onClearSelection: () => void;
}

export const AssetListBulkActionsBar: React.FC<
  AssetListBulkActionsBarProps
> = ({
  selectedIds,
  onDeleteSelected,
  onStatusChangeSelected,
  onClearSelection,
}) => {
  return (
    <AnimatePresence>
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-[#1a1040] to-[#251858] text-white px-6 py-3.5 rounded-2xl shadow-2xl shadow-violet-900/40 border border-white/10 flex items-center gap-5 backdrop-blur-xl">
            {/* Counter */}
            <div className="flex items-center gap-3 border-l border-white/10 pl-5">
              <div className="p-2 bg-violet-500/30 rounded-lg">
                <CheckIcon className="h-5 w-5 text-violet-300" />
              </div>
              <span className="font-bold text-sm whitespace-nowrap">
                <span className="font-mono tabular-nums">
                  {selectedIds.length}
                </span>{" "}
                عنصر محدد
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDeleteSelected(selectedIds)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-300 hover:text-white border border-red-400/20 hover:border-red-500 rounded-xl transition-all duration-200 font-medium text-sm group"
              >
                <TrashIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">حذف</span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl transition-all font-medium text-sm">
                  <span className="hidden sm:inline">تغيير الحالة</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  className="w-44 bg-[#251854] border border-white/10 p-1"
                >
                  {BULK_STATUS_OPTIONS.map((status) => (
                    <DropdownMenuItem
                      key={status.key}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-right text-white focus:bg-white/10"
                      onSelect={() =>
                        onStatusChangeSelected(status.key, status.label)
                      }
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${status.dot}`}
                      ></div>
                      <span className="flex-1">{status.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                onClick={onClearSelection}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
                title="إلغاء التحديد"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
