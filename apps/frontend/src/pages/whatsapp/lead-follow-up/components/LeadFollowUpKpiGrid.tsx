import React from "react";
import { WhatsAppMetricCard } from "../../components/WhatsAppPageShell";
import type { StatCardItem } from "../types";

interface LeadFollowUpKpiGridProps {
  cards: StatCardItem[];
}

export const LeadFollowUpKpiGrid: React.FC<LeadFollowUpKpiGridProps> = ({ cards }) => {
  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {cards.map((card, i) => (
        <div key={i} className="transition-all hover:scale-[1.01]">
          <WhatsAppMetricCard {...card} />
        </div>
      ))}
    </div>
  );
};
