export const parseEgyptianNationalId = (raw: string) => {
  const id = raw.replace(/\D/g, "");
  if (id.length !== 14) return null;
  const century = Number(id[0]);
  if (century !== 2 && century !== 3) return null;
  const year =
    century === 2 ? 1900 + Number(id.slice(1, 3)) : 2000 + Number(id.slice(1, 3));
  const month = Number(id.slice(3, 5));
  const day = Number(id.slice(5, 7));
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const gender = Number(id[12]) % 2 === 1 ? "male" : "female";
  const dob = new Date(Date.UTC(year, month - 1, day));
  const age = Math.max(
    0,
    Math.floor((Date.now() - dob.getTime()) / 31557600000),
  );
  return { gender, age: String(age), year, month, day };
};

export const birthFromNationalId = (raw: string): string => {
  const parsed = parseEgyptianNationalId(raw);
  if (!parsed) return "";
  const mm = String(parsed.month).padStart(2, "0");
  const dd = String(parsed.day).padStart(2, "0");
  return `${parsed.year}-${mm}-${dd}`;
};

export const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("ar-EG") : "—";
