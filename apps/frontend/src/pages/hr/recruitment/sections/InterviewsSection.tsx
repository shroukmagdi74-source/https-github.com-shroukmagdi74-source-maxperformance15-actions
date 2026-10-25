import React from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  useInterviewsController,
  InterviewScheduleModal,
  InterviewsGrid,
} from "./interviews";

const InterviewsSection: React.FC = () => {
  const {
    interviews,
    jobs,
    loading,
    showScheduleModal,
    setShowScheduleModal,
    newInterview,
    setNewInterview,
    interviewerInput,
    setInterviewerInput,
    handleScheduleInterview,
    handleUpdateStatus,
    resetForm,
    addInterviewer,
    removeInterviewer,
    getApplicantsForJob,
  } = useInterviewsController();

  return (
    <div className="relative min-h-screen p-6 -m-6 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 -z-20" />
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400">
            مساحة المقابلات
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            إدارة جداول المقابلات والمواعيد بذكاء
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="group relative px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-2">
            <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>جدولة مقابلة جديدة</span>
          </div>
        </button>
      </div>

      {/* Schedule Interview Modal */}
      <InterviewScheduleModal
        open={showScheduleModal}
        jobs={jobs}
        applicantsForJob={getApplicantsForJob()}
        newInterview={newInterview}
        interviewerInput={interviewerInput}
        onChangeInterview={setNewInterview}
        onChangeInterviewerInput={setInterviewerInput}
        onAddInterviewer={addInterviewer}
        onRemoveInterviewer={removeInterviewer}
        onClose={() => {
          setShowScheduleModal(false);
          resetForm();
        }}
        onSubmit={handleScheduleInterview}
      />

      {/* Interviews Grid */}
      <InterviewsGrid
        interviews={interviews}
        loading={loading}
        onOpenScheduleModal={() => setShowScheduleModal(true)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default InterviewsSection;
