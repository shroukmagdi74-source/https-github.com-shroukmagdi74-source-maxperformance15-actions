import React from "react";
import { MessageSquare, Search } from "lucide-react";
import type { Ticket } from "./types";

interface AdminTicketsSidebarProps {
  allTickets: Ticket[];
  filteredTickets: Ticket[];
  ticketsSearchQuery: string;
  setTicketsSearchQuery: (val: string) => void;
  activeTicketId: string | undefined;
  onSelectTicket: (ticketId: string) => void;
}

export const AdminTicketsSidebar: React.FC<AdminTicketsSidebarProps> = ({
  allTickets,
  filteredTickets,
  ticketsSearchQuery,
  setTicketsSearchQuery,
  activeTicketId,
  onSelectTicket,
}) => {
  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            التذاكر
          </h2>
          <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full text-sm font-medium">
            {allTickets.length}
          </span>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث في التذاكر..."
            value={ticketsSearchQuery}
            onChange={(e) => setTicketsSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Tickets List - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredTickets.map((t, idx) => (
          <div
            key={t._id || t.ticketId || idx}
            onClick={() => onSelectTicket(t.ticketId)}
            className={`p-4 border-b border-slate-100 dark:border-slate-800/60 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all ${
              t.ticketId === activeTicketId
                ? "bg-indigo-50 dark:bg-indigo-950/30 border-r-4 border-r-indigo-500"
                : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                  t.status === "open"
                    ? "bg-emerald-500"
                    : t.status === "in_progress"
                      ? "bg-indigo-500"
                      : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 dark:text-slate-100 text-base truncate mb-1">
                  {t.subject}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  {t.userId?.name || "مستخدم"}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono">{t.ticketId}</span>
                  <span>•</span>
                  <span>
                    {new Date(t.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              </div>
              <div
                className={`text-xs px-2 py-1 rounded-lg font-medium ${
                  t.priority === "critical"
                    ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    : t.priority === "high"
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                      : t.priority === "low"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {t.priority === "critical"
                  ? "حرجة"
                  : t.priority === "high"
                    ? "عالية"
                    : t.priority === "low"
                      ? "منخفضة"
                      : "متوسطة"}
              </div>
            </div>
          </div>
        ))}
        {filteredTickets.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            لا توجد تذاكر
          </div>
        )}
      </div>
    </div>
  );
};
