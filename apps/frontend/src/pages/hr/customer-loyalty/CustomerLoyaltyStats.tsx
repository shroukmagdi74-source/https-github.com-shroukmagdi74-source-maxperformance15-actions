import React from "react";
import { Gift, Users, Star, Trophy } from "lucide-react";
import type {
  CustomerLoyaltyProgram,
  CustomerLoyaltyRecord,
  CustomerLoyaltyTier,
} from "./types";

interface CustomerLoyaltyStatsProps {
  programs: CustomerLoyaltyProgram[];
  customers: CustomerLoyaltyRecord[];
  tiers: CustomerLoyaltyTier[];
}

export const CustomerLoyaltyStats: React.FC<CustomerLoyaltyStatsProps> = ({
  programs,
  customers,
  tiers,
}) => {
  const activeProgramsCount = programs.filter(
    (p) => p.status === "ACTIVE",
  ).length;
  const activeCustomersCount = customers.filter(
    (c) => c.status === "ACTIVE",
  ).length;
  const totalPoints = customers.reduce((sum, c) => sum + c.currentPoints, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white shadow-sm">
        <div className="flex items-center gap-2 text-sm opacity-80">
          <Gift className="w-4 h-4" />
          <span>البرامج النشطة</span>
        </div>
        <p className="text-2xl font-bold mt-1 font-mono tabular-nums">
          {activeProgramsCount}
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-sm">
        <div className="flex items-center gap-2 text-sm opacity-80">
          <Users className="w-4 h-4" />
          <span>العملاء المشتركين</span>
        </div>
        <p className="text-2xl font-bold mt-1 font-mono tabular-nums">
          {activeCustomersCount}
        </p>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white shadow-sm">
        <div className="flex items-center gap-2 text-sm opacity-80">
          <Star className="w-4 h-4" />
          <span>إجمالي النقاط</span>
        </div>
        <p className="text-2xl font-bold mt-1 font-mono tabular-nums">
          {totalPoints.toLocaleString()}
        </p>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl text-white shadow-sm">
        <div className="flex items-center gap-2 text-sm opacity-80">
          <Trophy className="w-4 h-4" />
          <span>المستويات</span>
        </div>
        <p className="text-2xl font-bold mt-1 font-mono tabular-nums">
          {tiers.length}
        </p>
      </div>
    </div>
  );
};
