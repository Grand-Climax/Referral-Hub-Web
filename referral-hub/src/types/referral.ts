export type UserRole =
  | "referring_doctor"
  | "receiving_specialist"
  | "hospital_admin"
  | "receptionist"
  | "department_head"
  | "liaison_officer"
  | "moh_analyst";

export const ROLE_LABELS: Record<UserRole, string> = {
  referring_doctor: "Referring Doctor",
  receiving_specialist: "Receiving Specialist",
  hospital_admin: "Hospital Admin",
  receptionist: "Receptionist",
  department_head: "Department Head",
  liaison_officer: "Liaison Officer",
  moh_analyst: "MoH Analyst",
};

export type ReferralStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "accepted"
  | "redirected"
  | "completed";

export type SeverityLevel = "critical" | "high" | "medium" | "low";

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  sex: "M" | "F";
  mrn: string; // medical record number
  phone: string;
}

export interface Vitals {
  bp: string;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
}

export interface Referral {
  id: string;
  patient: Patient;
  vitals: Vitals;
  reasonForReferral: string;
  clinicalHistory: string;
  provisionalDiagnosis: string;
  requiredSpecialty: string;
  status: ReferralStatus;
  severity: SeverityLevel;
  severityScore: number;
  referringHospital: string;
  referringDoctor: string;
  receivingHospital: string;
  receivingSpecialist?: string;
  createdAt: string;
  updatedAt: string;
  comments: ReferralComment[];
  appointmentDate?: string;
  arrivalConfirmed?: boolean;
}

export interface ReferralComment {
  id: string;
  author: string;
  role: UserRole;
  text: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hospital: string;
  department?: string;
}
