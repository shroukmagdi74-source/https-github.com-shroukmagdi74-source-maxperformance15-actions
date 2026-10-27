import React, { useEffect } from "react";
import { XMarkIcon, CommandLineIcon } from "@heroicons/react/24/outline";
import { STUDIO_KEYMAP, type StudioShortcutItem } from "./utils/studioKeymap";

interface StudioShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: StudioShortcutItem[];
}

export const StudioShortcutsModal: React.FC<StudioShortcutsModalProps> = ({
  isOpen,
  onClose,
  shortcuts = STUDIO_KEYMAP,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      data-testid="studio-shortcuts-modal"
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-[#2d3139] bg-[#16181d] text-[#e8eaee] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252830] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2b6cf6]/15 text-[#60a5fa] border border-[#2b6cf6]/30">
              <CommandLineIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 id="shortcuts-modal-title" className="text-sm font-bold text-white">
                اختصارات لوحة المفاتيح
              </h2>
              <p className="text-[11px] text-[#9ba0a8]">
                جميع الاختصارات السريعة لتسريع التحرير والتحكم في الاستوديو
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-shortcuts-modal"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9ba0a8] hover:bg-[#202226] hover:text-white transition-colors"
            title="إغلاق (Esc)"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-[#252830] text-[11px] font-semibold text-[#808791]">
                <th className="pb-2 font-medium">الوظيفة</th>
                <th className="pb-2 font-medium">الوصف</th>
                <th className="pb-2 font-medium text-left">المفتاح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20232a] text-xs">
              {shortcuts.map((shortcut) => (
                <tr
                  key={shortcut.id}
                  data-testid="shortcut-row"
                  className="hover:bg-[#1d2026] transition-colors"
                >
                  <td className="py-2.5 font-medium text-white">{shortcut.label}</td>
                  <td className="py-2.5 text-[#9ba0a8] text-[11.5px]">{shortcut.description}</td>
                  <td className="py-2.5 text-left">
                    <kbd className="inline-block rounded-md border border-[#353942] bg-[#22252c] px-2 py-0.5 text-[11px] font-mono font-semibold text-[#e1e4ea] shadow-sm">
                      {shortcut.displayKey}
                    </kbd>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-[#252830] bg-[#121317] px-5 py-2.5 flex items-center justify-between text-[11px] text-[#808791]">
          <span>إجمالي الاختصارات: {shortcuts.length}</span>
          <span className="font-mono text-[10px]">اضغط ? في أي وقت لفتح هذه اللوحة</span>
        </div>
      </div>
    </div>
  );
};
