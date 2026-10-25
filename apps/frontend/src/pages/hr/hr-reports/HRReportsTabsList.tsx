import React from "react";
import {
  Clock,
  Calendar,
  DollarSign,
  AlertTriangle,
  BookOpen,
  Activity,
  Award,
  TrendingUp,
  Shuffle,
  Users,
} from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export const HRReportsTabsList: React.FC = () => {
  return (
    <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent border-none">
      <TabsTrigger
        value="attendance"
        className="flex items-center gap-2 border data-[state=active]:bg-primary data-[state=active]:text-white"
      >
        <Clock className="h-4 w-4" />
        الحضور
      </TabsTrigger>
      <TabsTrigger
        value="leaves"
        className="flex items-center gap-2 border data-[state=active]:bg-primary data-[state=active]:text-white"
      >
        <Calendar className="h-4 w-4" />
        الإجازات
      </TabsTrigger>
      <TabsTrigger
        value="payroll"
        className="flex items-center gap-2 border data-[state=active]:bg-primary data-[state=active]:text-white"
      >
        <DollarSign className="h-4 w-4" />
        الرواتب
      </TabsTrigger>
      <TabsTrigger
        value="warnings"
        className="flex items-center gap-2 border data-[state=active]:bg-primary data-[state=active]:text-white"
      >
        <AlertTriangle className="h-4 w-4" />
        الإنذارات
      </TabsTrigger>
      <TabsTrigger
        value="training"
        className="flex items-center gap-2 border data-[state=active]:bg-primary data-[state=active]:text-white"
      >
        <BookOpen className="h-4 w-4" />
        التدريب
      </TabsTrigger>
      <TabsTrigger
        value="performance"
        className="flex items-center gap-2 border data-[state=active]:bg-primary data-[state=active]:text-white"
      >
        <Activity className="h-4 w-4" />
        الأداء
      </TabsTrigger>
      <TabsTrigger
        value="kpis"
        className="flex items-center gap-2 border data-[state=active]:bg-primary data-[state=active]:text-white"
      >
        <Award className="h-4 w-4" />
        المؤشرات
      </TabsTrigger>
      <TabsTrigger
        value="late-absence"
        className="flex items-center gap-2 border data-[state=active]:bg-primary data-[state=active]:text-white"
      >
        <Clock className="h-4 w-4" />
        التأخير والغياب
      </TabsTrigger>
      <TabsTrigger
        value="overtime"
        className="flex items-center gap-2 border data-[state=active]:bg-primary data-[state=active]:text-white"
      >
        <TrendingUp className="h-4 w-4" />
        العمل الإضافي
      </TabsTrigger>
      <TabsTrigger
        value="turnover"
        className="flex items-center gap-2 border data-[state=active]:bg-primary data-[state=active]:text-white"
      >
        <Shuffle className="h-4 w-4" />
        معدل الدوران
      </TabsTrigger>
      <TabsTrigger
        value="employee"
        className="flex items-center gap-2 border data-[state=active]:bg-primary data-[state=active]:text-white"
      >
        <Users className="h-4 w-4" />
        تقارير الموظفين
      </TabsTrigger>
    </TabsList>
  );
};
