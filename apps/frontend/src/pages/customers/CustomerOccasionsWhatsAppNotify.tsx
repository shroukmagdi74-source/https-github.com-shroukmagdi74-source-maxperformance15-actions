import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, BarChart3 } from 'lucide-react';
import MetaTemplatesModal from './components/MetaTemplatesModal';
import TemplateStatsPanel from './components/TemplateStatsPanel';
import {
  CustomerOccasionsChannelStatus,
  CustomerOccasionsDeleteDialog,
  CustomerOccasionsFormDialog,
  CustomerOccasionsHeader,
  CustomerOccasionsList,
  CustomerOccasionsViewDialog,
  useCustomerOccasionsController,
} from './occasions-notify';

const CustomerOccasionsWhatsAppNotify: React.FC = () => {
  const {
    occasions,
    loading,
    search,
    setSearch,
    selectedSession,
    setSelectedSession,
    form,
    setForm,
    formOpen,
    setFormOpen,
    saving,
    sendingNow,
    viewOccasion,
    setViewOccasion,
    metaModalOpen,
    setMetaModalOpen,
    deleting,
    setDeleting,
    loadOccasions,
    loadSessions,
    openCreate,
    openEdit,
    sendNow,
    save,
    confirmDelete,
    filtered,
    connectedSessions,
    hasBaileys,
  } = useCustomerOccasionsController();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-3 sm:p-5">
      {/* Header */}
      <CustomerOccasionsHeader
        loading={loading}
        onRefresh={loadOccasions}
        onCreate={openCreate}
      />

      {/* Channel Connection Status */}
      <CustomerOccasionsChannelStatus
        hasBaileys={hasBaileys}
        sessions={connectedSessions}
        selected={selectedSession}
        onSelect={setSelectedSession}
        onRefresh={loadSessions}
      />

      {/* Main Tabs Chassis */}
      <Tabs defaultValue="occasions" className="space-y-4">
        <TabsList className="h-9 rounded-lg p-1 bg-muted/60">
          <TabsTrigger value="occasions" className="h-7 rounded-md text-xs gap-1.5 data-[state=active]:bg-background">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>المناسبات</span>
            <Badge variant="secondary" className="mr-1.5 h-4 rounded-full px-1.5 text-[10px] font-mono tabular-nums">
              {occasions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="stats" className="h-7 rounded-md text-xs gap-1.5 data-[state=active]:bg-background">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>أداء القوالب</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="occasions" className="mt-0 space-y-4">
          <CustomerOccasionsList
            loading={loading}
            search={search}
            onSearchChange={setSearch}
            filtered={filtered}
            onCreate={openCreate}
            onView={(o) => setViewOccasion(o)}
            onEdit={(o) => openEdit(o)}
            onDelete={(o) => setDeleting(o)}
          />
        </TabsContent>

        <TabsContent value="stats" className="mt-0">
          <TemplateStatsPanel />
        </TabsContent>
      </Tabs>

      {/* Create / Edit Dialog */}
      <CustomerOccasionsFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        form={form}
        setForm={setForm}
        saving={saving}
        sendingNow={sendingNow}
        hasBaileys={hasBaileys}
        onSave={save}
        onSendNow={sendNow}
        onOpenMetaModal={() => setMetaModalOpen(true)}
      />

      {/* View Dialog */}
      <CustomerOccasionsViewDialog
        occasion={viewOccasion}
        onClose={() => setViewOccasion(null)}
      />

      {/* Delete Confirmation Dialog */}
      <CustomerOccasionsDeleteDialog
        occasion={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />

      {/* Meta Templates Selector Modal */}
      <MetaTemplatesModal
        open={metaModalOpen}
        onClose={() => setMetaModalOpen(false)}
        onPick={(content) => {
          setForm((prev) => ({ ...prev, message: content || prev.message }));
          setMetaModalOpen(false);
        }}
        title="اختيار قالب ميتا للمناسبة"
      />
    </div>
  );
};

export default CustomerOccasionsWhatsAppNotify;
