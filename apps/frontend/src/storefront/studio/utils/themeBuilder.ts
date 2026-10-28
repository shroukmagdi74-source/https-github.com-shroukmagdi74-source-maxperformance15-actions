import type { PageStyleScope } from "../StudioTypes";

export type ThemeBuilderTemplateType = "archive" | "single";
export type ThemeBuilderTargetType = "products" | "product" | "article" | "collection";

export interface ThemeBuilderCondition {
  applyTo: "all" | "group" | "specific";
  groupId?: string;
  groupSlug?: string;
  categoryIds?: string[];
  productIds?: string[];
  collectionIds?: string[];
  tags?: string[];
}

export interface ThemeBuilderPageContent {
  id?: string;
  key?: string;
  title?: string;
  sections: any[];
  styles?: PageStyleScope;
  seo?: Record<string, any>;
  layout?: string;
}

export interface ThemeBuilderTemplate {
  id: string;
  name: string;
  type: ThemeBuilderTemplateType; // "archive" | "single"
  target: ThemeBuilderTargetType; // "products" | "product" | "article"
  conditions: ThemeBuilderCondition;
  page: ThemeBuilderPageContent;
  isActive?: boolean;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResolveTemplateParams {
  templates?: ThemeBuilderTemplate[] | null;
  type: ThemeBuilderTemplateType;
  target: ThemeBuilderTargetType;
  entity?: {
    id?: string | number;
    categoryId?: string | number;
    categorySlug?: string;
    groupId?: string;
    groupSlug?: string;
    category?: { id?: string | number; slug?: string; name?: string };
    collectionId?: string | number;
    collectionSlug?: string;
    tags?: string[];
    [key: string]: any;
  } | null;
  groupId?: string;
}

/**
 * Resolves the appropriate Theme Builder template matching the target entity and conditions.
 * Returns null if no template matches, indicating a fallback to the default page.
 */
export function resolveThemeBuilderTemplate(
  params: ResolveTemplateParams
): ThemeBuilderTemplate | null {
  const templates = params.templates;
  if (!templates || !Array.isArray(templates) || templates.length === 0) {
    return null;
  }

  // 1. Filter templates by type, target, and active status
  const candidates = templates.filter((t) => {
    if (t.isActive === false) return false;
    if (t.type !== params.type) return false;
    if (t.target !== params.target) return false;
    return true;
  });

  if (candidates.length === 0) {
    return null;
  }

  // 2. Extract entity group identifiers
  const entity = params.entity || {};
  const entityId = entity.id !== undefined && entity.id !== null ? String(entity.id) : "";
  const entityGroupId = String(
    params.groupId ||
      entity.groupId ||
      entity.categoryId ||
      entity.category?.id ||
      entity.collectionId ||
      ""
  );
  const entityGroupSlug = String(
    entity.groupSlug ||
      entity.categorySlug ||
      entity.category?.slug ||
      entity.collectionSlug ||
      ""
  );

  // Sort candidates by priority (higher priority first)
  const sorted = [...candidates].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // 3. Priority 1: Match specific group / entity conditions
  for (const template of sorted) {
    const cond = template.conditions;
    if (!cond) continue;

    if (cond.applyTo === "group" || cond.applyTo === "specific") {
      const targetGroup = String(cond.groupId || cond.groupSlug || "");
      if (
        targetGroup &&
        (targetGroup === entityGroupId || targetGroup === entityGroupSlug)
      ) {
        return template;
      }

      if (
        Array.isArray(cond.categoryIds) &&
        cond.categoryIds.some((cid) => String(cid) === entityGroupId || String(cid) === entityGroupSlug)
      ) {
        return template;
      }

      if (
        Array.isArray(cond.collectionIds) &&
        cond.collectionIds.some((cid) => String(cid) === entityGroupId || String(cid) === entityGroupSlug)
      ) {
        return template;
      }

      if (
        entityId &&
        Array.isArray(cond.productIds) &&
        cond.productIds.some((pid) => String(pid) === entityId)
      ) {
        return template;
      }
    }
  }

  // 4. Priority 2: "all" condition (universal fallback template)
  const allTemplate = sorted.find((t) => !t.conditions || t.conditions.applyTo === "all");
  return allTemplate || null;
}

/**
 * Creates an archive template for listing entities (e.g. all products or categories).
 */
export function archiveTemplate(
  params: Omit<ThemeBuilderTemplate, "type"> & { type?: "archive" }
): ThemeBuilderTemplate {
  return {
    ...params,
    type: "archive",
    target: params.target || "products",
    conditions: params.conditions || { applyTo: "all" },
    page: {
      ...params.page,
      sections: params.page?.sections || [],
    },
  };
}

/**
 * Creates a single entity template (e.g. single product or single article).
 */
export function singleTemplate(
  params: Omit<ThemeBuilderTemplate, "type"> & { type?: "single" }
): ThemeBuilderTemplate {
  return {
    ...params,
    type: "single",
    target: params.target || "product",
    conditions: params.conditions || { applyTo: "all" },
    page: {
      ...params.page,
      sections: params.page?.sections || [],
    },
  };
}

/**
 * Namespace export for Theme Builder engine.
 */
export const themeBuilder = {
  resolveTemplate: resolveThemeBuilderTemplate,
  archiveTemplate,
  singleTemplate,
  createArchive: archiveTemplate,
  createSingle: singleTemplate,
};

export default themeBuilder;
