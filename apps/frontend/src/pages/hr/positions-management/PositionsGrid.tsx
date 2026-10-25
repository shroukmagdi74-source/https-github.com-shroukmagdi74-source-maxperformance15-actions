import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Edit2, Trash2, Building, DollarSign, Users } from "lucide-react";
import { Position } from "./types";
import { getLevelBadge } from "./helpers";
import { PositionsEmptyState } from "./PositionsEmptyState";

interface PositionsGridProps {
  positions: Position[];
  searchTerm: string;
  onEdit: (position: Position) => void;
  onDelete: (position: Position) => void;
  onNewPosition: () => void;
}

export const PositionsGrid: React.FC<PositionsGridProps> = ({
  positions,
  searchTerm,
  onEdit,
  onDelete,
  onNewPosition,
}) => {
  if (positions.length === 0) {
    return (
      <PositionsEmptyState
        searchTerm={searchTerm}
        onNewPosition={onNewPosition}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {positions.map((position) => {
        const levelInfo = getLevelBadge(position.level);
        return (
          <Card key={position.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{position.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(position)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(position)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={levelInfo.color}>{levelInfo.label}</Badge>
                {position.code && (
                  <Badge variant="outline">{position.code}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {position.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {position.description}
                  </p>
                )}

                {position.department && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Building className="h-4 w-4" />
                    <span>{position.department.name}</span>
                  </div>
                )}

                {(position.minSalary || position.maxSalary) && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-mono tabular-nums">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      {position.minSalary
                        ? position.minSalary.toLocaleString()
                        : "0"}{" "}
                      -
                      {position.maxSalary
                        ? position.maxSalary.toLocaleString()
                        : "غير محدد"}
                    </span>
                  </div>
                )}

                {position._count && position._count.users > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-mono tabular-nums">
                    <Users className="h-4 w-4" />
                    <span>{position._count.users} موظف</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
