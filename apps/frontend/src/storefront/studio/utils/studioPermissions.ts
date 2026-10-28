/**
 * studioPermissions.ts
 * Pure permissions resolution, optimistic concurrency checking, and heartbeat utilities
 * for MaxP Storefront Studio (PERM-1).
 */

export interface StudioUser {
  id?: string;
  role?: string;
  permissions?: string[];
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
}

export interface StudioCompany {
  id?: string;
  role?: string;
  name?: string;
}

export interface StudioAccessResult {
  canEdit: boolean;
  canPublish: boolean;
  reason:
    | "owner_full_access"
    | "admin_full_access"
    | "manager_full_access"
    | "employee_edit_only"
    | "employee_edit_and_publish"
    | "viewer_no_permission"
    | "viewer_role"
    | "anonymous_viewer";
}

const FULL_ACCESS_ROLES = new Set([
  "owner",
  "company_admin",
  "admin",
  "super_admin",
  "manager",
]);

/**
 * Pure helper: Resolves studio permissions based on user role and permissions.
 * - Owner / Admin / Manager => Full access (canEdit: true, canPublish: true)
 * - Employee with storefront.edit => Edit without publish (canEdit: true, canPublish: false)
 * - Everyone else => Viewer (canEdit: false, canPublish: false)
 */
export function resolveStudioAccess(
  user?: StudioUser | null,
  company?: StudioCompany | null
): StudioAccessResult {
  if (!user) {
    return {
      canEdit: false,
      canPublish: false,
      reason: "anonymous_viewer",
    };
  }

  const userRole = (user.role || "").trim().toLowerCase();
  const companyRole = (company?.role || "").trim().toLowerCase();

  // 1. Owner / Manager / Admin check
  if (FULL_ACCESS_ROLES.has(userRole) || FULL_ACCESS_ROLES.has(companyRole)) {
    if (userRole === "owner" || companyRole === "owner") {
      return { canEdit: true, canPublish: true, reason: "owner_full_access" };
    }
    if (userRole === "manager" || companyRole === "manager") {
      return { canEdit: true, canPublish: true, reason: "manager_full_access" };
    }
    return { canEdit: true, canPublish: true, reason: "admin_full_access" };
  }

  const permissions = Array.isArray(user.permissions)
    ? user.permissions.map((p) => p.trim().toLowerCase())
    : [];

  // Wildcard permissions grant full access
  if (
    permissions.includes("*") ||
    permissions.includes("storefront.*") ||
    permissions.includes("storefront.all")
  ) {
    return { canEdit: true, canPublish: true, reason: "admin_full_access" };
  }

  const hasEdit =
    permissions.includes("storefront.edit") ||
    permissions.includes("storefront:edit");
  const hasPublish =
    permissions.includes("storefront.publish") ||
    permissions.includes("storefront:publish");

  // 2. Employee with storefront.edit
  if (hasEdit) {
    if (hasPublish) {
      return {
        canEdit: true,
        canPublish: true,
        reason: "employee_edit_and_publish",
      };
    }
    return {
      canEdit: true,
      canPublish: false,
      reason: "employee_edit_only",
    };
  }

  // 3. Everyone else => Viewer
  if (userRole === "viewer" || userRole === "customer" || userRole === "guest") {
    return {
      canEdit: false,
      canPublish: false,
      reason: "viewer_role",
    };
  }

  return {
    canEdit: false,
    canPublish: false,
    reason: "viewer_no_permission",
  };
}

// ============================================================================
// Heartbeat utilities (sessionStorage based active editors tracking)
// ============================================================================

export interface StudioActiveEditor {
  sessionId: string;
  userId?: string;
  userName: string;
  pageKey: string;
  lastHeartbeat: number;
}

export const STUDIO_HEARTBEAT_STORAGE_KEY = "maxp_studio_active_editors";
export const HEARTBEAT_EXPIRY_MS = 60000; // 60 seconds

function getSafeStorage(storage?: Storage): Storage | null {
  if (storage) return storage;
  if (typeof window !== "undefined" && window.sessionStorage) {
    return window.sessionStorage;
  }
  return null;
}

export function recordStudioHeartbeat(
  pageKey: string,
  user: StudioUser | null | undefined,
  sessionId: string,
  storage?: Storage
): StudioActiveEditor[] {
  const targetStorage = getSafeStorage(storage);
  if (!targetStorage) return [];

  try {
    const raw = targetStorage.getItem(STUDIO_HEARTBEAT_STORAGE_KEY);
    let editors: StudioActiveEditor[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          editors = parsed;
        }
      } catch {
        editors = [];
      }
    }

    const now = Date.now();
    // Prune entries older than HEARTBEAT_EXPIRY_MS
    editors = editors.filter((e) => now - e.lastHeartbeat < HEARTBEAT_EXPIRY_MS);

    const userName =
      user?.name ||
      (user?.firstName
        ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`.trim()
        : "") ||
      user?.email ||
      `محرر (${sessionId.slice(-4)})`;

    const existingIdx = editors.findIndex((e) => e.sessionId === sessionId);
    const entry: StudioActiveEditor = {
      sessionId,
      userId: user?.id,
      userName,
      pageKey,
      lastHeartbeat: now,
    };

    if (existingIdx >= 0) {
      editors[existingIdx] = entry;
    } else {
      editors.push(entry);
    }

    targetStorage.setItem(STUDIO_HEARTBEAT_STORAGE_KEY, JSON.stringify(editors));
    return editors.filter((e) => e.pageKey === pageKey);
  } catch {
    return [];
  }
}

export function getActiveStudioEditors(
  pageKey: string,
  storage?: Storage,
  maxAgeMs = HEARTBEAT_EXPIRY_MS
): StudioActiveEditor[] {
  const targetStorage = getSafeStorage(storage);
  if (!targetStorage) return [];

  try {
    const raw = targetStorage.getItem(STUDIO_HEARTBEAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter(
      (e) => e.pageKey === pageKey && now - e.lastHeartbeat < maxAgeMs
    );
  } catch {
    return [];
  }
}

export function clearStudioHeartbeat(sessionId: string, storage?: Storage): void {
  const targetStorage = getSafeStorage(storage);
  if (!targetStorage) return;

  try {
    const raw = targetStorage.getItem(STUDIO_HEARTBEAT_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    const filtered = parsed.filter((e) => e.sessionId !== sessionId);
    targetStorage.setItem(STUDIO_HEARTBEAT_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore error
  }
}

// ============================================================================
// Optimistic Concurrency Helpers
// ============================================================================

export interface StudioTokensDiffSummary {
  hasChanges: boolean;
  changedPages: string[];
  themeChanged: boolean;
  details: string[];
}

export function checkOptimisticConcurrency(
  baseRevision: number,
  serverRevision: number
): { conflict: boolean; reason?: string } {
  if (serverRevision > baseRevision) {
    return {
      conflict: true,
      reason: `Revision mismatch: base is #${baseRevision}, but server is at #${serverRevision}`,
    };
  }
  return { conflict: false };
}

export function computeTokensDiff(
  localTokens?: Record<string, unknown> | null,
  serverTokens?: Record<string, unknown> | null
): StudioTokensDiffSummary {
  const result: StudioTokensDiffSummary = {
    hasChanges: false,
    changedPages: [],
    themeChanged: false,
    details: [],
  };

  if (!localTokens && !serverTokens) return result;
  if (!localTokens || !serverTokens) {
    result.hasChanges = true;
    result.details.push("أحد الإصدارين فارغ بالكامل");
    return result;
  }

  if (localTokens.themeId !== serverTokens.themeId) {
    result.hasChanges = true;
    result.themeChanged = true;
    result.details.push(
      `تغير القالب: ${String(localTokens.themeId || "افتراضي")} مقابل ${String(
        serverTokens.themeId || "افتراضي"
      )}`
    );
  }

  const localPages = (localTokens.pages as Record<string, unknown>) || {};
  const serverPages = (serverTokens.pages as Record<string, unknown>) || {};
  const allPageKeys = Array.from(
    new Set([...Object.keys(localPages), ...Object.keys(serverPages)])
  );

  for (const pageKey of allPageKeys) {
    const hasLocal = Object.prototype.hasOwnProperty.call(localPages, pageKey);
    const hasServer = Object.prototype.hasOwnProperty.call(serverPages, pageKey);

    if (!hasLocal && hasServer) {
      result.hasChanges = true;
      result.changedPages.push(pageKey);
      result.details.push(`إضافة صفحة: ${pageKey}`);
    } else if (hasLocal && !hasServer) {
      result.hasChanges = true;
      result.changedPages.push(pageKey);
      result.details.push(`حذف صفحة: ${pageKey}`);
    } else if (JSON.stringify(localPages[pageKey]) !== JSON.stringify(serverPages[pageKey])) {
      result.hasChanges = true;
      result.changedPages.push(pageKey);
      result.details.push(`تعديل في صفحة: ${pageKey}`);
    }
  }

  return result;
}
