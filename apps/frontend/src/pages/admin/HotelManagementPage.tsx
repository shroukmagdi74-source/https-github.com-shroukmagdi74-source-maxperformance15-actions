import React from "react";
import { RefreshCw } from "lucide-react";
import {
  useHotelManagementState,
  HotelControlHeader,
  HotelTabsNav,
  HotelPropertiesTab,
  HotelRoomTypesTab,
  HotelRoomsTab,
  HotelReservationsTab,
  HotelFolioRatesTab,
  HotelPoliciesTab,
  HotelModalsHost,
} from "./hotel-management";

export default function HotelManagementPage() {
  const {
    tab,
    properties,
    roomTypes,
    rooms,
    reservations,
    services,
    roomRates,
    policies,
    loading,
    error,
    search,
    selectedProperty,
    folioSubTab,
    modal,
    filteredRooms,
    filteredReservations,
    filteredRoomTypes,
    setTab,
    setSearch,
    setSelectedProperty,
    setFolioSubTab,
    setModal,
    loadAll,
    onSaved,
    onError,
    handleDelete,
  } = useHotelManagementState();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <RefreshCw className="size-4 animate-spin text-primary" />
          <span>جاري تحميل بيانات نظام الفنادق والغرف...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto" dir="rtl">
      {/* Linear Control Bar */}
      <HotelControlHeader
        propertiesCount={properties.length}
        tab={tab}
        setModal={setModal}
      />

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Single-Surface Chassis with Tabs */}
      <div className="rounded-xl border border-border/80 dark:border-border/60 bg-card shadow-2xs overflow-hidden">
        <HotelTabsNav
          tab={tab}
          properties={properties}
          selectedProperty={selectedProperty}
          search={search}
          setTab={setTab}
          setSelectedProperty={setSelectedProperty}
          setSearch={setSearch}
        />

        {/* Tab Body */}
        <div className="p-4 sm:p-5">
          {tab === "properties" && (
            <HotelPropertiesTab
              properties={properties}
              selectedProperty={selectedProperty}
              setModal={setModal}
              handleDelete={handleDelete}
            />
          )}

          {tab === "roomTypes" && (
            <HotelRoomTypesTab
              roomTypes={filteredRoomTypes}
              setModal={setModal}
              handleDelete={handleDelete}
            />
          )}

          {tab === "rooms" && (
            <HotelRoomsTab
              rooms={filteredRooms}
              setModal={setModal}
              handleDelete={handleDelete}
            />
          )}

          {tab === "reservations" && (
            <HotelReservationsTab
              reservations={filteredReservations}
              loadAll={loadAll}
              setModal={setModal}
            />
          )}

          {tab === "folio" && (
            <HotelFolioRatesTab
              folioSubTab={folioSubTab}
              reservations={reservations}
              services={services}
              filteredRoomTypes={filteredRoomTypes}
              roomRates={roomRates}
              setFolioSubTab={setFolioSubTab}
              setModal={setModal}
              loadAll={loadAll}
              setError={onError}
            />
          )}

          {tab === "policies" && (
            <HotelPoliciesTab
              policies={policies}
              setModal={setModal}
            />
          )}
        </div>
      </div>

      {/* Modals Host */}
      <HotelModalsHost
        modal={modal}
        properties={properties}
        roomTypes={roomTypes}
        rooms={rooms}
        reservations={reservations}
        selectedProperty={selectedProperty}
        policies={policies}
        setModal={setModal}
        onSaved={onSaved}
        onError={onError}
      />
    </div>
  );
}
