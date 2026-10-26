import { Link } from "react-router-dom";
import { AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDetailsData } from "./hooks/useAppDetailsData";
import { AppDetailsHeader } from "./components/app-details/AppDetailsHeader";
import { AppDetailsPricingSidebar } from "./components/app-details/AppDetailsPricingSidebar";
import { AppDetailsFeaturesTab } from "./components/app-details/AppDetailsFeaturesTab";
import { AppDetailsScreenshotsTab } from "./components/app-details/AppDetailsScreenshotsTab";
import { AppDetailsFaqTab } from "./components/app-details/AppDetailsFaqTab";
import { AppDetailsReviewsTab } from "./components/app-details/AppDetailsReviewsTab";
import { AppDetailsChangelogTab } from "./components/app-details/AppDetailsChangelogTab";
import { AppDetailsAuxiliarySections } from "./components/app-details/AppDetailsAuxiliarySections";
import { AppDetailsMobileStickyBar } from "./components/app-details/AppDetailsMobileStickyBar";
import { AppDetailsPositioning } from "./components/app-details/AppDetailsPositioning";
import { AppDetailsVideo } from "./components/app-details/AppDetailsVideo";
import { AppDetailsFitFence } from "./components/app-details/AppDetailsFitFence";
import { isLikelyImageUrl } from "./types/appDetailsTypes";

const tabTriggerClass =
  "rounded-none border-b-2 border-transparent px-3 pb-2.5 pt-2 text-[12.5px] font-bold text-muted-foreground transition-colors data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none";

const sectionTitle = "text-[19px] font-extrabold tracking-tight text-foreground";
const sectionSub = "mt-1 mb-5 text-[13px] text-muted-foreground";

export default function AppDetails() {
  const {
    app,
    loading,
    screenshotIndex,
    setScreenshotIndex,
    activeTab,
    setActiveTab,
    userRating,
    setUserRating,
    reviewText,
    setReviewText,
    submittingReview,
    installing,
    isInstalled,
    appExplanation,
    selectedPlan,
    setSelectedPlan,
    isExpired,
    handleInstall,
    handleUninstall,
    handleSubmitReview,
    navigate,
  } = useAppDetailsData();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 size={30} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-sm rounded-2xl border border-border/60 bg-card p-8 text-center">
          <AlertCircle size={38} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">التطبيق مش موجود أو اتشال من المتجر.</p>
          <Link to="/marketplace" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
            الرجوع للمتجر <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  const rawScreenshots: unknown[] = Array.isArray(app.screenshots)
    ? app.screenshots
    : Array.isArray(app.images)
    ? app.images
    : [];
  const screenshots = rawScreenshots
    .map((s) => (typeof s === "string" ? s : (s as { url?: string })?.url || ""))
    .filter((s) => isLikelyImageUrl(s));

  const faq = Array.isArray(app.faq) ? app.faq : [];
  const changelog = Array.isArray(app.changelog) ? app.changelog : [];
  const reviews = Array.isArray(app.reviews) ? app.reviews : [];

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-4 sm:px-6 lg:pb-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start lg:gap-12">
          <main className="min-w-0 space-y-9">
            <AppDetailsHeader app={app} onBack={() => navigate("/marketplace")} />

            <AppDetailsVideo app={app} explanation={appExplanation} />

            <AppDetailsPositioning app={app} />

            <section>
              <h2 className={sectionTitle}>التفاصيل</h2>
              <p className={sectionSub}>الميزات والشاشات والأسئلة — كل حاجة في مكانها.</p>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {(screenshots.length > 0 ||
                  faq.length > 0 ||
                  reviews.length > 0 ||
                  changelog.length > 0) && (
                  <TabsList className="mb-5 h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-border/60 bg-transparent p-0">
                    <TabsTrigger value="features" className={tabTriggerClass}>
                      الميزات
                    </TabsTrigger>
                    {screenshots.length > 0 && (
                      <TabsTrigger value="screenshots" className={tabTriggerClass}>
                        لقطات الشاشة
                      </TabsTrigger>
                    )}
                    {faq.length > 0 && (
                      <TabsTrigger value="faq" className={tabTriggerClass}>
                        الأسئلة الشائعة
                      </TabsTrigger>
                    )}
                    {reviews.length > 0 && (
                      <TabsTrigger value="reviews" className={tabTriggerClass}>
                        التقييمات
                      </TabsTrigger>
                    )}
                    {changelog.length > 0 && (
                      <TabsTrigger value="changelog" className={tabTriggerClass}>
                        سجل التحديثات
                      </TabsTrigger>
                    )}
                  </TabsList>
                )}

                <TabsContent value="features" className="mt-0">
                  <AppDetailsFeaturesTab app={app} />
                </TabsContent>

                {screenshots.length > 0 && (
                  <TabsContent value="screenshots" className="mt-0">
                    <AppDetailsScreenshotsTab
                      screenshots={screenshots}
                      screenshotIndex={screenshotIndex}
                      onSelectIndex={setScreenshotIndex}
                    />
                  </TabsContent>
                )}

                {faq.length > 0 && (
                  <TabsContent value="faq" className="mt-0">
                    <AppDetailsFaqTab faq={faq} />
                  </TabsContent>
                )}

                {reviews.length > 0 && (
                  <TabsContent value="reviews" className="mt-0">
                    <AppDetailsReviewsTab
                      rating={app.rating || 0}
                      reviewCount={app.reviewCount || 0}
                      reviews={reviews}
                      userRating={userRating}
                      reviewText={reviewText}
                      submittingReview={submittingReview}
                      onRatingChange={setUserRating}
                      onReviewTextChange={setReviewText}
                      onSubmitReview={handleSubmitReview}
                    />
                  </TabsContent>
                )}

                {changelog.length > 0 && (
                  <TabsContent value="changelog" className="mt-0">
                    <AppDetailsChangelogTab changelog={changelog} />
                  </TabsContent>
                )}
              </Tabs>
            </section>

            <AppDetailsAuxiliarySections app={app} appExplanation={null} />

            <AppDetailsFitFence app={app} />
          </main>

          <div>
            <AppDetailsPricingSidebar
              app={app}
              isInstalled={isInstalled}
              installing={installing}
              isExpired={isExpired}
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
              onInstall={handleInstall}
              onUninstall={handleUninstall}
            />
          </div>
        </div>
      </div>

      <AppDetailsMobileStickyBar
        app={app}
        isInstalled={isInstalled}
        installing={installing}
        isExpired={isExpired}
        selectedPlan={selectedPlan}
        onInstall={handleInstall}
      />
    </div>
  );
}
