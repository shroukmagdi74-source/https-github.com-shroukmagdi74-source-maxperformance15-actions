export const EGYPT_GOVERNORATES = [
  { key: "Cairo", name: "القاهرة" },
  { key: "Giza", name: "الجيزة" },
  { key: "Alexandria", name: "الإسكندرية" },
  { key: "Qalyubia", name: "القليوبية" },
  { key: "Al Sharqia", name: "الشرقية" },
  { key: "Dakahlia", name: "الدقهلية" },
  { key: "Gharbia", name: "الغربية" },
  { key: "Monufia", name: "المنوفية" },
  { key: "Beheira", name: "البحيرة" },
  { key: "Kafr el-Sheikh", name: "كفر الشيخ" },
  { key: "Damietta", name: "دمياط" },
  { key: "Port Said", name: "بورسعيد" },
  { key: "Ismailia", name: "الإسماعيلية" },
  { key: "Suez", name: "السويس" },
  { key: "Faiyum", name: "الفيوم" },
  { key: "Beni Suef", name: "بني سويف" },
  { key: "Minya", name: "المنيا" },
  { key: "Asyut", name: "أسيوط" },
  { key: "Sohag", name: "سوهاج" },
  { key: "Qena", name: "قنا" },
  { key: "Luxor", name: "الأقصر" },
  { key: "Aswan", name: "أسوان" },
  { key: "Matrouh", name: "مطروح" },
  { key: "Red Sea", name: "البحر الأحمر" },
];

export const parseGenders = (gendersRaw: unknown): string[] => {
  if (!gendersRaw) return ["1", "2"];
  if (Array.isArray(gendersRaw)) return gendersRaw.map(String);
  if (typeof gendersRaw === "string") {
    try {
      const parsed = JSON.parse(gendersRaw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      if (gendersRaw.includes(",")) return gendersRaw.split(",").map((s) => s.trim());
      return [gendersRaw];
    }
  }
  return ["1", "2"];
};

export const parseLocationsArray = (locRaw: unknown): string[] => {
  if (!locRaw) return [];
  if (Array.isArray(locRaw)) {
    return locRaw
      .map((item) =>
        typeof item === "string" ? item : (item as any)?.name || (item as any)?.key || ""
      )
      .filter(Boolean);
  }
  if (typeof locRaw === "string") {
    try {
      const parsed = JSON.parse(locRaw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) =>
            typeof item === "string" ? item : (item as any)?.name || (item as any)?.key || ""
          )
          .filter(Boolean);
      }
      if (parsed && typeof parsed === "object") {
        const p = parsed as any;
        const names: string[] = [];
        if (Array.isArray(p.regions)) names.push(...p.regions.map((r: any) => r.name || r.key));
        if (Array.isArray(p.cities)) names.push(...p.cities.map((c: any) => c.name || c.key));
        return names.filter(Boolean);
      }
    } catch {
      if (locRaw.includes(",")) return locRaw.split(",").map((s) => s.trim());
      return [locRaw];
    }
  }
  return [];
};
