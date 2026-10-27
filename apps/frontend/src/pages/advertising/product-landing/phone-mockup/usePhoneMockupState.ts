import React, { useRef, useState, useMemo } from "react";
import { ProductLandingProduct } from "../types";
import { getProductImage } from "../types";
import { DeviceType, ViewModeType, BundleTier } from "./types";

export const bundleTiers: BundleTier[] = [
  { qty: 1, label: "قطعة واحدة", discount: 0, badge: "" },
  { qty: 2, label: "قطعتين (وفر 15%)", discount: 15, badge: "الأكثر طلباً 🔥" },
  { qty: 3, label: "3 قطع (وفر 25%)", discount: 25, badge: "أفضل قيمة 💰" },
];

export const usePhoneMockupState = ({
  previewUrl,
  product,
}: {
  previewUrl?: string;
  product: ProductLandingProduct | null;
}) => {
  const [viewMode, setViewMode] = useState<ViewModeType>(previewUrl ? "live" : "sync");
  const [device, setDevice] = useState<DeviceType>("mobile");
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [selectedBundleQty, setSelectedBundleQty] = useState<number>(1);
  const [activeMockImageIndex, setActiveMockImageIndex] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const prodImg = getProductImage(product);
  const priceNum = Number(product?.price || 0);

  const activeBundle = useMemo(
    () => bundleTiers.find((b) => b.qty === selectedBundleQty) || bundleTiers[0],
    [selectedBundleQty]
  );

  const unitPrice = useMemo(
    () =>
      activeBundle.discount > 0
        ? Math.round(priceNum * (1 - activeBundle.discount / 100))
        : priceNum,
    [activeBundle.discount, priceNum]
  );

  const bundleTotal = useMemo(() => unitPrice * activeBundle.qty, [unitPrice, activeBundle.qty]);

  const rawVariants = (product as any)?.productVariants || (product as any)?.variants || [];

  const mockColors = useMemo(() => {
    const colors = new Set<string>();
    rawVariants.forEach((v: any) => {
      const attrs = v.metadata?.attributeValues || v.attributes || v.attributeValues || {};
      Object.entries(attrs).forEach(([k, val]) => {
        if (/لون|color|colour/i.test(k) && val) colors.add(String(val));
      });
      if (v.name && v.name.includes("-")) {
        const parts = v.name.split("-").map((p: string) => p.trim());
        parts.forEach((p: string) => {
          if (!/^\d+$/.test(p) && p.length > 1 && !/shoe|size|سنيكر/i.test(p)) colors.add(p);
        });
      }
    });
    if (colors.size > 0) return Array.from(colors);
    return ["أبيض في رمادي", "أبيض في نبيتي"];
  }, [rawVariants]);

  const mockSizes = useMemo(() => {
    const sizes = new Set<string>();
    rawVariants.forEach((v: any) => {
      const attrs = v.metadata?.attributeValues || v.attributes || v.attributeValues || {};
      Object.entries(attrs).forEach(([k, val]) => {
        if (/مقاس|size/i.test(k) && val) sizes.add(String(val));
      });
      if (v.name && v.name.includes("-")) {
        const parts = v.name.split("-").map((p: string) => p.trim());
        parts.forEach((p: string) => {
          if (/^\d{2}$/.test(p)) sizes.add(p);
        });
      }
    });
    if (sizes.size > 0) return Array.from(sizes);
    return ["37", "38", "39", "40", "41"];
  }, [rawVariants]);

  const handleRefreshIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  return {
    viewMode,
    setViewMode,
    device,
    setDevice,
    iframeKey,
    selectedBundleQty,
    setSelectedBundleQty,
    activeMockImageIndex,
    setActiveMockImageIndex,
    iframeRef,
    prodImg,
    priceNum,
    bundleTiers,
    activeBundle,
    unitPrice,
    bundleTotal,
    mockColors,
    mockSizes,
    handleRefreshIframe,
  };
};
