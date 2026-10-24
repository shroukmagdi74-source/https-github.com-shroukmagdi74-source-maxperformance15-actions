import React from "react";
import { Search, Plus, Pencil, Check, Trash2 } from "lucide-react";
import type { EducationSubject } from "./types";
import { CELL_CLS } from "./types";
import { SubjectModal } from "./SubjectModal";

export interface EducationSubjectsTabProps {
  subjects: EducationSubject[];
  subjectSearch: string;
  setSubjectSearch: (q: string) => void;
  subjectModal: Partial<EducationSubject> | null | undefined;
  setSubjectModal: (s: Partial<EducationSubject> | null | undefined) => void;
  handleSaveSubject: (d: Partial<EducationSubject>) => Promise<void>;
  handleToggleSubject: (id: string, current: boolean) => Promise<void>;
  handleDeleteSubject: (id: string) => Promise<void>;
}

export const EducationSubjectsTab: React.FC<EducationSubjectsTabProps> = ({
  subjects,
  subjectSearch,
  setSubjectSearch,
  subjectModal,
  setSubjectModal,
  handleSaveSubject,
  handleToggleSubject,
  handleDeleteSubject,
}) => {
  const filtered = subjects.filter(
    (s) => !subjectSearch || s.name.includes(subjectSearch)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-base font-bold text-foreground">
          إدارة المواد الأكاديمية
        </h2>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-muted-foreground" />
            <input
              className="bg-background border border-input rounded-lg pr-9 pl-3 py-1.5 text-xs text-foreground w-48 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="بحث في المواد..."
              value={subjectSearch}
              onChange={(e) => setSubjectSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => setSubjectModal({})}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة مادة
          </button>
        </div>
      </div>

      <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground text-xs">
              {["الاسم", "الوصف", "الحالة", ""].map((h) => (
                <th key={h} className="text-right py-3 px-4 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className={CELL_CLS + " font-medium text-foreground"}>
                  {s.name}
                </td>
                <td className={CELL_CLS + " text-muted-foreground"}>
                  {s.description || "—"}
                </td>
                <td className={CELL_CLS}>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                      s.isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                    }`}
                  >
                    {s.isActive ? "نشط" : "معطل"}
                  </span>
                </td>
                <td className={CELL_CLS}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setSubjectModal(s)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                      title="تعديل"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleSubject(s.id, s.isActive)}
                      className={`p-1.5 rounded-md transition-colors ${
                        s.isActive
                          ? "text-red-600 dark:text-red-400 hover:bg-red-500/10"
                          : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                      title={s.isActive ? "تعطيل" : "تفعيل"}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubject(s.id)}
                      className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-12 text-xs text-muted-foreground">
            لا توجد مواد مسجلة
          </p>
        )}
      </div>
      {subjectModal !== undefined && (
        <SubjectModal
          subject={subjectModal}
          onClose={() => setSubjectModal(undefined)}
          onSave={handleSaveSubject}
        />
      )}
    </div>
  );
};
