import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { tToast } from "../../../../utils/i18n-toast";
import api from "../../../../services/api";
import { Employee, SimulationState } from "./types";
import { createInitialSimulationState, SCENARIOS } from "./helpers";

export const usePayrollSimulatorController = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [simulation, setSimulation] = useState<SimulationState>({
    baseSalary: 0,
    attendance: [],
    leaves: [],
    manualDeductions: [],
    allowances: {},
  });
  const [results, setResults] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get("/hr/employees?limit=100");
      setEmployees(response.data?.employees || []);
    } catch {
      tToast.error("PayrollSimulator.failed_fetch_36f4");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (e) =>
        `${e.firstName} ${e.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()) || e.employeeNumber.includes(search)
    );
  }, [employees, search]);

  const selectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setSimulation(createInitialSimulationState(emp.baseSalary));
    setResults(null);
  };

  const runSimulation = async () => {
    if (!selectedEmployee) return;
    try {
      setCalculating(true);
      const response = await api.post(
        `/hr/payroll/calculate/${selectedEmployee.id}`,
        {
          month: 2,
          year: 2026,
          overrides: simulation,
        }
      );
      setResults(response.data.payroll);
      tToast.success("PayrollSimulator.msg_2d8c");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "فشل في المحاكاة");
    } finally {
      setCalculating(false);
    }
  };

  const applyScenario = (scenarioId: string) => {
    if (!selectedEmployee) return;
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (scenario) {
      setSimulation(scenario.apply(selectedEmployee.baseSalary));
      toast.info(`تم تطبيق سيناريو: ${scenario.name}`);
    }
  };

  return {
    employees,
    loading,
    search,
    setSearch,
    selectedEmployee,
    simulation,
    setSimulation,
    results,
    calculating,
    filteredEmployees,
    selectEmployee,
    runSimulation,
    applyScenario,
  };
};
