import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Star,
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  Reply,
  Clock,
  User,
  Send as SendIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { FeedbackItem } from "./types";
import { getTypeColor, getTypeLabel, getStatusBadge } from "./helpers";
import { FeedbackEmptyState } from "./FeedbackEmptyState";

interface FeedbackListProps {
  feedback: FeedbackItem[];
  isPrivileged: boolean;
  onOpenReplyDialog: (item: FeedbackItem) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onResetFilters: () => void;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({
  feedback,
  isPrivileged,
  onOpenReplyDialog,
  onEdit,
  onDelete,
  onResetFilters,
}) => {
  if (feedback.length === 0) {
    return <FeedbackEmptyState onResetFilters={onResetFilters} />;
  }

  return (
    <div className="divide-y divide-border">
      {feedback.map((item) => (
        <div
          key={item.id}
          className="p-6 hover:bg-muted/30 transition-colors group"
        >
          <div className="flex flex-col sm:flex-row gap-6">
            {/* User Avatars & Rating */}
            <div className="flex sm:flex-col items-center sm:items-center gap-4 sm:w-32 lg:w-40">
              <div className="flex -space-x-4 space-x-reverse items-center justify-center">
                <Avatar className="h-12 w-12 border-2 border-background ring-2 ring-primary/10 shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {item.toEmployee?.firstName?.[0] || ""}
                    {item.toEmployee?.lastName?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                {!item.isAnonymous && (
                  <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-purple-500/20 shadow-sm translate-y-1">
                    <AvatarFallback className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold">
                      {item.fromEmployee?.firstName?.[0] || ""}
                      {item.fromEmployee?.lastName?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              <div className="flex flex-col items-center">
                {item.rating && (
                  <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20 mt-2 font-mono tabular-nums">
                    <Star className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
                    <span className="text-sm font-black text-yellow-700 dark:text-yellow-400">
                      {item.rating}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.toEmployee
                        ? `${item.toEmployee.firstName} ${item.toEmployee.lastName}`
                        : "تغذية راجعة عامة"}
                    </h4>
                    <Badge
                      variant="outline"
                      className={`font-medium ${getTypeColor(item.type)}`}
                    >
                      {getTypeLabel(item.type)}
                    </Badge>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono tabular-nums">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {format(new Date(item.createdAt), "dd MMMM yyyy", {
                        locale: ar,
                      })}
                    </span>
                    {item.category && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/30"></span>
                        <span className="font-medium text-blue-600 dark:text-blue-400 font-sans">
                          {item.category}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {isPrivileged && (
                  <div className="flex items-center gap-2">
                    {(!item.toUserId || item.toUserId === "management") &&
                      !item.adminReply && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:text-primary hover:bg-primary/5 gap-1.5 h-8 px-3"
                          onClick={() => onOpenReplyDialog(item)}
                        >
                          <Reply className="h-4 w-4" />
                          <span className="text-xs font-bold">إضافة رد</span>
                        </Button>
                      )}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => onEdit(item.id)}
                          >
                            <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span>تعديل</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                            onClick={() => onDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>حذف</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-2xl border border-border group-hover:border-blue-500/20 group-hover:bg-blue-500/5 transition-all">
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wider text-muted-foreground pt-2">
                <div className="flex items-center gap-1.5 ">
                  {item.isAnonymous ? (
                    <>
                      <User className="h-3 w-3" />
                      <span>مجهول المصدر</span>
                    </>
                  ) : (
                    <>
                      <SendIcon className="h-3 w-3" />
                      <span>
                        من: {item.fromEmployee?.firstName}{" "}
                        {item.fromEmployee?.lastName}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Admin Reply Section */}
              {item.adminReply && (
                <div className="mr-8 mt-2 p-4 bg-primary/5 rounded-2xl border border-primary/10 relative">
                  <div className="absolute -right-4 top-4 bottom-4 w-1 bg-primary/30 rounded-full" />
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary/20 text-primary border-none text-[10px] h-5">
                      رد الإدارة
                    </Badge>
                    {item.repliedAt && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono tabular-nums">
                        <Clock className="h-3 w-3" />
                        {format(
                          new Date(item.repliedAt),
                          "dd MMMM yyyy HH:mm",
                          { locale: ar },
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                    {item.adminReply}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
