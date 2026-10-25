import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import api from "../../../services/api";
import { PromotionEmployee, PromotionFormData } from "./types";
import { calculateSalaryIncrease } from "./helpers";

export const useCreatePromotionController = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<PromotionEmployee[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<PromotionEmployee | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PromotionFormData>({
    defaultValues: {
      employeeId: "",
      fromPositionId: "none",
      fromPositionName: "",
      toPositionId: "",
      toPositionName: "",
      fromSalary: undefined,
      toSalary: undefined,
      promotionDate: today,
      effectiveDate: today,
      reason: "",
      notes: "",
    },
  });

  const watchedEmployeeId = watch("employeeId");
  const watchedToSalary = watch("toSalary");
  const watchedFromSalary = watch("fromSalary");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await api.get("/hr/employees");
        setEmployees(empRes.data.employees || []);

        try {
          const posRes = await api.get("/hr/positions");
          setPositions(posRes.data.positions || []);
        } catch (e) {
          console.warn("Could not fetch positions", e);
        }
      } catch (error: any) {
        console.error("❌ Error fetching data:", error);
        tToast.error("CreatePromotion.failed_load_a9d9");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (watchedEmployeeId && employees.length > 0) {
      const emp = employees.find((e) => e.id === watchedEmployeeId);
      setSelectedEmployee(emp || null);

      if (emp) {
        setValue("fromPositionName", emp.position?.title || "");
        setValue("fromPositionId", emp.position?.id || "none");
        setValue(
          "fromSalary",
          emp.baseSalary ? Number(emp.baseSalary) : undefined
        );
      }
    } else {
      setSelectedEmployee(null);
    }
  }, [watchedEmployeeId, employees, setValue]);

  const increaseStats = calculateSalaryIncrease(
    watchedFromSalary,
    watchedToSalary
  );

  const onSubmit = async (data: PromotionFormData) => {
    try {
      setLoading(true);

      if (!data.employeeId) {
        tToast.error("CreatePromotion.msg_c6e2");
        setLoading(false);
        return;
      }

      if (!data.toPositionName) {
        tToast.error("CreatePromotion.msg_754a");
        setLoading(false);
        return;
      }

      if (
        data.fromPositionName &&
        data.toPositionName &&
        data.fromPositionName.trim().toLowerCase() ===
          data.toPositionName.trim().toLowerCase()
      ) {
        tToast.error("CreatePromotion.msg_1de3");
        setLoading(false);
        return;
      }

      const payload = {
        ...data,
        fromSalary: data.fromSalary ? Number(data.fromSalary) : undefined,
        toSalary: data.toSalary ? Number(data.toSalary) : undefined,
      };

      await api.post("/hr/promotions", payload);
      tToast.success("CreatePromotion.success_create_e6da");
      navigate("/hr/promotions");
    } catch (error: any) {
      console.error("❌ Error creating promotion:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "فشل في إنشاء الترقية";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    navigate,
    loading,
    employees,
    positions,
    selectedEmployee,
    increaseStats,
    register,
    handleSubmit,
    control,
    errors,
    onSubmit,
  };
};
