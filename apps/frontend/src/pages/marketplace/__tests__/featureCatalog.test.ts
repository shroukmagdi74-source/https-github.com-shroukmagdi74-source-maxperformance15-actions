import { describe, it, expect } from "vitest";
import {
  getMarketplaceFeatureItems,
  getMarketplacePositioning,
  getFeatureAccessKind,
  getFeatureAccessLabel,
} from "../featureCatalog";
import { FEATURE_COPY } from "../feature-catalog/featureCopy";
import { POSITIONING_COPY } from "../feature-catalog/positioningCopy";

describe("featureCatalog (split data modules)", () => {
  it("keeps the full copy baseline after the split", () => {
    expect(Object.keys(FEATURE_COPY).length).toBeGreaterThanOrEqual(400);
    expect(Object.keys(POSITIONING_COPY).length).toBeGreaterThanOrEqual(60);
    expect(FEATURE_COPY.adAccounts.name).toBe("ربط الحسابات الإعلانية");
    expect(FEATURE_COPY.profitability.name).toBe("محرك الربحية");
  });

  it("resolves catalog copy and access for feature keys", () => {
    const items = getMarketplaceFeatureItems({
      pricingModel: "FREE",
      features: ["orders", "unknownKey"],
    });
    expect(items[0]).toMatchObject({ name: "إدارة الطلبات", access: "FREE" });
    expect(items[1].name).toBe("Unknown Key");
  });

  it("falls back to positioning copy by slug", () => {
    expect(getMarketplacePositioning({ slug: "crm-lite" })?.surface).toBe(
      "داخل ملفات العملاء والشرائح الأساسية.",
    );
    expect(getFeatureAccessKind("SUBSCRIPTION")).toBe("PAID");
    expect(getFeatureAccessLabel("PAY_PER_USE")).toBe("حسب الاستخدام");
  });
});
