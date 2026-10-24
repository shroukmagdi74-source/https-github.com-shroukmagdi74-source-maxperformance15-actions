import React from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreateCustomerBlockRuleCard,
  CustomerBlockConfigSection,
  CustomerBlockHeader,
  CustomerBlockRulesTable,
  useCustomerBlockController,
} from './customer-blocks';

const CustomerBlockSettings: React.FC = () => {
  const {
    settings,
    setSettings,
    rules,
    isLoading,
    isSaving,
    isCreating,
    feedback,
    search,
    setSearch,
    newRule,
    setNewRule,
    activeRulesCount,
    actionOptions,
    reasonOptions,
    getActionLabel,
    getReasonLabel,
    formatDate,
    loadData,
    updateBoolean,
    handleSaveSettings,
    handleCreateRule,
    handleLiftRule,
  } = useCustomerBlockController();

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <CustomerBlockHeader activeRulesCount={activeRulesCount} />

      {feedback && (
        <Alert
          variant={feedback.type === 'success' ? 'default' : 'destructive'}
          className="mb-6"
        >
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <CustomerBlockConfigSection
            settings={settings}
            setSettings={setSettings}
            actionOptions={actionOptions}
            updateBoolean={updateBoolean}
            handleSaveSettings={handleSaveSettings}
            isSaving={isSaving}
          />

          <CustomerBlockRulesTable
            rules={rules}
            search={search}
            setSearch={setSearch}
            loadData={loadData}
            handleLiftRule={handleLiftRule}
            getActionLabel={getActionLabel}
            getReasonLabel={getReasonLabel}
            formatDate={formatDate}
          />
        </div>

        <CreateCustomerBlockRuleCard
          newRule={newRule}
          setNewRule={setNewRule}
          handleCreateRule={handleCreateRule}
          isCreating={isCreating}
          actionOptions={actionOptions}
          reasonOptions={reasonOptions}
        />
      </div>
    </div>
  );
};

export default CustomerBlockSettings;
