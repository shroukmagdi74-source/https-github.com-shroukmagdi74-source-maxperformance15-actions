/** @vitest-environment jsdom */
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import HotelManagementPage from "../HotelManagementPage";
import { hotelApi } from "../hotel/shared";

// Mock hotelApi
vi.mock("../hotel/shared", async () => {
  const actual = await vi.importActual("../hotel/shared");
  return {
    ...actual,
    hotelApi: {
      properties: {
        list: vi.fn(),
        delete: vi.fn(),
      },
      roomTypes: {
        list: vi.fn(),
        delete: vi.fn(),
      },
      rooms: {
        list: vi.fn(),
        delete: vi.fn(),
      },
      reservations: {
        list: vi.fn(),
        updateStatus: vi.fn(),
      },
      services: {
        list: vi.fn(),
        delete: vi.fn(),
      },
      rates: {
        list: vi.fn(),
        delete: vi.fn(),
      },
      policies: {
        get: vi.fn(),
      },
      folio: {
        remove: vi.fn(),
      },
    },
  };
});

describe("HotelManagementPage (Modular)", () => {
  const mockProperties = [
    {
      id: "prop-1",
      name: "فندق النيل بالاس",
      city: "القاهرة",
      address: "كورنيش النيل",
      phone: "+201000000001",
      checkInTime: "14:00",
      checkOutTime: "12:00",
      roomTypes: [{ id: "rt-1" }],
    },
    {
      id: "prop-2",
      name: "منتجع شرم الفيروز",
      city: "شرم الشيخ",
      address: "خليج نعمة",
      phone: "+201000000002",
      checkInTime: "15:00",
      checkOutTime: "11:00",
      roomTypes: [],
    },
  ];

  const mockRoomTypes = [
    {
      id: "rt-1",
      propertyId: "prop-1",
      name: "غرفة ديلوكس مطلة على النيل",
      nameAr: "ديلوكس",
      capacity: 2,
      basePrice: 2500,
      totalRooms: 10,
      _count: { rooms: 5 },
    },
  ];

  const mockRooms = [
    {
      id: "room-101",
      propertyId: "prop-1",
      roomTypeId: "rt-1",
      roomNumber: "101",
      floor: "الأول",
      status: "AVAILABLE",
      roomType: { name: "غرفة ديلوكس مطلة على النيل" },
    },
    {
      id: "room-102",
      propertyId: "prop-1",
      roomTypeId: "rt-1",
      roomNumber: "102",
      floor: "الأول",
      status: "OCCUPIED",
      roomType: { name: "غرفة ديلوكس مطلة على النيل" },
    },
  ];

  const mockReservations = [
    {
      id: "res-1",
      propertyId: "prop-1",
      customerName: "محمود حسن",
      checkIn: "2026-11-01T12:00:00Z",
      checkOut: "2026-11-05T10:00:00Z",
      adults: 2,
      children: 1,
      status: "CONFIRMED",
      totalAmount: 10000,
      property: { name: "فندق النيل بالاس" },
      rooms: [{ id: "room-101" }],
      folio: [
        {
          id: "fol-1",
          description: "عشاء بوفيه مفتوح",
          itemType: "FOOD",
          quantity: 2,
          amount: 400,
        },
      ],
    },
  ];

  const mockServices = [
    {
      id: "svc-1",
      name: "خدمة توصيل المطار",
      nameAr: "توصيل المطار",
      itemType: "TRANSFER",
      price: 600,
      isActive: true,
    },
  ];

  const mockRates = [
    {
      id: "rate-1",
      roomTypeId: "rt-1",
      label: "عطلة نهاية الأسبوع",
      dateFrom: "2026-11-06T00:00:00Z",
      dateTo: "2026-11-08T00:00:00Z",
      price: 3000,
    },
  ];

  const mockPolicies = {
    checkInTime: "14:00",
    checkOutTime: "12:00",
    earlyCheckInFee: 200,
    lateCheckOutFee: 250,
    cancelFreeBefore: 3,
    cancelPenaltyPct: 50,
    childrenAllowed: true,
    extraBedPrice: 350,
  };

  beforeEach(() => {
    (hotelApi.properties.list as any).mockResolvedValue({
      success: true,
      data: mockProperties,
    });
    (hotelApi.roomTypes.list as any).mockResolvedValue({
      success: true,
      data: mockRoomTypes,
    });
    (hotelApi.rooms.list as any).mockResolvedValue({
      success: true,
      data: mockRooms,
    });
    (hotelApi.reservations.list as any).mockResolvedValue({
      success: true,
      data: mockReservations,
    });
    (hotelApi.services.list as any).mockResolvedValue({
      success: true,
      data: mockServices,
    });
    (hotelApi.rates.list as any).mockResolvedValue({
      success: true,
      data: mockRates,
    });
    (hotelApi.policies.get as any).mockResolvedValue({
      success: true,
      data: mockPolicies,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders header and properties list after loading", async () => {
    render(<HotelManagementPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "نظام إدارة الفنادق" }),
      ).toBeInTheDocument();
    });

    expect(screen.getAllByText("فندق النيل بالاس").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("منتجع شرم الفيروز")).toBeInTheDocument();
    expect(screen.getByText("إضافة فندق")).toBeInTheDocument();
  });

  it("switches tabs between roomTypes, rooms, reservations, folio, and policies", async () => {
    render(<HotelManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("أنواع الغرف")).toBeInTheDocument();
    });

    // Switch to Room Types
    fireEvent.click(screen.getByRole("button", { name: "أنواع الغرف" }));
    expect(
      screen.getByText("غرفة ديلوكس مطلة على النيل"),
    ).toBeInTheDocument();

    // Switch to Rooms
    fireEvent.click(screen.getByRole("button", { name: "الغرف" }));
    expect(screen.getByText("101")).toBeInTheDocument();
    expect(screen.getByText("102")).toBeInTheDocument();

    // Switch to Reservations
    fireEvent.click(screen.getByRole("button", { name: "الحجوزات" }));
    expect(screen.getByText("محمود حسن")).toBeInTheDocument();
    expect(screen.getByText(/عشاء بوفيه مفتوح/)).toBeInTheDocument();

    // Switch to Folio & Rates
    fireEvent.click(screen.getByRole("button", { name: "الخدمات والأسعار" }));
    expect(screen.getByText("الخدمات المضافة (Folio)")).toBeInTheDocument();

    // Switch to Policies
    fireEvent.click(screen.getByRole("button", { name: "السياسات" }));
    expect(screen.getByText("أوقات الدخول والخروج")).toBeInTheDocument();
    expect(screen.getByText("سياسة الإلغاء")).toBeInTheDocument();
  });

  it("filters rooms by search input", async () => {
    render(<HotelManagementPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "الغرف" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "الغرف" }));
    expect(screen.getByText("101")).toBeInTheDocument();
    expect(screen.getByText("102")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("بحث...");
    fireEvent.change(searchInput, { target: { value: "102" } });

    expect(screen.queryByText("101")).not.toBeInTheDocument();
    expect(screen.getByText("102")).toBeInTheDocument();
  });

  it("switches subtabs in Folio & Rates tab", async () => {
    render(<HotelManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("الخدمات والأسعار")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("الخدمات والأسعار"));

    // Switch to services catalog
    fireEvent.click(screen.getByText("كتالوج الخدمات"));
    expect(screen.getByText("خدمة توصيل المطار")).toBeInTheDocument();

    // Switch to seasonal rates
    fireEvent.click(screen.getByText("الأسعار الموسمية"));
    expect(screen.getByText(/عطلة نهاية الأسبوع/)).toBeInTheDocument();
  });

  it("opens modal when clicking Add Hotel button", async () => {
    render(<HotelManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("إضافة فندق")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("إضافة فندق"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("اسم الفندق")).toBeInTheDocument();
    });
  });
});
