export function getWhatsAppUrl(phone: string | null): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/\s+/g, "").replace(/^0+/, "");
  const full = cleaned.startsWith("+")
    ? cleaned.slice(1)
    : cleaned.startsWith("20")
    ? cleaned
    : `20${cleaned}`;
  return `https://wa.me/${full}`;
}

export function getCallStatusLabel(callStatus: string | null | undefined): string {
  switch (callStatus) {
    case "answered":
      return "تم الرد";
    case "no_answer":
      return "لم يرد";
    case "call_back_later":
      return "معاودة الاتصال";
    default:
      return "لم يتم الاتصال";
  }
}

export function getCallStatusColor(callStatus: string | null | undefined): string {
  switch (callStatus) {
    case "answered":
      return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800";
    case "no_answer":
      return "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800";
    case "call_back_later":
      return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800";
    default:
      return "text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800";
  }
}
