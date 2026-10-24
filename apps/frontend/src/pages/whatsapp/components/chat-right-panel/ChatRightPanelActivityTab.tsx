import React from 'react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  description: string;
  createdAt: string;
}

interface ChatRightPanelActivityTabProps {
  activities: ActivityItem[];
}

export const ChatRightPanelActivityTab: React.FC<ChatRightPanelActivityTabProps> = ({
  activities,
}) => {
  return (
    <div className="space-y-3">
      {activities.length > 0 ? (
        <div className="relative mr-2 space-y-4 pl-4 border-r-2 border-border/50">
          {activities.map((act) => (
            <div key={act.id} className="relative pr-5">
              <div
                className="absolute -right-[25px] top-1 size-2.5 rounded-full border-2 border-background bg-primary shadow-xs"
              />
              <p className="text-xs font-medium text-foreground">{act.description}</p>
              <p className="mt-0.5 text-[11px] font-mono tabular-nums text-muted-foreground">
                {format(new Date(act.createdAt), 'dd MMM, HH:mm', { locale: arSA })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          <Clock className="mx-auto mb-2 size-10 opacity-20" />
          <p className="text-xs">لا يوجد نشاط مسجل</p>
        </div>
      )}
    </div>
  );
};
