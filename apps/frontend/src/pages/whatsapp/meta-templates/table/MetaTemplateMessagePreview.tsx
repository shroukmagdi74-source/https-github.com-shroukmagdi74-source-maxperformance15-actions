import React from "react";
import type { MetaTemplate } from "../types";

interface MetaTemplateMessagePreviewProps {
  template: MetaTemplate;
  variantKey: string;
  substituteVars: (text: string, key: string) => string;
}

export const MetaTemplateMessagePreview: React.FC<
  MetaTemplateMessagePreviewProps
> = ({ template, variantKey, substituteVars }) => {
  const headerComp = template.components?.find((c) => c.type === "HEADER");
  const bodyComp = template.components?.find((c) => c.type === "BODY");
  const footerComp = template.components?.find((c) => c.type === "FOOTER");
  const buttonsComp = template.components?.find((c) => c.type === "BUTTONS");

  const isRtl = template.language === "ar" || template.language === "ur";

  return (
    <div
      className="rounded-lg border border-emerald-200/60 bg-white px-3 py-2 text-sm shadow-sm dark:border-emerald-900/40 dark:bg-[#0b141a]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {headerComp?.text ? (
        <p className="font-semibold text-[#111b21] dark:text-white">
          {substituteVars(headerComp.text, variantKey)}
        </p>
      ) : headerComp?.format && headerComp.format !== "TEXT" ? (
        <div className="mb-2 flex h-20 items-center justify-center rounded bg-emerald-50 text-[10px] uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
          {headerComp.format} media
        </div>
      ) : null}

      {bodyComp?.text ? (
        <p className="mt-1 whitespace-pre-wrap leading-relaxed text-[#111b21] dark:text-white">
          {substituteVars(bodyComp.text, variantKey)
            .split(/(\{\{\d+\}\})/g)
            .map((part, idx) =>
              /^\{\{\d+\}\}$/.test(part) ? (
                <span
                  key={idx}
                  className="mx-0.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
                >
                  {part}
                </span>
              ) : (
                <span key={idx}>{part}</span>
              )
            )}
        </p>
      ) : null}

      {footerComp?.text ? (
        <p className="mt-1 text-[11px] text-[#667781] dark:text-[#aebac1]">
          {substituteVars(footerComp.text, variantKey)}
        </p>
      ) : null}

      {buttonsComp?.buttons?.length ? (
        <div className="mt-2 flex flex-col gap-1 border-t border-[#e9edef] pt-1 dark:border-[#222d34]">
          {buttonsComp.buttons.map((b, idx) => (
            <div
              key={idx}
              className="text-center text-xs font-medium text-[#00a884] dark:text-[#00d294]"
            >
              {b.text || `زر ${idx + 1}`}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
