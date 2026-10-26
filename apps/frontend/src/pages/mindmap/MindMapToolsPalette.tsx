import React from "react";
import {
  Boxes,
  X,
  MousePointerClick,
  Calculator,
  GripVertical,
  Sparkles,
  Flame,
  CheckSquare,
  DollarSign,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import type { MindMapController } from "./useMindMapController";

interface ToolItemDef {
  type: string;
  label: string;
  badge: string;
  badgeColor: string;
}

interface ToolGroupDef {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  tools: ToolItemDef[];
}

const TOOL_GROUPS: ToolGroupDef[] = [
  {
    title: "1. التخطيط والحاسبات المالية",
    icon: Calculator,
    iconColor: "text-blue-400",
    tools: [
      {
        type: "calc_break_even",
        label: "حاسبة نقطة التعادل (Break-even)",
        badge: "حاسبة",
        badgeColor: "bg-blue-500/20 text-blue-300",
      },
      {
        type: "calc_budget",
        label: "مخطط الميزانية الإعلانية",
        badge: "ميزانية",
        badgeColor: "bg-blue-500/20 text-blue-300",
      },
    ],
  },
  {
    title: "2. المحتوى وصفحات المنتجات",
    icon: Sparkles,
    iconColor: "text-violet-400",
    tools: [
      {
        type: "creative_ai",
        label: "استوديو الصور والمحتوى (AI Hub)",
        badge: "AI",
        badgeColor: "bg-violet-500/20 text-violet-300",
      },
      {
        type: "store_pdp",
        label: "صفحة هبوط المنتج (PDP Storefront)",
        badge: "متجر",
        badgeColor: "bg-teal-500/20 text-teal-300",
      },
    ],
  },
  {
    title: "3. الإعلانات وقنوات التواصل",
    icon: Flame,
    iconColor: "text-indigo-400",
    tools: [
      {
        type: "ads_meta",
        label: "إعلانات فيسبوك وانستجرام",
        badge: "إعلانات",
        badgeColor: "bg-indigo-500/20 text-indigo-300",
      },
      {
        type: "chat_unified",
        label: "صندوق المحادثات الموحد (Inbox)",
        badge: "موحد",
        badgeColor: "bg-emerald-500/20 text-emerald-300",
      },
      {
        type: "chat_whatsapp",
        label: "بوت واتساب الرسمي السحابي",
        badge: "واتساب",
        badgeColor: "bg-emerald-500/20 text-emerald-300",
      },
    ],
  },
  {
    title: "4. العمليات والتأكيد والمخزن",
    icon: CheckSquare,
    iconColor: "text-amber-400",
    tools: [
      {
        type: "ops_confirmation",
        label: "تأكيد الطلبات ونسبة الإلغاء",
        badge: "تأكيد",
        badgeColor: "bg-amber-500/20 text-amber-300",
      },
      {
        type: "ops_warehouse",
        label: "تجهيز المستودع والشحن",
        badge: "مخزن",
        badgeColor: "bg-cyan-500/20 text-cyan-300",
      },
      {
        type: "ops_returns",
        label: "تحليل المرتجعات وأسبابها",
        badge: "مرتجعات",
        badgeColor: "bg-rose-500/20 text-rose-300",
      },
    ],
  },
  {
    title: "5. المالية وتحصيل الكاش P&L",
    icon: DollarSign,
    iconColor: "text-emerald-400",
    tools: [
      {
        type: "finance_cod",
        label: "أداء تحصيل الدفع عند الاستلام (COD)",
        badge: "COD",
        badgeColor: "bg-emerald-500/20 text-emerald-300",
      },
      {
        type: "finance_pnl",
        label: "الأرباح والخسائر الشهرية (P&L)",
        badge: "P&L",
        badgeColor: "bg-emerald-500/20 text-emerald-300",
      },
    ],
  },
  {
    title: "6. الجروث ماركتنج والسكيلينج",
    icon: TrendingUp,
    iconColor: "text-purple-400",
    tools: [
      {
        type: "growth_clv",
        label: "حاسبة القيمة الدائمة للعميل (CLV)",
        badge: "CLV",
        badgeColor: "bg-purple-500/20 text-purple-300",
      },
      {
        type: "growth_conversion",
        label: "مسار التحويل ومؤشرات الأداء",
        badge: "Funnel",
        badgeColor: "bg-purple-500/20 text-purple-300",
      },
    ],
  },
  {
    title: "7. التدريب والشرح المدمج",
    icon: GraduationCap,
    iconColor: "text-rose-400",
    tools: [
      {
        type: "training_video",
        label: "عقدة فيديو شرح وتدريب (SOP)",
        badge: "فيديو",
        badgeColor: "bg-rose-500/20 text-rose-300",
      },
    ],
  },
];

export const MindMapToolsPalette: React.FC<{ c: MindMapController }> = ({ c }) => {
  const { isSidePanelOpen, setIsSidePanelOpen, handleToolDragStart, addNodeFromPalette } = c;

  if (!isSidePanelOpen) return null;

  return (
    <aside className="fixed top-14 left-0 bottom-0 w-84 sm:w-96 bg-slate-900 border-r border-slate-800 shadow-2xl z-40 flex flex-col animate-slide-in-left">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-violet-400" />
          <div>
            <h3 className="font-bold text-sm text-white">أدوات السيناريو الكاملة (17 أداة)</h3>
            <p className="text-[11px] text-slate-400">اسحب الأداة وأفلتها في مكانها بالخريطة</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidePanelOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        <div className="p-2.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-slate-300 text-[11px] flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-violet-400 shrink-0" />
          <span>
            <strong>سحب وإفلات (Drag & Drop):</strong> اسحب أي أداة بالماوس وأفلتها في اللوحة لتستقر مكان
            الإفلات فوراً وتتصل بالمسار!
          </span>
        </div>

        {TOOL_GROUPS.map((group) => {
          const GroupIcon = group.icon;
          return (
            <div key={group.title}>
              <div className={`flex items-center gap-1.5 font-bold mb-2 ${group.iconColor}`}>
                <GroupIcon className="w-4 h-4" />
                <span>{group.title}</span>
              </div>
              <div className="space-y-1.5">
                {group.tools.map((tool) => (
                  <div
                    key={tool.type}
                    draggable
                    onDragStart={(e) => handleToolDragStart(e, tool.type)}
                    onClick={() => addNodeFromPalette(tool.type)}
                    className="cursor-grab active:cursor-grabbing p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 flex items-center justify-between text-slate-200 transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <GripVertical className="w-3.5 h-3.5 text-slate-500" /> {tool.label}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
