import React from "react";
import { Users, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { Employee } from "./types";

interface PayrollSimulatorEmployeeListProps {
  search: string;
  onSearchChange: (val: string) => void;
  filteredEmployees: Employee[];
  selectedEmployee: Employee | null;
  onSelectEmployee: (emp: Employee) => void;
}

export const PayrollSimulatorEmployeeList: React.FC<
  PayrollSimulatorEmployeeListProps
> = ({
  search,
  onSearchChange,
  filteredEmployees,
  selectedEmployee,
  onSelectEmployee,
}) => {
  return (
    <Card className="w-80 flex flex-col shrink-0 border-none shadow-xl bg-slate-50/50 dark:bg-slate-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          اختيار موظف للتجربة
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="بحث باسم أو رقم الموظف..."
            className="pr-9"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {filteredEmployees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => onSelectEmployee(emp)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedEmployee?.id === emp.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800"
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
                      selectedEmployee?.id === emp.id
                        ? "text-indigo-100"
                        : "text-slate-500"
                    }`}
                  >
                    <span className="font-mono tabular-nums">
                      #{emp.employeeNumber}
                    </span>{" "}
                    • {emp.department?.name || "بدون قسم"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
