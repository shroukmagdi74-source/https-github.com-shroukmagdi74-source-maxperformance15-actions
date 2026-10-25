import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import api from "../../../services/api";
import { TrainingFormData } from "./types";

export const useCreateTrainingController = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TrainingFormData>({
    defaultValues: {
      employeeId: "",
      trainingName: "",
      provider: "",
      type: "technical",
      startDate: "",
      endDate: "",
      cost: "",
      duration: "",
      score: "",
      status: "PLANNED",
      description: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await api.get("/hr/employees");
        setEmployees(empRes.data.employees || []);

        if (isEdit) {
          setFetching(true);
          const trainingRes = await api.get(`/hr/trainings/${id}`);
          const training = trainingRes.data.training;

          if (training) {
            reset({
              employeeId: training.userId || training.employeeId,
              trainingName: training.trainingName,
              provider: training.provider || "",
              type: training.type || "technical",
              startDate: training.startDate
                ? new Date(training.startDate).toISOString().split("T")[0]
                : "",
              endDate: training.endDate
                ? new Date(training.endDate).toISOString().split("T")[0]
                : "",
              status: training.status,
              cost: training.cost?.toString() || "",
              duration: training.duration?.toString() || "",
              score: training.score?.toString() || "",
              description: training.description || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        tToast.error("CreateTraining.failed_load_7dfb");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id, isEdit, reset]);

  const onSubmit = async (data: TrainingFormData) => {
    try {
      setLoading(true);

      if (!data.employeeId || data.employeeId.trim() === "") {
        tToast.error("CreateTraining.msg_e5a0");
        return;
      }

      const payload = {
        ...data,
        employeeId: data.employeeId,
        cost: data.cost ? Number(data.cost) : 0,
        duration: data.duration ? Number(data.duration) : 0,
        score: data.score ? Number(data.score) : null,
      };

      if (isEdit) {
        await api.put(`/hr/trainings/${id}`, payload);
        tToast.success("CreateTraining.success_update_d670");
      } else {
        await api.post("/hr/trainings", payload);
        tToast.success("CreateTraining.success_add_818b");
      }

      navigate("/hr/training");
    } catch (error: any) {
      console.error("Error saving training:", error);
      toast.error(error.response?.data?.error || "فشل في حفظ بيانات التدريب");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("هل أنت متأكد من حذف هذا السجل التدريبي؟")) return;

    try {
      setLoading(true);
      await api.delete(`/hr/trainings/${id}`);
      tToast.success("CreateTraining.success_delete_b773");
      navigate("/hr/training");
    } catch (error: any) {
      console.error("Error deleting training:", error);
      toast.error(error.response?.data?.error || "فشل في حذف سجل التدريب");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigate("/hr/training");

  return {
    isEdit,
    employees,
    loading,
    fetching,
    register,
    handleSubmit,
    control,
    errors,
    onSubmit,
    handleDelete,
    goBack,
  };
};
