import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Users, Clock } from "lucide-react";
import { Button } from "../../../components/ui/button";

export const HRDashboardHero: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 shadow-lg mb-8">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="text-white">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            {t("hrDashboard.pageTitle")}
          </h1>
          <p className="text-blue-100 mt-2 text-base sm:text-lg opacity-90 max-w-2xl">
            {t("hrDashboard.overview")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigate("/hr/employees")}
            variant="secondary"
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
          >
            <Users className="h-5 w-5 ml-2" />
            {t("hrDashboard.manageEmployees")}
          </Button>
          <Button
            onClick={() => navigate("/hr/attendance")}
            className="bg-white text-blue-700 hover:bg-blue-50 transition-all duration-300 shadow-md"
          >
            <Clock className="h-5 w-5 ml-2" />
            {t("hrDashboard.attendance")}
          </Button>
        </div>
      </div>
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
    </div>
  );
};
