import React from 'react';
import { Plus, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SettingsLoadingState,
  SettingsPageHero,
  SettingsPageShell,
  SettingsStatusAlert,
} from './components/SettingsPagePrimitives';
import {
  DeliveryOptionCard,
  DeliveryOptionEditorModal,
  DeliveryOptionsEmptyState,
  useDeliveryOptionsController,
} from './delivery-options';

const DeliveryOptions: React.FC = () => {
  const {
    options,
    sortedOptions,
    loading,
    saving,
    togglingId,
    dialogOpen,
    editingOption,
    message,
    formData,
    setFormData,
    activeCount,
    defaultCount,
    openCreateDialog,
    openEditDialog,
    handleCloseDialog,
    handleSave,
    handleToggle,
    handleDelete,
  } = useDeliveryOptionsController();

  if (loading) {
    return (
      <SettingsLoadingState
        title="جاري تحميل خيارات التوصيل..."
        description="بنرتّب لك أنواع التوصيل المتاحة وأسعارها من نفس السطح الحديث."
      />
    );
  }

  return (
    <>
      <SettingsPageShell>
        <SettingsPageHero
          badgeIcon={Truck}
          badgeLabel="إدارة مسارات التوصيل"
          title="خيارات التوصيل"
          description="أنشئ أنواع التوصيل التي يراها العميل، وحدد السعر ووقت التنفيذ والترتيب الافتراضي لكل خيار من مكان واحد."
          action={
            <Button
              type="button"
              size="lg"
              onClick={openCreateDialog}
              className="rounded-2xl bg-foreground text-background hover:bg-foreground/90 gap-2 font-semibold"
            >
              <Plus className="size-4" />
              إضافة خيار جديد
            </Button>
          }
          summaryItems={[
            { label: 'إجمالي الخيارات', value: options.length },
            { label: 'الخيارات النشطة', value: activeCount },
            { label: 'الخيارات الافتراضية', value: defaultCount },
          ]}
          gradientClassName="bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_36%),linear-gradient(135deg,_rgba(248,250,252,0.98),_rgba(239,246,255,0.88))]"
        />

        <div className="space-y-6 px-6 py-6">
          <SettingsStatusAlert message={message} />

          {sortedOptions.length === 0 ? (
            <DeliveryOptionsEmptyState onOpenCreateDialog={openCreateDialog} />
          ) : (
            <div className="space-y-4">
              {sortedOptions.map((option) => (
                <DeliveryOptionCard
                  key={option.id}
                  option={option}
                  togglingId={togglingId}
                  onToggle={handleToggle}
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </SettingsPageShell>

      <DeliveryOptionEditorModal
        dialogOpen={dialogOpen}
        editingOption={editingOption}
        formData={formData}
        setFormData={setFormData}
        saving={saving}
        onClose={handleCloseDialog}
        onSave={handleSave}
      />
    </>
  );
};

export default DeliveryOptions;
