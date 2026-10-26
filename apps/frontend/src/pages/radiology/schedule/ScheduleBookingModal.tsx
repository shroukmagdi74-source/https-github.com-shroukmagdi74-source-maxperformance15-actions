import React from "react";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  X as XMarkIcon,
  UserPlus,
  ScanLine,
  ChevronDown,
  Zap,
} from "lucide-react";
import {
  RadiologyExamType,
  RadiologyExamAddition,
  RadiologyDevice,
  MODAL_CONTENT_CLS,
  MODAL_INPUT_CLS,
} from "../shared";
import { Appointment, PAY_METHODS, ScheduleForm } from "./types";

interface ScheduleBookingModalProps {
  modal: ScheduleForm | null;
  saving: boolean;
  onClose: () => void;
  onModalChange: (form: ScheduleForm) => void;
  // Patient search & selection
  patientSearch: string;
  onPatientSearchChange: (val: string) => void;
  patientResults: {
    id: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    nationalId?: string;
    insuranceNumber?: string;
    gender?: string;
    birthDate?: string;
  }[];
  onPickPatient: (patient: any) => void;
  // Inline New Patient
  newPatientOpen: boolean;
  onOpenNewPatient: () => void;
  onCloseNewPatient: () => void;
  newPatient: {
    firstName: string;
    phone: string;
    gender: string;
    nationalId: string;
    birthDate: string;
    nationalIdImage?: string;
  };
  onNewPatientChange: (p: any) => void;
  savingNewPatient: boolean;
  onSaveNewPatient: () => void;
  onOpenCardScanner: () => void;
  // Exam selection
  examSearch: string;
  onExamSearchChange: (val: string) => void;
  examOpen: boolean;
  setExamOpen: (val: boolean) => void;
  examFiltered: RadiologyExamType[];
  examTypes: RadiologyExamType[];
  onToggleExam: (id: string) => void;
  coverage: Record<
    string,
    { covered: boolean; entityPrice?: number | null; basePrice?: number }
  >;
  entityPrice: number | null;
  additions: RadiologyExamAddition[];
  // Payer catalogs
  insuranceCompanies: { id: string; name: string }[];
  referralSources: { id: string; name: string }[];
  externalPartners: { id: string; name: string }[];
  marketingReps: { id: string; name: string }[];
  // Devices & clash detection
  devices: RadiologyDevice[];
  items: Appointment[];
  // Initial payment
  initialPayment: { amount: string; method: string };
  onInitialPaymentChange: (p: { amount: string; method: string }) => void;
  // Physician search
  physicianSearch: string;
  onPhysicianSearchChange: (val: string) => void;
  physicianResults: { id: string; name: string }[];
  onPickPhysician: (doc: any) => void;
  // Risk flags
  patientFlags: { value: string; label: string }[];
  // Submit actions
  onSave: (convertAfter?: boolean) => void;
  onReceiveAndCreate: () => void;
}

export const ScheduleBookingModal: React.FC<ScheduleBookingModalProps> = ({
  modal,
  saving,
  onClose,
  onModalChange,
  patientSearch,
  onPatientSearchChange,
  patientResults,
  onPickPatient,
  newPatientOpen,
  onOpenNewPatient,
  onCloseNewPatient,
  newPatient,
  onNewPatientChange,
  savingNewPatient,
  onSaveNewPatient,
  onOpenCardScanner,
  examSearch,
  onExamSearchChange,
  examOpen,
  setExamOpen,
  examFiltered,
  examTypes,
  onToggleExam,
  coverage,
  entityPrice,
  additions,
  insuranceCompanies,
  referralSources,
  externalPartners,
  marketingReps,
  devices,
  items,
  initialPayment,
  onInitialPaymentChange,
  physicianSearch,
  onPhysicianSearchChange,
  physicianResults,
  onPickPhysician,
  patientFlags,
  onSave,
  onReceiveAndCreate,
}) => {
  const { t } = useTranslation();

  if (!modal) return null;

  const labelCls =
    "block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1";

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={() => !saving && onClose()}
    >
      <div
        className={`${MODAL_CONTENT_CLS} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {modal.id
              ? t("radiology.schedule.editBooking")
              : modal.status === "CHECKED_IN"
                ? t("radiology.schedule.walkInModal")
                : t("radiology.schedule.newBookingModal")}
          </h3>
          <button
            onClick={() => !saving && onClose()}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg dark:text-gray-300"
            aria-label={t("radiology.cancel") as string}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 relative">
            <div className="flex items-center justify-between">
              <label className={labelCls}>
                {t("radiology.schedule.patientRequired")}
              </label>
              <button
                type="button"
                onClick={onOpenNewPatient}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline mb-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {t("radiology.schedule.addNewPatient")}
              </button>
            </div>
            <input
              className={MODAL_INPUT_CLS}
              value={patientSearch || modal.patientName}
              onChange={(e) => {
                const v = e.target.value;
                onPatientSearchChange(v);
                onModalChange({
                  ...modal,
                  patientId: "",
                  patientName: v,
                  patientPhone: v ? modal.patientPhone : "",
                });
              }}
              placeholder={t("radiology.schedule.searchPatient")}
            />
            {patientSearch.trim() && (
              <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-xl">
                {patientResults.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    {t("radiology.schedule.noResults")}
                  </div>
                ) : (
                  patientResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onPickPatient(p)}
                      className="block w-full text-right px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span className="font-medium">
                        {p.firstName} {p.lastName || ""}
                      </span>
                      {p.phone ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {" "}
                          — {p.phone}
                        </span>
                      ) : null}
                    </button>
                  ))
                )}
              </div>
            )}

            {newPatientOpen ? (
              <div className="mt-3 rounded-lg border dark:border-gray-600 p-3 space-y-3 bg-gray-50 dark:bg-gray-800/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>
                      {t("radiology.schedule.patientName")}
                    </label>
                    <input
                      className={MODAL_INPUT_CLS}
                      value={newPatient.firstName}
                      onChange={(e) =>
                        onNewPatientChange({
                          ...newPatient,
                          firstName: e.target.value,
                        })
                      }
                      placeholder={t("radiology.schedule.fullNamePlaceholder")}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>
                      {t("radiology.schedule.phone")}
                    </label>
                    <input
                      className={MODAL_INPUT_CLS}
                      dir="ltr"
                      value={newPatient.phone}
                      onChange={(e) =>
                        onNewPatientChange({
                          ...newPatient,
                          phone: e.target.value,
                        })
                      }
                      placeholder="01xxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>
                      {t("radiology.schedule.gender")}
                    </label>
                    <select
                      className={MODAL_INPUT_CLS}
                      value={newPatient.gender}
                      onChange={(e) =>
                        onNewPatientChange({
                          ...newPatient,
                          gender: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        {t("radiology.gender.unspecified")}
                      </option>
                      <option value="male">{t("radiology.gender.male")}</option>
                      <option value="female">
                        {t("radiology.gender.female")}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>
                      {t("radiology.schedule.nationalIdHint")}
                    </label>
                    <div className="flex gap-2">
                      <input
                        className={MODAL_INPUT_CLS}
                        dir="ltr"
                        value={newPatient.nationalId}
                        onChange={(e) =>
                          onNewPatientChange({
                            ...newPatient,
                            nationalId: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 14),
                          })
                        }
                        placeholder={t("radiology.schedule.nationalId14")}
                      />
                      <button
                        type="button"
                        onClick={onOpenCardScanner}
                        className="shrink-0 flex items-center gap-1 px-3 py-2 border dark:border-gray-600 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <ScanLine className="w-3.5 h-3.5" />
                        {t("radiology.schedule.scanCard")}
                      </button>
                    </div>
                    {newPatient.nationalIdImage ? (
                      <img
                        src={newPatient.nationalIdImage}
                        alt="بطاقة الرقم القومي"
                        className="mt-2 w-24 h-16 object-cover rounded-lg border dark:border-gray-600"
                      />
                    ) : null}
                  </div>
                  <div>
                    <label className={labelCls}>
                      {t("radiology.schedule.birthDate")}
                    </label>
                    <input
                      type="date"
                      className={MODAL_INPUT_CLS}
                      value={newPatient.birthDate}
                      onChange={(e) =>
                        onNewPatientChange({
                          ...newPatient,
                          birthDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onCloseNewPatient}
                    className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 border rounded-lg"
                  >
                    {t("radiology.cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={onSaveNewPatient}
                    disabled={savingNewPatient}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingNewPatient ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserPlus className="w-3.5 h-3.5" />
                    )}
                    {t("radiology.schedule.saveAndSelectPatient")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <label className={labelCls}>
              {t("radiology.schedule.phone")}
            </label>
            <input
              className={MODAL_INPUT_CLS}
              dir="ltr"
              value={modal.patientPhone}
              onChange={(e) =>
                onModalChange({ ...modal, patientPhone: e.target.value })
              }
            />
          </div>

          <div>
            <label className={labelCls}>
              {t("radiology.schedule.age")}
            </label>
            <input
              className={MODAL_INPUT_CLS}
              dir="ltr"
              value={modal.patientAge}
              onChange={(e) =>
                onModalChange({ ...modal, patientAge: e.target.value })
              }
              placeholder={t("radiology.schedule.agePlaceholder")}
            />
          </div>

          <div className="sm:col-span-2 relative">
            <label className={labelCls}>
              {t("radiology.schedule.examTypes")} ({modal.examTypeIds.length})
            </label>
            <div className="relative">
              <input
                className={`${MODAL_INPUT_CLS} pl-8`}
                value={examSearch}
                onChange={(e) => {
                  onExamSearchChange(e.target.value);
                  setExamOpen(true);
                }}
                onFocus={() => setExamOpen(true)}
                onBlur={() => setExamOpen(false)}
                placeholder={t("radiology.schedule.searchExam")}
              />
              <ChevronDown className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
              {examOpen ? (
                <div
                  className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-xl"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {examFiltered.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      {t("radiology.schedule.noExams")}
                    </div>
                  ) : (
                    examFiltered.slice(0, 60).map((et) => {
                      const selected = modal.examTypeIds.includes(et.id);
                      return (
                        <button
                          key={et.id}
                          type="button"
                          onClick={() => onToggleExam(et.id)}
                          className={`block w-full text-right px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between gap-2 ${
                            selected ? "bg-blue-50 dark:bg-blue-900/30" : ""
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="font-medium">{et.name}</span>
                            {et.category ? (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {" "}
                                ({et.category})
                              </span>
                            ) : null}
                          </span>
                          {selected ? (
                            <span className="text-xs text-blue-600 dark:text-blue-400 shrink-0">
                              ✓
                            </span>
                          ) : null}
                        </button>
                      );
                    })
                  )}
                </div>
              ) : null}
            </div>

            {modal.examTypeIds.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {modal.examTypeIds.map((id) => {
                  const et = examTypes.find((t) => t.id === id);
                  const cov = coverage[id];
                  return (
                    <span
                      key={id}
                      className={`flex items-center gap-1.5 text-xs border dark:border-gray-600 rounded-full px-2.5 py-1 ${
                        cov && !cov.covered
                          ? "border-amber-500 text-amber-600 dark:text-amber-400"
                          : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      <span className="font-medium">{et?.name || "—"}</span>
                      {cov && !cov.covered ? (
                        <span className="text-[10px] font-semibold">
                          {t("radiology.schedule.notCovered")}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onToggleExam(id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>
              {t("radiology.schedule.priceLabel")}
            </label>
            <div className="rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                {(() => {
                  const exams = modal.examTypeIds
                    .map((id) => examTypes.find((t) => t.id === id))
                    .filter(Boolean);
                  const base = exams.reduce((s, et) => {
                    const cov = coverage[et?.id || ""];
                    const price =
                      entityPrice !== null && modal.examTypeIds[0] === et?.id
                        ? entityPrice
                        : cov && cov.entityPrice != null
                          ? cov.entityPrice
                          : et
                            ? Number(et.price) || 0
                            : 0;
                    return s + price;
                  }, 0);
                  const add = additions
                    .filter((a) => modal.additionIds.includes(a.id))
                    .reduce((s, a) => s + a.price, 0);
                  return `${Number(base + add).toFixed(0)} ${t("radiology.currency")}${
                    entityPrice !== null
                      ? ` (${t("radiology.schedule.tariffSuffix", {
                          name:
                            insuranceCompanies.find(
                              (c) => c.id === modal.insuranceCompanyId,
                            )?.name || t("radiology.schedule.insuranceOptional"),
                        })})`
                      : ""
                  }`;
                })()}
              </span>
            </div>
          </div>

          <div>
            <label className={labelCls}>
              {t("radiology.schedule.payer")}
            </label>
            <select
              className={MODAL_INPUT_CLS}
              value={modal.payerType}
              onChange={(e) => {
                const pt = e.target.value;
                onModalChange({
                  ...modal,
                  payerType: pt,
                  insuranceCompanyId:
                    pt === "INSURANCE" ? modal.insuranceCompanyId : "",
                  referralSourceId:
                    pt === "REFERRAL" ? modal.referralSourceId : "",
                  externalPartnerId:
                    pt === "PARTNER" ? modal.externalPartnerId : "",
                });
              }}
            >
              <option value="CUSTOMER">
                {t("radiology.schedule.payerCustomer")}
              </option>
              <option value="INSURANCE">
                {t("radiology.schedule.payerInsurance")}
              </option>
              <option value="REFERRAL">
                {t("radiology.schedule.payerReferral")}
              </option>
              <option value="PARTNER">
                {t("radiology.schedule.payerPartner")}
              </option>
            </select>
          </div>

          {modal.payerType === "INSURANCE" ? (
            <div>
              <label className={labelCls}>
                {t("radiology.schedule.insuranceCompany")}
              </label>
              <select
                className={MODAL_INPUT_CLS}
                value={modal.insuranceCompanyId}
                onChange={(e) =>
                  onModalChange({
                    ...modal,
                    insuranceCompanyId: e.target.value,
                  })
                }
              >
                <option value="">
                  {t("radiology.schedule.insuranceCompanyPlaceholder")}
                </option>
                {insuranceCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : modal.payerType === "REFERRAL" ? (
            <div>
              <label className={labelCls}>
                {t("radiology.schedule.referralSource")}
              </label>
              <select
                className={MODAL_INPUT_CLS}
                value={modal.referralSourceId}
                onChange={(e) => {
                  const sid = e.target.value;
                  const src = referralSources.find((s) => s.id === sid) as
                    | { id: string; name: string; marketingRepId?: string | null }
                    | undefined;
                  const hasPhysicianRep =
                    modal.referringPhysicianId && modal.marketingRepId;
                  const suggestedRep = hasPhysicianRep
                    ? modal.marketingRepId
                    : src?.marketingRepId || "";
                  const repName = hasPhysicianRep
                    ? modal.marketingRepName
                    : src?.marketingRepId
                      ? marketingReps.find((r) => r.id === src.marketingRepId)
                          ?.name || ""
                      : "";
                  onModalChange({
                    ...modal,
                    referralSourceId: sid,
                    marketingRepId: suggestedRep,
                    marketingRepName: repName,
                  });
                }}
              >
                <option value="">
                  {t("radiology.schedule.referralSourcePlaceholder")}
                </option>
                {referralSources.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : modal.payerType === "PARTNER" ? (
            <div className="sm:col-span-2">
              <label className={labelCls}>
                {t("radiology.schedule.externalPartner")}
              </label>
              <select
                className={MODAL_INPUT_CLS}
                value={modal.externalPartnerId}
                onChange={(e) =>
                  onModalChange({
                    ...modal,
                    externalPartnerId: e.target.value,
                  })
                }
              >
                <option value="">
                  {t("radiology.schedule.externalPartnerPlaceholder")}
                </option>
                {externalPartners.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="mt-2">
                <label className={labelCls}>
                  {t("radiology.schedule.paymentDestination")}
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentDestination"
                      checked={modal.paymentDestination !== "PARTNER"}
                      onChange={() =>
                        onModalChange({ ...modal, paymentDestination: "ME" })
                      }
                      className="accent-blue-600"
                    />
                    {t("radiology.schedule.destMe")}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentDestination"
                      checked={modal.paymentDestination === "PARTNER"}
                      onChange={() =>
                        onModalChange({
                          ...modal,
                          paymentDestination: "PARTNER",
                        })
                      }
                      className="accent-blue-600"
                    />
                    {t("radiology.schedule.destPartner")}
                  </label>
                </div>
              </div>
            </div>
          ) : null}

          <div>
            <label className={labelCls}>
              {t("radiology.schedule.device")}
            </label>
            <select
              className={MODAL_INPUT_CLS}
              value={modal.deviceId}
              onChange={(e) =>
                onModalChange({ ...modal, deviceId: e.target.value })
              }
            >
              <option value="">{t("radiology.schedule.noDevice")}</option>
              {devices
                .filter((d) => d.isActive !== false)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {d.room ? ` — ${d.room}` : ""}
                  </option>
                ))}
            </select>
            {(() => {
              const did = modal.deviceId,
                d = modal.appointmentDate;
              if (!did || !d) return null;
              const clash = items.find((a) => {
                if (
                  a.id === modal.id ||
                  a.status === "CANCELLED" ||
                  a.deviceId !== did
                )
                  return false;
                if (a.appointmentDate?.slice(0, 10) !== d) return false;
                const t1 = modal.appointmentTime,
                  t2 = a.appointmentTime;
                if (t1 && t2) return t1 === t2;
                return true;
              });
              return clash ? (
                <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />{" "}
                  {t("radiology.schedule.deviceConflict", {
                    name: clash.patientName,
                    time: clash.appointmentTime || "—",
                  })}
                </p>
              ) : null;
            })()}
          </div>

          {!modal.id && modal.status === "CHECKED_IN" ? (
            <div className="sm:col-span-2">
              <label className={labelCls}>
                {t("radiology.receptionFlow.initialPayment")}
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min={0}
                  className={MODAL_INPUT_CLS}
                  dir="ltr"
                  placeholder={
                    t("radiology.receptionFlow.amountPlaceholder") as string
                  }
                  value={initialPayment.amount}
                  onChange={(e) =>
                    onInitialPaymentChange({
                      ...initialPayment,
                      amount: e.target.value,
                    })
                  }
                />
                <select
                  className={MODAL_INPUT_CLS}
                  style={{ maxWidth: 200 }}
                  value={initialPayment.method}
                  onChange={(e) =>
                    onInitialPaymentChange({
                      ...initialPayment,
                      method: e.target.value,
                    })
                  }
                >
                  {PAY_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {t(`radiology.paymentMethod.${m}`)}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t("radiology.receptionFlow.initialPaymentHint")}
              </p>
            </div>
          ) : null}

          {modal.insuranceCompanyId &&
          Object.keys(coverage).some((k) => !coverage[k]?.covered) ? (
            <div className="sm:col-span-2">
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />{" "}
                {t("radiology.schedule.coverageWarning")}
              </p>
            </div>
          ) : null}

          <div>
            <label className={labelCls}>
              {t("radiology.schedule.insuranceNumberLabel")}
            </label>
            <input
              className={MODAL_INPUT_CLS}
              dir="ltr"
              value={modal.insuranceNumber}
              onChange={(e) =>
                onModalChange({ ...modal, insuranceNumber: e.target.value })
              }
            />
          </div>

          <div className="relative">
            <label className={labelCls}>
              {t("radiology.schedule.referringDoctor")}
            </label>
            <input
              className={MODAL_INPUT_CLS}
              value={physicianSearch || modal.referralDoctor}
              onChange={(e) => {
                onPhysicianSearchChange(e.target.value);
                if (!e.target.value)
                  onModalChange({
                    ...modal,
                    referringPhysicianId: "",
                    referralDoctor: "",
                  });
              }}
              placeholder={t("radiology.schedule.searchDoctor")}
            />
            {physicianSearch.trim() && (
              <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-xl">
                {physicianResults.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    {t("radiology.schedule.noResults")}
                  </div>
                ) : (
                  physicianResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onPickPhysician(p)}
                      className="block w-full text-right px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <span className="font-medium">{p.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div>
            <label className={labelCls}>
              {t("radiology.schedule.marketingRep")}
            </label>
            <select
              className={MODAL_INPUT_CLS}
              value={modal.marketingRepId}
              onChange={(e) => {
                const rid = e.target.value;
                const rep = marketingReps.find((r) => r.id === rid);
                onModalChange({
                  ...modal,
                  marketingRepId: rid,
                  marketingRepName: rep?.name || "",
                });
              }}
            >
              <option value="">
                {t("radiology.schedule.noMarketingRep")}
              </option>
              {marketingReps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {modal.marketingRepName && !modal.marketingRepId ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {modal.marketingRepName}
              </p>
            ) : null}
          </div>

          <div>
            <label className={labelCls}>
              {t("radiology.schedule.date")}
            </label>
            <input
              type="date"
              className={MODAL_INPUT_CLS}
              value={modal.appointmentDate}
              onChange={(e) =>
                onModalChange({ ...modal, appointmentDate: e.target.value })
              }
            />
          </div>

          <div>
            <label className={labelCls}>
              {t("radiology.schedule.time")}
            </label>
            <input
              type="time"
              className={MODAL_INPUT_CLS}
              value={modal.appointmentTime}
              onChange={(e) =>
                onModalChange({ ...modal, appointmentTime: e.target.value })
              }
            />
            {(() => {
              const d = modal.appointmentDate,
                tm = modal.appointmentTime;
              if (!d || !tm) return null;
              const clash = items.find(
                (a) =>
                  a.id !== modal.id &&
                  a.status !== "CANCELLED" &&
                  a.appointmentDate?.slice(0, 10) === d &&
                  a.appointmentTime === tm,
              );
              return clash ? (
                <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />{" "}
                  {t("radiology.schedule.timeSlotTaken", {
                    name: clash.patientName,
                  })}
                </p>
              ) : null;
            })()}
          </div>

          {additions.length > 0 ? (
            <div className="sm:col-span-2">
              <label className={labelCls}>
                {t("radiology.schedule.examAdditions")}
              </label>
              <div className="flex flex-wrap gap-2">
                {additions.map((a) => (
                  <label
                    key={a.id}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 border dark:border-gray-600 rounded-lg px-3 py-1.5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={modal.additionIds.includes(a.id)}
                      onChange={() =>
                        onModalChange({
                          ...modal,
                          additionIds: modal.additionIds.includes(a.id)
                            ? modal.additionIds.filter((x) => x !== a.id)
                            : [...modal.additionIds, a.id],
                        })
                      }
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    {a.name} ({Number(a.price).toFixed(0)}{" "}
                    {t("radiology.currency")})
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="sm:col-span-2 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={modal.emergency}
                onChange={(e) =>
                  onModalChange({ ...modal, emergency: e.target.checked })
                }
                className="rounded border-gray-300 dark:border-gray-600"
              />
              {t("radiology.schedule.emergencyCase")}
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>
              {t("radiology.schedule.medicalRiskFlags")}
            </label>
            <div className="flex flex-wrap gap-2">
              {patientFlags.map((f) => (
                <label
                  key={f.value}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 border dark:border-gray-600 rounded-lg px-3 py-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={modal.patientFlags.includes(f.value)}
                    onChange={() =>
                      onModalChange({
                        ...modal,
                        patientFlags: modal.patientFlags.includes(f.value)
                          ? modal.patientFlags.filter((x) => x !== f.value)
                          : [...modal.patientFlags, f.value],
                      })
                    }
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>
              {t("radiology.schedule.notes")}
            </label>
            <input
              className={MODAL_INPUT_CLS}
              value={modal.notes}
              onChange={(e) =>
                onModalChange({ ...modal, notes: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border rounded-lg disabled:opacity-50"
          >
            {t("radiology.cancel")}
          </button>
          {!modal.id && modal.status === "CHECKED_IN" ? (
            <>
              <button
                onClick={onReceiveAndCreate}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {t("radiology.receptionFlow.receiveAndCreate")}
              </button>
              <button
                onClick={() => onSave(true)}
                disabled={saving}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {t("radiology.schedule.saveAndConvert")}
              </button>
            </>
          ) : (
            <button
              onClick={() => onSave(false)}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("radiology.save")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
