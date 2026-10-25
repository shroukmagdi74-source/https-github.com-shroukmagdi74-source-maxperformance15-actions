import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import api from "../../../services/api";
import { FeedbackEmployee, FeedbackFormData } from "./types";
import { isReviewFeedbackType } from "./helpers";

export const useCreateFeedbackController = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const isPersonal = window.location.pathname.startsWith("/my-feedback");
  const [employees, setEmployees] = useState<FeedbackEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEdit);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    defaultValues: {
      toEmployeeId: isPersonal ? "management" : "",
      type: isPersonal ? "SUGGESTION" : "PEER",
      category: "",
      content: "",
      rating: 0,
      isAnonymous: false,
    },
  });

  const currentRating = watch("rating");
  const currentType = watch("type");
  const selectedEmployeeId = watch("toEmployeeId");
  const selectedEmployee =
    employees.find((e) => e.id === selectedEmployeeId) || null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await api.get("/hr/employees");
        setEmployees(empRes.data.employees || []);

        if (isEdit) {
          const fbRes = await api.get(`/hr/feedback/${id}`);
          const currentFB = fbRes.data.feedback;

          if (currentFB) {
            setValue("toEmployeeId", currentFB.toUserId || "management");
            setValue("type", currentFB.type);
            setValue("category", currentFB.category || "");
            setValue("content", currentFB.content);
            setValue("rating", currentFB.rating || 0);
            setValue("isAnonymous", currentFB.isAnonymous);
          } else {
            tToast.error("CreateFeedback.msg_ad77");
            navigate("/my-feedback");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        tToast.error("CreateFeedback.failed_load_cfaf");
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [id, isEdit, setValue, navigate]);

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      const isReviewType = isReviewFeedbackType(data.type);
      if (isReviewType && data.rating === 0) {
        tToast.error("CreateFeedback.msg_79e3");
        return;
      }
      setLoading(true);
      const payload = {
        ...data,
        toUserId:
          data.toEmployeeId === "management" ? null : data.toEmployeeId,
        rating: isReviewType ? Number(data.rating) : null,
      };

      if (isEdit) {
        await api.put(`/hr/feedback/${id}`, payload);
        tToast.success("CreateFeedback.success_update_293e");
      } else {
        await api.post("/hr/feedback", payload);
        tToast.success("CreateFeedback.msg_1de5");
      }
      navigate("/my-feedback");
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error(
        isEdit ? "فشل في تحديث البيانات" : "فشل في عملية الإرسال"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    navigate,
    isEdit,
    isPersonal,
    employees,
    loading,
    fetchingData,
    hoverRating,
    setHoverRating,
    register,
    handleSubmit,
    control,
    setValue,
    errors,
    currentRating,
    currentType,
    selectedEmployee,
    onSubmit,
  };
};
