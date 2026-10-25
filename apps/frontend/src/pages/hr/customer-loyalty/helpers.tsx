import React from "react";
import {
  Star,
  Crown,
  DollarSign,
  Users,
  Gift,
  Medal,
  Gem,
  Trophy,
  Award,
} from "lucide-react";

export const getProgramIcon = (type: string): React.ReactElement => {
  switch (type) {
    case "POINTS":
      return <Star className="w-5 h-5" />;
    case "TIER":
      return <Crown className="w-5 h-5" />;
    case "CASHBACK":
      return <DollarSign className="w-5 h-5" />;
    case "REFERRAL":
      return <Users className="w-5 h-5" />;
    default:
      return <Gift className="w-5 h-5" />;
  }
};

export const getTierIcon = (iconName: string): React.ReactElement => {
  switch (iconName?.toLowerCase()) {
    case "crown":
      return <Crown className="w-6 h-6" />;
    case "medal":
      return <Medal className="w-6 h-6" />;
    case "gem":
      return <Gem className="w-6 h-6" />;
    case "trophy":
      return <Trophy className="w-6 h-6" />;
    default:
      return <Award className="w-6 h-6" />;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "INACTIVE":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    case "DRAFT":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "SUSPENDED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "نشط";
    case "INACTIVE":
      return "غير نشط";
    case "DRAFT":
      return "مسودة";
    case "SUSPENDED":
      return "معلق";
    default:
      return status;
  }
};
