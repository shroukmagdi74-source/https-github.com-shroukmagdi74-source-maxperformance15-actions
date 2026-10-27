import {
  RadiologyExamType,
  RadiologyExamAddition,
  RadiologyDevice,
} from '../shared';
import { Appointment, ScheduleForm } from './types';

export interface PatientSearchResult {
  id: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  nationalId?: string;
  insuranceNumber?: string;
  gender?: string;
  birthDate?: string;
}

export interface NewPatientFormState {
  firstName: string;
  phone: string;
  gender: string;
  nationalId: string;
  birthDate: string;
  nationalIdImage?: string;
}

export interface ScheduleBookingModalProps {
  modal: ScheduleForm | null;
  saving: boolean;
  onClose: () => void;
  onModalChange: (form: ScheduleForm) => void;
  // Patient search & selection
  patientSearch: string;
  onPatientSearchChange: (val: string) => void;
  patientResults: PatientSearchResult[];
  onPickPatient: (patient: any) => void;
  // Inline New Patient
  newPatientOpen: boolean;
  onOpenNewPatient: () => void;
  onCloseNewPatient: () => void;
  newPatient: NewPatientFormState;
  onNewPatientChange: (p: any) => void;
  savingNewPatient: boolean;
  onSaveNewPatient: () => void;
  onOpenCardScanner: () => void;
  // Exam selection
  examSearch: string;
  onExamSearchChange: (val: string) => void;
  examOpen: boolean;
  setExamOpen: (val: boolean) => void;
  examFiltered: RadiologyExamType[];
  examTypes: RadiologyExamType[];
  onToggleExam: (id: string) => void;
  coverage: Record<
    string,
    { covered: boolean; entityPrice?: number | null; basePrice?: number }
  >;
  entityPrice: number | null;
  additions: RadiologyExamAddition[];
  // Payer catalogs
  insuranceCompanies: { id: string; name: string }[];
  referralSources: { id: string; name: string }[];
  externalPartners: { id: string; name: string }[];
  marketingReps: { id: string; name: string }[];
  // Devices & clash detection
  devices: RadiologyDevice[];
  items: Appointment[];
  // Initial payment
  initialPayment: { amount: string; method: string };
  onInitialPaymentChange: (p: { amount: string; method: string }) => void;
  // Physician search
  physicianSearch: string;
  onPhysicianSearchChange: (val: string) => void;
  physicianResults: { id: string; name: string }[];
  onPickPhysician: (doc: any) => void;
  // Risk flags
  patientFlags: { value: string; label: string }[];
  // Submit actions
  onSave: (convertAfter?: boolean) => void;
  onReceiveAndCreate: () => void;
}
