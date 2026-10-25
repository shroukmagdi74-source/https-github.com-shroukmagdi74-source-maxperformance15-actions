import React from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface CreateTrainingHeaderProps {
  onBack: () => void;
}

export const CreateTrainingHeader: React.FC<CreateTrainingHeaderProps> = ({
  onBack,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="rounded-full bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm"
        >
          <ArrowRight className="h-5 w-5 text-purple-600" />
        </Button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-600">
            إضافة سجل تدريبي
          </h1>
          <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
            <BookOpen className="h-4 w-4 text-purple-400" />
            توثيق الدورات التدريبية والتطويرية للموظفين
          </p>
        </div>
      </div>
    </div>
  );
};
