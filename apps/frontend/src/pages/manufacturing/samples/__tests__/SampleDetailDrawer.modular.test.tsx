// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DrawerHeader,
  DrawerReceiptStatusBar,
  DrawerStatusBanners,
  DrawerTabsNav,
  SampleStagesTab,
  SampleInfoTab,
  SampleAttachmentsTab,
  SampleFinanceTab,
  SamplePaymentModal,
  SampleFactoryModal,
  DrawerFooterActions,
} from '../sample-detail-drawer';
import { SampleDetailDrawer } from '../SampleDetailDrawer';
import { SampleOrder } from '../../manufacturingApi';

afterEach(() => {
  cleanup();
});

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../sample-detail-drawer/useSampleDetailDrawer', () => ({
  useSampleDetailDrawer: () => ({
    navigate: vi.fn(),
    activeTab: 'stages',
    setActiveTab: vi.fn(),
    loading: false,
    actionError: null,
    setActionError: vi.fn(),
    isConvertModalOpen: false,
    setIsConvertModalOpen: vi.fn(),
    isRejectModalOpen: false,
    setIsRejectModalOpen: vi.fn(),
    isApproveModalOpen: false,
    setIsApproveModalOpen: vi.fn(),
    isShareModalOpen: false,
    setIsShareModalOpen: vi.fn(),
    isPaymentModalOpen: false,
    setIsPaymentModalOpen: vi.fn(),
    paymentAmount: '',
    setPaymentAmount: vi.fn(),
    paymentMethod: 'CASH',
    setPaymentMethod: vi.fn(),
    paymentPaidAt: '2026-03-01',
    setPaymentPaidAt: vi.fn(),
    paymentNotes: '',
    setPaymentNotes: vi.fn(),
    paymentReference: '',
    setPaymentReference: vi.fn(),
    paymentSubmitting: false,
    paymentError: null,
    isFactoryModalOpen: false,
    setIsFactoryModalOpen: vi.fn(),
    factories: [],
    selectedFactoryId: '',
    setSelectedFactoryId: vi.fn(),
    selectedExpectedDeliveryAt: '',
    setSelectedExpectedDeliveryAt: vi.fn(),
    newStageName: '',
    setNewStageName: vi.fn(),
    isAddingStage: false,
    setIsAddingStage: vi.fn(),
    uploadingFile: false,
    isAddingExpense: false,
    setIsAddingExpense: vi.fn(),
    expenseNameInput: '',
    setExpenseNameInput: vi.fn(),
    expenseAmountInput: '',
    setExpenseAmountInput: vi.fn(),
    expenseSubmitting: false,
    handleStageStatusChange: vi.fn(),
    handleAddStage: vi.fn(),
    handleAddExpense: vi.fn(),
    handleDeleteExpense: vi.fn(),
    handleApprove: vi.fn(),
    handleReject: vi.fn(),
    handleOpenPaymentModal: vi.fn(),
    handleRecordPayment: vi.fn(),
    handleDeletePayment: vi.fn(),
    handleOpenFactoryModal: vi.fn(),
    handleSaveFactoryCommercial: vi.fn(),
    handleFileUpload: vi.fn(),
    handleToggleReceipt: vi.fn(),
    handleDeleteAttachment: vi.fn(),
  }),
}));

const mockSample: SampleOrder = {
  id: 'sample-1',
  sampleNumber: 'SMP-2026-001',
  productName: 'فستان سواريه حرير',
  status: 'PENDING',
  materialSource: 'FACTORY',
  plannedQuantity: 2,
  size: 'M',
  color: 'أحمر داكن',
  customerName: 'سيدة الأعمال منى',
  brandName: 'Monique Fashion',
  fee: 1500,
  totalAmount: 1800,
  depositAmount: 500,
  paidAmount: 500,
  remaining: 1300,
  totalCost: 1100,
  sampleReceived: false,
  isOverdue: false,
  dueDate: '2026-03-15T00:00:00Z',
  createdAt: '2026-03-01T00:00:00Z',
  stages: [
    {
      id: 'stg-1',
      name: 'قص القماش والباترون',
      sequence: 1,
      status: 'IN_PROGRESS',
    },
    {
      id: 'stg-2',
      name: 'التطريز اليدوي',
      sequence: 2,
      status: 'PENDING',
    },
  ],
  attachments: [
    {
      id: 'att-1',
      fileName: 'sketch.jpg',
      url: 'https://example.com/sketch.jpg',
      kind: 'IMAGE',
    },
  ],
  expenses: [
    {
      id: 'exp-1',
      name: 'شحن أقمشة',
      amount: 150,
    },
  ],
  payments: [
    {
      id: 'pay-1',
      amount: 500,
      kind: 'DEPOSIT',
      method: 'نقدي',
      paidAt: '2026-03-01T12:00:00Z',
    },
  ],
  partnerFactory: {
    id: 'fac-1',
    name: 'مصنع الأهرام للنسيج',
    code: 'FAC-01',
    phone: '01222222222',
  },
};

describe('SampleDetailDrawer Modular Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DrawerHeader', () => {
    it('renders sampleNumber, badges, and action triggers', () => {
      const onShare = vi.fn();
      const onClose = vi.fn();

      render(
        <DrawerHeader
          sample={mockSample}
          onShare={onShare}
          onClose={onClose}
        />
      );

      expect(screen.getByText('SMP-2026-001')).toBeTruthy();
      fireEvent.click(screen.getByTitle('مشاركة العينة'));
      expect(onShare).toHaveBeenCalled();
    });
  });

  describe('DrawerReceiptStatusBar', () => {
    it('renders receipt status bar and toggles receipt', () => {
      const onToggle = vi.fn();
      render(
        <DrawerReceiptStatusBar
          sample={mockSample}
          loading={false}
          onToggleReceipt={onToggle}
        />
      );

      expect(screen.getByText('في انتظار الاستلام')).toBeTruthy();
      fireEvent.click(screen.getByText('تأكيد استلام العينة'));
      expect(onToggle).toHaveBeenCalledWith(false);
    });
  });

  describe('DrawerStatusBanners', () => {
    it('renders APPROVED status banner with convert button', () => {
      const onConvert = vi.fn();
      const approvedSample = { ...mockSample, status: 'APPROVED' };

      render(
        <DrawerStatusBanners
          sample={approvedSample}
          onNavigateOrder={vi.fn()}
          onOpenConvertModal={onConvert}
        />
      );

      expect(
        screen.getByText('العينة معتمدة وجاهزة للتحويل لأمر تصنيع كامل')
      ).toBeTruthy();
      fireEvent.click(screen.getByText('تحويل لأمر تصنيع'));
      expect(onConvert).toHaveBeenCalled();
    });
  });

  describe('DrawerTabsNav', () => {
    it('renders tabs navigation and switches active tab', () => {
      const setActiveTab = vi.fn();
      render(
        <DrawerTabsNav
          sample={mockSample}
          activeTab="stages"
          setActiveTab={setActiveTab}
        />
      );

      expect(screen.getByText(/مراحل التشغيل/)).toBeTruthy();
      expect(screen.getByText('المواصفات والبيانات')).toBeTruthy();

      fireEvent.click(screen.getByText('المواصفات والبيانات'));
      expect(setActiveTab).toHaveBeenCalledWith('info');
    });
  });

  describe('SampleStagesTab', () => {
    it('renders stages list and stage status change triggers', () => {
      const onStageStatusChange = vi.fn();
      render(
        <SampleStagesTab
          sample={mockSample}
          loading={false}
          isAddingStage={false}
          setIsAddingStage={vi.fn()}
          newStageName=""
          setNewStageName={vi.fn()}
          onAddStage={vi.fn()}
          onStageStatusChange={onStageStatusChange}
        />
      );

      expect(screen.getByText('قص القماش والباترون')).toBeTruthy();
      expect(screen.getByText('التطريز اليدوي')).toBeTruthy();

      fireEvent.click(screen.getByText('إنهاء'));
      expect(onStageStatusChange).toHaveBeenCalledWith(
        mockSample.stages[0],
        'COMPLETED'
      );
    });
  });

  describe('SampleInfoTab', () => {
    it('renders product name and expenses list', () => {
      render(
        <SampleInfoTab
          sample={mockSample}
          isAddingExpense={false}
          setIsAddingExpense={vi.fn()}
          expenseNameInput=""
          setExpenseNameInput={vi.fn()}
          expenseAmountInput=""
          setExpenseAmountInput={vi.fn()}
          expenseSubmitting={false}
          onAddExpense={vi.fn()}
          onDeleteExpense={vi.fn()}
        />
      );

      expect(screen.getByText('فستان سواريه حرير')).toBeTruthy();
      expect(screen.getByText('سيدة الأعمال منى')).toBeTruthy();
      expect(screen.getByText(/شحن أقمشة/)).toBeTruthy();
    });
  });

  describe('SampleAttachmentsTab', () => {
    it('renders attachments list', () => {
      const onDelete = vi.fn();
      render(
        <SampleAttachmentsTab
          sample={mockSample}
          uploadingFile={false}
          onFileUpload={vi.fn()}
          onDeleteAttachment={onDelete}
        />
      );

      expect(screen.getByText('sketch.jpg')).toBeTruthy();
      fireEvent.click(screen.getByTitle('حذف المرفق'));
      expect(onDelete).toHaveBeenCalledWith('att-1');
    });
  });

  describe('SampleFinanceTab', () => {
    it('renders financial summary and payments list', () => {
      const onOpenPayment = vi.fn();
      render(
        <SampleFinanceTab
          sample={mockSample}
          loading={false}
          onOpenFactoryModal={vi.fn()}
          onOpenPaymentModal={onOpenPayment}
          onDeletePayment={vi.fn()}
        />
      );

      expect(screen.getByText('مصنع الأهرام للنسيج')).toBeTruthy();
      expect(screen.getByText('العربون المطلوب')).toBeTruthy();

      fireEvent.click(screen.getByText('تسجيل دفعة'));
      expect(onOpenPayment).toHaveBeenCalled();
    });
  });

  describe('SamplePaymentModal', () => {
    it('renders payment modal and handles submit', () => {
      const onSubmit = vi.fn((e) => e.preventDefault());
      render(
        <SamplePaymentModal
          sample={mockSample}
          isOpen={true}
          onClose={vi.fn()}
          paymentAmount="500"
          setPaymentAmount={vi.fn()}
          paymentMethod="CASH"
          setPaymentMethod={vi.fn()}
          paymentPaidAt="2026-03-01"
          setPaymentPaidAt={vi.fn()}
          paymentReference=""
          setPaymentReference={vi.fn()}
          paymentNotes=""
          setPaymentNotes={vi.fn()}
          paymentSubmitting={false}
          paymentError={null}
          onRecordPayment={onSubmit}
        />
      );

      expect(screen.getByText(/تسجيل دفعة على أمر العينة/)).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'تسجيل الدفعة' }));
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe('SampleFactoryModal', () => {
    it('renders factory assignment modal', () => {
      const onSave = vi.fn((e) => e.preventDefault());
      render(
        <SampleFactoryModal
          isOpen={true}
          onClose={vi.fn()}
          loading={false}
          factories={[{ id: 'fac-1', name: 'مصنع الأهرام' }]}
          selectedFactoryId="fac-1"
          setSelectedFactoryId={vi.fn()}
          selectedExpectedDeliveryAt="2026-03-20"
          setSelectedExpectedDeliveryAt={vi.fn()}
          onSaveFactoryCommercial={onSave}
        />
      );

      expect(screen.getByText('تعديل المصنع وموعد الاستلام')).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'حفظ التعديلات' }));
      expect(onSave).toHaveBeenCalled();
    });
  });

  describe('DrawerFooterActions', () => {
    it('renders approve and reject buttons', () => {
      const onApprove = vi.fn();
      const onReject = vi.fn();

      render(
        <DrawerFooterActions
          sample={mockSample}
          loading={false}
          onOpenApproveModal={onApprove}
          onOpenRejectModal={onReject}
          onOpenConvertModal={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('اعتماد العينة'));
      expect(onApprove).toHaveBeenCalled();

      fireEvent.click(screen.getByText('رفض'));
      expect(onReject).toHaveBeenCalled();
    });
  });

  describe('SampleDetailDrawer Coordinator', () => {
    it('renders drawer when isOpen is true', () => {
      render(
        <SampleDetailDrawer
          sample={mockSample}
          isOpen={true}
          onClose={vi.fn()}
          onRefresh={vi.fn()}
        />
      );

      expect(screen.getByText('SMP-2026-001')).toBeTruthy();
    });

    it('returns null when isOpen is false', () => {
      const { container } = render(
        <SampleDetailDrawer
          sample={mockSample}
          isOpen={false}
          onClose={vi.fn()}
          onRefresh={vi.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
