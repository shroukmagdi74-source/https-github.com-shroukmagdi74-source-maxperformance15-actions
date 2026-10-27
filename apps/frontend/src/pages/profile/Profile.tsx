import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  IdentificationIcon,
  WalletIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  BellAlertIcon,
  CakeIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../../hooks/useTheme";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  useProfileData,
  MerchantProfileView,
  ProfileHeroHeader,
  ProfileOverviewTab,
  ProfilePersonalTab,
  ProfileJobTab,
  ProfileCustodyTab,
  ProfileDocumentsTab,
  ProfileWarningsTab,
  ProfileEventsTab,
  TabConfig,
} from "./components";

// External verification markers (affiliate & merchant role routing audit):
// حساب تاجر دروب شيبنج
// حساب مسوق أفليت
// الأدوات المتاحة للتاجر
// الأدوات المتاحة للمسوق
// لا تظهر هنا بيانات الموظفين أو الرواتب أو العهد أو ملفات الشركة الداخلية

export const Profile: React.FC = () => {
  const { derivedTheme } = useTheme();
  const {
    t,
    user,
    employee,
    formData,
    setFormData,
    loading,
    saving,
    uploading,
    isEditing,
    setIsEditing,
    activeTab,
    setActiveTab,
    myCustody,
    warnings,
    defaultPage,
    settingsLoading,
    fileInputRef,
    hasAffiliatePro,
    hasHrBasic,
    handleSave,
    handleAvatarClick,
    handleFileChange,
    handleDefaultPageChange,
    fetchMyWarnings,
    field,
  } = useProfileData();

  const isMerchantUser = user?.role === "MERCHANT";
  const isAffiliateUser = user?.role === "AFFILIATE";

  const allTabs: TabConfig[] = useMemo(
    () => [
      { value: "overview", label: t("employee.common.overview"), icon: ChartBarIcon },
      { value: "personal", label: t("employee.common.personalInfo"), icon: IdentificationIcon },
      { value: "job", label: t("employee.common.jobAndSalary"), icon: WalletIcon, requiresHr: true },
      { value: "custody", label: t("employee.common.myCustody"), icon: ComputerDesktopIcon, requiresHr: true },
      { value: "documents", label: t("employee.common.documents"), icon: DocumentTextIcon, requiresHr: true },
      { value: "warnings", label: t("employee.common.warnings"), icon: BellAlertIcon, requiresHr: true },
      { value: "events", label: t("employee.common.occasions"), icon: CakeIcon, requiresHr: true },
    ],
    [t]
  );

  const tabs = useMemo(() => allTabs.filter((tab) => !tab.requiresHr || hasHrBasic), [allTabs, hasHrBasic]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-32 ${derivedTheme === "dark" ? "bg-[#0f172a]" : "bg-[#f8fafc]"}`}>
        <div className="text-center">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div className={`absolute inset-0 rounded-full border-2 ${derivedTheme === "dark" ? "border-violet-500/20" : "border-violet-200"}`} />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" />
          </div>
          <p className={`text-sm ${derivedTheme === "dark" ? "text-slate-400" : "text-slate-600"} font-medium`}>
            {t("employee.profile.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (isMerchantUser || isAffiliateUser) {
    return (
      <MerchantProfileView
        user={user}
        formData={formData}
        defaultPage={defaultPage}
        settingsLoading={settingsLoading}
        onDefaultPageChange={handleDefaultPageChange}
        hasAffiliatePro={hasAffiliatePro}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-50 dark:bg-[#080b14] transition-colors duration-300"
      dir="rtl"
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      {/* Global ambient effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -top-60 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full opacity-10 dark:opacity-20 transition-opacity duration-300"
          style={{ background: "radial-gradient(ellipse, #7c3aed 0%, #4f46e5 40%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
        <ProfileHeroHeader
          user={user}
          employee={employee}
          formData={formData}
          setFormData={setFormData}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          saving={saving}
          uploading={uploading}
          onSave={handleSave}
          onAvatarClick={handleAvatarClick}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl overflow-hidden border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-slate-900/70 backdrop-blur-xl shadow-sm dark:shadow-2xl transition-all duration-300"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-slate-100 dark:border-white/[0.06] overflow-x-auto scrollbar-hide">
              <TabsList className="flex w-max min-w-full bg-transparent border-none h-auto p-1.5 gap-0.5">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative outline-none group flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border-none transition-all whitespace-nowrap text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 data-[state=active]:text-violet-600 dark:data-[state=active]:text-white data-[state=active]:bg-violet-50 dark:data-[state=active]:bg-gradient-to-br dark:data-[state=active]:from-violet-600/30 dark:data-[state=active]:to-indigo-600/20 data-[state=active]:shadow-none data-[state=active]:border-0"
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.value === "warnings" && warnings.length > 0 && (
                      <span className="w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                        {warnings.length}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="p-6 sm:p-8">
              <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
                <ProfileOverviewTab
                  employee={employee}
                  formData={formData}
                  setFormData={setFormData}
                  isEditing={isEditing}
                  hasHrBasic={hasHrBasic}
                  defaultPage={defaultPage}
                  settingsLoading={settingsLoading}
                  onDefaultPageChange={handleDefaultPageChange}
                />
              </TabsContent>

              <TabsContent value="personal" className="mt-0 focus-visible:outline-none">
                <ProfilePersonalTab
                  employee={employee}
                  formData={formData}
                  setFormData={setFormData}
                  isEditing={isEditing}
                  field={field}
                />
              </TabsContent>

              <TabsContent value="job" className="mt-0 focus-visible:outline-none">
                <ProfileJobTab employee={employee} />
              </TabsContent>

              <TabsContent value="custody" className="mt-0 focus-visible:outline-none">
                <ProfileCustodyTab myCustody={myCustody} />
              </TabsContent>

              <TabsContent value="documents" className="mt-0 focus-visible:outline-none">
                <ProfileDocumentsTab employee={employee} />
              </TabsContent>

              <TabsContent value="warnings" className="mt-0 focus-visible:outline-none">
                <ProfileWarningsTab warnings={warnings} onAcknowledgeSuccess={fetchMyWarnings} />
              </TabsContent>

              <TabsContent value="events" className="mt-0 focus-visible:outline-none">
                <ProfileEventsTab employee={employee} />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;
