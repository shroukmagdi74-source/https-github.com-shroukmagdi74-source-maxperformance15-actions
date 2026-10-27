import React from "react";

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile: string;
  avatar: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  nationalId: string;
  address: string;
  city: string;
  country: string;
  hireDate: string;
  contractType: string;
  status: string;
  baseSalary: number;
  annualLeaveBalance: number;
  sickLeaveBalance: number;
  bankName: string;
  bankAccountNumber: string;
  bankIban: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  department: { name: string } | null;
  position: { title: string } | null;
  manager: { firstName: string; lastName: string } | null;
  documents_rel: EmployeeDocument[];
}

export interface EmployeeDocument {
  type?: string;
  title?: string;
  name?: string;
  createdAt?: string;
}

export interface CustodyAsset {
  id: string;
  name: string;
  status?: string;
  code?: string;
  serialNumber?: string;
  assignedDate?: string;
}

export interface WarningRecord {
  id: string;
  title: string;
  severity?: string;
  incidentDate?: string;
  description?: string;
  actionTaken?: string;
  acknowledgedAt?: string | null;
}

export interface MerchantUserExtras {
  phone?: string | null;
  avatar?: string | null;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  maritalStatus: string;
  gender: string;
  dateOfBirth: string;
  nationalId: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
}

export type ProfileIcon = React.ElementType<{ className?: string }>;

export interface TabConfig {
  value: string;
  label: string;
  icon: ProfileIcon;
  requiresHr?: boolean;
}
