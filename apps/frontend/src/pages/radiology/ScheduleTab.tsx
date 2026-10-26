import React from "react";
import ScheduleCalendar from "./ScheduleCalendar";
import {
  todayKey,
  useScheduleData,
  useScheduleBookingModal,
  ScheduleHeader,
  ScheduleDateFilters,
  ScheduleTable,
  ScheduleBookingModal,
  ScheduleCardScanModal,
} from "./schedule";

export * from "./schedule";

export function ScheduleTab() {
  const scheduleData = useScheduleData();
  const {
    items,
    sortedItems,
    total,
    loading,
    loadError,
    sort,
    toggleSort,
    isManagerUser,
    examTypes,
    additions,
    insuranceCompanies,
    referralSources,
    externalPartners,
    marketingReps,
    devices,
    status,
    setStatus,
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    view,
    setView,
    anchorDate,
    shiftAnchor,
    gotoToday,
    selectDay,
    idSettings,
    selected,
    setSelected,
    toggleSelected,
    toggleSelectAll,
    bulkBusy,
    runBulk,
    advance,
    remove,
    convert,
    refresh,
    loadMore,
    setPage,
  } = scheduleData;

  const bookingModal = useScheduleBookingModal({
    examTypes,
    additions,
    insuranceCompanies,
    marketingReps,
    refresh,
  });

  const {
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
  } = bookingModal;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <ScheduleHeader
        view={view}
        onViewChange={(v) => {
          setPage(1);
          setView(v);
        }}
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(st) => {
          setPage(1);
          setStatus(st);
        }}
        onToday={() => {
          setPage(1);
          setDateFrom(todayKey());
          setDateTo(todayKey());
        }}
        onRefresh={() => refresh()}
        onOpenNew={openNew}
      />

      {/* Date Filters (List View Only) */}
      {view === "list" && (
        <ScheduleDateFilters
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={(val) => {
            setPage(1);
            setDateFrom(val);
          }}
          onDateToChange={(val) => {
            setPage(1);
            setDateTo(val);
          }}
          loadError={loadError}
          onRetry={() => refresh()}
        />
      )}

      {/* Calendar View vs Table List View */}
      {view !== "list" ? (
        <ScheduleCalendar
          view={view as "day" | "week" | "month"}
          anchorDate={anchorDate}
          items={items}
          onShift={shiftAnchor}
          onToday={gotoToday}
          onSelectDay={selectDay}
        />
      ) : (
        <ScheduleTable
          items={items}
          sortedItems={sortedItems}
          total={total}
          loading={loading}
          sort={sort}
          onToggleSort={toggleSort}
          selected={selected}
          onToggleSelected={toggleSelected}
          onToggleSelectAll={toggleSelectAll}
          isManagerUser={isManagerUser}
          insuranceCompanies={insuranceCompanies}
          idSettings={idSettings}
          bulkBusy={bulkBusy}
          onRunBulk={runBulk}
          onClearSelected={() => setSelected(new Set())}
          onEdit={(form) => setModal(form)}
          onAdvance={advance}
          onConvert={convert}
          onRemove={remove}
          onLoadMore={loadMore}
        />
      )}

      {/* Booking Modal */}
      <ScheduleBookingModal
        modal={modal}
        saving={saving}
        onClose={() => setModal(null)}
        onModalChange={setModal}
        patientSearch={patientSearch}
        onPatientSearchChange={setPatientSearch}
        patientResults={patientResults}
        onPickPatient={pickPatient}
        newPatientOpen={newPatientOpen}
        onOpenNewPatient={openNewPatient}
        onCloseNewPatient={() => setNewPatientOpen(false)}
        newPatient={newPatient}
        onNewPatientChange={setNewPatient}
        savingNewPatient={savingNewPatient}
        onSaveNewPatient={saveNewPatient}
        onOpenCardScanner={openCardScanner}
        examSearch={examSearch}
        onExamSearchChange={setExamSearch}
        examOpen={examOpen}
        setExamOpen={setExamOpen}
        examFiltered={examFiltered}
        examTypes={examTypes}
        onToggleExam={toggleExam}
        coverage={coverage}
        entityPrice={entityPrice}
        additions={additions}
        insuranceCompanies={insuranceCompanies}
        referralSources={referralSources}
        externalPartners={externalPartners}
        marketingReps={marketingReps}
        devices={devices}
        items={items}
        initialPayment={initialPayment}
        onInitialPaymentChange={setInitialPayment}
        physicianSearch={physicianSearch}
        onPhysicianSearchChange={setPhysicianSearch}
        physicianResults={physicianResults}
        onPickPhysician={pickPhysician}
        patientFlags={patientFlags}
        onSave={save}
        onReceiveAndCreate={receiveAndCreate}
      />

      {/* Hidden Card Scanner Input */}
      <input
        ref={cardInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleCardScanFile(e.target.files?.[0] || null);
          e.target.value = "";
        }}
      />

      {/* Card Scan OCR Modal */}
      <ScheduleCardScanModal
        cardScan={cardScan}
        cardOcrBusy={cardOcrBusy}
        cardScanTarget={cardScanTarget}
        nationalIdValue={newPatient.nationalId}
        onNationalIdChange={(val) =>
          setNewPatient({ ...newPatient, nationalId: val })
        }
        onConfirm={applyScannedCard}
        onClose={() => {
          setCardScan(null);
          setCardScanTarget(null);
        }}
      />
    </div>
  );
}

export default ScheduleTab;
