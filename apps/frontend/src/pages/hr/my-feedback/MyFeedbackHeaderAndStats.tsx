import React from "react";
import { TFunction } from "i18next";
import { MessageSquare, Plus, Star, Inbox, Send as SendIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MyFeedbackStats } from "./types";

interface MyFeedbackHeaderAndStatsProps {
  t: TFunction;
  stats: MyFeedbackStats;
  onNewMessage: () => void;
}

export const MyFeedbackHeaderAndStats: React.FC<
  MyFeedbackHeaderAndStatsProps
> = ({ t, stats, onNewMessage }) => {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            {t("employee.feedback.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("employee.feedback.subtitle")}
          </p>
        </div>
        <Button
          onClick={onNewMessage}
          className="flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all"
        >
          <Plus className="h-5 w-5" />
          {t("employee.feedback.newMessage")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background border-indigo-100 dark:border-indigo-900/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Inbox className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              {t("employee.feedback.receivedMessages")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tabular-nums">
              {stats.receivedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("employee.feedback.receivedDesc")}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border-purple-100 dark:border-purple-900/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <SendIcon className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-600 dark:text-purple-400">
              {t("employee.feedback.sentMessages")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tabular-nums">
              {stats.sentCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("employee.feedback.sentDesc")}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background border-amber-100 dark:border-amber-900/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Star className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-600 dark:text-amber-400">
              {t("employee.feedback.avgRating")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tabular-nums">
              {stats.avgRating}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("employee.feedback.basedOnRatings")}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
