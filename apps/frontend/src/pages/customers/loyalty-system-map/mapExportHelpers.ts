import { MapNode, DrawnEdge, ReEngagementLine, NodeStatus, STATUS_META } from "./types";
import { fmt } from "./formatters";

export function exportLoyaltyCsv({
  data,
  nodes,
  reEngagementLines,
}: {
  data: Record<string, any> | null;
  nodes: MapNode[];
  reEngagementLines: ReEngagementLine[];
}) {
  const d = data || {};
  const programs = d.programs || [];
  const totalCustomers = programs.reduce((s: number, p: any) => s + Number(p.customersCount || 0), 0);
  const totalIssued = programs.reduce((s: number, p: any) => s + Number(p.totalPointsIssued || 0), 0);
  const totalRedeemed = programs.reduce((s: number, p: any) => s + Number(p.totalPointsRedeemed || 0), 0);
  const totalCashback = Number(d.wallet?.totalCashback || 0);
  const avgPoints = totalCustomers > 0 ? Math.round((totalIssued - totalRedeemed) / totalCustomers) : 0;
  const redemptionRate = totalIssued > 0 ? Math.round((totalRedeemed / totalIssued) * 100) : 0;
  const statusText = (s: string) =>
    s === "scheduled" ? "مجدولة" : s === "sent" ? "اتبعتت" : s === "failed" ? "فشلت" : s === "inactive" ? "غير مفعّلة" : "غير محدد";

  const lines: string[][] = [];
  lines.push(["العنصر", "القيمة"]);
  lines.push(["العملاء المشتركين", fmt(totalCustomers)]);
  lines.push(["متوسط النقاط للعميل", fmt(avgPoints)]);
  lines.push(["نسبة الاستبدال", `${redemptionRate}%`]);
  lines.push(["إجمالي الكاش باك", `${fmt(totalCashback)} ج.م`]);
  lines.push(["", ""]);
  lines.push(["أداة", "الحالة", "ملخص"]);
  nodes.forEach((n) => lines.push([n.label, STATUS_META[n.status].label, n.summary]));
  lines.push(["", ""]);
  lines.push(["حلقة إعادة استهداف", "المستهدفون", "الحالة"]);
  reEngagementLines.forEach((l) =>
    lines.push([
      l.trigger,
      l.count === null ? "غير محدد" : String(l.count),
      statusText(l.status),
    ]),
  );
  const csv = lines
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "loyalty-system-map.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function exportLoyaltySvg({
  mapElement,
  edges,
  nodeById,
  nodeRefs,
}: {
  mapElement: HTMLDivElement | null;
  edges: DrawnEdge[];
  nodeById: Record<string, MapNode>;
  nodeRefs: Record<string, HTMLDivElement | null>;
}) {
  if (!mapElement) return;
  const rect = mapElement.getBoundingClientRect();
  const W = Math.max(mapElement.scrollWidth, Math.ceil(rect.width));
  const H = Math.max(mapElement.scrollHeight, Math.ceil(rect.height));
  const esc = (s: string) =>
    String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const borderColor: Record<NodeStatus, string> = {
    active: "#10b981",
    inactive: "#cbd5e1",
    warning: "#f59e0b",
    unknown: "#93c5fd",
  };

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Tahoma,Arial,sans-serif"><defs><marker id="arS" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 z" fill="#94a3b8"/></marker><marker id="arA" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 z" fill="#f59e0b"/></marker></defs><rect width="100%" height="100%" fill="#ffffff"/>`,
  );
  for (const e of edges) {
    parts.push(
      `<path d="${e.d}" fill="none" stroke="${e.color}" stroke-width="1.5"${
        e.loop ? ' stroke-dasharray="5 4"' : ""
      } opacity="0.65" marker-end="${e.loop ? "url(#arA)" : "url(#arS)"}"/>`,
    );
    parts.push(
      `<text x="${e.lx}" y="${e.ly - 4}" text-anchor="middle" font-size="10" fill="#64748b">${esc(e.label)}</text>`,
    );
  }
  const ids = Object.keys(nodeById);
  for (const id of ids) {
    const el = nodeRefs[id];
    const n = nodeById[id];
    if (!el || !n) continue;
    const r = el.getBoundingClientRect();
    const x = r.left - rect.left;
    const y = r.top - rect.top;
    const w = r.width;
    const h = r.height;
    parts.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#ffffff" stroke="${borderColor[n.status]}" stroke-width="2"/>`,
    );
    parts.push(
      `<text x="${x + w / 2}" y="${y + 24}" text-anchor="middle" font-size="13" font-weight="bold" fill="#111827">${esc(n.label)}</text>`,
    );
    const summary = n.summary.length > 48 ? n.summary.slice(0, 48) + "…" : n.summary;
    parts.push(
      `<text x="${x + w / 2}" y="${y + 42}" text-anchor="middle" font-size="9" fill="#6b7280">${esc(summary)}</text>`,
    );
  }
  parts.push("</svg>");

  const blob = new Blob([parts.join("")], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "loyalty-system-map.svg";
  a.click();
  URL.revokeObjectURL(url);
}
