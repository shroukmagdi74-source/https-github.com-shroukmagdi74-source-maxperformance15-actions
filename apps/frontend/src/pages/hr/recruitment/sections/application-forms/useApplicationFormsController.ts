import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import i18n from "../../../../../i18n";
import { tToast } from "../../../../../utils/i18n-toast";
import { companyAwareApi } from "../../../../../services/companyAwareApi";
import {
  ApplicationForm,
  FormResponse,
  JobOption,
  NewFormDraft,
  Question,
  ResponseFilter,
} from "./types";
import {
  createEmptyFormDraft,
  createEmptyQuestionDraft,
  patchResponseInList,
  reorderQuestions,
} from "./helpers";

export const useApplicationFormsController = () => {
  const [forms, setForms] = useState<ApplicationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [showResponseDetailModal, setShowResponseDetailModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<ApplicationForm | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [responseFilter, setResponseFilter] = useState<ResponseFilter>("all");
  const [updatingResponseId, setUpdatingResponseId] = useState<string | null>(null);
  const [convertingResponseId, setConvertingResponseId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [newForm, setNewForm] = useState<NewFormDraft>(() => createEmptyFormDraft());
  const [newQuestion, setNewQuestion] = useState<Question>(() => createEmptyQuestionDraft());
  const [optionInput, setOptionInput] = useState("");

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await companyAwareApi.get("/hr/recruitment/forms");
      if (response.data.success) setForms(response.data.data);
    } catch {
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await companyAwareApi.get("/hr/recruitment/jobs");
      if (response.data.success) {
        setJobs(response.data.data.map((j: any) => ({ id: j.id, title: j.title })));
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchForms();
    fetchJobs();
  }, [fetchForms, fetchJobs]);

  const resetForm = () => {
    setNewForm(createEmptyFormDraft());
    setNewQuestion(createEmptyQuestionDraft());
    setSelectedForm(null);
  };

  const handleCreateForm = async () => {
    if (!newForm.title.trim()) {
      tToast.error("applicationForms.msg_0a56");
      return;
    }
    try {
      const response = await companyAwareApi.post("/hr/recruitment/forms", newForm);
      if (response.data.success) {
        tToast.success("applicationForms.success_create_aa40");
        setShowCreateModal(false);
        fetchForms();
        resetForm();
      }
    } catch {
      tToast.error("applicationForms.error_error_81bb");
    }
  };

  const handleUpdateForm = async () => {
    if (!selectedForm || !newForm.title.trim()) {
      tToast.error("applicationForms.msg_0a56");
      return;
    }
    try {
      const response = await companyAwareApi.put(
        `/hr/recruitment/forms/${selectedForm.id}`,
        newForm
      );
      if (response.data.success) {
        tToast.success("applicationForms.success_update_89da");
        setShowEditModal(false);
        fetchForms();
        resetForm();
      }
    } catch {
      tToast.error("applicationForms.error_error_485e");
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الفورم؟")) return;
    try {
      const response = await companyAwareApi.delete(`/hr/recruitment/forms/${formId}`);
      if (response.data.success) {
        tToast.success("applicationForms.success_delete_d329");
        fetchForms();
      }
    } catch {
      tToast.error("applicationForms.error_error_f86a");
    }
  };

  const handleEditForm = async (form: ApplicationForm) => {
    try {
      const response = await companyAwareApi.get(`/hr/recruitment/forms/${form.id}`);
      if (response.data.success) {
        const formData = response.data.data;
        setSelectedForm(formData);
        setNewForm({
          title: formData.title,
          slug: formData.slug || "",
          description: formData.description || "",
          jobId: formData.jobId || "",
          isActive: formData.isActive,
          questions: formData.questions || [],
        });
        setShowEditModal(true);
      }
    } catch {
      tToast.error("applicationForms.error_error_6bea");
    }
  };

  const handleViewResponses = async (form: ApplicationForm) => {
    try {
      setSelectedForm(form);
      setResponseFilter("all");
      const response = await companyAwareApi.get(`/hr/recruitment/forms/${form.id}/responses`);
      if (response.data.success) {
        setResponses(response.data.data);
        setShowResponsesModal(true);
      }
    } catch {
      tToast.error("applicationForms.error_error_b108");
    }
  };

  const handleViewResponseDetail = async (responseItem: FormResponse) => {
    try {
      const response = await companyAwareApi.get(`/hr/recruitment/responses/${responseItem.id}`);
      if (response.data.success) {
        setSelectedResponse(response.data.data);
        setShowResponseDetailModal(true);
      }
    } catch {
      tToast.error("applicationForms.error_error_088a");
    }
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الرد؟")) return;
    try {
      const response = await companyAwareApi.delete(`/hr/recruitment/responses/${responseId}`);
      if (response.data.success) {
        tToast.success("applicationForms.success_delete_62be");
        if (selectedForm) handleViewResponses(selectedForm);
      }
    } catch {
      tToast.error("applicationForms.error_error_d252");
    }
  };

  const handleToggleContactStatus = async (responseId: string, isContacted: boolean) => {
    try {
      setUpdatingResponseId(responseId);
      const response = await companyAwareApi.put(
        `/hr/recruitment/responses/${responseId}/contact-status`,
        { isContacted }
      );
      if (response.data.success) {
        const { isContacted: nextContacted, contactedAt } = response.data.data;
        const patch = { isContacted: nextContacted, contactedAt };
        setResponses((prev) => patchResponseInList(prev, responseId, patch));
        setSelectedResponse((prev) => (prev?.id === responseId ? { ...prev, ...patch } : prev));
        toast.success(
          isContacted ? "تم تحديد الرد كـ تم التواصل" : "تم تحديد الرد كـ لم يتم التواصل"
        );
      }
    } catch {
      tToast.error("applicationForms.error_error_55c6");
    } finally {
      setUpdatingResponseId(null);
    }
  };

  const handleConvertResponseToApplicant = async (responseId: string) => {
    try {
      setConvertingResponseId(responseId);
      const response = await companyAwareApi.post(
        `/hr/recruitment/responses/${responseId}/convert-to-applicant`
      );
      if (response.data.success) {
        const updated = response.data.data;
        setResponses((prev) =>
          patchResponseInList(prev, responseId, { applicant: updated.applicant })
        );
        setSelectedResponse((prev) =>
          prev?.id === responseId
            ? { ...prev, applicant: updated.applicant, form: updated.form || prev.form }
            : prev
        );
        toast.success(response.data.message || i18n.t("applicationForms.msg_ed0e"));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "تعذر إضافة الرد إلى مسار التوظيف");
    } finally {
      setConvertingResponseId(null);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.questionText.trim()) {
      tToast.error("applicationForms.msg_ab6b");
      return;
    }
    const needsOptions = ["SELECT", "RADIO", "CHECKBOX"].includes(newQuestion.questionType);
    if (needsOptions && newQuestion.options.length < 2) {
      tToast.error("applicationForms.please_add_ffef");
      return;
    }
    setNewForm((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...newQuestion, orderIndex: prev.questions.length }],
    }));
    setNewQuestion(createEmptyQuestionDraft());
  };

  const removeQuestion = (index: number) =>
    setNewForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));

  const moveQuestion = (index: number, direction: "up" | "down") =>
    setNewForm((prev) => ({
      ...prev,
      questions: reorderQuestions(prev.questions, index, direction),
    }));

  const addOption = () => {
    if (!optionInput.trim()) return;
    setNewQuestion((prev) => ({ ...prev, options: [...prev.options, optionInput.trim()] }));
    setOptionInput("");
  };

  const removeOption = (index: number) =>
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));

  const copyFormLink = (formId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/apply/${formId}`);
    tToast.success("applicationForms.msg_ba5c");
  };

  const filteredForms = useMemo(
    () =>
      forms.filter(
        (form) =>
          form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (form.jobTitle && form.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [forms, searchTerm]
  );

  const contactedResponsesCount = useMemo(
    () => responses.filter((r) => r.isContacted).length,
    [responses]
  );
  const notContactedResponsesCount = responses.length - contactedResponsesCount;

  const visibleResponses = useMemo(
    () =>
      responses.filter((r) => {
        if (responseFilter === "contacted") return r.isContacted;
        if (responseFilter === "notContacted") return !r.isContacted;
        return true;
      }),
    [responses, responseFilter]
  );

  const selectedResponseCanJoinPipeline = Boolean(
    selectedResponse?.form?.jobId || selectedForm?.jobId
  );

  return {
    loading, searchTerm, setSearchTerm, showCreateModal, setShowCreateModal,
    showEditModal, setShowEditModal, showResponsesModal, setShowResponsesModal,
    showResponseDetailModal, setShowResponseDetailModal, selectedForm, responses,
    selectedResponse, responseFilter, setResponseFilter, updatingResponseId,
    convertingResponseId, jobs, newForm, setNewForm, newQuestion, setNewQuestion,
    optionInput, setOptionInput, handleCreateForm, handleUpdateForm, handleDeleteForm,
    handleEditForm, handleViewResponses, handleViewResponseDetail, handleDeleteResponse,
    handleToggleContactStatus, handleConvertResponseToApplicant, addQuestion,
    removeQuestion, moveQuestion, addOption, removeOption, resetForm, copyFormLink,
    filteredForms, contactedResponsesCount, notContactedResponsesCount,
    visibleResponses, selectedResponseCanJoinPipeline,
  };
};
