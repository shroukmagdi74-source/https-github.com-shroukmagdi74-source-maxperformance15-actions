import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { tToast } from "../../../utils/i18n-toast";
import { Employee } from "./types";

export const useEmployeeDetailsController = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchEmployee = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await api.get(`/hr/employees/${id}`);
      setEmployee(response.data.employee || null);
    } catch (error) {
      console.error("Error fetching employee:", error);
      tToast.error("EmployeeDetails.error_error_e639");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  return {
    id,
    loading,
    employee,
    activeTab,
    setActiveTab,
    navigate,
    fetchEmployee,
  };
};
