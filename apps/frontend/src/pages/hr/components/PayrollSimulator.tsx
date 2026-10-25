import React from "react";
import {
  usePayrollSimulatorController,
  PayrollSimulatorEmployeeList,
  PayrollSimulatorWorkspace,
  PayrollSimulatorResultsPanel,
} from "./payroll-simulator/index";

export default function PayrollSimulator() {
  const {
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
  } = usePayrollSimulatorController();

  return (
    <div className="flex gap-6 h-[calc(100dvh-180px)]" dir="rtl">
      <PayrollSimulatorEmployeeList
        search={search}
        onSearchChange={setSearch}
        filteredEmployees={filteredEmployees}
        selectedEmployee={selectedEmployee}
        onSelectEmployee={selectEmployee}
      />

      <div className="flex-1 overflow-hidden flex flex-col gap-6">
        <PayrollSimulatorWorkspace
          selectedEmployee={selectedEmployee}
          simulation={simulation}
          onSimulationChange={setSimulation}
          calculating={calculating}
          onRunSimulation={runSimulation}
          onApplyScenario={applyScenario}
        />
      </div>

      <PayrollSimulatorResultsPanel results={results} />
    </div>
  );
}
