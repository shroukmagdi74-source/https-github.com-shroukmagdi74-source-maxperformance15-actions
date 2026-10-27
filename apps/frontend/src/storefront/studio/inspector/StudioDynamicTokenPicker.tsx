import React, { useState, useRef, useEffect } from "react";
import { DYNAMIC_TOKENS, type DynamicTokenOption } from "../utils/dynamicValues";

export interface StudioDynamicTokenPickerProps {
  currentValue?: string;
  onSelectToken: (token: string) => void;
  className?: string;
  buttonAriaLabel?: string;
}

export const StudioDynamicTokenPicker: React.FC<StudioDynamicTokenPickerProps> = ({
  currentValue = "",
  onSelectToken,
  className = "",
  buttonAriaLabel = "ربط بقيمة ديناميكية",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"product" | "collection" | "page" | "store" | "custom">("product");
  const [customKey, setCustomKey] = useState("");
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const isBound = Boolean(currentValue && currentValue.includes("{{"));

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const handleInsertToken = (token: string) => {
    onSelectToken(token);
    setIsOpen(false);
  };

  const handleInsertCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customKey.trim().replace(/^\{\{|\}\}$/g, "");
    if (clean) {
      handleInsertToken(`{{custom.${clean}}}`);
      setCustomKey("");
    }
  };

  const filteredTokens = DYNAMIC_TOKENS.filter((t) => t.group === activeTab);

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={popoverRef}>
      <button
        type="button"
        data-testid="btn-dynamic-tag-picker"
        data-bound={isBound ? "true" : "false"}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={buttonAriaLabel}
        title={isBound ? "الحقل مرتبط بقيمة ديناميكية — اضغط لتعديل التوكن" : "ربط بقيمة ديناميكية (Dynamic Tag)"}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-colors ${
          isBound
            ? "border-[#2b6cf6] bg-[#2b6cf6]/10 text-[#2b6cf6] font-bold"
            : "border-[#ececee] bg-[#f6f7f8] text-[#6f747b] hover:border-[#2b6cf6] hover:text-[#2b6cf6]"
        }`}
      >
        <span className="text-[10px] font-mono leading-none">{`{ }`}</span>
      </button>

      {isOpen && (
        <div
          data-testid="dynamic-token-popover"
          className="absolute end-0 top-full z-50 mt-1 w-64 rounded-xl border border-[#ececee] bg-white p-2.5 shadow-xl select-none text-[11px] text-[#17181c]"
          style={{ minWidth: "240px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-[#ececee] mb-2">
            <span className="font-bold text-[#17181c] text-[11px]">ربط حقل بقيمة ديناميكية</span>
            <span className="text-[9.5px] font-mono text-[#8a8f96]">Dynamic Tag</span>
          </div>

          {/* Group Tabs */}
          <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {(
              [
                { id: "product", label: "منتج" },
                { id: "collection", label: "مجموعة" },
                { id: "page", label: "صفحة" },
                { id: "store", label: "متجر" },
                { id: "custom", label: "مخصص" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#2b6cf6] text-white"
                    : "bg-[#f6f7f8] text-[#6f747b] hover:bg-[#ececee]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Token List */}
          {activeTab !== "custom" ? (
            <div className="space-y-1 max-h-44 overflow-y-auto [scrollbar-width:thin]">
              {filteredTokens.map((item: DynamicTokenOption) => (
                <button
                  key={item.token}
                  type="button"
                  data-testid={`token-option-${item.token.replace(/[{}.]/g, "-")}`}
                  onClick={() => handleInsertToken(item.token)}
                  className="w-full flex flex-col items-start gap-0.5 rounded-lg px-2 py-1.5 text-start hover:bg-[#f6f7f8] border border-transparent hover:border-[#ececee] transition-all"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-[#17181c]">{item.label}</span>
                    <span className="text-[9.5px] font-mono text-[#2b6cf6] bg-[#2b6cf6]/10 px-1 rounded">
                      {item.token}
                    </span>
                  </div>
                  {item.example && (
                    <span className="text-[9.5px] text-[#8a8f96] truncate max-w-[200px]">
                      مثال: {item.example}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleInsertCustom} className="space-y-2 pt-1">
              <label className="block text-[10px] font-semibold text-[#6f747b]">
                اسم المفتاح المخصص (Custom Key):
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-[#8a8f96]">{"{{custom."}</span>
                <input
                  type="text"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="badge_text"
                  className="flex-1 rounded border border-[#ececee] bg-[#f6f7f8] px-2 py-1 text-[11px] font-mono outline-none focus:border-[#2b6cf6] focus:bg-white"
                />
                <span className="text-[10px] font-mono text-[#8a8f96]">{"}}"}</span>
              </div>
              <button
                type="submit"
                className="w-full rounded bg-[#2b6cf6] py-1 text-[10.5px] font-bold text-white hover:bg-[#2058d4] transition-colors"
              >
                إدراج التوكن
              </button>
            </form>
          )}

          {isBound && (
            <div className="mt-2 pt-2 border-t border-[#ececee] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onSelectToken("");
                  setIsOpen(false);
                }}
                className="text-[10px] text-red-500 hover:underline"
              >
                إلغاء الربط وإفراغ الحقل
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
