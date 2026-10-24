import React from 'react';
import { PencilIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { BusinessSectionPanel } from '../../../components/business/BusinessSurface';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import MentionInput from '../../../components/tasks/MentionInput';
import { renderWithMentions } from '../../../components/tasks/mentionUtils';
import { TaskComment, getPersonName, formatDateTime } from './types';
import { TaskEmptyState } from './TaskInfoWidgets';

interface TaskCommentsTabProps {
  comments: TaskComment[];
  currentUserId: string;
  newComment: string;
  setNewComment: (val: string) => void;
  editingComment: string | null;
  setEditingComment: (val: string | null) => void;
  editCommentContent: string;
  setEditCommentContent: (val: string) => void;
  onAddComment: () => void;
  onUpdateComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export const TaskCommentsTab: React.FC<TaskCommentsTabProps> = ({
  comments,
  currentUserId,
  newComment,
  setNewComment,
  editingComment,
  setEditingComment,
  editCommentContent,
  setEditCommentContent,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}) => {
  return (
    <BusinessSectionPanel
      title="التعليقات"
      description="حافظ على النقاش والتنبيهات داخل المهمة نفسها حتى يبقى السياق واضحًا لكل من يراجعها لاحقًا."
      contentClassName="space-y-4"
    >
      <div className="rounded-[26px] border border-border/70 bg-background/60 p-4">
        <MentionInput
          value={newComment}
          onChange={setNewComment}
          placeholder="أضف تعليقًا واضحًا... استخدم @ للإشارة لشخص"
          rows={3}
        />
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            onClick={onAddComment}
            disabled={!newComment.trim()}
          >
            إرسال التعليق
          </Button>
        </div>
      </div>

      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-[26px] border border-border/70 bg-background/65 px-4 py-4"
            >
              <div className="flex items-start gap-3">
                {comment.user?.avatar ? (
                  <img
                    src={comment.user.avatar}
                    alt=""
                    className="size-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                    <UserCircleIcon className="size-5" />
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {getPersonName(comment.user)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(comment.createdAt)}
                        {comment.isEdited ? " • معدل" : ""}
                      </p>
                    </div>

                    {comment.userId === currentUserId ? (
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setEditingComment(comment.id);
                            setEditCommentContent(comment.content);
                          }}
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDeleteComment(comment.id)}
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  {editingComment === comment.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editCommentContent}
                        onChange={(event) =>
                          setEditCommentContent(event.target.value)
                        }
                        className="min-h-28 rounded-2xl"
                      />
                      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingComment(null);
                            setEditCommentContent("");
                          }}
                        >
                          إلغاء
                        </Button>
                        <Button
                          type="button"
                          onClick={() => onUpdateComment(comment.id)}
                        >
                          حفظ التعديل
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm leading-7 text-foreground whitespace-pre-wrap">
                      {renderWithMentions(comment.content)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <TaskEmptyState
          title="لا توجد تعليقات بعد"
          description="أضف أول تحديث هنا بدل تشتيت النقاش خارج المهمة."
        />
      )}
    </BusinessSectionPanel>
  );
};
