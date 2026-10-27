// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ScheduleBookingModal } from '../ScheduleBookingModal';
import { ScheduleForm } from '../types';

afterEach(() => {
  cleanup();
});

const mockT = (key: string, opts?: any) => {
  const map: Record<string, string> = {
    'radiology.schedule.newBookingModal': 'حجز جديد',
    'radiology.schedule.editBooking': 'تعديل الحجز',
    'radiology.schedule.walkInModal': 'حجز فوري (Walk-in)',
    'radiology.schedule.patientRequired': 'المريض *',
    'radiology.schedule.addNewPatient': 'مريض جديد',
    'radiology.schedule.searchPatient': 'بحث بالاسم أو الهاتف...',
    'radiology.schedule.examTypes': 'الفحوصات المطلوبة',
    'radiology.schedule.searchExam': 'بحث عن فحص...',
    'radiology.schedule.priceLabel': 'إجمالي السعر',
    'radiology.schedule.payer': 'الجهة الدافعة',
    'radiology.schedule.payerCustomer': 'مريض نقدي',
    'radiology.schedule.payerInsurance': 'شركة تأمين',
    'radiology.schedule.payerReferral': 'جهة إحالة',
    'radiology.schedule.payerPartner': 'مركز خارجي',
    'radiology.schedule.device': 'الجهاز / الغرفة',
    'radiology.schedule.noDevice': 'بدون جهاز',
    'radiology.schedule.date': 'التاريخ',
    'radiology.schedule.time': 'الوقت',
    'radiology.schedule.emergencyCase': 'حالة طوارئ عاجلة',
    'radiology.schedule.saveAndSelectPatient': 'حفظ واختيار المريض',
    'radiology.schedule.notes': 'ملاحظات',
    'radiology.cancel': 'إلغاء',
    'radiology.save': 'حفظ',
    'radiology.currency': 'ج.م',
  };
  if (opts?.name) return `${map[key] || key}: ${opts.name}`;
  return map[key] || key;
};

vi.mock('react-i18next', async importOriginal => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: mockT,
    }),
  };
});

const mockModal: ScheduleForm = {
  id: '',
  patientId: '',
  patientName: 'أحمد محمود',
  patientPhone: '01012345678',
  patientAge: '32',
  examTypeIds: ['exam-1'],
  insuranceCompanyId: '',
  referralSourceId: '',
  externalPartnerId: '',
  paymentDestination: 'ME',
  insuranceNumber: '',
  referralDoctor: '',
  referringPhysicianId: '',
  marketingRepId: '',
  marketingRepName: '',
  appointmentDate: '2026-11-01',
  appointmentTime: '10:00',
  notes: 'ملاحظة تجريبية',
  status: 'SCHEDULED',
  emergency: false,
  additionIds: [],
  patientFlags: ['diabetic'],
  payerType: 'CUSTOMER',
  deviceId: 'dev-1',
};

const defaultProps = {
  modal: mockModal,
  saving: false,
  onClose: vi.fn(),
  onModalChange: vi.fn(),
  patientSearch: '',
  onPatientSearchChange: vi.fn(),
  patientResults: [],
  onPickPatient: vi.fn(),
  newPatientOpen: false,
  onOpenNewPatient: vi.fn(),
  onCloseNewPatient: vi.fn(),
  newPatient: {
    firstName: '',
    phone: '',
    gender: 'male',
    nationalId: '',
    birthDate: '',
  },
  onNewPatientChange: vi.fn(),
  savingNewPatient: false,
  onSaveNewPatient: vi.fn(),
  onOpenCardScanner: vi.fn(),
  examSearch: '',
  onExamSearchChange: vi.fn(),
  examOpen: false,
  setExamOpen: vi.fn(),
  examFiltered: [],
  examTypes: [
    { id: 'exam-1', name: 'أشعة رنين مغناطيسي على المخ', price: 1200, category: 'MRI' } as any,
    { id: 'exam-2', name: 'أشعة مقطعية على الصدر', price: 800, category: 'CT' } as any,
  ],
  onToggleExam: vi.fn(),
  coverage: {
    'exam-1': { covered: true, basePrice: 1200 },
  },
  entityPrice: null,
  additions: [
    { id: 'add-1', name: 'صبغة وريدية', price: 300 } as any,
  ],
  insuranceCompanies: [{ id: 'ins-1', name: 'بوبا للتأمين' }],
  referralSources: [{ id: 'ref-1', name: 'عيادات الصفا' }],
  externalPartners: [{ id: 'part-1', name: 'مستشفى الشروق' }],
  marketingReps: [{ id: 'rep-1', name: 'محمود مندوب' }],
  devices: [
    { id: 'dev-1', name: 'MRI Siemens 1.5T', room: 'غرفة 1', isActive: true } as any,
  ],
  items: [],
  initialPayment: { amount: '', method: 'CASH' },
  onInitialPaymentChange: vi.fn(),
  physicianSearch: '',
  onPhysicianSearchChange: vi.fn(),
  physicianResults: [],
  onPickPhysician: vi.fn(),
  patientFlags: [
    { value: 'diabetic', label: 'مريض سكر' },
    { value: 'hypertensive', label: 'مريض ضغط' },
  ],
  onSave: vi.fn(),
  onReceiveAndCreate: vi.fn(),
};

describe('ScheduleBookingModal Modular Suite', () => {
  it('returns null if modal is null', () => {
    const { container } = render(<ScheduleBookingModal {...defaultProps} modal={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with patient, exam, payer and device sections', () => {
    render(<ScheduleBookingModal {...defaultProps} />);

    expect(screen.getByText('حجز جديد')).toBeInTheDocument();
    expect(screen.getByText('المريض *')).toBeInTheDocument();
    expect(screen.getByText('مريض جديد')).toBeInTheDocument();
    expect(screen.getByText('أشعة رنين مغناطيسي على المخ')).toBeInTheDocument();
    expect(screen.getByText('الجهة الدافعة')).toBeInTheDocument();
    expect(screen.getByText('الجهاز / الغرفة')).toBeInTheDocument();
    expect(screen.getByText('حالة طوارئ عاجلة')).toBeInTheDocument();
    expect(screen.getByText('مريض سكر')).toBeInTheDocument();
  });

  it('triggers patient search callback on typing', () => {
    render(<ScheduleBookingModal {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('بحث بالاسم أو الهاتف...');
    fireEvent.change(searchInput, { target: { value: 'محمد' } });

    expect(defaultProps.onPatientSearchChange).toHaveBeenCalledWith('محمد');
  });

  it('renders inline new patient form when newPatientOpen is true', () => {
    render(
      <ScheduleBookingModal
        {...defaultProps}
        newPatientOpen={true}
        newPatient={{
          firstName: 'سارة خالد',
          phone: '01123456789',
          gender: 'female',
          nationalId: '29501011234567',
          birthDate: '1995-01-01',
        }}
      />
    );

    expect(screen.getByDisplayValue('سارة خالد')).toBeInTheDocument();
    expect(screen.getByDisplayValue('01123456789')).toBeInTheDocument();
    expect(screen.getByText('حفظ واختيار المريض')).toBeInTheDocument();
  });

  it('handles exam removal button click', () => {
    render(<ScheduleBookingModal {...defaultProps} />);

    const removeExamBtn = screen.getByLabelText('Remove exam');
    fireEvent.click(removeExamBtn);

    expect(defaultProps.onToggleExam).toHaveBeenCalledWith('exam-1');
  });

  it('triggers onSave when clicking save button', () => {
    render(<ScheduleBookingModal {...defaultProps} />);

    const saveBtn = screen.getByRole('button', { name: 'حفظ' });
    fireEvent.click(saveBtn);

    expect(defaultProps.onSave).toHaveBeenCalledWith(false);
  });

  it('triggers onClose when clicking cancel button', () => {
    render(<ScheduleBookingModal {...defaultProps} />);

    const cancelBtns = screen.getAllByRole('button', { name: 'إلغاء' });
    fireEvent.click(cancelBtns[1]);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
