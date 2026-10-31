import React from "react";
import {
  PlusIcon,
  PhotoIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  PaperClipIcon,
  BoltIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  ChartBarIcon,
  Bars3Icon,
  ListBulletIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { Mic } from "lucide-react";
import { MessageInputProps } from "./types";

interface MobileToolsMenuProps {
  showMobileTools: boolean;
  setShowMobileTools: React.Dispatch<React.SetStateAction<boolean>>;
  mobileMenuRef: React.RefObject<HTMLDivElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onStartVoiceRecording: () => void;
  onOpenQuickReplies: () => void;
  uploadingFile: boolean;
  props: MessageInputProps;
}

interface ToolItemConfig {
  show: boolean;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  onClick: () => void;
  disabled?: boolean;
}

export const MobileToolsMenu: React.FC<MobileToolsMenuProps> = ({
  showMobileTools,
  setShowMobileTools,
  mobileMenuRef,
  fileInputRef,
  onStartVoiceRecording,
  onOpenQuickReplies,
  uploadingFile,
  props,
}) => {
  const {
    onOpenImageGallery,
    onOpenTextGallery,
    onOpenProductPicker,
    onSendFile,
    onOpenOrder,
    onOpenServiceOrder,
    onOpenTasks,
    onOpenInteractive,
    onOpenPoll,
    onOpenButtons,
    onOpenList,
    onOpenTemplate,
    onOpenLocation,
    onOpenCatalog,
  } = props;

  const toolItems: ToolItemConfig[] = [
    {
      show: Boolean(onOpenImageGallery),
      label: "معرض الصور",
      sublabel: "إرسال صور من الحافظة",
      icon: PhotoIcon,
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
      onClick: () => onOpenImageGallery?.(),
    },
    {
      show: Boolean(onOpenTextGallery),
      label: "النصوص والقوالب",
      sublabel: "ردود مجهزة مسبقاً",
      icon: DocumentTextIcon,
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
      onClick: () => onOpenTextGallery?.(),
    },
    {
      show: Boolean(onOpenProductPicker),
      label: "اختيار منتج",
      sublabel: "مشاركة كارت منتج",
      icon: ShoppingBagIcon,
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
      onClick: () => onOpenProductPicker?.(),
    },
    {
      show: Boolean(onSendFile),
      label: "تسجيل صوتي",
      sublabel: "تسجيل رسالة صوتية",
      icon: Mic,
      iconBg: "bg-rose-500/20",
      iconColor: "text-rose-400",
      onClick: onStartVoiceRecording,
      disabled: uploadingFile,
    },
    {
      show: Boolean(onSendFile),
      label: "إرفاق ملف",
      sublabel: "صور أو مستندات أو صوت",
      icon: PaperClipIcon,
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400",
      onClick: () => fileInputRef.current?.click(),
      disabled: uploadingFile,
    },
    {
      show: true,
      label: "الردود السريعة",
      sublabel: "قائمة الردود (/)",
      icon: BoltIcon,
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
      onClick: onOpenQuickReplies,
    },
    {
      show: Boolean(onOpenOrder),
      label: "إنشاء طلب سريع",
      sublabel: "تسجيل أوردر للعميل",
      icon: ShoppingCartIcon,
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
      onClick: () => onOpenOrder?.(),
    },
    {
      show: Boolean(onOpenServiceOrder),
      label: "طلب صيانة / خدمة",
      sublabel: "خدمات فنية ودعم",
      icon: ClipboardDocumentListIcon,
      iconBg: "bg-cyan-500/20",
      iconColor: "text-cyan-400",
      onClick: () => onOpenServiceOrder?.(),
    },
    {
      show: Boolean(onOpenTasks),
      label: "إدارة المهام",
      sublabel: "إسناد مهمة للفريق",
      icon: SparklesIcon,
      iconBg: "bg-violet-500/20",
      iconColor: "text-violet-400",
      onClick: () => onOpenTasks?.(),
    },
    {
      show: Boolean(onOpenInteractive),
      label: "رسائل تفاعلية",
      sublabel: "كوبون، رابط، أو اتصال",
      icon: SparklesIcon,
      iconBg: "bg-pink-500/20",
      iconColor: "text-pink-400",
      onClick: () => onOpenInteractive?.(),
    },
    {
      show: Boolean(onOpenPoll),
      label: "استطلاع رأي",
      sublabel: "تصويت واستبيان",
      icon: ChartBarIcon,
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
      onClick: () => onOpenPoll?.(),
    },
    {
      show: Boolean(onOpenButtons),
      label: "أزرار سريعة",
      sublabel: "خيارات سريعة للعميل",
      icon: Bars3Icon,
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
      onClick: () => onOpenButtons?.(),
    },
    {
      show: Boolean(onOpenList),
      label: "رسالة قائمة",
      sublabel: "قائمة اختيارات متعددة",
      icon: ListBulletIcon,
      iconBg: "bg-teal-500/20",
      iconColor: "text-teal-400",
      onClick: () => onOpenList?.(),
    },
    {
      show: Boolean(onOpenTemplate),
      label: "قوالب الرسائل",
      sublabel: "قوالب رسمية معتمدة",
      icon: DocumentTextIcon,
      iconBg: "bg-indigo-500/20",
      iconColor: "text-indigo-400",
      onClick: () => onOpenTemplate?.(),
    },
    {
      show: Boolean(onOpenLocation),
      label: "إرسال موقع",
      sublabel: "موقع المتجر أو الفرع",
      icon: MapPinIcon,
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
      onClick: () => onOpenLocation?.(),
    },
    {
      show: Boolean(onOpenCatalog),
      label: "كتالوج المنتجات",
      sublabel: "كتالوج واتساب",
      icon: BuildingStorefrontIcon,
      iconBg: "bg-teal-500/20",
      iconColor: "text-teal-400",
      onClick: () => onOpenCatalog?.(),
    },
  ];

  return (
    <div className="relative flex-shrink-0 sm:hidden" ref={mobileMenuRef}>
      <button
        type="button"
        onClick={() => setShowMobileTools((prev) => !prev)}
        className={`business-icon-button flex h-[38px] w-[38px] items-center justify-center rounded-xl transition-all duration-200 ${
          showMobileTools ? "text-white" : "text-foreground"
        }`}
        style={{
          background: showMobileTools
            ? "var(--color-primary)"
            : "color-mix(in srgb, var(--color-foreground) 8%, transparent)",
          transform: showMobileTools ? "rotate(45deg)" : "none",
        }}
        title="المرفقات والأدوات"
        aria-label="المرفقات والأدوات"
      >
        <PlusIcon className="h-5 w-5" />
      </button>

      {/* Mobile Tools Popover */}
      {showMobileTools && (
        <div
          className="absolute bottom-[calc(100%+8px)] start-0 z-50 min-w-[210px] max-w-[260px] rounded-2xl p-1.5 shadow-2xl border animate-in fade-in zoom-in-95 duration-150"
          style={{
            background: "var(--business-surface-strong, #182234)",
            borderColor: "var(--business-card-border, rgba(255,255,255,0.12))",
            boxShadow: "0 12px 36px -4px rgba(0, 0, 0, 0.45)",
          }}
        >
          <div className="px-2.5 py-1 text-[11px] font-semibold text-muted-foreground border-b border-white/10 flex items-center justify-between mb-1">
            <span>أدوات المحادثة</span>
            <span className="text-[10px] opacity-70">مرفقات سريعة</span>
          </div>

          <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto">
            {toolItems
              .filter((item) => item.show)
              .map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => {
                      setShowMobileTools(false);
                      item.onClick();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-xs font-medium text-foreground transition-colors hover:bg-white/10 active:bg-white/15 disabled:opacity-50"
                  >
                    <div
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold text-xs truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {item.sublabel}
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
