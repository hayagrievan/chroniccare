export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PHARMACY' | 'DOCTOR' | 'ADMIN';
}

export interface AuthTokenPayload {
  id: string;
  name: string;
  email: string;
  role: 'PHARMACY' | 'DOCTOR' | 'ADMIN';
  iat: number;
  exp: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ── Real DB schema (chronicare.prescrptions) ───────────────────────────────
export interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
}

export type PrescriptionStatus = 'Pending' | 'Dispensed' | 'Cancelled';

export interface Prescription {
  _id: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  disease: string;
  doctorId: string;
  doctorName: string;
  items: PrescriptionItem[];
  diagnosis: string;
  notes: string;
  status: PrescriptionStatus;
  pharmacyShared: boolean;
  sharedAt: string;
  createdAt: string;
  updatedAt?: string;
}

// Legacy alias kept for backward compat with older mock type references
export type Medicine = PrescriptionItem;

export interface Patient {
  _id: string;
  uniqueId: string;
  name: string;
  phrn?: string;
  age: number;
  gender: string;
  phone: string;
  prescriptions: Prescription[];
}

export interface DashboardStats {
  totalPending: number;
  totalDispensedToday: number;
  totalPatientsServed: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
