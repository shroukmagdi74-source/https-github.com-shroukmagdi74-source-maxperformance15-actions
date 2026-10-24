import React from "react";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { motion } from "framer-motion";
import DepartmentCard from "../components/DepartmentCard";
import { Department } from "./types";

interface DepartmentGridProps {
  departments: Department[];
  paginatedDepartments: Department[];
  filteredDepartments: Department[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  onViewDetails: (dept: Department) => void;
  onDelete: (dept: Department) => void;
  canManage: boolean;
  onOpenAddDialog: () => void;
}

export const DepartmentGrid: React.FC<DepartmentGridProps> = ({
  departments,
  paginatedDepartments,
  filteredDepartments,
  currentPage,
  totalPages,
  setCurrentPage,
  onViewDetails,
  onDelete,
  canManage,
  onOpenAddDialog,
}) => {
  if (departments.length === 0) {
    return (
      <motion.div
        key="empty"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Building2 className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">لا توجد أقسام مضافة بعد</p>
            {canManage && (
              <Button
                variant="link"
                className="mt-2 text-primary hover:underline"
                onClick={onOpenAddDialog}
              >
                ابدأ بإضافة أول قسم الآن
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedDepartments.map((dept) => (
          <DepartmentCard
            key={dept.id}
            department={dept}
            onViewDetails={onViewDetails}
            onDelete={onDelete}
            canManage={canManage}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm font-medium text-gray-500 font-mono tabular-nums">
            عرض {paginatedDepartments.length} من {filteredDepartments.length} قسم
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-xl"
            >
              السابق
            </Button>
            <div className="flex gap-1 font-mono tabular-nums">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1,
                )
                .map((page, idx, arr) => (
                  <React.Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="flex items-center text-gray-300">
                        ...
                      </span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[40px] rounded-xl font-bold ${
                        currentPage === page ? "shadow-lg shadow-primary/20" : ""
                      }`}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl"
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
