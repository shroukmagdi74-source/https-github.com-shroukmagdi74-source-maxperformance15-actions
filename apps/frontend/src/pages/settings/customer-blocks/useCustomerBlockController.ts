import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  customerBlocklistService,
  type CustomerBlockAction,
  type CustomerBlockReasonCode,
  type CustomerBlockRule,
  type CustomerBlockSettings as CustomerBlockSettingsShape,
} from '../../../services/customerBlocklistService';
import type {
  CustomerBlockActionOption,
  CustomerBlockReasonOption,
  FeedbackState,
  NewRuleState,
} from './types';

export function useCustomerBlockController() {
  const { t } = useTranslation();

  const reasonOptions: CustomerBlockReasonOption[] = useMemo(
    () => [
      { value: 'FAKE_ORDERS', label: t('customerBlocks.k_1', 'طلب وهمي') },
      { value: 'REPEATED_REFUSAL', label: t('customerBlocks.k_2', 'رفض الاستلام مكرر') },
      { value: 'ABUSE', label: t('customerBlocks.k_3', 'إساءة التعامل') },
      { value: 'FRAUD', label: t('customerBlocks.k_4', 'احتيال') },
      { value: 'WRONG_DATA', label: t('customerBlocks.k_5', 'بيانات خاطئة') },
      { value: 'OTHER', label: t('customerBlocks.k_6', 'سبب آخر') },
    ],
    [t],
  );

  const actionOptions: CustomerBlockActionOption[] = useMemo(
    () => [
      { value: 'BLOCK_ORDERS', label: t('customerBlocks.k_7', 'حظر إتاحة الطلبات') },
      { value: 'REQUIRE_MANAGER_APPROVAL', label: t('customerBlocks.k_8', 'يتطلب موافقة المدير') },
      { value: 'BLOCK_COD_ONLY', label: t('customerBlocks.k_9', 'حظر الدفع عند الاستلام فقط') },
    ],
    [t],
  );

  const defaultSettings: CustomerBlockSettingsShape = useMemo(
    () => ({
      enabled: true,
      blockCheckout: true,
      blockManualOrders: true,
      blockAffiliateManualOrders: true,
      blockAiOrderCreation: true,
      matchPhone: true,
      matchEmail: true,
      matchFacebook: true,
      matchWhatsapp: true,
      allowManagerOverride: true,
      defaultAction: 'BLOCK_ORDERS',
      checkoutMessage: t(
        'customerBlocks.k_10',
        'عذراً، لا يمكن إتمام الطلب بناءً على سياسات المتجر.',
      ),
      internalWarningMessage: t(
        'customerBlocks.k_11',
        'تحذير: هذا العميل موجود في قائمة الحظر.',
      ),
    }),
    [t],
  );

  const [settings, setSettings] = useState<CustomerBlockSettingsShape>(defaultSettings);
  const [rules, setRules] = useState<CustomerBlockRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [search, setSearch] = useState('');
  const [newRule, setNewRule] = useState<NewRuleState>({
    phone: '',
    email: '',
    reasonCode: 'REPEATED_REFUSAL',
    reasonNote: '',
    action: 'BLOCK_ORDERS',
    expiresAt: '',
  });

  const activeRulesCount = useMemo(
    () => rules.filter((rule) => rule.status === 'ACTIVE').length,
    [rules],
  );

  const getActionLabel = (action?: string | null) =>
    actionOptions.find((item) => item.value === action)?.label ||
    t('customerBlocks.k_7', 'حظر الطلبات');

  const getReasonLabel = (reason?: string | null) =>
    reasonOptions.find((item) => item.value === reason)?.label ||
    t('customerBlocks.k_6', 'سبب آخر');

  const formatDate = (value?: string | null) => {
    if (!value) return t('customerBlocks.k_12', 'غير محدد');
    try {
      return new Date(value).toLocaleDateString('ar-EG');
    } catch {
      return value;
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const [settingsResponse, rulesResponse] = await Promise.all([
        customerBlocklistService.getSettings(),
        customerBlocklistService.listRules({
          status: 'ACTIVE',
          limit: 50,
          search,
        }),
      ]);
      setSettings({ ...defaultSettings, ...settingsResponse });
      setRules(rulesResponse?.data || []);
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message:
          error?.response?.data?.message ||
          error?.message ||
          t('customerBlocks.k_13', 'فشل تحميل بيانات الحظر'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateBoolean =
    (field: keyof CustomerBlockSettingsShape) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSettings((current) => ({
        ...current,
        [field]: event.target.checked,
      }));
    };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const saved = await customerBlocklistService.updateSettings(settings);
      setSettings({ ...defaultSettings, ...saved });
      setFeedback({
        type: 'success',
        message: t('customerBlocks.k_14', 'تم حفظ إعدادات الحظر بنجاح'),
      });
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message:
          error?.response?.data?.message ||
          error?.message ||
          t('customerBlocks.k_15', 'فشل حفظ الإعدادات'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRule = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    if (!newRule.phone.trim() && !newRule.email.trim()) {
      setFeedback({
        type: 'error',
        message: t('customerBlocks.k_16', 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني'),
      });
      return;
    }

    setIsCreating(true);
    try {
      await customerBlocklistService.createRule({
        phone: newRule.phone.trim() || undefined,
        email: newRule.email.trim() || undefined,
        reasonCode: newRule.reasonCode,
        reasonNote: newRule.reasonNote.trim() || undefined,
        action: newRule.action,
        expiresAt: newRule.expiresAt || undefined,
      });
      setNewRule({
        phone: '',
        email: '',
        reasonCode: 'REPEATED_REFUSAL',
        reasonNote: '',
        action: settings.defaultAction || 'BLOCK_ORDERS',
        expiresAt: '',
      });
      setFeedback({
        type: 'success',
        message: t('customerBlocks.k_17', 'تمت إضافة العميل إلى قائمة الحظر بنجاح'),
      });
      const rulesResponse = await customerBlocklistService.listRules({
        status: 'ACTIVE',
        limit: 50,
        search,
      });
      setRules(rulesResponse?.data || []);
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message:
          error?.response?.data?.message ||
          error?.message ||
          t('customerBlocks.k_18', 'فشل إضافة العميل لقائمة الحظر'),
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleLiftRule = async (rule: CustomerBlockRule) => {
    setFeedback(null);
    try {
      await customerBlocklistService.liftRule(
        rule.id,
        t('customerBlocks.k_19', 'إلغاء الحظر يدوي بواسطة المدير'),
      );
      setRules((current) => current.filter((item) => item.id !== rule.id));
      setFeedback({
        type: 'success',
        message: t('customerBlocks.k_20', 'تم رفع الحظر بنجاح'),
      });
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message:
          error?.response?.data?.message ||
          error?.message ||
          t('customerBlocks.k_21', 'فشل رفع الحظر'),
      });
    }
  };

  return {
    t,
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
  };
}
