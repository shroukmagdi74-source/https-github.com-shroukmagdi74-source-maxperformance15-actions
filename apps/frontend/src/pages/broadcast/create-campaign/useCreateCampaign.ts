import { useState, useEffect, useCallback } from "react";
import { broadcastService } from "../../../services/broadcastService";
import type { CampaignFormData, CustomerList } from "./types";

const INITIAL_FORM_DATA: CampaignFormData = {
  name: "",
  message: "",
  targetAudience: "",
  scheduledAt: "",
  scheduledTime: "",
  recipientCount: 0,
  tags: [],
  priority: "medium",
  includeImages: false,
  trackClicks: true,
  autoResend: false,
  sendNow: false,
  images: [],
};

export function useCreateCampaign() {
  const [formData, setFormData] = useState<CampaignFormData>(INITIAL_FORM_DATA);
  const [customerLists, setCustomerLists] = useState<CustomerList[]>([]);
  const [newTag, setNewTag] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [currentCampaignId, setCurrentCampaignId] = useState<string>("");
  const [currentCampaignName, setCurrentCampaignName] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [messageTextareaRef, setMessageTextareaRef] =
    useState<HTMLTextAreaElement | null>(null);

  const loadCustomerLists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await broadcastService.getCustomerLists();

      let listsArray: CustomerList[] = [];
      if (Array.isArray(response)) {
        listsArray = response;
      } else if (response && typeof response === "object") {
        if ("data" in response && Array.isArray((response as any).data)) {
          listsArray = (response as any).data;
        } else if (
          "success" in response &&
          "data" in response &&
          Array.isArray((response as any).data)
        ) {
          listsArray = (response as any).data;
        }
      }

      setCustomerLists(listsArray);
    } catch (err: any) {
      console.error("Error loading customer lists:", err);
      setError(
        err.message || "فشل في تحميل قوائم العملاء. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomerLists();
  }, [loadCustomerLists]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (name === "targetAudience") {
        const selectedList = customerLists.find((list) => list.id === value);
        if (selectedList) {
          setFormData((prev) => ({
            ...prev,
            recipientCount: selectedList.count || 0,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            recipientCount: 0,
          }));
        }
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSendNowChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sendNow: checked,
      scheduledAt: checked ? "" : prev.scheduledAt,
      scheduledTime: checked ? "" : prev.scheduledTime,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "اسم الحملة مطلوب";
    if (!formData.message.trim()) return "نص الرسالة مطلوب";
    if (!formData.targetAudience) return "يجب اختيار الجمهور المستهدف";

    if (!formData.sendNow) {
      if (!formData.scheduledAt) return "تاريخ الإرسال مطلوب";
      if (!formData.scheduledTime) return "وقت الإرسال مطلوب";

      const scheduledDateTime = new Date(
        `${formData.scheduledAt}T${formData.scheduledTime}`
      );
      const now = new Date();
      const maxDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      if (scheduledDateTime <= now) {
        return "يجب أن يكون موعد الإرسال في المستقبل";
      }

      if (scheduledDateTime > maxDate) {
        return "لا يمكن جدولة الحملة لأكثر من 24 ساعة مقدماً";
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("message", formData.message);
      formDataToSend.append("targetAudience", formData.targetAudience);
      if (!formData.sendNow) {
        const localDateTime = new Date(
          `${formData.scheduledAt}T${formData.scheduledTime}`
        );
        const utcDateTime = localDateTime.toISOString();
        formDataToSend.append("scheduledAt", utcDateTime);
      }
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("includeImages", String(formData.includeImages));
      formDataToSend.append("trackClicks", String(formData.trackClicks));
      formDataToSend.append("autoResend", String(formData.autoResend));
      formDataToSend.append("sendNow", String(formData.sendNow));
      formData.tags.forEach((tag) => formDataToSend.append("tags[]", tag));
      formData.images.forEach((file) => formDataToSend.append("images", file));

      const createdCampaign =
        await broadcastService.createCampaign(formDataToSend);

      if (createdCampaign?.data?.status === "sending") {
        setCurrentCampaignId(createdCampaign.data.id);
        setCurrentCampaignName(formData.name);
        setShowProgressModal(true);

        try {
          const sendResult = await broadcastService.sendCampaign(
            createdCampaign.data.id
          );
          if (!sendResult.success) {
            throw new Error(sendResult.message || "فشل في إرسال الحملة");
          }
        } catch (sendError: any) {
          console.error("Error sending campaign:", sendError);
          throw new Error(
            `فشل في إرسال الحملة: ${sendError.message || sendError.toString()}`
          );
        }
      }

      if (!formData.sendNow) {
        setSuccess(true);
        setSuccessMessage("تم إنشاء الحملة وجدولتها بنجاح!");

        setTimeout(() => {
          setSuccess(false);
          setSuccessMessage("");
          setFormData(INITIAL_FORM_DATA);
        }, 3000);
      }
    } catch (err: any) {
      console.error("Error creating campaign:", err);
      setError(err.message || "فشل في إنشاء الحملة. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const insertVariable = (variable: string) => {
    if (!messageTextareaRef) return;

    const textarea = messageTextareaRef;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.message;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newMessage = before + variable + after;
    setFormData((prev) => ({ ...prev, message: newMessage }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + variable.length,
        start + variable.length
      );
    }, 0);
  };

  const getPreviewMessage = () => {
    if (!formData.message) return "اكتب رسالتك لرؤية المعاينة...";

    let preview = formData.message;
    preview = preview.replace(/{customerName}/g, "محمد أحمد");
    preview = preview.replace(/{firstName}/g, "محمد");
    preview = preview.replace(/{lastName}/g, "أحمد");

    return preview;
  };

  const selectedList = customerLists.find(
    (list) => list.id === formData.targetAudience
  );

  return {
    formData,
    setFormData,
    customerLists,
    newTag,
    setNewTag,
    addTag,
    removeTag,
    previewMode,
    setPreviewMode,
    loading,
    error,
    setError,
    showProgressModal,
    setShowProgressModal,
    currentCampaignId,
    currentCampaignName,
    success,
    successMessage,
    messageTextareaRef,
    setMessageTextareaRef,
    handleInputChange,
    handleImageChange,
    removeImage,
    handleSendNowChange,
    handleSubmit,
    insertVariable,
    getPreviewMessage,
    selectedList,
  };
}
