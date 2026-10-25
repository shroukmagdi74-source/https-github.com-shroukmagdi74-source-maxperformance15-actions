import React from "react";
import { Clock, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import type { ShiftStats } from "./types";

interface ShiftsStatsGridProps {
  stats: ShiftStats;
}

export const ShiftsStatsGrid: React.FC<ShiftsStatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-none shadow-sm bg-white dark:bg-gray-800/80 overflow-hidden group hover:shadow-md transition-all">
        <div className="h-1 w-full bg-blue-500 opacity-60" />
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              الإجمالي
            </p>
            <p className="text-2xl font-black text-gray-800 dark:text-gray-100 font-mono tabular-nums">
              {stats.total}
            </p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
            <Clock className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-800/80 overflow-hidden group hover:shadow-md transition-all">
        <div className="h-1 w-full bg-emerald-500 opacity-60" />
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              نشطة
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {stats.active}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-800/80 overflow-hidden group hover:shadow-md transition-all">
        <div className="h-1 w-full bg-gray-400 opacity-60" />
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              معطلة
            </p>
            <p className="text-2xl font-black text-gray-600 dark:text-gray-300 font-mono tabular-nums">
              {stats.inactive}
            </p>
          </div>
          <div className="p-3 bg-gray-100 dark:bg-gray-700/60 rounded-2xl text-gray-500 dark:text-gray-400 group-hover:scale-110 transition-transform">
            <Clock className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white dark:bg-gray-800/80 overflow-hidden group hover:shadow-md transition-all">
        <div className="h-1 w-full bg-purple-500 opacity-60" />
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              الموظفين
            </p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono tabular-nums">
              {stats.totalAssignments}
            </p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform">
            <Users className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
