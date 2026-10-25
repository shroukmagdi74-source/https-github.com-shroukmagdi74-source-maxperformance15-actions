import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import api from "../../../services/api";
import { PromotionFormData } from "./types";
import { calculateSalaryIncrease } from "./helpers";

export const useEditPromotionController = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [promotion, setPromotion] = useState<any>(null);

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
      promotionDate: "",
      effectiveDate: "",
      reason: "",
      notes: "",
      status: "PENDING",
    },
  });

  const watchedEmployeeId = watch("employeeId");
  const watchedToSalary = watch("toSalary");
  const watchedFromSalary = watch("fromSalary");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const empRes = await api.get("/hr/employees");
        const employeesData =
          empRes.data.employees ||
          empRes.data.data ||
          (Array.isArray(empRes.data) ? empRes.data : []);
        setEmployees(employeesData);

        const promoRes = await api.get(`/hr/promotions/${id}`);
        const promotionData = promoRes.data.promotion || promoRes.data;

        if (!promotionData || typeof promotionData !== "object") {
          throw new Error("بيانات الترقية غير صالحة");
        }

        setPromotion(promotionData);

        setValue(
          "employeeId",
          promotionData.userId || promotionData.employeeId || "",
        );
        setValue("fromPositionId", promotionData.fromPositionId || "none");
        setValue("toPositionId", promotionData.toPositionId || "");
        setValue("fromPositionName", promotionData.fromPositionName || "");
        setValue("toPositionName", promotionData.toPositionName || "");
        setValue(
          "fromSalary",
          promotionData.fromSalary != null
            ? Number(promotionData.fromSalary)
            : undefined,
        );
        setValue(
          "toSalary",
          promotionData.toSalary != null
            ? Number(promotionData.toSalary)
            : undefined,
        );
        setValue(
          "promotionDate",
          promotionData.promotionDate
            ? String(promotionData.promotionDate).split("T")[0]
            : "",
        );
        setValue(
          "effectiveDate",
          promotionData.effectiveDate
            ? String(promotionData.effectiveDate).split("T")[0]
            : "",
        );
        setValue("reason", promotionData.reason || "");
        setValue("notes", promotionData.notes || "");
        setValue("status", promotionData.status || "PENDING");

        if (promotionData.fromPositionId && employeesData.length > 0) {
          const emp = employeesData.find(
            (e: any) =>
              e.id === (promotionData.userId || promotionData.employeeId),
          );
          if (emp) {
            setSelectedEmployee(emp);
          }
        }

        try {
          const posRes = await api.get("/hr/positions");
          setPositions(posRes.data.positions || []);
        } catch (e) {
          console.warn("Could not fetch positions", e);
        }
      } catch (error: any) {
        console.error("Error fetching promotion:", error);
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "فشل في تحميل بيانات الترقية";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, setValue]);

  useEffect(() => {
    if (watchedEmployeeId && employees.length > 0) {
      const emp = employees.find((e) => e.id === watchedEmployeeId);
      setSelectedEmployee(emp || null);

      if (promotion && watchedEmployeeId !== promotion.userId) {
        if (emp) {
          setValue("fromPositionName", emp.position?.title || "");
          setValue("fromPositionId", emp.position?.id || "none");
          setValue(
            "fromSalary",
            emp.baseSalary ? Number(emp.baseSalary) : undefined,
          );
        }
      }
    }
  }, [watchedEmployeeId, employees, promotion, setValue]);

  const increaseStats = calculateSalaryIncrease(
    watchedFromSalary,
    watchedToSalary,
  );

  const onSubmit = async (data: PromotionFormData) => {
    try {
      setSaving(true);

      if (!data.employeeId) {
        tToast.error("EditPromotion.msg_0242");
        return;
      }

      if (!data.toPositionName) {
        tToast.error("EditPromotion.msg_d62b");
        return;
      }

      const payload = {
        ...data,
        fromSalary:
          data.fromSalary !== undefined && data.fromSalary !== null
            ? Number(data.fromSalary)
            : undefined,
        toSalary:
          data.toSalary !== undefined && data.toSalary !== null
            ? Number(data.toSalary)
            : undefined,
      };

      await api.put(`/hr/promotions/${id}`, payload);
      tToast.success("EditPromotion.success_update_a27f");
      navigate("/hr/promotions");
    } catch (error: any) {
      console.error("Error updating promotion:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "فشل في تحديث الترقية";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => navigate("/hr/promotions");

  return {
    loading,
    saving,
    employees,
    positions,
    selectedEmployee,
    promotion,
    register,
    handleSubmit,
    control,
    errors,
    increaseStats,
    onSubmit,
    goBack,
  };
};
