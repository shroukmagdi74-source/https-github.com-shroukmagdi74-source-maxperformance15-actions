import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { tToast } from "../../../utils/i18n-toast";
import api from "../../../services/api";
import { Employee, PerformanceReviewFormData } from "./types";
import { createInitialPerformanceReviewFormData } from "./helpers";

export const useCreatePerformanceReviewController = () => {
  const navigate = useNavigate();
  const { id: reviewId } = useParams<{ id?: string }>();
  const location = useLocation();
  const isEditing = Boolean(reviewId);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);

  const [formData, setFormData] = useState<PerformanceReviewFormData>(() =>
    createInitialPerformanceReviewFormData()
  );

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/hr/employees?limit=100");
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      tToast.error("CreatePerformanceReview.failed_fetch_8148");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReview = useCallback(async (id: string) => {
    try {
      setLoadingReview(true);
      const response = await api.get(`/hr/performance-reviews/${id}`);
      const review = response.data.review;
      if (!review) return;

      const today = new Date().toISOString().split("T")[0];
      setFormData({
        employeeId: review.userId || "",
        reviewerId: review.reviewerId || "",
        reviewPeriod: review.reviewPeriod || "",
        periodStart: review.periodStart
          ? new Date(review.periodStart).toISOString().split("T")[0]
          : today,
        periodEnd: review.periodEnd
          ? new Date(review.periodEnd).toISOString().split("T")[0]
          : today,
        overallRating: review.overallRating
          ? parseFloat(review.overallRating)
          : 5.0,
        strengths: review.strengths || "",
        improvements: review.improvements || "",
        reviewerComments: review.reviewerComments || "",
        status: review.status || "DRAFT",
      });
    } catch (error: any) {
      console.error("Error fetching review:", error);
      toast.error(error.response?.data?.error || "فشل في جلب التقييم");
    } finally {
      setLoadingReview(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();

    const params = new URLSearchParams(location.search);
    const empId = params.get("employeeId");
    if (empId && !isEditing) {
      setFormData((prev) => ({ ...prev, employeeId: empId }));
    }
  }, [location.search, isEditing, fetchEmployees]);

  useEffect(() => {
    if (isEditing && reviewId) {
      fetchReview(reviewId);
    }
  }, [isEditing, reviewId, fetchReview]);

  const handleSubmit = async () => {
    if (
      !formData.employeeId ||
      !formData.reviewerId ||
      !formData.reviewPeriod
    ) {
      tToast.error("CreatePerformanceReview.msg_aee9");
      return;
    }

    try {
      setSubmitting(true);
      if (isEditing && reviewId) {
        await api.put(`/hr/performance-reviews/${reviewId}`, formData);
        tToast.success("CreatePerformanceReview.success_update_80c1");
      } else {
        await api.post("/hr/performance-reviews", formData);
        tToast.success("CreatePerformanceReview.success_create_a683");
      }
      navigate("/hr/performance-reviews");
    } catch (error: any) {
      console.error("Error creating review:", error);
      toast.error(
        error.response?.data?.error ||
          (isEditing ? "فشل في تحديث التقييم" : "فشل في إنشاء التقييم")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
    navigate,
    isEditing,
    employees,
    loading,
    submitting,
    loadingReview,
    formData,
    setFormData,
    handleSubmit,
  };
};
