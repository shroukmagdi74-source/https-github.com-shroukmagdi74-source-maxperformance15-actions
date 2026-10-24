import React from "react";

interface ProcurementPrintStylesProps {
  paperSize?: "A4" | "A5";
}

export const ProcurementPrintStyles: React.FC<ProcurementPrintStylesProps> = ({
  paperSize = "A4",
}) => {
  const pageRule =
    paperSize === "A5"
      ? "size: A5 landscape; margin: 6mm 8mm;"
      : "size: A4 portrait; margin: 10mm 12mm 12mm 12mm;";

  return (
    <style>{`
      @media print {
        @page {
          ${pageRule}
        }
        body, html {
          background: #ffffff !important;
          color: #0f172a !important;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", sans-serif !important;
          font-size: 12px !important;
          line-height: 1.4 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        header, nav, aside, [role="navigation"], .sidebar, .app-sidebar, #app-header, button, .print\\:hidden, [data-sonner-toaster], .fixed {
          display: none !important;
        }
        .purchase-order-detail-container,
        .purchase-invoice-detail-container,
        .procurement-print-root {
          padding: 0 !important;
          margin: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          box-shadow: none !important;
          border: none !important;
          background: transparent !important;
        }
        .printable-commercial-sheet {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 100% !important;
          background: #ffffff !important;
          color: #0f172a !important;
          box-shadow: none !important;
        }
        .no-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      }
      @media screen {
        .printable-commercial-sheet {
          display: block;
        }
      }
    `}</style>
  );
};
