/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";

import WhatsAppLeadFollowUp from "../../WhatsAppLeadFollowUp";
import { apiClient } from "../../../../services/apiClient";

vi.mock("../../../../services/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: {
      dir: () => "ltr",
      language: "en",
    },
    t: (key: string) => {
      const translations: Record<string, string> = {
        "whatsappLeadFollowup.title": "Lead Follow-up Automation",
        "whatsappLeadFollowup.subtitle": "Automate WhatsApp messaging sequences for leads",
        "whatsappLeadFollowup.stats.activeEnrollments": "Active Leads",
        "whatsappLeadFollowup.stats.totalSent": "Total Messages Sent",
        "whatsappLeadFollowup.stats.replyRate": "Reply Rate",
        "whatsappLeadFollowup.stats.replyRateHint": "{{replied}} of {{total}} leads replied",
        "whatsappLeadFollowup.stats.completionRate": "Completion Rate",
        "whatsappLeadFollowup.stats.totalEnrollments": "Total Enrollments",
        "whatsappLeadFollowup.tabs.flows": "Sequences & Flows",
        "whatsappLeadFollowup.tabs.monitoring": "Live Monitoring",
        "whatsappLeadFollowup.flows.title": "Lead Follow-up Sequences",
        "whatsappLeadFollowup.flows.presetWelcome": "Add Starter Flow",
        "whatsappLeadFollowup.flows.addNew": "New Sequence",
        "whatsappLeadFollowup.flows.name": "Sequence Name",
        "whatsappLeadFollowup.flows.scope": "Audience Scope",
        "whatsappLeadFollowup.flows.targeted": "Targeted by Category",
        "whatsappLeadFollowup.flows.general": "General Flow",
        "whatsappLeadFollowup.flows.steps": "steps",
        "whatsappLeadFollowup.flows.activeLeads": "leads active",
        "whatsappLeadFollowup.categories.title": "Category Lead Rules",
        "whatsappLeadFollowup.categories.description": "Configure automatic sequence triggering per category",
        "whatsappLeadFollowup.categories.autoFollowUp": "Auto Follow-up",
        "whatsappLeadFollowup.categories.linkedFlow": "Assigned Sequence",
        "whatsappLeadFollowup.categories.none": "None",
        "whatsappLeadFollowup.categories.performanceTitle": "Category Performance",
        "whatsappLeadFollowup.categories.performanceDesc": "Response rates broken down by lead category",
        "whatsappLeadFollowup.categories.total": "Total",
        "whatsappLeadFollowup.categories.enrolled": "Enrolled",
        "whatsappLeadFollowup.categories.completed": "Completed",
        "whatsappLeadFollowup.categories.replied": "Replied",
        "whatsappLeadFollowup.categories.replyRate": "Reply %",
        "whatsappLeadFollowup.businessHours.title": "Sending Window & Business Hours",
        "whatsappLeadFollowup.businessHours.description": "Restrict sequence messages to business hours",
        "whatsappLeadFollowup.businessHours.startHour": "Start Hour",
        "whatsappLeadFollowup.businessHours.endHour": "End Hour",
        "whatsappLeadFollowup.businessHours.timezone": "Timezone",
        "whatsappLeadFollowup.businessHours.anyTime": "Any time (24/7)",
        "whatsappLeadFollowup.hints.title": "Best Practice Recommendations",
        "whatsappLeadFollowup.hints.tip1": "Send initial follow-ups within 15 minutes of inquiry.",
        "whatsappLeadFollowup.hints.tip2": "Keep message steps concise and end with a clear question.",
        "whatsappLeadFollowup.hints.tip3": "Personalize message bodies using customer variables.",
        "whatsappLeadFollowup.monitoring.customer": "Customer",
        "whatsappLeadFollowup.monitoring.flow": "Flow",
        "whatsappLeadFollowup.monitoring.status": "Status",
        "whatsappLeadFollowup.monitoring.currentStep": "Current Step",
        "whatsappLeadFollowup.monitoring.nextMessage": "Next Send",
        "whatsappLeadFollowup.monitoring.allStatuses": "All Statuses",
        "whatsappLeadFollowup.monitoring.allFlows": "All Flows",
        "whatsappLeadFollowup.monitoring.active": "Active",
        "whatsappLeadFollowup.monitoring.step": "Step {{current}} of {{total}}",
        "whatsappLeadFollowup.actions.save": "Save Changes",
        "whatsappLeadFollowup.status.active": "Active and Running",
      };
      return translations[key] || key;
    },
  }),
}));

describe("WhatsAppLeadFollowUp", () => {
  const mockFlows = [
    {
      id: "flow-1",
      companyId: "comp-1",
      name: "VIP Welcome Nudge",
      isEnabled: true,
      isGeneral: false,
      _count: { steps: 3, journeys: 12, categories: 1 },
      categories: [{ id: "cat-1", name: "High Value", color: "#10b981" }],
    },
  ];

  const mockCategories = [
    {
      id: "cat-1",
      name: "High Value",
      color: "#10b981",
      autoFollowUp: true,
      triggerFlowId: "flow-1",
    },
  ];

  const mockStats = {
    active: 12,
    completed: 45,
    cancelled: 3,
    replied: 28,
    total: 60,
    totalSent: 150,
    replyRate: 18.7,
    completionRate: 75.0,
  };

  const mockCategoryStats = [
    {
      id: "cat-1",
      name: "High Value",
      color: "#10b981",
      totalContacts: 80,
      enrolled: 40,
      completed: 30,
      replied: 25,
      replyRate: 62.5,
    },
  ];

  const mockSettings = {
    isEnabled: true,
    businessHourStart: 9,
    businessHourEnd: 20,
    timezone: "Africa/Cairo",
  };

  const mockJourneys = [
    {
      id: "journey-1",
      companyId: "comp-1",
      customerId: "cust-1",
      flowId: "flow-1",
      status: "ACTIVE",
      currentStep: 1,
      nextSendAt: "2026-10-25T14:00:00Z",
      customer: {
        firstName: "Tamer",
        lastName: "Hosny",
        phone: "+201012345678",
      },
      flow: {
        name: "VIP Welcome Nudge",
        steps: [{ id: "step-1" }, { id: "step-2" }, { id: "step-3" }],
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes("/lead-categories")) {
        return Promise.resolve({ data: { data: mockCategories } });
      }
      if (url.includes("/lead-followup/settings")) {
        return Promise.resolve({ data: { data: mockSettings } });
      }
      if (url.includes("/automation/flows")) {
        return Promise.resolve({ data: { data: mockFlows } });
      }
      if (url.includes("/lead-followup/stats")) {
        return Promise.resolve({ data: { data: mockStats } });
      }
      if (url.includes("/lead-followup/category-stats")) {
        return Promise.resolve({ data: { data: mockCategoryStats } });
      }
      if (url.includes("/automation/journeys")) {
        return Promise.resolve({ data: { data: mockJourneys } });
      }
      if (url.includes("/lead-followup/enrollments")) {
        return Promise.resolve({ data: { data: [] } });
      }
      return Promise.resolve({ data: { data: null } });
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <WhatsAppLeadFollowUp companyId="comp-1" />
      </MemoryRouter>
    );

  it("renders page header, KPI metrics and loaded sequence data", async () => {
    renderComponent();

    // Initially loading skeleton or content
    await waitFor(() => {
      expect(screen.getByText("VIP Welcome Nudge")).toBeInTheDocument();
    });

    // Check KPI cards
    expect(screen.getByText("Active Leads")).toBeInTheDocument();
    expect(screen.getByText("Total Messages Sent")).toBeInTheDocument();
    expect(screen.getByText("Completion Rate")).toBeInTheDocument();

    // Check Scope Badge
    expect(screen.getByText("Targeted by Category")).toBeInTheDocument();
    // Check Category tag in flow
    expect(screen.getAllByText("High Value").length).toBeGreaterThan(0);
  });

  it("renders Category Lead Rules and Category Performance tables", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText("Category Lead Rules").length).toBeGreaterThan(0);
    });

    expect(screen.getByText("Category Performance")).toBeInTheDocument();
    expect(screen.getByText("62.5%")).toBeInTheDocument();
  });

  it("renders Business Hours configuration card with settings", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Sending Window & Business Hours")).toBeInTheDocument();
    });

    expect(screen.getByText("Active and Running")).toBeInTheDocument();
  });

  it("switches to Live Monitoring tab and shows active journey customer record", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("VIP Welcome Nudge")).toBeInTheDocument();
    });

    // Switch to Monitoring tab
    const monitoringTabBtn = screen.getByRole("tab", { name: /Live Monitoring/i });
    fireEvent.click(monitoringTabBtn);

    await waitFor(() => {
      expect(screen.getByText("Tamer Hosny")).toBeInTheDocument();
    });

    expect(screen.getByText("+201012345678")).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
  });
});
