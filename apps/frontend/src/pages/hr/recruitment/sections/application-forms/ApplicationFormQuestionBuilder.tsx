import React from "react";
import {
  PlusIcon,
  TrashIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { Question } from "./types";
import { QUESTION_TYPES } from "./helpers";

interface ApplicationFormQuestionBuilderProps {
  questions: Question[];
  newQuestion: Question;
  onNewQuestionChange: React.Dispatch<React.SetStateAction<Question>>;
  optionInput: string;
  onOptionInputChange: (val: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
  onMoveQuestion: (index: number, direction: "up" | "down") => void;
}

export const ApplicationFormQuestionBuilder: React.FC<
  ApplicationFormQuestionBuilderProps
> = ({
  questions,
  newQuestion,
  onNewQuestionChange,
  optionInput,
  onOptionInputChange,
  onAddOption,
  onRemoveOption,
  onAddQuestion,
  onRemoveQuestion,
  onMoveQuestion,
}) => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
        الأسئلة (
        <span className="font-mono tabular-nums">{questions.length}</span>)
      </h3>

      {questions.length > 0 && (
        <div className="space-y-3 mb-4">
          {questions.map((q, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => onMoveQuestion(index, "up")}
                  disabled={index === 0}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30"
                >
                  <ChevronUpIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMoveQuestion(index, "down")}
                  disabled={index === questions.length - 1}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30"
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white">
                  <span className="font-mono tabular-nums">{index + 1}</span>.{" "}
                  {q.questionText}
                  {q.isRequired && <span className="text-red-500 mr-1">*</span>}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {
                    QUESTION_TYPES.find((t) => t.value === q.questionType)
                      ?.label
                  }
                  {q.options.length > 0 && ` (${q.options.length} خيارات)`}
                </p>
              </div>
              <button
                onClick={() => onRemoveQuestion(index)}
                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">
          إضافة سؤال جديد
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            value={newQuestion.questionText}
            onChange={(e) =>
              onNewQuestionChange((prev) => ({
                ...prev,
                questionText: e.target.value,
              }))
            }
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            placeholder="نص السؤال..."
          />
          <select
            value={newQuestion.questionType}
            onChange={(e) =>
              onNewQuestionChange((prev) => ({
                ...prev,
                questionType: e.target.value as any,
                options: [],
              }))
            }
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {["SELECT", "RADIO", "CHECKBOX"].includes(newQuestion.questionType) && (
          <div className="mb-3">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={optionInput}
                onChange={(e) => onOptionInputChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && onAddOption()}
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                placeholder="أضف خيار..."
              />
              <button
                onClick={onAddOption}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                إضافة
              </button>
            </div>
            {newQuestion.options.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newQuestion.options.map((opt, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm"
                  >
                    {opt}
                    <button
                      onClick={() => onRemoveOption(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newQuestion.isRequired}
              onChange={(e) =>
                onNewQuestionChange((prev) => ({
                  ...prev,
                  isRequired: e.target.checked,
                }))
              }
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              سؤال إجباري
            </span>
          </label>
          <button
            onClick={onAddQuestion}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4" />
            إضافة السؤال
          </button>
        </div>
      </div>
    </div>
  );
};
