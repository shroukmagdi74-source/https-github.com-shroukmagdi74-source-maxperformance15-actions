import { useState, useEffect, useCallback } from "react";
import {
  hotelApi,
  HotelProperty,
  HotelRoomType,
  HotelRoom,
  HotelReservation,
  HotelService,
  HotelPolicy,
  HotelRoomRate,
} from "../hotel/shared";
import { TabId, HotelModalState } from "./types";

const fetchJson = async (fn: () => Promise<any>, retries = 2): Promise<any> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await fn();
      return data;
    } catch (e: any) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw e;
    }
  }
};

export const useHotelManagementState = () => {
  const [tab, setTab] = useState<TabId>("properties");
  const [properties, setProperties] = useState<HotelProperty[]>([]);
  const [roomTypes, setRoomTypes] = useState<HotelRoomType[]>([]);
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [reservations, setReservations] = useState<HotelReservation[]>([]);
  const [services, setServices] = useState<HotelService[]>([]);
  const [roomRates, setRoomRates] = useState<HotelRoomRate[]>([]);
  const [policies, setPolicies] = useState<HotelPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [folioSubTab, setFolioSubTab] = useState<"folio" | "services" | "rates">("folio");
  const [modal, setModal] = useState<HotelModalState | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [props, rtypes, rms, resvs, svcs, rrates, pols] = await Promise.all([
        fetchJson(() =>
          hotelApi.properties.list().then((r) => (r.success ? r.data : [])),
        ),
        fetchJson(() =>
          hotelApi.roomTypes.list().then((r) => (r.success ? r.data : [])),
        ),
        fetchJson(() =>
          hotelApi.rooms.list().then((r) => (r.success ? r.data : [])),
        ),
        fetchJson(() =>
          hotelApi.reservations.list().then((r) => (r.success ? r.data : [])),
        ),
        fetchJson(() =>
          hotelApi.services.list().then((r) => (r.success ? r.data : [])),
        ),
        fetchJson(() =>
          hotelApi.rates.list().then((r) => (r.success ? r.data : [])),
        ),
        fetchJson(() =>
          hotelApi.policies.get().then((r) => (r.success ? r.data : null)),
        ),
      ]);
      setProperties(props);
      setRoomTypes(rtypes);
      setRooms(rms);
      setReservations(resvs);
      setServices(svcs);
      setRoomRates(rrates);
      setPolicies(pols);
      setSelectedProperty((current) => current || (props.length ? props[0].id : ""));
    } catch (e: any) {
      setError(e.message || "فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const filteredRooms = rooms.filter(
    (r) =>
      (!selectedProperty || r.propertyId === selectedProperty) &&
      (!search || r.roomNumber.toLowerCase().includes(search.toLowerCase())),
  );

  const filteredReservations = reservations.filter(
    (r) =>
      (!selectedProperty || r.propertyId === selectedProperty) &&
      (!search || r.customerName.includes(search)),
  );

  const filteredRoomTypes = roomTypes.filter(
    (r) => !selectedProperty || r.propertyId === selectedProperty,
  );

  const onSaved = useCallback(async () => {
    await loadAll();
    setModal(null);
  }, [loadAll]);

  const onError = useCallback((msg: string) => setError(msg), []);

  const handleDelete = useCallback(
    async (fn: () => Promise<any>) => {
      if (!confirm("هل أنت متأكد من الحذف؟")) return;
      try {
        await fn();
        await loadAll();
      } catch (e: any) {
        setError(e.message || "حدث خطأ أثناء الحذف");
      }
    },
    [loadAll],
  );

  return {
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
  };
};
