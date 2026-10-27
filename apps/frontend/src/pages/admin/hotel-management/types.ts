import {
  Building2,
  Home,
  Key,
  Calendar,
  DollarSign,
  Settings,
} from "lucide-react";

export type TabId =
  | "properties"
  | "roomTypes"
  | "rooms"
  | "reservations"
  | "folio"
  | "policies";

export interface TabItem {
  id: TabId;
  label: string;
  icon: any;
}

export const TABS: TabItem[] = [
  { id: "properties", label: "الفنادق", icon: Building2 },
  { id: "roomTypes", label: "أنواع الغرف", icon: Home },
  { id: "rooms", label: "الغرف", icon: Key },
  { id: "reservations", label: "الحجوزات", icon: Calendar },
  { id: "folio", label: "الخدمات والأسعار", icon: DollarSign },
  { id: "policies", label: "السياسات", icon: Settings },
];

export const CELL_CLS = "py-2.5 px-3.5";

export interface HotelModalState {
  type: string;
  data?: any;
}
