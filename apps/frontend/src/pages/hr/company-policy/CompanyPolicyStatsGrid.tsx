import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { FileText, CheckCircle, Clock, BookOpen } from "lucide-react";
import { Policy } from "./types";

interface CompanyPolicyStatsGridProps {
  policies: Policy[];
}

export const CompanyPolicyStatsGrid: React.FC<CompanyPolicyStatsGridProps> = ({
  policies,
}) => {
  const activeCount = policies.filter((p) => p.isActive).length;

  const recentUpdatesCount = policies.filter((p) => {
    const date = new Date(p.updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;

  const categoriesCount = new Set(policies.map((p) => p.category)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-md">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">إجمالي السياسات</p>
            <h3 className="text-2xl font-bold font-mono tabular-nums">
              {policies.length}
            </h3>
          </div>
          <div className="bg-white/20 p-2 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-md">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm mb-1">السياسات الفعالة</p>
            <h3 className="text-2xl font-bold font-mono tabular-nums">
              {activeCount}
            </h3>
          </div>
          <div className="bg-white/20 p-2 rounded-lg">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-md">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm mb-1">التحديثات الأخيرة</p>
            <h3 className="text-2xl font-bold font-mono tabular-nums">
              {recentUpdatesCount}
            </h3>
          </div>
          <div className="bg-white/20 p-2 rounded-lg">
            <Clock className="h-6 w-6 text-white" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-md">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm mb-1">فئات السياسات</p>
            <h3 className="text-2xl font-bold font-mono tabular-nums">
              {categoriesCount}
            </h3>
          </div>
          <div className="bg-white/20 p-2 rounded-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
