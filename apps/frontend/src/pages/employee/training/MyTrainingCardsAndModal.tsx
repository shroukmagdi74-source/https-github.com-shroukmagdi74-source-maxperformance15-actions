import React from "react";
import {
  GraduationCap,
  Calendar,
  DollarSign,
  Award,
  Clock,
  Eye,
  Search,
} from "lucide-react";
import type { TFunction } from "i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Training,
  trainingStatusConfig,
  trainingTypeLabels,
} from "./types";
import { MyTrainingDetailsModal } from "./MyTrainingDetailsModal";

interface MyTrainingCardsAndModalProps {
  t: TFunction;
  loading: boolean;
  filteredTrainings: Training[];
  searchTerm: string;
  statusFilter: string;
  selectedTraining: Training | null;
  onSelectTraining: (training: Training | null) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
}

const TrainingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Card
        key={i}
        className="border-none shadow-md overflow-hidden bg-white/40 animate-pulse"
      >
        <div className="h-1.5 w-full bg-gray-200" />
        <CardHeader className="space-y-3">
          <div className="flex justify-between">
            <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
            <div className="w-20 h-5 bg-gray-200 rounded-lg" />
          </div>
          <div className="w-3/4 h-6 bg-gray-200 rounded-md" />
          <div className="w-1/2 h-4 bg-gray-200 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="w-full h-3 bg-gray-100 rounded" />
              <div className="w-2/3 h-4 bg-gray-200 rounded" />
            </div>
            <div className="space-y-2">
              <div className="w-full h-3 bg-gray-100 rounded" />
              <div className="w-2/3 h-4 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="h-20 bg-gray-50 rounded-xl" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const MyTrainingCardsAndModal: React.FC<
  MyTrainingCardsAndModalProps
> = ({
  t,
  loading,
  filteredTrainings,
  searchTerm,
  statusFilter,
  selectedTraining,
  onSelectTraining,
  onResetFilters,
  onRefresh,
}) => {
  return (
    <>
      {loading ? (
        <TrainingSkeleton />
      ) : filteredTrainings.length === 0 ? (
        <Card className="border-none shadow-2xl bg-white/50 backdrop-blur-md p-16 animate-in zoom-in-95 duration-500">
          <CardContent className="flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center text-purple-200">
              {searchTerm || statusFilter !== "ALL" ? (
                <Search className="h-12 w-12" />
              ) : (
                <GraduationCap className="h-12 w-12" />
              )}
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-800">
                  {searchTerm || statusFilter !== "ALL"
                    ? t("employee.training.noSearchResults")
                    : t("employee.training.noTrainings")}
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  {searchTerm || statusFilter !== "ALL"
                    ? t("employee.training.searchHint")
                    : t("employee.training.noTrainingsHint")}
                </p>
              </div>

              {searchTerm || statusFilter !== "ALL" ? (
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  onClick={onResetFilters}
                >
                  {t("employee.training.resetSearch")}
                </Button>
              ) : (
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  onClick={onRefresh}
                >
                  {t("employee.training.refreshData")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {filteredTrainings.map((training) => {
            const status = trainingStatusConfig[training.status] ?? {
              labelKey: training.status,
              color: "bg-gray-100 text-gray-700",
              icon: null,
            };

            return (
              <Card
                key={training.id}
                className="group border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden bg-white/70 backdrop-blur-sm ring-1 ring-purple-100/50"
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black border flex items-center gap-1 ${status.color}`}
                    >
                      {status.icon}
                      {t(status.labelKey)}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-black mt-4 leading-tight group-hover:text-purple-700 transition-colors">
                    {training.trainingName}
                  </CardTitle>
                  {training.provider && (
                    <p className="text-sm text-gray-500 font-medium">
                      {training.provider}
                    </p>
                  )}
                  <Badge
                    variant="outline"
                    className="w-fit text-[10px] font-bold border-purple-100 text-purple-600 mt-1"
                  >
                    {t(
                      trainingTypeLabels[training.type] ??
                        "employee.training.typeOther",
                    )}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="h-3 w-3" />{" "}
                        {t("employee.training.startDate")}
                      </p>
                      <p className="text-xs font-bold text-gray-700">
                        {new Date(training.startDate).toLocaleDateString(
                          "ar-EG",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>

                    {training.duration ? (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="h-3 w-3" />{" "}
                          {t("employee.training.duration")}
                        </p>
                        <p className="text-xs font-bold font-mono tabular-nums text-gray-700">
                          {t("employee.training.hours", {
                            hours: training.duration,
                          })}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {training.endDate && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="h-3 w-3" />{" "}
                        {t("employee.training.endDate")}
                      </p>
                      <p className="text-xs font-bold text-gray-700">
                        {new Date(training.endDate).toLocaleDateString(
                          "ar-EG",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    {training.cost ? (
                      <div className="flex flex-col">
                        <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />{" "}
                          {t("employee.training.cost")}
                        </p>
                        <p className="text-sm font-black font-mono tabular-nums text-purple-600">
                          {training.cost.toLocaleString()}{" "}
                          <span className="text-[10px] font-bold opacity-60">
                            EGP
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div />
                    )}

                    {training.score ? (
                      <div className="flex flex-col items-end">
                        <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                          <Award className="h-3 w-3" />{" "}
                          {t("employee.training.rating")}
                        </p>
                        <p className="text-sm font-black font-mono tabular-nums text-amber-500">
                          %{training.score}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {training.description && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 border-t border-gray-50 pt-3 mt-3">
                      {training.description}
                    </p>
                  )}

                  <div className="pt-4 mt-4 border-t border-gray-50">
                    <Button
                      variant="ghost"
                      className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-bold gap-2"
                      onClick={() => onSelectTraining(training)}
                    >
                      <Eye className="w-4 h-4" />{" "}
                      {t("employee.training.viewDetails")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <MyTrainingDetailsModal
        t={t}
        selectedTraining={selectedTraining}
        onClose={() => onSelectTraining(null)}
      />
    </>
  );
};
