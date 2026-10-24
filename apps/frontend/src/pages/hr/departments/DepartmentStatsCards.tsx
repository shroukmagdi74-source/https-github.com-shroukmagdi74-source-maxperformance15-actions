import React from "react";
import { Building2, Activity, Users } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { motion } from "framer-motion";

interface DepartmentStatsCardsProps {
  totalDepartments: number;
  activeDepartments: number;
  totalEmployees: number;
}

export const DepartmentStatsCards: React.FC<DepartmentStatsCardsProps> = ({
  totalDepartments,
  activeDepartments,
  totalEmployees,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900 overflow-hidden relative group">
        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Building2 className="h-16 w-16 text-blue-600" />
        </div>
        <CardContent className="p-6 relative">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">
            إجمالي الأقسام
          </p>
          <h3 className="text-4xl font-black mt-2 text-blue-600 dark:text-blue-400 font-mono tabular-nums">
            {totalDepartments}
          </h3>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900 overflow-hidden relative group">
        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Activity className="h-16 w-16 text-emerald-600" />
        </div>
        <CardContent className="p-6 relative">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">
            الأقسام النشطة
          </p>
          <h3 className="text-4xl font-black mt-2 text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {activeDepartments}
          </h3>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900 overflow-hidden relative group">
        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Users className="h-16 w-16 text-purple-600" />
        </div>
        <CardContent className="p-6 relative">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">
            إجمالي الموظفين
          </p>
          <h3 className="text-4xl font-black mt-2 text-purple-600 dark:text-purple-400 font-mono tabular-nums">
            {totalEmployees}
          </h3>
        </CardContent>
      </Card>
    </motion.div>
  );
};
