import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Star, TrendingUp, Award } from "lucide-react";
import { FeedbackStats, FeedbackItem } from "./types";

interface FeedbackStatsGridProps {
  stats: FeedbackStats | null;
  feedback: FeedbackItem[];
}

export const FeedbackStatsGrid: React.FC<FeedbackStatsGridProps> = ({
  stats,
  feedback,
}) => {
  const positiveCount = feedback.filter((f) => (f.rating || 0) >= 4).length;
  const participationRate = Math.round(((stats?.total || 0) / 50) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-none bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900 shadow-md hover:shadow-lg transition-all duration-300 border border-transparent dark:border-blue-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full">
              الإجمالي
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold font-mono tabular-nums">
              {stats?.total || 0}
            </h3>
            <p className="text-sm text-muted-foreground">تم تلقيها مؤخراً</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-slate-900 shadow-md hover:shadow-lg transition-all duration-300 border border-transparent dark:border-yellow-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-500/10 rounded-xl">
              <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
            </div>
            <span className="text-sm font-medium text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full">
              التقييم
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold font-mono tabular-nums">
              {stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
            </h3>
            <p className="text-sm text-muted-foreground">متوسط الرضا العام</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-900 shadow-md hover:shadow-lg transition-all duration-300 border border-transparent dark:border-purple-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded-full">
              النشاط
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold font-mono tabular-nums">
              %{participationRate}
            </h3>
            <p className="text-sm text-muted-foreground">
              معدل المشاركة الشهري
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-slate-900 shadow-md hover:shadow-lg transition-all duration-300 border border-transparent dark:border-green-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
              التميز
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold font-mono tabular-nums">
              {positiveCount}
            </h3>
            <p className="text-sm text-muted-foreground">
              تقييمات إيجابية (4-5)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
