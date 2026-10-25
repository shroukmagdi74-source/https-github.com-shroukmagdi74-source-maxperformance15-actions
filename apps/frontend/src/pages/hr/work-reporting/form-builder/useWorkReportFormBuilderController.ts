import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { tToast } from "../../../../utils/i18n-toast";
import { companyAwareApi } from "../../../../services/companyAwareApi";
import { buildMessagingPreset, SYSTEM_FIELD_OPTIONS } from "../catalog";
import { WorkReportField, WorkReportTemplateDraft } from "../types";
import {
  buildBlankField,
  cloneDraft,
  computeFieldSourceCounts,
  normalizeDraftForSubmit,
} from "./helpers";

export const useWorkReportFormBuilderController = () => {
  const navigate = useNavigate();
  const { formId } = useParams<{ formId: string }>();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(formId);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState<WorkReportTemplateDraft>({
    title: "",
    description: "",
    cadence: "DAILY",
    isActive: true,
    allowMultipleSubmissions: false,
    fields: [],
  });

  const applyDraft = (draft: WorkReportTemplateDraft) => {
    setFormState(cloneDraft(draft));
  };

  useEffect(() => {
    const loadExistingForm = async () => {
      if (!formId) return;

      try {
        setLoading(true);
        const response = await companyAwareApi.get<{
          data: WorkReportTemplateDraft;
        }>(`/hr/reporting/forms/${formId}`);
        if (response.data?.data) {
          applyDraft(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching reporting form:", error);
        tToast.error("WorkReportFormBuilder.unable_load_c717");
      } finally {
        setLoading(false);
      }
    };

    loadExistingForm();
  }, [formId]);

  useEffect(() => {
    if (isEditing) return;

    const presetName = searchParams.get("preset");
    const storedPreset = sessionStorage.getItem("work-report-form-preset");

    if (storedPreset) {
      try {
        const parsed = JSON.parse(storedPreset) as WorkReportTemplateDraft;
        applyDraft(parsed);
        sessionStorage.removeItem("work-report-form-preset");
        return;
      } catch {
        sessionStorage.removeItem("work-report-form-preset");
      }
    }

    if (presetName === "messaging") {
      applyDraft(buildMessagingPreset());
    }
  }, [isEditing, searchParams]);

  const visibleCounts = useMemo(
    () => computeFieldSourceCounts(formState.fields),
    [formState.fields]
  );

  const updateField = (
    index: number,
    updater: (field: WorkReportField) => WorkReportField
  ) => {
    setFormState((current) => ({
      ...current,
      fields: current.fields.map((field, fieldIndex) =>
        fieldIndex === index ? updater(field) : field
      ),
    }));
  };

  const addField = (sourceType: WorkReportField["sourceType"] = "MANUAL") => {
    setFormState((current) => {
      const nextIndex = current.fields.length;
      const candidate = buildBlankField(nextIndex);
      candidate.sourceType = sourceType;

      if (sourceType === "SYSTEM") {
        candidate.systemKey = SYSTEM_FIELD_OPTIONS[0]?.key || null;
        candidate.dataType = SYSTEM_FIELD_OPTIONS[0]?.dataType || "TEXT";
      }

      if (sourceType === "CALCULATED") {
        candidate.dataType = "NUMBER";
        candidate.formula = "";
      }

      return {
        ...current,
        fields: [...current.fields, candidate],
      };
    });
  };

  const duplicateField = (index: number) => {
    setFormState((current) => {
      const target = current.fields[index];
      if (!target) return current;

      const clone = {
        ...target,
        key: `${target.key}_copy`,
      };

      const fields = [...current.fields];
      fields.splice(index + 1, 0, clone);

      return {
        ...current,
        fields: fields.map((field, fieldIndex) => ({
          ...field,
          orderIndex: fieldIndex,
        })),
      };
    });
  };

  const removeField = (index: number) => {
    setFormState((current) => ({
      ...current,
      fields: current.fields
        .filter((_, fieldIndex) => fieldIndex !== index)
        .map((field, fieldIndex) => ({
          ...field,
          orderIndex: fieldIndex,
        })),
    }));
  };

  const moveField = (index: number, direction: -1 | 1) => {
    setFormState((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.fields.length) return current;

      const fields = [...current.fields];
      const [target] = fields.splice(index, 1);
      fields.splice(nextIndex, 0, target);

      return {
        ...current,
        fields: fields.map((field, fieldIndex) => ({
          ...field,
          orderIndex: fieldIndex,
        })),
      };
    });
  };

  const handleSave = async () => {
    const payload = normalizeDraftForSubmit(formState);

    if (!payload.title) {
      tToast.error("WorkReportFormBuilder.msg_92ff");
      return;
    }

    if (!payload.fields.length) {
      tToast.error("WorkReportFormBuilder.msg_b98e");
      return;
    }

    try {
      setSaving(true);
      if (isEditing && formId) {
        await companyAwareApi.put(`/hr/reporting/forms/${formId}`, payload);
        tToast.success("WorkReportFormBuilder.success_update_f51f");
      } else {
        const response = await companyAwareApi.post<{ data: { id: string } }>(
          "/hr/reporting/forms",
          payload
        );
        tToast.success("WorkReportFormBuilder.success_create_3fbf");
        const createdId = response.data?.data?.id;
        if (createdId) {
          navigate(`/hr/reporting/forms/${createdId}/preview`);
          return;
        }
      }

      navigate("/hr/reporting/forms");
    } catch (error: any) {
      console.error("Error saving reporting form:", error);
      toast.error(
        error?.response?.data?.message ||
          "تعذر حفظ الفورم، راجع الحقول مرة أخرى"
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    formId,
    isEditing,
    loading,
    saving,
    formState,
    setFormState,
    visibleCounts,
    applyDraft,
    updateField,
    addField,
    duplicateField,
    removeField,
    moveField,
    handleSave,
  };
};
