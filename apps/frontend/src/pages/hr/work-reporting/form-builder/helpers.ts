import { slugifyFieldKey } from "../utils";
import { WorkReportField, WorkReportTemplateDraft } from "../types";

export const buildBlankField = (index: number): WorkReportField => ({
  key: `field_${index + 1}`,
  label: "",
  helpText: "",
  sourceType: "MANUAL",
  dataType: "TEXT",
  isRequired: false,
  isVisible: true,
  placeholder: "",
  orderIndex: index,
  systemKey: null,
  formula: null,
  options: [],
});

export const cloneDraft = (
  draft: WorkReportTemplateDraft
): WorkReportTemplateDraft => ({
  ...draft,
  fields: draft.fields.map((field, index) => ({
    ...field,
    options: [...field.options],
    orderIndex: index,
  })),
});

export const normalizeDraftForSubmit = (
  formState: WorkReportTemplateDraft
): WorkReportTemplateDraft => ({
  ...formState,
  title: formState.title.trim(),
  description: formState.description.trim(),
  fields: formState.fields.map((field, index) => ({
    ...field,
    label: field.label.trim(),
    key: slugifyFieldKey(field.key || field.label) || `field_${index + 1}`,
    helpText: field.helpText?.trim() || "",
    placeholder: field.placeholder?.trim() || "",
    formula: field.formula?.trim() || "",
    orderIndex: index,
    options: field.options.map((option) => option.trim()).filter(Boolean),
  })),
});

export const computeFieldSourceCounts = (fields: WorkReportField[]) => {
  const sourceCount = {
    SYSTEM: 0,
    MANUAL: 0,
    CALCULATED: 0,
  };
  fields.forEach((field) => {
    sourceCount[field.sourceType] += 1;
  });
  return sourceCount;
};
