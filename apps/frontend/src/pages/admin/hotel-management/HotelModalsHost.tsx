import React from "react";
import PropertyModal from "../hotel/PropertyModal";
import RoomTypeModal from "../hotel/RoomTypeModal";
import RoomModal from "../hotel/RoomModal";
import ReservationModal from "../hotel/ReservationModal";
import FolioModal from "../hotel/FolioModal";
import RateModal from "../hotel/RateModal";
import ServiceModal from "../hotel/ServiceModal";
import PolicyModal from "../hotel/PolicyModal";
import PriceTierModal from "../hotel/PriceTierModal";
import {
  HotelProperty,
  HotelRoomType,
  HotelRoom,
  HotelReservation,
  HotelPolicy,
} from "../hotel/shared";
import { HotelModalState } from "./types";

interface HotelModalsHostProps {
  modal: HotelModalState | null;
  properties: HotelProperty[];
  roomTypes: HotelRoomType[];
  rooms: HotelRoom[];
  reservations: HotelReservation[];
  selectedProperty: string;
  policies: HotelPolicy | null;
  setModal: (modal: HotelModalState | null) => void;
  onSaved: () => Promise<void>;
  onError: (msg: string) => void;
}

export const HotelModalsHost: React.FC<HotelModalsHostProps> = ({
  modal,
  properties,
  roomTypes,
  rooms,
  reservations,
  selectedProperty,
  policies,
  setModal,
  onSaved,
  onError,
}) => {
  if (!modal) return null;

  return (
    <>
      {modal.type === "property" && (
        <PropertyModal
          data={modal.data}
          onClose={() => setModal(null)}
          onSaved={onSaved}
          onError={onError}
        />
      )}
      {modal.type === "roomType" && (
        <RoomTypeModal
          properties={properties}
          selectedProperty={selectedProperty}
          data={modal.data}
          onClose={() => setModal(null)}
          onSaved={onSaved}
          onError={onError}
        />
      )}
      {modal.type === "room" && (
        <RoomModal
          properties={properties}
          roomTypes={roomTypes}
          selectedProperty={selectedProperty}
          data={modal.data}
          onClose={() => setModal(null)}
          onSaved={onSaved}
          onError={onError}
        />
      )}
      {modal.type === "reservation" && (
        <ReservationModal
          properties={properties}
          roomTypes={roomTypes}
          rooms={rooms}
          selectedProperty={selectedProperty}
          onClose={() => setModal(null)}
          onSaved={onSaved}
          onError={onError}
        />
      )}
      {modal.type === "folio" && (
        <FolioModal
          reservations={reservations}
          preselectedId={modal.data?.reservationId}
          onClose={() => setModal(null)}
          onSaved={onSaved}
          onError={onError}
        />
      )}
      {modal.type === "rate" && (
        <RateModal
          roomTypes={roomTypes}
          selectedProperty={selectedProperty}
          onClose={() => setModal(null)}
          onSaved={onSaved}
          onError={onError}
        />
      )}
      {modal.type === "service" && (
        <ServiceModal
          data={modal.data}
          onClose={() => setModal(null)}
          onSaved={onSaved}
          onError={onError}
        />
      )}
      {modal.type === "policy" && (
        <PolicyModal
          data={modal.data || policies}
          onClose={() => setModal(null)}
          onSaved={onSaved}
          onError={onError}
        />
      )}
      {modal.type === "priceTier" && (
        <PriceTierModal
          roomType={modal.data}
          onClose={() => setModal(null)}
          onSaved={onSaved}
          onError={onError}
        />
      )}
    </>
  );
};
