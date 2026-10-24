import React from "react";
import { Users, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Employee } from "./types";

interface PayrollEmployeeSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loadingEmployees: boolean;
  filteredEmployees: Employee[];
  selectedEmployee: Employee | null;
  handleSelectEmployee: (emp: Employee) => void;
}

export const PayrollEmployeeSidebar: React.FC<PayrollEmployeeSidebarProps> = ({
  searchQuery,
  setSearchQuery,
  loadingEmployees,
  filteredEmployees,
  selectedEmployee,
  handleSelectEmployee,
}) => {
  return (
    <Card className="lg:w-80 flex flex-col shrink-0 shadow-lg">
      <CardHeader className="pb-3 bg-indigo-600 text-white">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          اختيار موظف للاختبار
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="بحث باسم أو رقم الموظف..."
            className="pr-9 bg-white/20 text-white placeholder:text-white/70 border-white/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100dvh-300px)]">
          {loadingEmployees ? (
            <div className="p-4 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-indigo-600 rounded-full border-t-transparent mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">
                جاري تحميل الموظفين...
              </p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">
                لا يوجد موظفين مطابقين للبحث
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => handleSelectEmployee(emp)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    selectedEmployee?.id === emp.id
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : "bg-white hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                  }`}
                >
                  <Avatar className="h-10 w-10 border-2 border-white/20">
                    <AvatarImage src={emp.avatar} />
                    <AvatarFallback className="bg-indigo-200 text-indigo-700">
                      {emp.firstName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-right overflow-hidden">
                    <p className="font-bold text-sm truncate">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p
                      className={`text-xs ${
                        selectedEmployee?.id === emp.id ? "text-indigo-100" : "text-slate-500"
                      }`}
                    >
                      #{emp.employeeNumber} •{" "}
                      {emp.department?.name || "بدون قسم"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
