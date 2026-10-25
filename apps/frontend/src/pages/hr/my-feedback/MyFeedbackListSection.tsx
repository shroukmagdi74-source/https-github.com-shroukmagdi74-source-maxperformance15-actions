import React from "react";
import { TFunction } from "i18next";
import {
  Star,
  User,
  Inbox,
  Send as SendIcon,
  Search,
  Calendar,
  AlertCircle,
  Clock,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Feedback } from "./types";
import { getFeedbackTypeKey } from "./helpers";

interface MyFeedbackListSectionProps {
  t: TFunction;
  loading: boolean;
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  filteredFeedback: Feedback[];
  onOpenPreview: (item: Feedback) => void;
  onNewMessage: () => void;
}

export const renderFeedbackStatusBadge = (status: string, t: TFunction) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-700 hover:bg-green-100 border-none"
        >
          {t("employee.feedback.statusNew")}
        </Badge>
      );
    case "RESOLVED":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none"
        >
          {t("employee.feedback.statusReplied")}
        </Badge>
      );
    case "ARCHIVED":
      return (
        <Badge variant="secondary">
          {t("employee.feedback.statusArchived")}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const MyFeedbackListSection: React.FC<MyFeedbackListSectionProps> = ({
  t,
  loading,
  activeTab,
  onActiveTabChange,
  searchQuery,
  onSearchQueryChange,
  filteredFeedback,
  onOpenPreview,
  onNewMessage,
}) => {
  return (
    <Tabs
      defaultValue="sent"
      value={activeTab}
      onValueChange={onActiveTabChange}
      className="space-y-6"
    >
      <div className="bg-card border rounded-xl p-2 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <SendIcon className="h-4 w-4" />
            {t("employee.feedback.sentTab")}
          </TabsTrigger>
          <TabsTrigger value="received" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            {t("employee.feedback.receivedTab")}
          </TabsTrigger>
        </TabsList>

        <div className="relative w-full md:w-80 px-2">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={String(t("employee.feedback.searchPlaceholder"))}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pr-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      <TabsContent value={activeTab} className="mt-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-muted-foreground animate-pulse">
              {t("employee.feedback.loading")}
            </p>
          </div>
        ) : filteredFeedback.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeedback.map((item) => (
              <Card
                key={item.id}
                className="group hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary/20 relative"
              >
                <CardHeader className="pb-3 border-b bg-muted/5 group-hover:bg-muted/10 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-background shadow-sm hover:scale-105 transition-transform">
                        {activeTab === "received" ? (
                          item.isAnonymous ? (
                            <AvatarFallback className="bg-muted text-muted-foreground">
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          ) : (
                            <AvatarImage src={item.fromEmployee?.avatar} />
                          )
                        ) : item.toUserId ? (
                          <AvatarImage src={item.toEmployee?.avatar} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            HQ
                          </AvatarFallback>
                        )}
                        <AvatarFallback className="bg-primary/5 text-primary">
                          {activeTab === "received"
                            ? item.isAnonymous
                              ? "?"
                              : item.fromEmployee?.firstName?.[0]
                            : item.toUserId
                              ? item.toEmployee?.firstName?.[0]
                              : "H"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-foreground">
                          {activeTab === "received"
                            ? item.isAnonymous
                              ? t("employee.feedback.anonymous")
                              : `${item.fromEmployee?.firstName} ${item.fromEmployee?.lastName}`
                            : item.toUserId
                              ? `${item.toEmployee?.firstName} ${item.toEmployee?.lastName}`
                              : t("employee.feedback.generalManagement")}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground font-mono tabular-nums">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(item.createdAt), "dd MMMM yyyy", {
                            locale: ar,
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold px-2 py-0.5 bg-background shadow-sm"
                      >
                        {t(getFeedbackTypeKey(item.type))}
                      </Badge>
                      {renderFeedbackStatusBadge(item.status, t)}
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="معاينة الرسالة"
                        className="h-8 w-8 rounded-full bg-white text-slate-600 hover:text-primary shadow-sm"
                        onClick={() => onOpenPreview(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 relative">
                  {item.rating && (
                    <div className="flex items-center gap-0.5 mb-4 bg-amber-50 dark:bg-amber-950/20 w-fit px-2 py-1 rounded-full border border-amber-100 dark:border-amber-900/30">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= (item.rating || 0)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300 dark:text-gray-700"
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 mr-1 font-mono tabular-nums">
                        {item.rating}
                      </span>
                    </div>
                  )}
                  <div className="relative">
                    <div className="absolute -right-2 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                    <p className="text-sm text-foreground/80 leading-relaxed pr-2 italic font-medium whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                  {item.category && (
                    <div className="mt-4 pt-4 border-t border-dashed flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] text-muted-foreground font-normal"
                      >
                        #{item.category}
                      </Badge>
                    </div>
                  )}

                  {item.adminReply && (
                    <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 relative">
                      <div className="absolute -right-4 top-4 bottom-4 w-1 bg-primary/30 rounded-full" />
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-primary/20 text-primary border-none text-[10px] h-5">
                          {t("employee.feedback.replyBadge")}
                        </Badge>
                        {item.repliedAt && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono tabular-nums">
                            <Clock className="h-3 w-3" />
                            {format(
                              new Date(item.repliedAt),
                              "dd MMMM yyyy HH:mm",
                              { locale: ar }
                            )}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                        {item.adminReply}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-dashed rounded-3xl shadow-sm">
            <div className="bg-primary/5 p-6 rounded-full mb-4">
              <AlertCircle className="h-12 w-12 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {t("employee.feedback.noRecords")}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-sm">
              {activeTab === "received"
                ? t("employee.feedback.receivedEmpty")
                : t("employee.feedback.sentEmpty")}
            </p>
            <Button
              onClick={onNewMessage}
              variant="outline"
              className="rounded-full px-8 hover:bg-primary hover:text-white transition-all"
            >
              {t("employee.feedback.startWriting")}
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
