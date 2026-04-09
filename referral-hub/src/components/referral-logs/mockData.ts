import { Referral } from '@/types/referral';

// Helper to create a consistent mock referral
const createMockReferral = (
  id: string,
  firstName: string,
  lastName: string,
  sex: 'male' | 'female',
  dept: string,
  status: Referral['status'],
  severity: Referral['severity'] = 'medium',
  daysAgo: number = 0
): Referral => {
  const date = new Date(Date.now() - 86400000 * daysAgo).toISOString();
  return {
    id,
    patient_id: `P-${id.split('-').pop()}`,
    referring_doctor_id: 'doc-1',
    sender_hospital_id: 'hosp-1',
    target_hospital_id: 'hosp-2',
    target_dept_id: dept,
    status,
    created_at: date,
    updated_at: date,
    patient: {
      id: `P-${id.split('-').pop()}`,
      phone_number: '+251 911 223344',
      first_name: firstName,
      last_name: lastName,
      sex,
      date_of_birth: '1980-01-01',
    },
    diagnoses: [
      {
        id: `dx-${id}`,
        referral_id: id,
        icd_code: 'ICD-10',
        is_primary: true,
        diagnosis_certainty: 'CONFIRMED',
        code_info: {
          code: 'ICD-10',
          description: 'Provisional Diagnosis',
          category: dept,
        },
      },
    ],
    vitals: [
      {
        id: `v-${id}`,
        referral_id: id,
        recorded_at: date,
        systolic_bp: 120,
        diastolic_bp: 80,
        heart_rate: 72,
        sp_o2: 98,
        temperature: 36.5,
        respiratory_rate: 16,
      },
    ],
    referral_form: {
      id: `f-${id}`,
      referral_id: id,
      clinical_summary: 'Clinical summary here...',
      patient_history: 'History here...',
      reason_of_referral: 'Reason here...',
      reason_for_referral_category: 'ROUTINE',
      condition_at_referral: 'STABLE',
    },
    severity,
  };
};

export const mockReferralLogs: Referral[] = [
  createMockReferral('REF-2024-001', 'John', 'Doe', 'male', 'Cardiology', 'PENDING', 'high', 0.1),
  createMockReferral('REF-2024-002', 'Jane', 'Smith', 'female', 'General Surgery', 'ACCEPTED', 'critical', 0.2),
  createMockReferral('REF-2024-003', 'Robert', 'Wilson', 'male', 'Ophthalmology', 'COMPLETED', 'medium', 2),
  createMockReferral('REF-2024-004', 'Maria', 'Garcia', 'female', 'Internal Medicine', 'REJECTED', 'medium', 3),
  createMockReferral('REF-2024-005', 'Samuel', 'Adebayo', 'male', 'Pediatric Neurology', 'PENDING', 'high', 0.5),
];
