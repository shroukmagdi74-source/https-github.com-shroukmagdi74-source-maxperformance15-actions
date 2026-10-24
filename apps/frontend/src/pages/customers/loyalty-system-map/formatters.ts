import { RoutingInfo } from "./types";

export function fmt(n: number | undefined | null): string {
  return Number(n || 0).toLocaleString("en-US");
}

export function normalizeDigits(s: string): string {
  return String(s || "")
    .replace(/[\u0660-\u0669]/g, (d) => String("\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669".indexOf(d)))
    .replace(/[\u06F0-\u06F9]/g, (d) => String("\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9".indexOf(d)));
}

export function fmtDate(v?: string | null): string {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" });
}

export function firstLine(text?: string | null, max = 120): string {
  if (!text) return "";
  const single = String(text).split("\n")[0] || "";
  return single.length > max ? single.slice(0, max) + "…" : single;
}

export function resolveRouting(sessions: any[]): RoutingInfo {
  const connected = sessions.filter(
    (s: any) => String(s.status || "").toUpperCase() === "CONNECTED",
  );
  const def = connected.find((s: any) => s.isDefault) || connected[0];
  if (!def) {
    return {
      key: "unknown",
      label: "غير محدد",
      desc: "لا توجد جلسة واتساب متصلة",
    };
  }
  if (def.provider === "META_CLOUD") {
    return {
      key: "meta",
      label: "Meta Cloud API",
      desc: def.name || def.metaDisplayPhoneNumber || def.phoneNumber || "",
    };
  }
  if (def.provider === "BAILEYS") {
    return {
      key: "wa",
      label: "واتساب عادي (Baileys)",
      desc: def.name || def.phoneNumber || "",
    };
  }
  return {
    key: "unknown",
    label: "غير محدد",
    desc: "مصدر الإرسال غير معروف",
  };
}
