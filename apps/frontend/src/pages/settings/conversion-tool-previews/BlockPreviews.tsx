import React, { useEffect, useRef, useState } from "react";
import CountdownBlock from "../../../storefront/sections/ConversionBlocks/CountdownBlock";
import DeliveryBlock from "../../../storefront/sections/ConversionBlocks/DeliveryBlock";
import FakeVisitorBlock from "../../../storefront/sections/ConversionBlocks/FakeVisitorBlock";
import LowStockBlock from "../../../storefront/sections/ConversionBlocks/LowStockBlock";
import PreOrderBlock from "../../../storefront/sections/ConversionBlocks/PreOrderBlock";
import PurchaseFomoBlock from "../../../storefront/sections/ConversionBlocks/PurchaseFomoBlock";
import SoldCounterBlock from "../../../storefront/sections/ConversionBlocks/SoldCounterBlock";
import { pad2 } from "./types";

const SALE_COUNTDOWN_END_OFFSET_MS =
  2 * 60 * 60 * 1000 + 47 * 60 * 1000 + 33 * 1000;

export const SaleCountdownPreview = () => {
  const endRef = useRef(Date.now() + SALE_COUNTDOWN_END_OFFSET_MS);
  const [remaining, setRemaining] = useState(SALE_COUNTDOWN_END_OFFSET_MS);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(Math.max(0, endRef.current - Date.now()));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const totalSeconds = Math.floor(remaining / 1000);
  const summary = `${pad2(Math.floor(totalSeconds / 3600))}:${pad2(
    Math.floor((totalSeconds % 3600) / 60),
  )}:${pad2(totalSeconds % 60)}`;

  return <CountdownBlock label="عرض نهاية الأسبوع ينتهي خلال" summary={summary} />;
};

export const LowStockPreview = () => (
  <LowStockBlock
    count={4}
    label="مقاس 39 — الكمية محدودة"
    style="meter"
    progress={28}
  />
);

export const SoldCounterPreview = () => (
  <SoldCounterBlock count={128} message="اتباع 128 قطعة من المنتج ده الأسبوع ده" />
);

export const PurchaseFomoPreview = () => (
  <PurchaseFomoBlock count={14} message="14 عميل بيشوفوا المنتج ده دلوقتي" />
);

export const DeliveryPreview = () => (
  <DeliveryBlock
    label="التوصيل المتوقع"
    range="خلال 2 إلى 4 أيام عمل"
    style="card"
  />
);

const FAKE_VISITOR_BASE = 23;

export const FakeVisitorPreview = () => {
  const [count, setCount] = useState(FAKE_VISITOR_BASE);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCount(
        () =>
          FAKE_VISITOR_BASE +
          Math.floor(Math.random() * 7) -
          Math.floor(Math.random() * 5),
      );
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <FakeVisitorBlock
      count={count}
      message={`${count} زائر بيتصفحوا المنتج ده دلوقتي`}
    />
  );
};

export const PreOrderPreview = () => (
  <PreOrderBlock
    title="اطلب دلوقتي قبل الشحنة الجاية"
    description="المخزون الحالي خلص — اطلب مسبقًا وتوصلك خلال 10 إلى 14 يوم"
    mode="dominant"
  />
);
