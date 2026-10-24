import React from "react";
import {
  BarChart3,
  Calculator,
  ExternalLink,
  Kanban,
  Megaphone,
  MessageCircle,
  Search,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";

interface AgencySuiteTabProps {
  onNavigate: (path: string) => void;
}

export const AgencySuiteTab: React.FC<AgencySuiteTabProps> = ({ onNavigate }) => {
  const tools = [
    {
      title: "إعلانات ميتا (Facebook Ads Pro)",
      desc: "إطلاق الحملات وتتبع النتائج والـ ROAS لحسابات عملائك.",
      icon: Megaphone,
      color: "bg-blue-500/10 text-blue-600",
      path: "/advertising/facebook-ads",
    },
    {
      title: "الإنبوكس الموحد (Unified Inbox)",
      desc: "إدارة محادثات واتساب وفيسبوك وإنستجرام وتليجرام في شاشة واحدة.",
      icon: MessageCircle,
      color: "bg-emerald-500/10 text-emerald-600",
      path: "/unified-inbox",
    },
    {
      title: "لوحة مهام الفريق (Kanban OS)",
      desc: "توزيع مهام الميديا بايينج والتصميم على أعضاء الفريق ومتابعة التنفيذ.",
      icon: Kanban,
      color: "bg-amber-500/10 text-amber-600",
      path: "/tasks/kanban",
    },
    {
      title: "الأرباح والخسائر (P&L Engine)",
      desc: "حساب صافي ربح الوكالة ومصاريف التشغيل والرواتب.",
      icon: Calculator,
      color: "bg-indigo-500/10 text-indigo-600",
      path: "/tools/monthly-pnl",
    },
    {
      title: "مخطط ميزانيات الإعلانات",
      desc: "تقدير تكاليف الحملات وتوزيع الميزانية على القنوات المختلفة.",
      icon: BarChart3,
      color: "bg-purple-500/10 text-purple-600",
      path: "/tools/ad-budget-planner",
    },
    {
      title: "تحليل المنافسين",
      desc: "مراقبة إعلانات المنافسين ومكتبة الإعلانات لاقتناص الأفكار.",
      icon: Search,
      color: "bg-teal-500/10 text-teal-600",
      path: "/competitors",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-3.5 sm:p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-1">
        <h3 className="font-black text-sm text-primary">الأدوات المتكاملة لوكالة التسويق</h3>
        <p className="text-xs text-muted-foreground">
          تكامل سلس ومباشر بين إدارة العملاء وباقي منظومة MaxP للإعلانات، المحادثات، والمهام.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.title}
              className="hover:border-primary/50 transition-all cursor-pointer active:scale-[0.99] touch-manipulation shadow-xs"
              onClick={() => onNavigate(tool.path)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${tool.color}`}>
                  <Icon className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-black text-xs text-foreground flex items-center gap-1">
                    {tool.title}
                    <ExternalLink className="size-3 text-muted-foreground" />
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
