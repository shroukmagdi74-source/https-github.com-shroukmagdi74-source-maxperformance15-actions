import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  api,
  bookingApi,
  fetchJson,
  RadiologyExamType,
  RadiologyExamAddition,
  useRadiologyRiskFlags,
} from "../shared";
import { ScheduleForm, emptyForm, Appointment } from "./types";
import { parseEgyptianNationalId, birthFromNationalId } from "./helpers";

interface UseScheduleBookingModalProps {
  examTypes: RadiologyExamType[];
  additions: RadiologyExamAddition[];
  insuranceCompanies: { id: string; name: string }[];
  marketingReps: { id: string; name: string }[];
  refresh: (opts?: { silent?: boolean }) => Promise<void>;
}

export const useScheduleBookingModal = ({
  examTypes,
  marketingReps,
  refresh,
}: UseScheduleBookingModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [modal, setModal] = useState<ScheduleForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<
    {
      id: string;
      firstName: string;
      lastName?: string;
      phone?: string;
      nationalId?: string;
      insuranceNumber?: string;
      gender?: string;
      birthDate?: string;
    }[]
  >([]);

  const [physicianSearch, setPhysicianSearch] = useState("");
  const [physicianResults, setPhysicianResults] = useState<
    { id: string; name: string; specialty?: string }[]
  >([]);

  const [examSearch, setExamSearch] = useState("");
  const [examOpen, setExamOpen] = useState(false);
  const [examFiltered, setExamFiltered] = useState<RadiologyExamType[]>([]);

  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    phone: "",
    gender: "",
    nationalId: "",
    birthDate: "",
    nationalIdImage: "",
  });
  const [savingNewPatient, setSavingNewPatient] = useState(false);

  const [entityPrice, setEntityPrice] = useState<number | null>(null);
  const [coverage, setCoverage] = useState<
    Record<
      string,
      { covered: boolean; entityPrice?: number | null; basePrice?: number }
    >
  >({});

  const [cardScan, setCardScan] = useState<string | null>(null);
  const [cardScanTarget, setCardScanTarget] = useState<"newPatient" | null>(
    null,
  );
  const [cardOcrBusy, setCardOcrBusy] = useState(false);
  const cardInputRef = useRef<HTMLInputElement | null>(null);

  const [initialPayment, setInitialPayment] = useState<{
    amount: string;
    method: string;
  }>({ amount: "", method: "CASH" });

  const patientFlags = useRadiologyRiskFlags();

  // Search patients
  useEffect(() => {
    if (!patientSearch.trim()) {
      setPatientResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const url = new URL(bookingApi("patients"));
        url.searchParams.set("search", patientSearch.trim());
        url.searchParams.set("limit", "8");
        const rows = await fetchJson<
          {
            id: string;
            firstName: string;
            lastName?: string;
            phone?: string;
            nationalId?: string;
            insuranceNumber?: string;
          }[]
        >(url.toString());
        setPatientResults(Array.isArray(rows) ? rows : []);
      } catch {
        setPatientResults([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  // Search physicians
  useEffect(() => {
    if (!physicianSearch.trim()) {
      setPhysicianResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const url = new URL(api("referring-physicians"));
        url.searchParams.set("search", physicianSearch.trim());
        url.searchParams.set("limit", "20");
        const rows = await fetchJson<
          { id: string; name: string; specialty?: string }[]
        >(url.toString());
        setPhysicianResults(Array.isArray(rows) ? rows : []);
      } catch {
        setPhysicianResults([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [physicianSearch]);

  // Filter exams
  useEffect(() => {
    if (!examSearch.trim()) {
      setExamFiltered(examTypes.filter((t) => t.isActive !== false));
      return;
    }
    const term = examSearch.trim().toLowerCase();
    setExamFiltered(
      examTypes.filter(
        (t) =>
          t.isActive !== false &&
          (t.name?.toLowerCase().includes(term) ||
            (t.category || "").toLowerCase().includes(term) ||
            (t.abbreviation || "").toLowerCase().includes(term)),
      ),
    );
  }, [examSearch, examTypes]);

  // Fetch entity price
  useEffect(() => {
    if (!modal?.examTypeIds.length || !modal.insuranceCompanyId) {
      setEntityPrice(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const url = new URL(api("entity-prices"));
        url.searchParams.set("insuranceCompanyId", modal.insuranceCompanyId);
        url.searchParams.set("examTypeId", modal.examTypeIds[0] || "");
        const rows = await fetchJson<{ price: number }[]>(url.toString());
        if (!cancelled)
          setEntityPrice(rows && rows.length ? Number(rows[0]?.price) : null);
      } catch {
        if (!cancelled) setEntityPrice(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [modal?.examTypeIds, modal?.insuranceCompanyId]);

  // Fetch coverage
  useEffect(() => {
    if (!modal?.examTypeIds.length || !modal.insuranceCompanyId) {
      setCoverage({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const url = new URL(api("coverage"));
        url.searchParams.set("insuranceCompanyId", modal.insuranceCompanyId);
        url.searchParams.set("examTypeIds", modal.examTypeIds.join(","));
        const rows = await fetchJson<
          {
            examTypeId: string;
            covered: boolean;
            entityPrice?: number | null;
            basePrice?: number;
          }[]
        >(url.toString());
        if (!cancelled) {
          const map: Record<
            string,
            {
              covered: boolean;
              entityPrice?: number | null;
              basePrice?: number;
            }
          > = {};
          (Array.isArray(rows) ? rows : []).forEach((r) => {
            map[r.examTypeId] = {
              covered: r.covered,
              entityPrice: r.entityPrice,
              basePrice: r.basePrice,
            };
          });
          setCoverage(map);
        }
      } catch {
        if (!cancelled) setCoverage({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [modal?.examTypeIds, modal?.insuranceCompanyId]);

  const openCardScanner = () => {
    setCardScanTarget("newPatient");
    setCardScan(null);
    if (cardInputRef.current) cardInputRef.current.click();
  };

  const handleCardScanFile = async (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setCardScan(dataUrl);
      setNewPatient((p) => ({ ...p, nationalIdImage: dataUrl }));
    };
    reader.readAsDataURL(file);

    setCardOcrBusy(true);
    try {
      const { extractNationalIdFromImage } = await import("../cardOcr");
      const result = await extractNationalIdFromImage(file);
      if (result.nationalId) {
        setNewPatient((p) => ({ ...p, nationalId: result.nationalId || "" }));
        toast.success(t("radiology.schedule.cardOcrFound"));
      } else {
        toast.warning(t("radiology.schedule.cardOcrNotFound"));
      }
    } catch {
      toast.warning(t("radiology.schedule.cardOcrFailed"));
    } finally {
      setCardOcrBusy(false);
    }
  };

  const applyScannedCard = () => {
    setCardScan(null);
    setCardScanTarget(null);
    if (newPatient.nationalId.replace(/\D/g, "").length === 14) {
      const parsed = parseEgyptianNationalId(newPatient.nationalId);
      if (parsed) {
        setNewPatient((p) => ({
          ...p,
          gender: parsed.gender,
          birthDate: birthFromNationalId(newPatient.nationalId),
        }));
        toast.success(t("radiology.schedule.cardDataExtracted"));
      }
    }
  };

  const toggleExam = (id: string) => {
    setModal((m) =>
      m
        ? {
            ...m,
            examTypeIds: m.examTypeIds.includes(id)
              ? m.examTypeIds.filter((x) => x !== id)
              : [...m.examTypeIds, id],
          }
        : m,
    );
    setExamSearch("");
    setExamOpen(false);
  };

  const openNewPatient = () => {
    setNewPatient({
      firstName: "",
      phone: "",
      gender: "",
      nationalId: "",
      birthDate: "",
      nationalIdImage: "",
    });
    setNewPatientOpen(true);
  };

  const findExistingPatient = async (
    f: ScheduleForm,
    _name: string,
  ): Promise<{ id: string; name: string } | null> => {
    const queries: string[] = [];
    if (f.nationalId.trim()) queries.push(f.nationalId.trim());
    if (f.patientPhone.trim()) queries.push(f.patientPhone.trim());
    if (!queries.length) return null;
    try {
      const url = new URL(bookingApi("patients"));
      url.searchParams.set("search", queries[0] || "");
      url.searchParams.set("limit", "10");
      const rows = await fetchJson<
        {
          id: string;
          firstName: string;
          lastName?: string;
          phone?: string;
          nationalId?: string;
        }[]
      >(url.toString());
      const list = Array.isArray(rows) ? rows : [];
      const nationalId = f.nationalId.trim();
      const phone = f.patientPhone.trim();
      const match = list.find(
        (p) =>
          (nationalId && p.nationalId === nationalId) ||
          (phone && p.phone === phone),
      );
      if (!match) return null;
      return {
        id: match.id,
        name: `${match.firstName}${match.lastName ? " " + match.lastName : ""}`,
      };
    } catch {
      return null;
    }
  };

  const saveNewPatient = async () => {
    if (savingNewPatient) return;
    if (!newPatient.firstName.trim()) {
      toast.error(t("radiology.schedule.patientNameRequired"));
      return;
    }
    setSavingNewPatient(true);
    try {
      const nationalId = newPatient.nationalId.replace(/\D/g, "");
      const existing = await findExistingPatient(
        {
          nationalId,
          patientPhone: newPatient.phone.trim(),
          patientName: newPatient.firstName.trim(),
          patientId: "",
        } as ScheduleForm,
        newPatient.firstName.trim(),
      );
      if (existing) {
        setModal((m) =>
          m
            ? {
                ...m,
                patientId: existing.id,
                patientName: existing.name,
                patientPhone: newPatient.phone.trim(),
                nationalId,
              }
            : m,
        );
        toast.info(
          t("radiology.schedule.duplicatePatientLinked", {
            name: existing.name,
          }),
        );
        setNewPatientOpen(false);
        setPatientSearch("");
        setPatientResults([]);
        return;
      }
      const body: Record<string, string | undefined> = {
        firstName: newPatient.firstName.trim(),
        phone: newPatient.phone.trim() || undefined,
        nationalId: nationalId || undefined,
        nationalIdImage: newPatient.nationalIdImage || undefined,
        gender: newPatient.gender || undefined,
        birthDate: newPatient.birthDate || undefined,
      };
      const created = await fetchJson<{
        id: string;
        firstName: string;
        lastName?: string;
        phone?: string;
        gender?: string;
        birthDate?: string;
        nationalId?: string;
      }>(bookingApi("patients"), {
        method: "POST",
        body: JSON.stringify(body),
      });
      const parsed =
        newPatient.nationalId.replace(/\D/g, "").length === 14
          ? parseEgyptianNationalId(newPatient.nationalId.replace(/\D/g, ""))
          : null;
      setModal((m) =>
        m
          ? {
              ...m,
              patientId: created.id,
              patientName: `${created.firstName}${created.lastName ? " " + created.lastName : ""}`,
              patientPhone: created.phone || newPatient.phone.trim(),
              nationalId:
                created.nationalId || newPatient.nationalId.replace(/\D/g, ""),
              patientGender:
                created.gender ||
                parsed?.gender ||
                newPatient.gender ||
                m.patientGender,
              patientAge: parsed ? parsed.age : m.patientAge,
            }
          : m,
      );
      toast.success(t("radiology.schedule.patientAdded"));
      setNewPatientOpen(false);
      setPatientSearch("");
      setPatientResults([]);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : t("radiology.schedule.addPatientFailed"),
      );
    } finally {
      setSavingNewPatient(false);
    }
  };

  const pickPatient = (p: {
    id: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    nationalId?: string;
    insuranceNumber?: string;
    gender?: string;
    birthDate?: string;
  }) => {
    let gender = p.gender
      ? p.gender === "male" || p.gender === "M"
        ? "male"
        : "female"
      : "";
    let age = "";
    if (p.birthDate) {
      const dob = new Date(p.birthDate);
      if (!Number.isNaN(dob.getTime())) {
        const a = Math.max(
          0,
          Math.floor((Date.now() - dob.getTime()) / 31557600000),
        );
        if (a > 0) age = String(a);
      }
    }
    setModal((m) =>
      m
        ? {
            ...m,
            patientId: p.id,
            patientName: `${p.firstName}${p.lastName ? " " + p.lastName : ""}`,
            patientPhone: p.phone || "",
            nationalId: p.nationalId || m.nationalId,
            insuranceNumber: p.insuranceNumber || m.insuranceNumber,
            patientGender: gender || m.patientGender,
            patientAge: age || m.patientAge,
          }
        : m,
    );
    setPatientSearch("");
    setPatientResults([]);
  };

  const pickPhysician = (p: {
    id: string;
    name: string;
    marketingRepId?: string | null;
  }) => {
    setModal((m) => {
      if (!m) return m;
      const suggestedRep = p.marketingRepId || m.marketingRepId || "";
      const repName = p.marketingRepId
        ? marketingReps.find((r) => r.id === p.marketingRepId)?.name ||
          m.marketingRepName ||
          ""
        : m.marketingRepName;
      return {
        ...m,
        referringPhysicianId: p.id,
        referralDoctor: p.name,
        marketingRepId: suggestedRep,
        marketingRepName: repName,
      };
    });
    setPhysicianSearch("");
    setPhysicianResults([]);
  };

  const syncPatientRecord = async (
    f: ScheduleForm,
  ): Promise<string | null> => {
    const fields: Record<string, string> = {};
    if (f.patientPhone.trim()) fields["phone"] = f.patientPhone.trim();
    if (f.nationalId.trim()) fields["nationalId"] = f.nationalId.trim();
    if (f.nationalIdImage) fields["nationalIdImage"] = f.nationalIdImage;
    if (f.insuranceNumber.trim())
      fields["insuranceNumber"] = f.insuranceNumber.trim();
    if (f.patientId) {
      if (Object.keys(fields).length) {
        await fetchJson(bookingApi(`patients/${f.patientId}`), {
          method: "PUT",
          body: JSON.stringify(fields),
        });
      }
      return f.patientId;
    }
    const name = f.patientName.trim() || patientSearch.trim();
    if (!name) return null;
    const existing = await findExistingPatient(f, name);
    if (existing) {
      if (Object.keys(fields).length) {
        await fetchJson(bookingApi(`patients/${existing.id}`), {
          method: "PUT",
          body: JSON.stringify(fields),
        });
      }
      toast.info(
        t("radiology.schedule.duplicatePatientLinked", {
          name: existing.name,
        }),
      );
      return existing.id;
    }
    const parts = name.split(/\s+/);
    const created = await fetchJson<{ id: string }>(bookingApi("patients"), {
      method: "POST",
      body: JSON.stringify({
        firstName: parts[0],
        lastName: parts.length > 1 ? parts.slice(1).join(" ") : undefined,
        ...fields,
      }),
    });
    return created.id;
  };

  const buildPayload = (f: ScheduleForm) => {
    const payerType = [
      "CUSTOMER",
      "INSURANCE",
      "REFERRAL",
      "PARTNER",
    ].includes(f.payerType)
      ? f.payerType
      : "CUSTOMER";
    const isInsurance = payerType === "INSURANCE";
    const isReferral = payerType === "REFERRAL";
    const isPartner = payerType === "PARTNER";
    return {
      patientId: f.patientId || undefined,
      patientName: f.patientName.trim(),
      patientPhone: f.patientPhone.trim() || undefined,
      patientGender: f.patientGender || undefined,
      patientAge: f.patientAge.trim() || undefined,
      nationalId: f.nationalId.trim() || undefined,
      insuranceNumber: f.insuranceNumber.trim() || undefined,
      patientFlags: f.patientFlags.length ? f.patientFlags : undefined,
      examTypeIds: f.examTypeIds.length ? f.examTypeIds : undefined,
      examTypeId: f.examTypeIds[0] || undefined,
      insuranceCompanyId: isInsurance
        ? f.insuranceCompanyId || undefined
        : undefined,
      deviceId: f.deviceId || undefined,
      additionIds: f.additionIds,
      payerType,
      referralSourceId: isReferral
        ? f.referralSourceId || undefined
        : undefined,
      isExternalReferral: isPartner,
      externalPartnerId: isPartner
        ? f.externalPartnerId || undefined
        : undefined,
      paymentDestination: isPartner
        ? f.paymentDestination || "ME"
        : undefined,
      referringPhysicianId: f.referringPhysicianId || undefined,
      referralDoctor: f.referralDoctor.trim() || undefined,
      marketingRepId: f.marketingRepId || undefined,
      emergency: f.emergency,
      appointmentDate: f.appointmentDate || undefined,
      appointmentTime: f.appointmentTime || undefined,
      status: f.status || "SCHEDULED",
      notes: f.notes.trim() || undefined,
    };
  };

  const distributeInitialPayment = async (
    studies: { id: string; priceSnapshot?: number }[],
    amount: number,
    method: string,
  ) => {
    let remaining = amount;
    let paid = 0;
    for (const s of studies) {
      if (remaining <= 0) break;
      const total = Number(s.priceSnapshot);
      const pay = total > 0 ? Math.min(remaining, total) : remaining;
      if (pay <= 0) continue;
      try {
        await fetchJson(api(`studies/${s.id}/payment`), {
          method: "POST",
          body: JSON.stringify({ amount: pay, method }),
        });
        remaining -= pay;
        paid += pay;
      } catch {
        /* best-effort */
      }
    }
    return paid > 0;
  };

  const persistAndConvert = async (
    payload: ReturnType<typeof buildPayload>,
    initialPaymentValue?: { amount: string; method: string },
    successKey = "radiology.schedule.studyCreatedWalkIn",
  ) => {
    const currentId = modal?.id;
    let id = currentId;
    if (currentId) {
      await fetchJson(api(`appointments/${currentId}`), {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      const created = await fetchJson<{ id: string }>(api("appointments"), {
        method: "POST",
        body: JSON.stringify(payload),
      });
      id = created.id;
    }
    if (!id) throw new Error(t("radiology.schedule.saveFailed") as string);
    const r = await fetchJson<{
      studies?: { id: string; priceSnapshot?: number }[];
      study?: { id: string; priceSnapshot?: number };
    }>(api(`appointments/${id}/convert`), { method: "POST" });
    const studies = r?.studies?.length
      ? r.studies
      : r?.study
        ? [r.study]
        : [];
    const amount = Number(initialPaymentValue?.amount);
    if (studies.length && Number.isFinite(amount) && amount > 0) {
      const ok = await distributeInitialPayment(
        studies,
        amount,
        initialPaymentValue?.method || "CASH",
      );
      toast.success(
        ok
          ? t("radiology.receptionFlow.created")
          : t("radiology.receptionFlow.paymentWarning"),
      );
    } else {
      toast.success(t(successKey));
    }
    setModal(null);
    navigate("/radiology/studies");
  };

  const save = async (convertAfter = false) => {
    if (!modal || saving) return;
    if (!modal.patientName.trim()) {
      toast.error(t("radiology.schedule.patientNameRequired"));
      return;
    }
    if (!modal.examTypeIds.length) {
      toast.error(t("radiology.schedule.selectExam"));
      return;
    }
    setSaving(true);
    try {
      const patientId = await syncPatientRecord(modal);
      const payload = buildPayload({
        ...modal,
        patientId: patientId || "",
        status: convertAfter ? "CHECKED_IN" : modal.status,
      });
      if (convertAfter) {
        await persistAndConvert(payload);
        return;
      }
      toast.success(
        modal.id
          ? t("radiology.schedule.bookingUpdated")
          : t("radiology.schedule.bookingCreated"),
      );
      setModal(null);
      await refresh({ silent: true });
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : t("radiology.schedule.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  const receiveAndCreate = async () => {
    if (!modal || saving) return;
    if (!modal.patientName.trim()) {
      toast.error(t("radiology.schedule.patientNameRequired"));
      return;
    }
    if (!modal.examTypeIds.length) {
      toast.error(t("radiology.schedule.selectExam"));
      return;
    }
    setSaving(true);
    try {
      const patientId = await syncPatientRecord(modal);
      const payload = buildPayload({
        ...modal,
        patientId: patientId || "",
        status: "CHECKED_IN",
      });
      await persistAndConvert(
        payload,
        initialPayment,
        "radiology.receptionFlow.created",
      );
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : t("radiology.schedule.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  const openNew = (asWalkIn = false) => {
    setModal({
      ...emptyForm(),
      status: asWalkIn ? "CHECKED_IN" : "SCHEDULED",
    });
    setPatientSearch("");
    setPhysicianSearch("");
    setExamSearch("");
    setExamOpen(false);
    setNewPatientOpen(false);
    setEntityPrice(null);
    setCoverage({});
    setCardScan(null);
    setCardScanTarget(null);
    setCardOcrBusy(false);
    setInitialPayment({ amount: "", method: "CASH" });
  };

  return {
    modal,
    setModal,
    saving,
    patientSearch,
    setPatientSearch,
    patientResults,
    physicianSearch,
    setPhysicianSearch,
    physicianResults,
    examSearch,
    setExamSearch,
    examOpen,
    setExamOpen,
    examFiltered,
    newPatientOpen,
    setNewPatientOpen,
    newPatient,
    setNewPatient,
    savingNewPatient,
    entityPrice,
    coverage,
    cardScan,
    setCardScan,
    cardScanTarget,
    setCardScanTarget,
    cardOcrBusy,
    cardInputRef,
    initialPayment,
    setInitialPayment,
    patientFlags,
    openNew,
    save,
    receiveAndCreate,
    openCardScanner,
    handleCardScanFile,
    applyScannedCard,
    toggleExam,
    openNewPatient,
    saveNewPatient,
    pickPatient,
    pickPhysician,
  };
};
