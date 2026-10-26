import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Layers, List, Megaphone, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '../../services/apiClient';
import { WhatsAppPageShell } from './components/WhatsAppPageShell';
import {
  BroadcastAnalyticsTab,
  CampaignsHistoryTab,
  CreateCampaignTab,
  CustomerListsTab,
  DeleteListConfirmDialog,
  useWhatsAppTemplateBroadcastController,
} from './template-broadcast';

interface WhatsAppTemplateBroadcastProps {
  companyId?: string;
  companyName?: string;
  superAdminMode?: boolean;
}

const WhatsAppTemplateBroadcast: React.FC<WhatsAppTemplateBroadcastProps> = ({
  companyId,
  companyName: _companyName,
  superAdminMode: _superAdminMode = false,
}) => {
  const { t } = useTranslation();

  const {
    activeTab,
    setActiveTab,
    sessions,
    selectedSessionId,
    setSelectedSessionId,
    templates,
    selectedTemplate,
    setSelectedTemplate,
    languageCode,
    setLanguageCode,
    waHeaderMedia,
    setWaHeaderMedia,
    headerMediaName,
    setHeaderMediaName,
    headerUploading,
    campaignName,
    setCampaignName,
    customerLists,
    selectedListId,
    leadCategories,
    selectedLeadCategoryId,
    setSelectedLeadCategoryId,
    recipientsText,
    setRecipientsText,
    recipients,
    availableTags,
    selectedTag,
    listsSearch,
    setListsSearch,
    listsFilter,
    setListsFilter,
    listToDelete,
    setListToDelete,
    deletingList,
    refreshingListId,
    scheduleAt,
    setScheduleAt,
    sending,
    result,
    sendProgress,
    campaigns,
    loadingCampaigns,
    expandedCampaignId,
    setExpandedCampaignId,
    expandedListId,
    setExpandedListId,
    listMembers,
    setListMembers,
    loadingMembers,
    setLoadingMembers,
    importingCategoryId,
    filteredCustomerLists,
    addRecipients,
    removeRecipient,
    handleSelectList,
    handleListSelectForSend,
    handleSelectTag,
    handleImportFromCategory,
    handleCreateCampaign,
    handleUploadHeaderMedia,
    handleDeleteList,
    handleDuplicateList,
    handleRefreshListCount,
    openRate,
    clickRate,
    deliveryRate,
    replyRate,
    fetchCampaigns,
    withCompanyConfig,
  } = useWhatsAppTemplateBroadcastController({ companyId });

  const handleToggleExpandCategory = async (categoryId: string, contactCount: number) => {
    if (expandedListId === categoryId) {
      setExpandedListId(null);
      return;
    }
    setExpandedListId(categoryId);
    const existing = listMembers[categoryId] || [];
    if (existing.length === 0 && contactCount > 0) {
      setLoadingMembers(true);
      try {
        const res = await apiClient.get(
          `/whatsapp/lead-categories/${categoryId}/contacts`,
          withCompanyConfig()
        );
        setListMembers((prev) => ({
          ...prev,
          [categoryId]: (res as any).data?.data || [],
        }));
      } catch {
        // Fallback
      } finally {
        setLoadingMembers(false);
      }
    }
  };

  return (
    <WhatsAppPageShell
      title="حملات بث قوالب واتساب"
      description="إنشاء وإدارة حملات إرسال قوالب Meta API مع تتبع الفتح والضغط"
      icon={Megaphone}
      backHref="/whatsapp"
      backLabel={(t('common.back') as string) || 'رجوع'}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="h-9 rounded-lg p-1 bg-muted/60">
          <TabsTrigger value="create" className="h-7 rounded-md text-xs gap-1.5 data-[state=active]:bg-background">
            <Send className="size-3.5" />
            <span>إنشاء حملة</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="h-7 rounded-md text-xs gap-1.5 data-[state=active]:bg-background">
            <Megaphone className="size-3.5" />
            <span>سجل الحملات</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="h-7 rounded-md text-xs gap-1.5 data-[state=active]:bg-background">
            <BarChart className="size-3.5" />
            <span>التحليلات</span>
          </TabsTrigger>
          <TabsTrigger value="lists" className="h-7 rounded-md text-xs gap-1.5 data-[state=active]:bg-background">
            <List className="size-3.5" />
            <span>قوائم العملاء</span>
          </TabsTrigger>
        </TabsList>

        {/* Create Campaign Tab */}
        <TabsContent value="create" className="mt-0 space-y-4">
          <CreateCampaignTab
            campaignName={campaignName}
            setCampaignName={setCampaignName}
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            setSelectedSessionId={setSelectedSessionId}
            templates={templates}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            languageCode={languageCode}
            setLanguageCode={setLanguageCode}
            waHeaderMedia={waHeaderMedia}
            setWaHeaderMedia={setWaHeaderMedia}
            headerMediaName={headerMediaName}
            setHeaderMediaName={setHeaderMediaName}
            headerUploading={headerUploading}
            customerLists={customerLists}
            selectedListId={selectedListId}
            handleSelectList={handleSelectList}
            availableTags={availableTags}
            selectedTag={selectedTag}
            handleSelectTag={handleSelectTag}
            leadCategories={leadCategories}
            selectedLeadCategoryId={selectedLeadCategoryId}
            setSelectedLeadCategoryId={setSelectedLeadCategoryId}
            scheduleAt={scheduleAt}
            setScheduleAt={setScheduleAt}
            recipientsText={recipientsText}
            setRecipientsText={setRecipientsText}
            recipients={recipients}
            addRecipients={addRecipients}
            removeRecipient={removeRecipient}
            sending={sending}
            handleCreateCampaign={handleCreateCampaign}
            handleUploadHeaderMedia={handleUploadHeaderMedia}
            result={result}
            sendProgress={sendProgress}
            onGoToCampaigns={() => setActiveTab('campaigns')}
          />
        </TabsContent>

        {/* Previous Campaigns Tab */}
        <TabsContent value="campaigns" className="mt-0">
          <CampaignsHistoryTab
            loadingCampaigns={loadingCampaigns}
            campaigns={campaigns}
            expandedCampaignId={expandedCampaignId}
            setExpandedCampaignId={setExpandedCampaignId}
            openRate={openRate}
            clickRate={clickRate}
            deliveryRate={deliveryRate}
            replyRate={replyRate}
            onRefresh={fetchCampaigns}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-0">
          <BroadcastAnalyticsTab
            campaigns={campaigns}
            openRate={openRate}
            clickRate={clickRate}
            deliveryRate={deliveryRate}
            replyRate={replyRate}
          />
        </TabsContent>

        {/* Customer Lists Tab */}
        <TabsContent value="lists" className="mt-0">
          <CustomerListsTab
            listsSearch={listsSearch}
            setListsSearch={setListsSearch}
            listsFilter={listsFilter}
            setListsFilter={setListsFilter}
            filteredCustomerLists={filteredCustomerLists}
            refreshingListId={refreshingListId}
            onSelectForSend={handleListSelectForSend}
            onDuplicateList={handleDuplicateList}
            onRefreshListCount={handleRefreshListCount}
            onDeleteList={setListToDelete}
            leadCategories={leadCategories}
            expandedListId={expandedListId}
            setExpandedListId={setExpandedListId}
            listMembers={listMembers}
            loadingMembers={loadingMembers}
            importingCategoryId={importingCategoryId}
            onImportFromCategory={handleImportFromCategory}
            onToggleExpandCategory={handleToggleExpandCategory}
          />
        </TabsContent>
      </Tabs>

      {/* Delete List Confirmation Dialog */}
      <DeleteListConfirmDialog
        list={listToDelete}
        deleting={deletingList}
        onClose={() => setListToDelete(null)}
        onConfirm={handleDeleteList}
      />
    </WhatsAppPageShell>
  );
};

export default WhatsAppTemplateBroadcast;
