import tokenManager from "../../../utils/tokenManager";
import { buildApiUrl } from "../../../utils/urlHelper";

export type AgentProfilesTab = "settings" | "skills" | "tools" | "guardrails" | "automation";

export interface AgentItem {
  id: string;
  name: string;
  role: string;
  icon?: string;
  status?: string;
  allowedChannels?: string[];
  templateSlug?: string | null;
  description?: string | null;
}

export interface AgentTemplateItem {
  slug: string;
  name: string;
  role: string;
  allowedTools: string[];
  allowedSkills: string[];
}

export const FILES_EQUAL = (
  a: Record<string, string>,
  b: Record<string, string>,
): boolean => {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const k of keys) {
    if ((a?.[k] || "") !== (b?.[k] || "")) return false;
  }
  return true;
};

export async function tryApiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  try {
    let companyId = "";
    try {
      const userStr =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (userStr) companyId = JSON.parse(userStr).companyId || "";
    } catch {
      // ignore JSON parse error
    }
    const res = await fetch(buildApiUrl(path), {
      ...init,
      headers: {
        ...tokenManager.createAuthHeaders(
          companyId ? { "X-Company-Id": companyId } : {},
        ),
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      const msg =
        data?.error || data?.detail || data?.message || `HTTP ${res.status}`;
      console.warn("[tryApiFetch] %s %s: %s", init?.method || "GET", path, msg);
      return null;
    }
    return data as T;
  } catch (err) {
    console.warn(
      "[tryApiFetch] %s %s exception: %o",
      init?.method || "GET",
      path,
      err,
    );
    return null;
  }
}
