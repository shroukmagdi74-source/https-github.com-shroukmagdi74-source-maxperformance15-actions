import { CartItem, LastOrder } from "./types";

export const printReceipt = (
  lastOrder: LastOrder | null,
  locale: string,
  t: (key: string) => string,
) => {
  if (!lastOrder) return;
  const w = window.open("", "", "width=400,height=600");
  if (w) {
    w.document.write(
      '<html dir="rtl"><head><style>body{font:12px Arial;max-width:280px;margin:auto;padding:20px}.c{text-align:center}.r{display:flex;justify-content:space-between;margin:4px 0}.b{font-weight:bold}.hr{border-top:1px dashed #000;margin:10px 0}</style></head><body>',
    );
    w.document.write(
      '<div class="c"><h2>' +
        t("posPage.posReceipt") +
        '</h2><p>' +
        lastOrder.orderNumber +
        "</p><p>" +
        lastOrder.date.toLocaleString(locale) +
        '</p></div><div class="hr"></div>',
    );
    lastOrder.items.forEach((i) => {
      w.document.write(
        '<div class="r"><span>' +
          i.name +
          " x" +
          i.qty +
          "</span><span>" +
          (i.price * i.qty).toLocaleString(locale) +
          "</span></div>",
      );
      if (i.selectedModifiers && i.selectedModifiers.length > 0) {
        i.selectedModifiers.forEach((m) => {
          w.document.write(
            '<div style="font-size:10px;color:#555;padding-right:8px">+ ' +
              m.name +
              (m.additionalPrice > 0 ? " (+" + m.additionalPrice + ")" : "") +
              "</div>",
          );
        });
      }
      if (i.itemNotes) {
        w.document.write(
          '<div style="font-size:10px;color:#888;padding-right:8px">ملاحظة: ' +
            i.itemNotes +
            "</div>",
        );
      }
    });
    w.document.write(
      '<div class="hr"></div><div class="r"><span>' +
        t("posPage.subtotal") +
        '</span><span>' +
        lastOrder.subtotal.toLocaleString(locale) +
        "</span></div>",
    );
    if (lastOrder.discount && lastOrder.discount > 0) {
      w.document.write(
        '<div class="r" style="color:#d97706"><span>' +
          (lastOrder.discountType === "VIP_COMP" ? "ضيافة إدارة (100%)" : "خصم") +
          '</span><span>-' +
          lastOrder.discount.toLocaleString(locale) +
          "</span></div>",
      );
    }
    w.document.write(
      '<div class="r"><span>' +
        t("posPage.vat") +
        '</span><span>' +
        lastOrder.tax.toLocaleString(locale) +
        "</span></div>",
    );
    w.document.write(
      '<div class="r b"><span>' +
        t("posPage.total") +
        '</span><span>' +
        lastOrder.total.toLocaleString(locale) +
        " " +
        t("posPage.egp") +
        "</span></div>",
    );
    if (lastOrder.paymentMethod === "CASH") {
      w.document.write(
        '<div class="hr"></div><div class="r"><span>' +
          t("posPage.paid") +
          '</span><span>' +
          (lastOrder.cashReceived || 0).toLocaleString(locale) +
          "</span></div>",
      );
      w.document.write(
        '<div class="r b"><span>' +
          t("posPage.change") +
          '</span><span>' +
          (lastOrder.change || 0).toLocaleString(locale) +
          "</span></div>",
      );
    } else if (lastOrder.paymentMethod === "SPLIT" && lastOrder.splitDetails) {
      w.document.write(
        '<div class="hr"></div><div class="r"><span>كاش: ' +
          lastOrder.splitDetails.cash.toLocaleString(locale) +
          '</span><span>فيزا: ' +
          lastOrder.splitDetails.card.toLocaleString(locale) +
          "</span></div>",
      );
    }
    w.document.write(
      '<div class="hr"></div><p class="c">' +
        t("posPage.thankYou") +
        '</p></body></html>',
    );
    w.document.close();
    setTimeout(() => {
      w.print();
      w.close();
    }, 300);
  }
};

export const printKitchenTicket = (
  lastOrder: LastOrder | null,
  locale: string,
) => {
  if (!lastOrder) return;
  const w = window.open("", "", "width=400,height=500");
  if (w) {
    w.document.write(
      '<html dir="rtl"><head><style>body{font:13px monospace;max-width:280px;margin:auto;padding:15px}.c{text-align:center}.r{display:flex;justify-content:space-between;margin:5px 0;font-weight:bold;font-size:15px}.hr{border-top:2px dashed #000;margin:8px 0}</style></head><body>',
    );
    w.document.write(
      '<div class="c"><h2 style="margin:0">تذكرة تجهيز بار / مطبخ</h2><h1 style="margin:4px 0;font-size:22px">#' +
        lastOrder.orderNumber +
        '</h1><p style="margin:0">' +
        lastOrder.date.toLocaleTimeString(locale) +
        '</p></div><div class="hr"></div>',
    );
    lastOrder.items.forEach((i) => {
      w.document.write(
        '<div class="r"><span>' +
          i.name +
          '</span><span>x ' +
          i.qty +
          '</span></div>',
      );
      if (i.selectedModifiers && i.selectedModifiers.length > 0) {
        i.selectedModifiers.forEach((m) => {
          w.document.write(
            '<div style="font-size:11px;font-weight:normal;padding-right:8px">+ ' +
              m.name +
              '</div>',
          );
        });
      }
      if (i.itemNotes) {
        w.document.write(
          '<div style="font-size:11px;font-weight:normal;color:#c00;padding-right:8px">ملاحظة: ' +
            i.itemNotes +
            '</div>',
        );
      }
    });
    w.document.write(
      '<div class="hr"></div><p class="c" style="font-size:10px">تذكرة تشغيلية للأقسام</p></body></html>',
    );
    w.document.close();
    setTimeout(() => {
      w.print();
      w.close();
    }, 300);
  }
};

export const fireKitchenTicketWindow = (
  cart: CartItem[],
  activeTabName: string | null,
  locale: string,
) => {
  const w = window.open("", "", "width=400,height=550");
  if (w) {
    w.document.write(
      '<html dir="rtl"><head><title>تذكرة بار / مطبخ</title><style>body{font:13px monospace;max-width:280px;margin:auto;padding:15px;color:#000}.c{text-align:center}.r{display:flex;justify-content:space-between;margin:5px 0;font-weight:bold;font-size:14px}.mod{font-size:11px;color:#555;padding-right:8px}.note{font-size:11px;color:#c00;padding-right:8px;font-style:italic}.hr{border-top:2px dashed #000;margin:8px 0}</style></head><body>'
    );
    w.document.write(
      '<div class="c"><h2 style="margin:0;font-size:16px">تذكرة تجهيز بار / مطبخ</h2>' +
      (activeTabName ? '<h1 style="margin:4px 0;font-size:20px;border:1px solid #000;padding:4px">' + activeTabName + '</h1>' : '<h3 style="margin:4px 0">طلب صالة / سفري</h3>') +
      '<p style="margin:0;font-size:11px">' + new Date().toLocaleTimeString(locale) + '</p></div><div class="hr"></div>'
    );
    cart.forEach((i) => {
      w.document.write(
        '<div class="r"><span>' + i.name + '</span><span>x ' + i.qty + '</span></div>'
      );
      if (i.selectedModifiers && i.selectedModifiers.length > 0) {
        i.selectedModifiers.forEach((m) => {
          w.document.write('<div class="mod">+ ' + m.name + (m.additionalPrice > 0 ? ' (+' + m.additionalPrice + ')' : '') + '</div>');
        });
      }
      if (i.itemNotes) {
        w.document.write('<div class="note">ملاحظة: ' + i.itemNotes + '</div>');
      }
    });
    w.document.write(
      '<div class="hr"></div><p class="c" style="font-size:10px;margin:4px 0">يرجى سرعة التجهيز والتقديم</p></body></html>'
    );
    w.document.close();
    setTimeout(() => {
      w.print();
      w.close();
    }, 300);
  }
};
