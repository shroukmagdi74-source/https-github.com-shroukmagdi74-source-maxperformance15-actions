import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import api from "../../../services/api";
import { WarningFormData } from "./types";

export const useCreateWarningController = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<WarningFormData>({
    defaultValues: {
      employeeId: "",
      type: "VERBAL",
      severity: "minor",
      title: "",
      description: "",
      incidentDate: new Date().toISOString().split("T")[0],
      actionTaken: "",
    },
  });

  const selectedEmployeeId = watch("employeeId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await api.get("/hr/employees");
        setEmployees(empRes.data.employees || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        tToast.error("CreateWarning.failed_load_dbdf");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      const employee = employees.find((e) => e.id === selectedEmployeeId);
      setSelectedEmployee(employee);
    }
  }, [selectedEmployeeId, employees]);

  const onSubmit = async (data: WarningFormData) => {
    try {
      setLoading(true);

      if (!data.employeeId || data.employeeId.trim() === "") {
        tToast.error("CreateWarning.msg_a319");
        return;
      }

      await api.post("/hr/warnings", data);
      tToast.success("CreateWarning.msg_c304");
      navigate("/hr/warnings");
    } catch (error: any) {
      console.error("Error creating warning:", error);
      toast.error(error.response?.data?.error || "فشل في إصدار الإنذار");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigate("/hr/warnings");

  return {
    employees,
    loading,
    selectedEmployee,
    showPreview,
    setShowPreview,
    register,
    handleSubmit,
    control,
    watch,
    errors,
    onSubmit,
    goBack,
  };
};
