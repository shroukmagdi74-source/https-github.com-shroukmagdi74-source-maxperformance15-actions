import React from "react";
import {
  Gift,
  HeartPulse,
  Shield,
  PiggyBank,
  Car,
  Home,
} from "lucide-react";
import { BenefitFormData, EnrollmentFormData } from "./types";

export const getTypeIcon = (type: string) => {
  switch (type) {
    case "health_insurance":
      return <HeartPulse className="h-5 w-5 text-red-500" />;
    case "life_insurance":
      return <Shield className="h-5 w-5 text-blue-500" />;
    case "retirement":
      return <PiggyBank className="h-5 w-5 text-green-500" />;
    case "transportation":
      return <Car className="h-5 w-5 text-gray-500" />;
    case "housing":
      return <Home className="h-5 w-5 text-orange-500" />;
    default:
      return <Gift className="h-5 w-5 text-purple-500" />;
  }
};

export const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    health_insurance: "تأمين صحي",
    life_insurance: "تأمين على الحياة",
    retirement: "تقاعد",
    transportation: "بدل انتقال",
    housing: "بدل سكن",
    other: "أخرى",
  };
  return typeMap[type] || type;
};

export const createDefaultBenefitForm = (): BenefitFormData => ({
  name: "",
  description: "",
  type: "health_insurance",
  cost: 0,
  currency: "EGP",
  isActive: true,
});

export const createDefaultEnrollmentForm = (): EnrollmentFormData => ({
  employeeId: "",
  startDate: new Date().toISOString().split("T")[0],
  notes: "",
});
