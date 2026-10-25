import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { FeedbackEmployee } from "./types";
import { FEEDBACK_GUIDELINES } from "./helpers";

interface CreateFeedbackSidebarProps {
  selectedEmployee: FeedbackEmployee | null;
}

export const CreateFeedbackSidebar: React.FC<CreateFeedbackSidebarProps> = ({
  selectedEmployee,
}) => {
  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-gradient-to-br from-primary/20 to-primary/5 border-t border-white/5">
        <CardHeader>
          <CardTitle className="text-lg text-primary">
            إرشادات التغذية الراجعة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-foreground/80 leading-relaxed">
          {FEEDBACK_GUIDELINES.map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 font-mono tabular-nums">
                {item.step}
              </div>
              <p>{item.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedEmployee && (
        <Card className="border-none shadow-lg animate-in fade-in zoom-in duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              الموظف المختار
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-2 ring-primary/20">
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {selectedEmployee.firstName?.[0] || ""}
                {selectedEmployee.lastName?.[0] || ""}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedEmployee.position?.title || "موظف"}
              </p>
              <Badge variant="secondary" className="mt-2">
                {selectedEmployee.department?.name || "بدون قسم"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
