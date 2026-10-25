import React from "react";
import { DollarSign, Users, Pencil, Trash2, ChevronLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Benefit } from "./types";
import { getTypeIcon, getTypeLabel } from "./helpers";

interface BenefitCardProps {
  benefit: Benefit;
  onClick: () => void;
  onEdit: (benefit: Benefit) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({
  benefit,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="group relative" onClick={onClick}>
      <Card className="relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer group bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl ring-1 ring-gray-100 dark:ring-white/5 h-full rounded-3xl">
        {/* Visual Gradient Bottom */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-l from-primary via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-none group-hover:scale-110 transition-transform duration-500">
              {getTypeIcon(benefit.type)}
            </div>
            <div className="flex gap-1">
              {benefit.isActive ? (
                <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-none font-bold">
                  نشط
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                >
                  متوقف
                </Badge>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(benefit);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                onClick={(e) => onDelete(e, benefit.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-2xl font-black mt-6 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
            {benefit.name}
          </CardTitle>
          <CardDescription className="line-clamp-2 min-h-[48px] mt-2 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            {benefit.description || "لا يوجد وصف متاح لهذه الميزة"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-0">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="rounded-lg font-bold px-3 py-1 border-primary/10 bg-primary/5 text-primary"
            >
              {getTypeLabel(benefit.type)}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest leading-none mb-1">
                  التكلفة
                </p>
                <p className="font-black text-gray-900 dark:text-gray-100 font-mono tabular-nums">
                  {benefit.cost?.toLocaleString() || 0}{" "}
                  <span className="text-xs font-bold text-gray-400">
                    {benefit.currency}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-left flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest leading-none mb-1">
                  المشتركون
                </p>
                <p className="font-black text-orange-600 dark:text-orange-400 leading-none font-mono tabular-nums">
                  {benefit.activeEnrollments || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
        </CardContent>

        <div className="px-6 py-4 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center group-hover:bg-primary/5 transition-colors">
          <div className="flex -space-x-2 rtl:space-x-reverse">
            {[...Array(Math.min(3, benefit.activeEnrollments || 0))].map(
              (_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary uppercase"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ),
            )}
          </div>
          <span className="text-xs font-black text-primary flex items-center gap-2">
            عرض التفاصيل
            <ChevronLeft className="h-4 w-4" />
          </span>
        </div>
      </Card>
    </div>
  );
};
