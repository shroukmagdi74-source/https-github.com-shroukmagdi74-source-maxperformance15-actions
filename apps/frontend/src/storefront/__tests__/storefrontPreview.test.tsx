// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { cleanup, configure, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import StorefrontShell from "../StorefrontShell";
import {
  DEFAULT_STOREFRONT_CART_STORAGE_NAME,
  getStorefrontPreviewCartStorageName,
  useCartStore,
} from "../store/useCartStore";
import { createMarketplacePreviewOrderResponse } from "../preview/marketplacePreviewOrder";
import {
  formatMoney,
  getLocaleFormatDefaults,
  resetLocaleFormatDefaults,
  setLocaleFormatDefaults,
} from "../utils/localeFormat";
import { formatStorefrontCurrency } from "../utils/currency";

/**
 * PREVIEW-1 — async budget for preview assertions (was the library default,
 * 1000ms).
 *
 * Measured on this suite: a marketplace preview resolves its settings through
 * `buildPreviewStorefrontSettingsFallback` (two dynamic imports) and then the
 * runtime theme resolver loads the theme asset before the shell can paint.
 * Time-to-preview-banner measured here: ~1.0s warm and ~3.5-5.5s on the first
 * case of a worker (cold module graph, worse under parallel load). The 1s default failed on timing,
 * not on behaviour — every case below was verified to render the expected DOM
 * once given a realistic budget (banner link, seeded BiteRush/cafe carts,
 * split-panel hero copy). Assertions are unchanged; only the polling window is.
 */
const PREVIEW_ASYNC_TIMEOUT = 8000;

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

describe("Storefront preview mode", () => {
  // PREVIEW-1 — warm the preview module graph once per file. The first case of a
  // worker used to pay ~3.6s just transforming/importing the preview banner,
  // the theme presets and the marketplace sample data, which made the first
  // assertion race its own budget on slower machines/CI.
  beforeAll(async () => {
    // A marketplace preview case costs 0.3-2.5s of pipeline plus the DOM work,
    // and vitest's 5s per-test default is hit under load (measured: 5.2s).
    // Give the cases room to finish their assertions instead of dying mid-await.
    vi.setConfig({ testTimeout: 30000 });
    await Promise.all([
      import("../components/preview/StorefrontPreviewBanner"),
      import("../preview/marketplaceSampleData"),
      import("../preview/marketplacePreviewCart"),
      import("../themes"),
    ]);
  });

  beforeEach(() => {
    configure({ asyncUtilTimeout: PREVIEW_ASYNC_TIMEOUT });
    localStorage.clear();
    sessionStorage.clear();
    useCartStore.setState({ items: [], isOpen: false });
    useCartStore.persist.setOptions({
      name: DEFAULT_STOREFRONT_CART_STORAGE_NAME,
    });
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1280,
    });
    window.dispatchEvent(new Event("resize"));
    localStorage.setItem("storefront_companyId", "company123");
    window.history.pushState(
      {},
      "",
      "/store?companyId=company123&previewTheme=elegant-luxe&previewSource=marketplace&previewAdminOrigin=https%3A%2F%2Fadmin.example.com",
    );
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const requestUrl =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      const url = new URL(requestUrl, window.location.origin);

      const jsonResponse = (payload: unknown, status = 200) =>
        Promise.resolve(
          new Response(JSON.stringify(payload), {
            status,
            headers: {
              "Content-Type": "application/json",
            },
          }),
        );

      if (url.pathname.endsWith("/public/storefront/settings")) {
        const requestedPreviewTheme = url.searchParams.get("previewTheme");
        return jsonResponse({
          success: true,
          data: {
            company: {
              id: "company123",
              name: "Preview Store",
              slug: "preview-store",
              logo: null,
              currency: "EGP",
              settings: {},
            },
            storefront: {
              themeId: requestedPreviewTheme || "modern-minimal",
              pages: {
                home: { sections: ["hero-banner"] },
                shop: { sections: ["product-grid"] },
                pdp: { sections: ["product-gallery", "product-info"] },
                cart: { sections: ["cart-items", "order-summary"] },
                checkout: { sections: ["checkout-form", "payment"] },
              },
              settings: {
                storeName: "Preview Store",
                currency: "EGP",
              },
              storefrontFeatures: {
                quickViewEnabled: true,
                comparisonEnabled: false,
                wishlistEnabled: false,
                recentlyViewedEnabled: false,
                advancedFiltersEnabled: true,
                productCardStyle: "default",
                gridAddToCartIcon: false,
                gridDiscountBanner: true,
              },
            },
            templateId: null,
            lastUpdated: "2026-03-26T00:00:00.000Z",
          },
        });
      }

      if (url.pathname.endsWith("/public/products")) {
        return jsonResponse({
          success: true,
          data: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 12,
            pages: 0,
          },
        });
      }

      if (
        url.pathname.endsWith("/public/storefront/apps/conversion-suite/track")
      ) {
        return jsonResponse({ success: true });
      }

      return jsonResponse(
        { success: false, message: `Unhandled request: ${url.pathname}` },
        404,
      );
    }) as typeof fetch;
  });

  afterEach(() => {
    cleanup();
    configure({ asyncUtilTimeout: 1000 });
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    useCartStore.setState({ items: [], isOpen: false });
    useCartStore.persist.setOptions({
      name: DEFAULT_STOREFRONT_CART_STORAGE_NAME,
    });
  });

  it("shows a compact preview return action without applying the theme", async () => {
    const queryClient = createQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            "/store?companyId=company123&previewTheme=elegant-luxe&previewSource=marketplace&previewAdminOrigin=https%3A%2F%2Fadmin.example.com",
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("link", { name: "العودة إلى متجر القوالب" }),
    ).toHaveAttribute(
      "href",
      "https://admin.example.com/marketplace/themes?theme=elegant-luxe",
    );
    expect(screen.queryByText("معاينة مؤقتة")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /أنت تشاهد الآن قالب Elegant Luxe قبل تطبيقه على متجرك/i,
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "تخصيص القالب من الإدارة" }),
    ).not.toBeInTheDocument();
  });

  it("uses the compact boutique preview dock for rose-boutique-eg", async () => {
    const queryClient = createQueryClient();
    window.history.pushState(
      {},
      "",
      "/store?companyId=company123&previewTheme=rose-boutique-eg&previewSource=marketplace",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            "/store?companyId=company123&previewTheme=rose-boutique-eg&previewSource=marketplace",
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("link", { name: "العودة إلى القوالب" }),
    ).toHaveAttribute("href", "/marketplace/themes?theme=rose-boutique-eg");
    expect(screen.queryByText("معاينة مؤقتة")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/أنت تشاهد الآن قالب روزا/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "تخصيص القالب من الإدارة" }),
    ).not.toBeInTheDocument();
  });

  it("uses the compact boutique preview dock for atelier-nova", async () => {
    const queryClient = createQueryClient();
    window.history.pushState(
      {},
      "",
      "/store?companyId=company123&previewTheme=atelier-nova&previewSource=marketplace",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            "/store?companyId=company123&previewTheme=atelier-nova&previewSource=marketplace",
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("link", { name: "العودة إلى القوالب" }),
    ).toHaveAttribute("href", "/marketplace/themes?theme=atelier-nova");
    expect(screen.queryByText("معاينة مؤقتة")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/أنت تشاهد الآن قالب Atelier Nova/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "تخصيص القالب من الإدارة" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Atelier edit")).toBeInTheDocument();
    expect(screen.queryByText("Everyday fashion")).not.toBeInTheDocument();
  });

  it("keeps atelier-nova purchase flow footer compact and brand-specific", async () => {
    const queryClient = createQueryClient();
    window.history.pushState(
      {},
      "",
      "/store/checkout?companyId=company123&previewTheme=atelier-nova&previewSource=marketplace",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            "/store/checkout?companyId=company123&previewTheme=atelier-nova&previewSource=marketplace",
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText(/مسار الشراء هنا يظل هادئًا/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText("واتساب الطلب: +20 100 000 0000"),
    ).toBeInTheDocument();
    expect(screen.queryByText("hello@velafashion.eg")).not.toBeInTheDocument();
    expect(screen.queryByText("القاهرة، مدينة نصر")).not.toBeInTheDocument();
    expect(screen.queryByText("التسوق")).not.toBeInTheDocument();
  });

  it("keeps the scoped storefront shell root used by centering fixes", async () => {
    const queryClient = createQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            "/store?companyId=company123&previewTheme=elegant-luxe&previewSource=marketplace",
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByRole("link", { name: "العودة إلى متجر القوالب" });
    expect(document.querySelector(".storefront-shell")).toBeTruthy();
  });

  it("hydrates BiteRush checkout preview with an isolated sample cart", async () => {
    const queryClient = createQueryClient();
    const previewStorageName =
      getStorefrontPreviewCartStorageName("restaurant-demo");
    window.history.pushState(
      {},
      "",
      "/store/checkout?companyId=company123&previewTheme=restaurant-demo&previewSource=marketplace",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            "/store/checkout?companyId=company123&previewTheme=restaurant-demo&previewSource=marketplace",
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findAllByText("راش كومبو")).not.toHaveLength(0);
    expect(screen.getAllByText("فولكانو فرايز")).not.toHaveLength(0);
    // PREVIEW-1 — the preview cart must carry the whole sample order (3 lines),
    // not just the visuals: the same seed feeds the cart drawer and checkout.
    expect(useCartStore.getState().items).toHaveLength(3);

    await waitFor(() => {
      const liveCart = localStorage.getItem(
        DEFAULT_STOREFRONT_CART_STORAGE_NAME,
      );
      const previewCart = localStorage.getItem(previewStorageName);

      expect(liveCart ?? "").not.toContain("rush-combo");
      expect(previewCart ?? "").toContain("rush-combo");
    });
  });

  it("hydrates cafe checkout preview with an isolated coffee cart", async () => {
    const queryClient = createQueryClient();
    const previewStorageName = getStorefrontPreviewCartStorageName("cafe-demo");
    window.history.pushState(
      {},
      "",
      "/store/checkout?companyId=company123&previewTheme=cafe-demo&previewSource=marketplace",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            "/store/checkout?companyId=company123&previewTheme=cafe-demo&previewSource=marketplace",
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findAllByText("حبوب هاوس بليند")).not.toHaveLength(0);
    expect(screen.getAllByText("كرواسون فستق طازج")).not.toHaveLength(0);

    await waitFor(() => {
      const liveCart = localStorage.getItem(
        DEFAULT_STOREFRONT_CART_STORAGE_NAME,
      );
      const previewCart = localStorage.getItem(previewStorageName);

      expect(liveCart ?? "").not.toContain("house-blend-beans");
      expect(previewCart ?? "").toContain("house-blend-beans");
    });
  });

  it("opens BiteRush home preview cart drawer with seeded items", async () => {
    const queryClient = createQueryClient();
    const user = userEvent.setup();
    window.history.pushState(
      {},
      "",
      "/store?companyId=company123&previewTheme=restaurant-demo&previewSource=marketplace",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            "/store?companyId=company123&previewTheme=restaurant-demo&previewSource=marketplace",
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const cartButtons = await screen.findAllByRole("button", {
      name: /Open cart|فتح السلة|Shopping cart|سلة التسوق/,
    });
    expect(cartButtons.length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("dialog", { name: /Shopping Cart|سلة التسوق/ }),
    ).not.toBeInTheDocument();

    await user.click(cartButtons[0]!);

    expect(
      await screen.findByRole("dialog", { name: /Shopping Cart|سلة التسوق/ }),
    ).toBeInTheDocument();
    expect(await screen.findAllByText("راش كومبو")).not.toHaveLength(0);
    expect(screen.getAllByText("فولكانو فرايز")).not.toHaveLength(0);
  });

  it("refreshes elegant-luxe preview cart items when stored preview imagery is stale", async () => {
    const queryClient = createQueryClient();
    const previewStorageName =
      getStorefrontPreviewCartStorageName("elegant-luxe");

    localStorage.setItem(
      previewStorageName,
      JSON.stringify({
        state: {
          items: [
            {
              id: "elegant-luxe-satin-signature-dress-elegant-luxe-satin-signature-dress-ivory-size-S",
              productId: "elegant-luxe-satin-signature-dress",
              variantId: "elegant-luxe-satin-signature-dress-ivory-size-S",
              name: "فستان ساتان سيجنتشر",
              price: 3990,
              basePrice: 3990,
              quantity: 1,
              imageUrl: "/assets/themes/elegant-luxe/preview.png",
              attributes: {
                اللون: "أوف وايت",
                المقاس: "S",
              },
            },
          ],
        },
        version: 0,
      }),
    );
    sessionStorage.setItem(
      "sf-marketplace-preview-cart-seeded:elegant-luxe",
      "stale-signature",
    );
    // PREVIEW-1 — a stale "already seeded" marker (legacy and `:active:` shape)
    // must not stop the preview cart from being reconciled with the current seed.
    sessionStorage.setItem(
      "sf-marketplace-preview-cart-seeded:active:elegant-luxe",
      "1",
    );
    window.history.pushState(
      {},
      "",
      "/store?companyId=company123&previewTheme=elegant-luxe&previewSource=marketplace",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            "/store?companyId=company123&previewTheme=elegant-luxe&previewSource=marketplace",
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(useCartStore.getState().items).toHaveLength(3);
      expect(
        useCartStore
          .getState()
          .items.every(
            (item) =>
              typeof item.imageUrl === "string" &&
              item.imageUrl.includes("images.unsplash.com") &&
              !item.imageUrl.includes(
                "/assets/themes/elegant-luxe/preview.png",
              ),
          ),
      ).toBe(true);
    });

    await waitFor(() => {
      const previewCart = localStorage.getItem(previewStorageName) ?? "";

      expect(previewCart).toContain("images.unsplash.com");
      expect(previewCart).not.toContain(
        "/assets/themes/elegant-luxe/preview.png",
      );
    });
  });

  it("hydrates cafe thank-you preview with seeded reorder items", async () => {
    const queryClient = createQueryClient();
    const user = userEvent.setup();
    window.history.pushState(
      {},
      "",
      "/store/thank-you?companyId=company123&orderId=MUT-2048&previewTheme=cafe-demo&previewSource=marketplace",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            "/store/thank-you?companyId=company123&orderId=MUT-2048&previewTheme=cafe-demo&previewSource=marketplace",
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("أعد نفس الطلب سريعًا")).toBeInTheDocument();
    expect(await screen.findAllByText("حبوب هاوس بليند")).not.toHaveLength(0);
    const reorderButton = screen.getByRole("button", {
      name: "أضف هذه المنتجات مرة أخرى",
    });

    expect(reorderButton).toBeInTheDocument();
    await waitFor(() => {
      expect(useCartStore.getState().items).toHaveLength(3);
    });

    await user.click(reorderButton);

    await waitFor(() => {
      const cartItems = useCartStore.getState().items;
      expect(cartItems).toHaveLength(3);
      expect(cartItems.map((item) => item.quantity)).toEqual([2, 4, 2]);
    });
  });

  it("keeps the real KHEMET preview order on thank-you when opened as a direct link", async () => {
    const queryClient = createQueryClient();
    const previewResponse = createMarketplacePreviewOrderResponse(
      {
        guestName: "سارة اختبار",
        guestEmail: "checkout-test@example.com",
        guestPhone: "01000000000",
        paymentMethod: "cod",
        shippingAddress: {
          governorate: "القاهرة",
          city: "مدينة نصر",
          street: "10 شارع التحرير",
          address: "10 شارع التحرير، مدينة نصر، القاهرة",
          addressLine1: "10 شارع التحرير",
        },
      },
      "khemet-luxe-eg",
    ) as { data?: { orderNumber?: string } } | null;

    const orderNumber = String(previewResponse?.data?.orderNumber || "");
    expect(orderNumber.startsWith("KHE-")).toBe(true);

    sessionStorage.clear();
    window.history.pushState(
      {},
      "",
      `/store/thank-you?companyId=company123&orderId=${orderNumber}&previewTheme=khemet-luxe-eg&previewSource=marketplace`,
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            `/store/thank-you?companyId=company123&orderId=${orderNumber}&previewTheme=khemet-luxe-eg&previewSource=marketplace`,
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findAllByText(new RegExp(`#${orderNumber}`))).not.toHaveLength(0);
    expect(document.body.textContent || "").not.toContain("#KHE-2048");
  });

  it("keeps split-panel fallback copy generic in cafe preview hero", async () => {
    const queryClient = createQueryClient();
    window.history.pushState(
      {},
      "",
      "/store?companyId=company123&previewTheme=cafe-demo&previewSource=marketplace",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            "/store?companyId=company123&previewTheme=cafe-demo&previewSource=marketplace",
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("ابدأ من الفئة الأقرب لاحتياجك"),
    ).toBeInTheDocument();
    expect(screen.getByText("صور أقرب للحقيقة")).toBeInTheDocument();
    expect(
      screen.queryByText("ابدأ من السنيكرز أو الكاجوال أو اللوفر"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("دليل مقاس أوضح")).not.toBeInTheDocument();
  });

  it("uses compact mobile preview chrome and hides conversion overlays in marketplace mobile previews", async () => {
    const queryClient = createQueryClient();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 390,
    });
    window.dispatchEvent(new Event("resize"));
    window.history.pushState(
      {},
      "",
      "/store?companyId=company123&previewTheme=cafe-demo&previewSource=marketplace",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            "/store?companyId=company123&previewTheme=cafe-demo&previewSource=marketplace",
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("link", { name: "العودة إلى القوالب" }),
    ).toHaveAttribute("href", "/marketplace/themes?theme=cafe-demo");
    expect(screen.getByRole("link", { name: "تخصيص سريع" })).toHaveAttribute(
      "href",
      "/settings/storefront?theme=cafe-demo",
    );
    expect(screen.queryByText("وضع المعاينة")).not.toBeInTheDocument();
    expect(
      screen.queryByText("التوصيل علينا في الطلب الحالي"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("ينتهي العرض خلال")).not.toBeInTheDocument();
    expect(screen.queryByText("طلب قهوة الآن")).not.toBeInTheDocument();
  });

  it("prefers submitted purchase tracking on men-shoes thank-you over seeded preview items", async () => {
    const queryClient = createQueryClient();
    const user = userEvent.setup();
    const purchaseTracking = {
      eventId: "preview-order-men-shoes",
      orderNumber: "KH-2048",
      total: 1890,
      phone: "01012345678",
      customerName: "اختبار عرض 1",
      paymentMethod: "cod",
      items: [
        {
          id: "stride-core-runner-race-red-size-42",
          productId: "stride-core-runner",
          variantId: "stride-core-runner-race-red-size-42",
          name: "طلب مباشر تجريبي",
          quantity: 1,
          price: 1890,
          imageUrl:
            "/assets/themes/men-shoes-eg/products/stride-core-runner-1.svg",
          attributes: {
            اللون: "أحمر سباق",
            المقاس: "42",
          },
          quantityOffer: {
            groupId: "offer-1",
            offerId: "single-piece",
            offerLabel: "قطعة واحدة",
            offerQuantity: 1,
            slotIndex: 1,
          },
        },
      ],
    };

    window.history.pushState(
      {},
      "",
      "/store/thank-you?companyId=company123&orderId=KH-2048&previewTheme=men-shoes-eg&previewSource=marketplace",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/store/thank-you",
              search:
                "?companyId=company123&orderId=KH-2048&previewTheme=men-shoes-eg&previewSource=marketplace",
              state: { purchaseTracking },
            },
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("طلب مباشر تجريبي")).toBeInTheDocument();
    // PREVIEW-1 — this store is Arabic (`dir="rtl"`, `lang="ar"`), so LOCALE-1
    // renders EGP with the Arabic symbol and no redundant piasters: `1,890 ج.م`.
    // The old `EGP 1,890.00` expectation pinned the pre-LOCALE-1 Intl output and
    // never matched an Arabic store; the English format is asserted separately in
    // "formats EGP for the storefront locale (ar vs en)" below.
    expect(screen.getAllByText("1,890 ج.م").length).toBeGreaterThan(0);

    await user.click(
      screen.getByRole("button", {
        name: /اعرضي آخر تحديث|اعرض آخر تحديث|Show latest update|Show order status/i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("طلب مباشر تجريبي")).toBeInTheDocument();
      expect(screen.queryByText("Stride Core Runner")).not.toBeInTheDocument();
    });
  });

  it("renders status-aware pc-hub thank-you copy when preview status is shipped", async () => {
    const queryClient = createQueryClient();
    window.history.pushState(
      {},
      "",
      "/store/thank-you?companyId=company123&orderId=PCH-2048&previewTheme=pc-hub-eg&previewSource=marketplace&previewOrderStatus=SHIPPED",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            "/store/thank-you?companyId=company123&orderId=PCH-2048&previewTheme=pc-hub-eg&previewSource=marketplace&previewOrderStatus=SHIPPED",
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("طلبك خرج للشحن")).toBeInTheDocument();
    expect(screen.getAllByText("الشحنة في الطريق إليك").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("خرج للشحن").length).toBeGreaterThan(0);
  });

  it("hydrates Max Care Go checkout preview with its own seeded quick-order cart", async () => {
    const queryClient = createQueryClient();
    const previewStorageName =
      getStorefrontPreviewCartStorageName("max-care-go");
    window.history.pushState(
      {},
      "",
      "/store/checkout?companyId=company123&previewTheme=max-care-go&previewSource=marketplace",
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            "/store/checkout?companyId=company123&previewTheme=max-care-go&previewSource=marketplace",
          ]}
        >
          <Routes>
            <Route path="/store/*" element={<StorefrontShell />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("link", { name: "العودة إلى القوالب" }),
    ).toHaveAttribute("href", "/marketplace/themes?theme=max-care-go");
    expect(await screen.findAllByText("شراب كحة مهدئ")).not.toHaveLength(0);
    expect(screen.getAllByText("ترمومتر رقمي سريع")).not.toHaveLength(0);

    await waitFor(() => {
      const liveCart = localStorage.getItem(
        DEFAULT_STOREFRONT_CART_STORAGE_NAME,
      );
      const previewCart = localStorage.getItem(previewStorageName);

      expect(liveCart ?? "").not.toContain("cough-relief-syrup");
      expect(previewCart ?? "").toContain("cough-relief-syrup");
    });
  });

  it("formats EGP for the storefront locale (ar vs en)", () => {
    // PREVIEW-1 / LOCALE-1 — proof that money formatting follows the store
    // language instead of collapsing both locales into one string:
    //   Arabic store  → `1,890 ج.م`      (symbol after, no redundant `.00`)
    //   English store → `EGP 1,890.00`   (Intl currency code, currency decimals)
    const previousDefaults = getLocaleFormatDefaults();
    resetLocaleFormatDefaults();
    try {
      expect(
        formatMoney(1890, {
          currency: "EGP",
          symbol: "ج.م",
          position: "after",
          locale: "ar-EG",
        }),
      ).toBe("1,890 ج.م");
      expect(formatStorefrontCurrency(1890, "EGP", "ar-EG")).toBe("1,890 ج.م");

      expect(
        formatMoney(1890, {
          style: "currency",
          currency: "EGP",
          locale: "en-US",
        }),
      ).toBe("EGP 1,890.00");
      expect(formatStorefrontCurrency(1890, "EGP", "en-US")).toBe(
        "EGP 1,890.00",
      );
      expect(formatStorefrontCurrency(1890.5, "EGP", "en-US")).toBe(
        "EGP 1,890.50",
      );
      // Arabic keeps storing piasters when the amount actually has them.
      expect(formatStorefrontCurrency(1890.5, "EGP", "ar-EG")).toBe(
        "1,890.50 ج.م",
      );
    } finally {
      setLocaleFormatDefaults(previousDefaults);
    }
  });
});
