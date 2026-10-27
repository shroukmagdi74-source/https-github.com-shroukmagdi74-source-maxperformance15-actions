// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  FactoryPortalLoginCard,
  FactoryPortalHeader,
  FactoryPortalFilterTabs,
  FactoryDeliveredMaterialsCard,
  FactoryStageMediaGallery,
  FactorySizeChartCard,
  FactoryTechPackCard,
  FactoryAgreementCard,
  FactoryPortalModals,
  FactoryAssignmentCard,
} from '../factory-portal';
import type { FactoryPortalAssignment } from '../../manufacturingApi';

afterEach(() => {
  cleanup();
});

const mockAssignment: FactoryPortalAssignment = {
  id: 'asg-1',
  orderId: 'ord-101',
  factoryId: 'fac-55',
  sequence: 2,
  name: 'مرحلة الخياطة والتجميع',
  stageType: 'SEWING',
  status: 'IN_PROGRESS',
  targetCost: 15000,
  actualCost: 12000,
  plannedQuantity: 500,
  completedQuantity: 250,
  scrapQuantity: 10,
  reworkQuantity: 5,
  factoryAckReceiptAt: '2026-10-15T10:00:00Z',
  sentToFactoryAt: '2026-10-14T09:00:00Z',
  factoryStartedAt: '2026-10-15T11:00:00Z',
  factoryCompletedAt: null,
  order: {
    id: 'ord-101',
    orderNumber: 'MFG-2026-0089',
    brandName: 'سوان كوليكشن',
    productModel: 'قميص كلاسيك أوكسفورد',
    plannedQuantity: 500,
    unit: 'قطعة',
    dueDate: '2026-11-01',
  },
  agreement: {
    partnerAgreedCost: 15000,
    ratePerPiece: 30,
    currency: 'EGP',
  },
  deliveredMaterials: [
    {
      rawMaterialName: 'قماش قطن 100%',
      quantity: 1200,
      unit: 'متر',
      batchNumber: 'BATCH-44',
    },
  ],
  attachments: [
    {
      id: 'att-1',
      mediaUrl: 'https://example.com/photo.jpg',
      mediaType: 'IMAGE',
      caption: 'عينة التشطيب الأولي',
      reviewStatus: 'APPROVED',
      createdAt: '2026-10-16T12:00:00Z',
    },
  ],
  sizeChart: {
    id: 'sc-1',
    name: 'جدول المقاسات الرجالي',
    code: 'SC-MENS-01',
    version: 1,
    unit: 'سم',
    measurementMethod: 'FLAT',
    rows: [
      {
        sizeLabel: 'L',
        measurementKey: 'محيط الصدر',
        value: 112,
        tolerance: 1,
        source: 'FACTORY',
      },
    ],
  },
  techPack: {
    id: 'tp-1',
    name: 'الملف الفني للقميص',
    code: 'TP-SHIRT-01',
    version: 2,
    fabricSummary: 'قطن 100% مع معالجة ضد الانكماش',
    printDetails: 'طباعة حرارية على الصدر',
    packagingDetails: 'كيس بولي فردي مع بطاقة المقاس',
    instructions: 'الخياطة بمسافة 1 سم وثبات الغرزة 4 غرز لكل سم',
    files: [
      {
        id: 'f-1',
        fileName: 'pattern-spec.pdf',
        url: 'https://example.com/pattern.pdf',
        kind: 'PDF',
      },
    ],
  },
  agreementSummary: {
    id: 'agr-1',
    code: 'AGR-2026-004',
    title: 'عقد تشغيل وتجميع الدفعة الشتوية',
    totalValue: 15000,
    agreedCost: 15000,
    status: 'ACTIVE',
    currency: 'EGP',
    terms: 'يتم تسليم الدفعة الأولى بعد اعتماد عينة ما قبل الإنتاج',
    signedAt: '2026-10-10T10:00:00Z',
    signerName: 'أحمد محمود',
    payments: [
      {
        id: 'pay-1',
        seq: 1,
        label: 'دفعة مقدمة',
        percent: 30,
        amount: 4500,
        status: 'PAID',
        dueDate: '2026-10-12',
      },
    ],
  },
};

describe('FactoryPortal Modular Components', () => {
  it('FactoryPortalLoginCard renders input, handles submission and displays errors', () => {
    const handleLogin = vi.fn((e) => e.preventDefault());
    const setToken = vi.fn();

    const { rerender } = render(
      <FactoryPortalLoginCard
        authError={null}
        inputToken=""
        setInputToken={setToken}
        onSubmit={handleLogin}
      />
    );

    expect(screen.getByText('بوابة المصنع الشريك')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/أدخل الرمز أو الصق رابط البوابة/)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /دخول إلى التكليفات/ });
    fireEvent.submit(submitBtn.closest('form')!);
    expect(handleLogin).toHaveBeenCalled();

    rerender(
      <FactoryPortalLoginCard
        authError="رمز الوصول غير صالح أو منتهي الصلاحية"
        inputToken="INVALID"
        setInputToken={setToken}
        onSubmit={handleLogin}
      />
    );
    expect(screen.getByText('رمز الوصول غير صالح أو منتهي الصلاحية')).toBeInTheDocument();
  });

  it('FactoryPortalHeader renders factory info and triggers refresh', () => {
    const onRefresh = vi.fn();
    render(
      <FactoryPortalHeader
        context={{
          name: 'مصنع النيل للملابس الجاهزة',
          code: 'FAC-09',
          specialty: 'حياكة وتجميع راقي',
        } as any}
        loading={false}
        onRefresh={onRefresh}
      />
    );

    expect(screen.getByText('مصنع النيل للملابس الجاهزة')).toBeInTheDocument();
    expect(screen.getByText('FAC-09')).toBeInTheDocument();
    expect(screen.getByText('حياكة وتجميع راقي')).toBeInTheDocument();

    const refreshBtn = screen.getByTitle('تحديث البيانات');
    fireEvent.click(refreshBtn);
    expect(onRefresh).toHaveBeenCalled();
  });

  it('FactoryPortalFilterTabs displays tab counts and handles tab selection', () => {
    const setStatusTab = vi.fn();
    const stats = {
      all: 12,
      active: 5,
      pendingReview: 3,
      completed: 4,
    };

    render(
      <FactoryPortalFilterTabs
        statusTab="ALL"
        setStatusTab={setStatusTab}
        stats={stats}
      />
    );

    expect(screen.getByText('كافة التكليفات')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('جارية بالتشغيل')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    fireEvent.click(screen.getByText('مكتملة'));
    expect(setStatusTab).toHaveBeenCalledWith('COMPLETED');
  });

  it('FactoryDeliveredMaterialsCard toggles and displays materials list', () => {
    const onToggle = vi.fn();

    const { rerender } = render(
      <FactoryDeliveredMaterialsCard
        deliveredMaterials={mockAssignment.deliveredMaterials}
        isExpanded={false}
        onToggle={onToggle}
      />
    );

    expect(screen.getByText(/الخامات المسلمة للمصنع/)).toBeInTheDocument();
    expect(screen.queryByText('قماش قطن 100%')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalled();

    rerender(
      <FactoryDeliveredMaterialsCard
        deliveredMaterials={mockAssignment.deliveredMaterials}
        isExpanded={true}
        onToggle={onToggle}
      />
    );

    expect(screen.getByText('قماش قطن 100%')).toBeInTheDocument();
    expect(screen.getByText(/BATCH-44/)).toBeInTheDocument();
  });

  it('FactoryStageMediaGallery renders attachments and status badges', () => {
    render(<FactoryStageMediaGallery attachments={mockAssignment.attachments} />);

    expect(screen.getByText('الصور والمستندات المرفوعة لهذه المرحلة:')).toBeInTheDocument();
    expect(screen.getByText('عينة التشطيب الأولي')).toBeInTheDocument();
    expect(screen.getByText('معتمدة من الإدارة')).toBeInTheDocument();
  });

  it('FactorySizeChartCard renders measurements and tolerance', () => {
    render(<FactorySizeChartCard sizeChart={mockAssignment.sizeChart} />);

    expect(screen.getByText(/جدول القياسات المعتمد:/)).toBeInTheDocument();
    expect(screen.getByText('محيط الصدر')).toBeInTheDocument();
    expect(screen.getByText('112 سم')).toBeInTheDocument();
    expect(screen.getByText('±1')).toBeInTheDocument();
  });

  it('FactoryTechPackCard renders model components and versions', () => {
    render(<FactoryTechPackCard techPack={mockAssignment.techPack} />);

    expect(screen.getByText(/الملف الفني للموديل/)).toBeInTheDocument();
    expect(screen.getByText(/TP-SHIRT-01 V2/)).toBeInTheDocument();
    expect(screen.getByText('قطن 100% مع معالجة ضد الانكماش')).toBeInTheDocument();
    expect(screen.getByText('pattern-spec.pdf')).toBeInTheDocument();
  });

  it('FactoryAgreementCard renders terms and installment breakdown', () => {
    render(<FactoryAgreementCard agreementSummary={mockAssignment.agreementSummary} />);

    expect(screen.getByText(/اتفاقية المصنع/)).toBeInTheDocument();
    expect(screen.getByText('عقد تشغيل وتجميع الدفعة الشتوية')).toBeInTheDocument();
    expect(screen.getByText('سارية (ACTIVE)')).toBeInTheDocument();
    expect(screen.getByText('دفعة مقدمة')).toBeInTheDocument();
    expect(screen.getByText('(30%)')).toBeInTheDocument();
    expect(screen.getByText('تم السداد (PAID)')).toBeInTheDocument();
  });

  it('FactoryAssignmentCard renders assignment overview and triggers action buttons', () => {
    const onOpenUpdate = vi.fn();
    const onOpenMedia = vi.fn();
    const onOpenApproval = vi.fn();
    const onOpenIssue = vi.fn();
    const onConfirm = vi.fn();
    const onStart = vi.fn();
    const onToggle = vi.fn();

    render(
      <FactoryAssignmentCard
        asg={mockAssignment}
        isExpanded={false}
        submitting={false}
        onToggleExpandMaterials={onToggle}
        onConfirmReceipt={onConfirm}
        onStart={onStart}
        onOpenUpdateModal={onOpenUpdate}
        onOpenMediaModal={onOpenMedia}
        onOpenApprovalModal={onOpenApproval}
        onOpenIssueModal={onOpenIssue}
      />
    );

    expect(screen.getByText('MFG-2026-0089')).toBeInTheDocument();
    expect(screen.getByText('مرحلة الخياطة والتجميع')).toBeInTheDocument();
    expect(screen.getByText('قيد التشغيل')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /تحديث الكميات/ }));
    expect(onOpenUpdate).toHaveBeenCalledWith(mockAssignment);

    fireEvent.click(screen.getByRole('button', { name: /رفع صورة \/ فيديو/ }));
    expect(onOpenMedia).toHaveBeenCalledWith(mockAssignment);

    fireEvent.click(screen.getByRole('button', { name: /طلب اعتماد/ }));
    expect(onOpenApproval).toHaveBeenCalledWith(mockAssignment);

    fireEvent.click(screen.getByRole('button', { name: /تسجيل ملاحظة/ }));
    expect(onOpenIssue).toHaveBeenCalledWith(mockAssignment);
  });

  it('FactoryPortalModals renders UPDATE, MEDIA, APPROVAL, and ISSUE dialogues', () => {
    const onClose = vi.fn();
    const onSaveUpdate = vi.fn();
    const onUploadMedia = vi.fn();
    const onSendApproval = vi.fn();
    const onSendIssue = vi.fn();

    // 1. UPDATE modal
    const { rerender } = render(
      <FactoryPortalModals
        activeModal={{ type: 'UPDATE', assignment: mockAssignment }}
        onClose={onClose}
        submitting={false}
        updateExecutedQty={250}
        setUpdateExecutedQty={vi.fn()}
        updateScrapQty={5}
        setUpdateScrapQty={vi.fn()}
        updateReworkQty={2}
        setUpdateReworkQty={vi.fn()}
        updateNotes="تم إنهاء تشغيل الدفعة الأولى"
        setUpdateNotes={vi.fn()}
        onSaveUpdate={onSaveUpdate}
        mediaPreviewUrl={null}
        selectedFile={null}
        mediaCaption=""
        setMediaCaption={vi.fn()}
        onFileChange={vi.fn()}
        onUploadMedia={onUploadMedia}
        approvalNotes=""
        setApprovalNotes={vi.fn()}
        onSendApprovalRequest={onSendApproval}
        issueText=""
        setIssueText={vi.fn()}
        onSendIssue={onSendIssue}
      />
    );

    expect(screen.getByText('تحديث كميات التشغيل')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /حفظ التحديث/ }));
    expect(onSaveUpdate).toHaveBeenCalled();

    // 2. MEDIA modal
    rerender(
      <FactoryPortalModals
        activeModal={{ type: 'MEDIA', assignment: mockAssignment }}
        onClose={onClose}
        submitting={false}
        updateExecutedQty={250}
        setUpdateExecutedQty={vi.fn()}
        updateScrapQty={5}
        setUpdateScrapQty={vi.fn()}
        updateReworkQty={2}
        setUpdateReworkQty={vi.fn()}
        updateNotes=""
        setUpdateNotes={vi.fn()}
        onSaveUpdate={onSaveUpdate}
        mediaPreviewUrl="https://example.com/test.png"
        selectedFile={new File([''], 'test.png', { type: 'image/png' })}
        mediaCaption="صورة الاختبار"
        setMediaCaption={vi.fn()}
        onFileChange={vi.fn()}
        onUploadMedia={onUploadMedia}
        approvalNotes=""
        setApprovalNotes={vi.fn()}
        onSendApprovalRequest={onSendApproval}
        issueText=""
        setIssueText={vi.fn()}
        onSendIssue={onSendIssue}
      />
    );
    expect(screen.getByText('رفع صور أو فيديو لمرحلة التشغيل')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /رفع المرفق للمراجعة/ }));
    expect(onUploadMedia).toHaveBeenCalled();

    // 3. APPROVAL modal
    rerender(
      <FactoryPortalModals
        activeModal={{ type: 'APPROVAL', assignment: mockAssignment }}
        onClose={onClose}
        submitting={false}
        updateExecutedQty={0}
        setUpdateExecutedQty={vi.fn()}
        updateScrapQty={0}
        setUpdateScrapQty={vi.fn()}
        updateReworkQty={0}
        setUpdateReworkQty={vi.fn()}
        updateNotes=""
        setUpdateNotes={vi.fn()}
        onSaveUpdate={onSaveUpdate}
        mediaPreviewUrl={null}
        selectedFile={null}
        mediaCaption=""
        setMediaCaption={vi.fn()}
        onFileChange={vi.fn()}
        onUploadMedia={onUploadMedia}
        approvalNotes="جاهز للمراجعة"
        setApprovalNotes={vi.fn()}
        onSendApprovalRequest={onSendApproval}
        issueText=""
        setIssueText={vi.fn()}
        onSendIssue={onSendIssue}
      />
    );
    expect(screen.getByText('طلب اعتماد مرحلة التشغيل')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /إرسال طلب الاعتماد/ }));
    expect(onSendApproval).toHaveBeenCalled();

    // 4. ISSUE modal
    rerender(
      <FactoryPortalModals
        activeModal={{ type: 'ISSUE', assignment: mockAssignment }}
        onClose={onClose}
        submitting={false}
        updateExecutedQty={0}
        setUpdateExecutedQty={vi.fn()}
        updateScrapQty={0}
        setUpdateScrapQty={vi.fn()}
        updateReworkQty={0}
        setUpdateReworkQty={vi.fn()}
        updateNotes=""
        setUpdateNotes={vi.fn()}
        onSaveUpdate={onSaveUpdate}
        mediaPreviewUrl={null}
        selectedFile={null}
        mediaCaption=""
        setMediaCaption={vi.fn()}
        onFileChange={vi.fn()}
        onUploadMedia={onUploadMedia}
        approvalNotes=""
        setApprovalNotes={vi.fn()}
        onSendApprovalRequest={onSendApproval}
        issueText="نقص في الخيوط البيضاء"
        setIssueText={vi.fn()}
        onSendIssue={onSendIssue}
      />
    );
    expect(screen.getByText('تسجيل ملاحظة أو عائق تشغيل')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /إرسال الملاحظة/ }));
    expect(onSendIssue).toHaveBeenCalled();
  });
});
