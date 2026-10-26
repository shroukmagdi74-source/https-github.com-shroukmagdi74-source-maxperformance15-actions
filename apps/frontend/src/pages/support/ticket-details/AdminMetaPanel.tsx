import React from "react";
import {
  Mail,
  Building,
  MoreVertical,
  Flag,
  User,
} from "lucide-react";
import { Ticket, getCategoryText } from "./types";

interface AdminMetaPanelProps {
  ticket: Ticket;
  userHistory: any[];
  staffList: any[];
  currentUserId?: string;
  onUpdatePriority: (newPriority: string) => void;
  onAssignToMe: () => void;
  onAssignUser: (staffId: string) => void;
  onSelectHistoryTicket: (ticketId: string) => void;
}

export const AdminMetaPanel: React.FC<AdminMetaPanelProps> = ({
  ticket,
  userHistory,
  staffList,
  currentUserId,
  onUpdatePriority,
  onAssignToMe,
  onAssignUser,
  onSelectHistoryTicket,
}) => {
  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0">
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {/* Customer Card */}
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-800/50 dark:to-indigo-950/20 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">
            بيانات العميل
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
              {ticket.userId?.name ? ticket.userId.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                {ticket.userId?.name}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Mail className="w-4 h-4" /> {ticket.userId?.email}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-base text-slate-600 dark:text-slate-300 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
              <Building className="w-5 h-5 text-slate-400" />
              <div>
                <span className="block text-xs text-slate-400 uppercase">
                  الشركة
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  شركة تجريبية
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Meta */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">
            معلومات التذكرة
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-500 dark:text-slate-400 block mb-2 font-medium">
                المعرف (ID)
              </label>
              <div className="font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-base select-all text-slate-600 dark:text-slate-300 tracking-wider text-center">
                {ticket.ticketId}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-500 dark:text-slate-400 block mb-2 font-medium">
                القسم
              </label>
              <button
                type="button"
                className="w-full text-right flex items-center justify-between px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 transition-all bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-base"
              >
                {getCategoryText(ticket.category)}
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="text-sm text-slate-500 dark:text-slate-400 block mb-2 font-medium">
                الأولوية
              </label>
              <div className="relative group">
                <button
                  type="button"
                  className="w-full text-right flex items-center justify-between px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 transition-all bg-white dark:bg-slate-800 text-base"
                >
                  <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                    <Flag
                      className={`w-4 h-4 ${
                        ticket.priority === "critical"
                          ? "text-red-500 fill-red-500"
                          : ticket.priority === "high"
                            ? "text-orange-500"
                            : ticket.priority === "low"
                              ? "text-emerald-500"
                              : "text-blue-500"
                      }`}
                    />
                    {ticket.priority === "critical" ? (
                      <span className="text-red-600 dark:text-red-400">حرجة</span>
                    ) : ticket.priority === "high" ? (
                      <span className="text-orange-600 dark:text-orange-400">عالية</span>
                    ) : ticket.priority === "low" ? (
                      <span className="text-emerald-600 dark:text-emerald-400">منخفضة</span>
                    ) : (
                      <span className="text-blue-600 dark:text-blue-400">متوسطة</span>
                    )}
                  </span>
                </button>
                <div className="absolute left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onUpdatePriority("low")}
                    className="w-full text-right px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-base flex items-center gap-2 border-b border-slate-50 dark:border-slate-700 font-medium"
                  >
                    منخفضة
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdatePriority("medium")}
                    className="w-full text-right px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-base flex items-center gap-2 border-b border-slate-50 dark:border-slate-700 font-medium"
                  >
                    متوسطة
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdatePriority("high")}
                    className="w-full text-right px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-orange-700 dark:text-orange-400 text-base flex items-center gap-2 border-b border-slate-50 dark:border-slate-700 font-medium"
                  >
                    عالية
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdatePriority("critical")}
                    className="w-full text-right px-4 py-3 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-700 dark:text-red-400 text-base flex items-center gap-2 font-bold"
                  >
                    حرجة
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-500 dark:text-slate-400 block mb-2 font-medium">
                المكلف
              </label>
              <div className="relative group">
                {ticket.assignedTo ? (
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm cursor-pointer hover:border-indigo-300 transition-colors">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-base font-bold text-indigo-700 dark:text-indigo-300">
                      {ticket.assignedTo.name.charAt(0)}
                    </div>
                    <span className="text-base font-medium text-slate-700 dark:text-slate-200">
                      {ticket.assignedTo.name}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 text-base transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <User className="w-5 h-5" /> تعيين موظف
                  </button>
                )}
                <div className="absolute left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 max-h-48 overflow-y-auto">
                  <button
                    type="button"
                    onClick={onAssignToMe}
                    className="w-full text-right px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-base flex items-center gap-2 border-b border-slate-50 dark:border-slate-700 font-bold"
                  >
                    تعيين لي
                  </button>
                  {staffList
                    .filter((s) => s.id !== currentUserId)
                    .map((staff) => (
                      <button
                        type="button"
                        key={staff.id}
                        onClick={() => onAssignUser(staff.id)}
                        className="w-full text-right px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-base flex items-center gap-2 border-b border-slate-50 dark:border-slate-700"
                      >
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400">
                          {staff.name.charAt(0)}
                        </div>
                        {staff.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Tickets */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">
            تذاكر سابقة للعميل
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {userHistory.length > 0 ? (
              userHistory.map((hTicket) => (
                <div
                  key={hTicket.id}
                  onClick={() => onSelectHistoryTicket(hTicket.ticketId)}
                  className="cursor-pointer group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div
                    className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      hTicket.status === "open"
                        ? "bg-emerald-500"
                        : hTicket.status === "closed"
                          ? "bg-slate-300 dark:bg-slate-600"
                          : "bg-indigo-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                      {hTicket.subject}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="font-mono">
                        {hTicket.ticketId}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(hTicket.createdAt).toLocaleDateString(
                          "ar-EG",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-base text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                لا توجد تذاكر سابقة
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
