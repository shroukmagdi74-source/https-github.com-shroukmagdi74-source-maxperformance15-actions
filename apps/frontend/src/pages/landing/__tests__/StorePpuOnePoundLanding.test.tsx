// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, afterEach } from "vitest";
import { StorePpuOnePoundLanding } from "../StorePpuOnePoundLanding";

describe("StorePpuOnePoundLanding (Ticket LP-1)", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders H1 with exact text «جنيه واحد على كل أوردر»", () => {
    render(
      <MemoryRouter>
        <StorePpuOnePoundLanding />
      </MemoryRouter>
    );

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1.textContent?.trim()).toBe("جنيه واحد على كل أوردر");
  });

  it("renders exactly 3 start buttons with exact href /register?redirect=%2Fmarketplace%2Fapps%2Fstore", () => {
    const { container } = render(
      <MemoryRouter>
        <StorePpuOnePoundLanding />
      </MemoryRouter>
    );

    const startButtons = Array.from(container.querySelectorAll("a")).filter(
      (a) => a.getAttribute("href") === "/register?redirect=%2Fmarketplace%2Fapps%2Fstore"
    );
    expect(startButtons).toHaveLength(3);

    startButtons.forEach((btn) => {
      expect(btn.textContent).toContain("ابدأ متجرك دلوقتي");
    });
  });

  it("contains all exact mandated strings without alteration", () => {
    render(
      <MemoryRouter>
        <StorePpuOnePoundLanding />
      </MemoryRouter>
    );

    // 1 ج.م
    expect(screen.getAllByText(/1 ج\.م/)[0]).toBeInTheDocument();

    // على كل أوردر
    expect(screen.getAllByText(/على كل أوردر/)[0]).toBeInTheDocument();

    // تثبيت المتجر 0 ج.م · من غير اشتراك شهري · من غير نسبة على البيعة
    expect(
      screen.getAllByText(/تثبيت المتجر 0 ج\.م · من غير اشتراك شهري · من غير نسبة على البيعة/)[0]
    ).toBeInTheDocument();

    // ابدأ متجرك دلوقتي
    expect(screen.getAllByText(/ابدأ متجرك دلوقتي/)[0]).toBeInTheDocument();

    // بتدفع على أوردرات المتجر بس
    expect(screen.getAllByText(/بتدفع على أوردرات المتجر بس/)[0]).toBeInTheDocument();
  });

  it("has strictly NO numbers in text other than 0 and 1 (with 1, 2, 3 allowed for step numbering)", () => {
    const { container } = render(
      <MemoryRouter>
        <StorePpuOnePoundLanding />
      </MemoryRouter>
    );

    const text = container.textContent || "";

    // Extract all numbers found in rendered text
    const numbers = text.match(/\d+/g) || [];
    const allowedNumbers = new Set(["0", "1", "2", "3"]);

    const disallowed = numbers.filter((n) => !allowedNumbers.has(n));
    expect(disallowed).toEqual([]);

    // Extra check: no digits 4, 5, 6, 7, 8, 9 anywhere in text
    expect(text).not.toMatch(/[4-9]/);
  });

  it("renders all 6 ordered sections correctly", () => {
    render(
      <MemoryRouter>
        <StorePpuOnePoundLanding />
      </MemoryRouter>
    );

    // 1. Hero
    expect(screen.getByRole("heading", { level: 1, name: "جنيه واحد على كل أوردر" })).toBeInTheDocument();

    // 2. إزاي بتتحسب
    expect(screen.getByRole("heading", { level: 2, name: "إزاي بتتحسب؟" })).toBeInTheDocument();

    // 3. اللي جوه المتجر
    expect(screen.getByRole("heading", { level: 2, name: "اللي جوه المتجر" })).toBeInTheDocument();

    // 4. شفافية الرصيد
    expect(screen.getByRole("heading", { level: 2, name: "شفافية الرصيد" })).toBeInTheDocument();
    expect(screen.getByText(/لو الرصيد مش كفاية الأوردر بيتسجّل ومستني شحن/)).toBeInTheDocument();

    // 5. خمس أسئلة شائعة
    expect(screen.getByRole("heading", { level: 2, name: "أسئلة شائعة" })).toBeInTheDocument();
    expect(screen.getByText("إزاي بتحاسب؟")).toBeInTheDocument();
    expect(screen.getByText("أقل مبلغ شحن للمحفظة كام؟")).toBeInTheDocument();
    expect(screen.getByText("هل فيه تجربة مجانية؟")).toBeInTheDocument();
    expect(screen.getByText("هل فيه اشتراك شهري؟")).toBeInTheDocument();
    expect(screen.getByText("إيه وضع الأوردرات اليدوية؟")).toBeInTheDocument();

    // 6. CTA ختامي
    expect(screen.getByRole("heading", { level: 2, name: "ابدأ متجرك دلوقتي" })).toBeInTheDocument();
  });
});
