import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { BusinessSectionPanel } from '../../../components/business/BusinessSurface';
import { TaskActivity, getPersonName, formatDateTime } from './types';
import { TaskEmptyState } from './TaskInfoWidgets';

interface TaskActivityTabProps {
  activities: TaskActivity[];
}

export const TaskActivityTab: React.FC<TaskActivityTabProps> = ({ activities }) => {
  return (
    <BusinessSectionPanel
      title="النشاط"
      description="سجل التحديثات يساعدك على فهم ما الذي تغير ومتى، خصوصًا عندما يراجع المهمة أكثر من شخص."
      contentClassName="space-y-3"
    >
      {activities.length > 0 ? (
        activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-[24px] border border-border/70 bg-background/65 px-4 py-4"
          >
            {activity.user?.avatar ? (
              <img
                src={activity.user.avatar}
                alt=""
                className="size-9 rounded-full object-cover"
              />
            ) : (
              <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                <UserCircleIcon className="size-5" />
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm leading-7 text-foreground">
                <span className="font-semibold">
                  {getPersonName(activity.user)}
                </span>{" "}
                {activity.description || activity.action}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(activity.createdAt)}
              </p>
            </div>
          </div>
        ))
      ) : (
        <TaskEmptyState
          title="لا توجد نشاطات بعد"
          description="بمجرد حصول تحديثات أو تعليقات أو تغييرات على المهمة ستظهر هنا بشكل زمني واضح."
        />
      )}
    </BusinessSectionPanel>
  );
};
