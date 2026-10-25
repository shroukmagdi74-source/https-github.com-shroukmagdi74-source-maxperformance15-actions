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
      : "size: A4 portrait; margin: 8mm 10mm 10mm 10mm;";

  return (
    <style>{`
      @media print {
        @page {
          ${pageRule}
        }

        /* 1. RESET ALL DARK THEMES AND CSS VARIABLES TO PURE CRISP WHITE */
        :root, html, body, [class*="dark"], [data-theme] {
          --background: 0 0% 100% !important;
          --foreground: 0 0% 0% !important;
          --card: 0 0% 100% !important;
          --card-foreground: 0 0% 0% !important;
          --popover: 0 0% 100% !important;
          --popover-foreground: 0 0% 0% !important;
          --muted: 0 0% 96% !important;
          --muted-foreground: 0 0% 40% !important;
          --border: 0 0% 88% !important;
          background-color: transparent !important;
          color-scheme: light !important;
        }

        html, body {
          background: #ffffff !important;
          background-color: #ffffff !important;
          color: #0f172a !important;
          margin: 0 !important;
          padding: 0 !important;
          min-height: 0 !important;
          height: auto !important;
        }

        /* 2. REMOVE ALL DROP SHADOWS, BLURS, AND TEXT NOISE */
        *, *::before, *::after {
          box-shadow: none !important;
          text-shadow: none !important;
          filter: none !important;
          backdrop-filter: none !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* 3. ENSURE ALL ROOT LAYOUT CONTAINERS ARE 100% WHITE & BORDERLESS */
        #root, #root > div, main, [role="main"], .app-shell, .layout-container,
        .business-shell-root, .business-shell-main, .app-dashboard-root, .app-dashboard-app-root,
        .purchase-order-detail-container, .purchase-invoice-detail-container {
          background: #ffffff !important;
          background-color: #ffffff !important;
          color: #0f172a !important;
          margin: 0 !important;
          padding: 0 !important;
          min-height: 0 !important;
          height: auto !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* 4. HIDE ALL NAVIGATION, HEADERS, SHELLS & UI CONTROLS */
        header, nav, aside, [role="navigation"], .sidebar, .app-sidebar, #app-header, 
        button, .print\\:hidden, [data-sonner-toaster], .fixed, .no-print,
        .canvas-toolbar, .zoom-controls, .business-shell-header, .business-shell-sidebar,
        .business-mobile-drawer, .business-mobile-overlay, .business-mobile-backdrop {
          display: none !important;
        }

        /* 5. ENSURE ROOT IS TRANSPARENT & SHEET IS 100% PURE WHITE */
        .procurement-print-root {
          display: block !important;
          position: static !important;
          padding: 0 !important;
          margin: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          background: #ffffff !important;
          background-color: #ffffff !important;
          border: none !important;
          box-shadow: none !important;
        }

        .printable-commercial-sheet {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 100% !important;
          background: #ffffff !important;
          background-color: #ffffff !important;
          color: #0f172a !important;
          box-shadow: none !important;
          border: none !important;
          margin: 0 auto !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        .printable-commercial-sheet * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        /* 6. AVOID AWKWARD PAGE BREAKS */
        .no-break, tr, .no-page-break {
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
