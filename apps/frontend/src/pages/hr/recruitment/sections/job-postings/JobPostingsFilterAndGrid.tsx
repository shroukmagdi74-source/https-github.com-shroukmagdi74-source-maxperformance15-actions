import React from "react";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { JobPosting } from "./types";
import {
  getJobExperienceLabel,
  getJobStatusBadge,
  getJobTypeLabel,
} from "./helpers";

interface JobPostingsFilterAndGridProps {
  loading: boolean;
  searchTerm: string;
  filterStatus: string;
  filteredJobs: JobPosting[];
  onSearchChange: (val: string) => void;
  onFilterStatusChange: (val: string) => void;
  onOpenCreateModal: () => void;
  onViewDetails: (job: JobPosting) => void;
  onToggleStatus: (job: JobPosting) => void;
  onDeleteJob: (jobId: string) => void;
}

export const JobPostingsFilterAndGrid: React.FC<
  JobPostingsFilterAndGridProps
> = ({
  loading,
  searchTerm,
  filterStatus,
  filteredJobs,
  onSearchChange,
  onFilterStatusChange,
  onOpenCreateModal,
  onViewDetails,
  onToggleStatus,
  onDeleteJob,
}) => {
  return (
    <>
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن وظيفة..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">جميع الحالات</option>
            <option value="ACTIVE">نشط</option>
            <option value="DRAFT">مسودة</option>
            <option value="CLOSED">مغلق</option>
            <option value="ON_HOLD">معلق</option>
          </select>
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <PlusIcon className="w-5 h-5" />
            إضافة وظيفة
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredJobs.map((job, index) => {
            const statusBadge = getJobStatusBadge(job.status);
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BriefcaseIcon className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        {job.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {job.department}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${statusBadge.bg}`}
                  >
                    {statusBadge.text}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPinIcon className="w-5 h-5" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <ClockIcon className="w-5 h-5" />
                    <span>{getJobTypeLabel(job.type)}</span>
                    <span className="mx-2">•</span>
                    <span>{getJobExperienceLabel(job.experienceLevel)}</span>
                  </div>
                  {job.salaryMin && job.salaryMax && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <CurrencyDollarIcon className="w-5 h-5" />
                      <span>
                        <span className="font-mono tabular-nums">
                          {job.salaryMin.toLocaleString()}
                        </span>{" "}
                        -{" "}
                        <span className="font-mono tabular-nums">
                          {job.salaryMax.toLocaleString()}
                        </span>{" "}
                        جنيه
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <UserGroupIcon className="w-5 h-5" />
                    <span>
                      <span className="font-mono tabular-nums">
                        {job.applicantsCount}
                      </span>{" "}
                      متقدم
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => onViewDetails(job)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                  >
                    <EyeIcon className="w-5 h-5" />
                    عرض
                  </button>
                  <button
                    onClick={() => onToggleStatus(job)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                  >
                    {job.status === "ACTIVE" ? (
                      <XCircleIcon className="w-5 h-5" />
                    ) : (
                      <CheckCircleIcon className="w-5 h-5" />
                    )}
                    {job.status === "ACTIVE" ? "إغلاق" : "تفعيل"}
                  </button>
                  <button
                    onClick={() => onDeleteJob(job.id)}
                    aria-label="حذف الوظيفة"
                    className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredJobs.length === 0 && !loading && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
          <BriefcaseIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            لا توجد وظائف متاحة
          </p>
        </div>
      )}
    </>
  );
};
