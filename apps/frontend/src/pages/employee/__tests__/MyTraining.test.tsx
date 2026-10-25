// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import MyTraining from "../MyTraining";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../../services/api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        trainings: [
          {
            id: "tr-1",
            trainingName: "أساسيات خدمة العملاء",
            provider: "أكاديمية ماكس",
            type: "soft-skills",
            startDate: "2026-10-01T00:00:00Z",
            status: "COMPLETED",
            duration: 16,
            score: 95,
          },
        ],
      },
    }),
  },
}));

describe("MyTraining", () => {
  it("renders training header and course card", async () => {
    render(<MyTraining />);
    await waitFor(() => {
      expect(screen.getByText("employee.training.title")).toBeTruthy();
      expect(screen.getByText("أساسيات خدمة العملاء")).toBeTruthy();
    });
  });
});
