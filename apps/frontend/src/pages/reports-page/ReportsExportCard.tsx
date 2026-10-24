import React from "react";
import { Download, RefreshCw } from "lucide-react";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

interface ReportsExportCardProps {
  exporting: boolean;
  onExport: (type: string, format: string) => void;
}

export const ReportsExportCard: React.FC<ReportsExportCardProps> = ({
  exporting,
  onExport,
}) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse text-gray-900 dark:text-white">
          <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span>تصدير التقارير</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => onExport("daily", "json")}
            disabled={exporting}
            variant="outline"
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {exporting ? (
              <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 ml-2" />
            )}
            تقرير يومي (JSON)
          </Button>

          <Button
            onClick={() => onExport("weekly", "json")}
            disabled={exporting}
            variant="outline"
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {exporting ? (
              <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 ml-2" />
            )}
            تقرير أسبوعي (JSON)
          </Button>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>• التقارير متاحة بصيغة JSON</p>
          <p>• يمكن إضافة صيغ PDF و Excel لاحقاً</p>
          <p>• التقارير تحتوي على جميع البيانات والتحليلات</p>
        </div>
      </CardContent>
    </Card>
  );
};
