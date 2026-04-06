import { Referral, User, UserRole } from "@/types/referral";

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Dr. Abebe Kebede",
    email: "abebe@tikur.gov.et",
    role: "referring_doctor",
    hospital: "Tikur Anbessa Hospital",
    department: "Internal Medicine",
  },
  {
    id: "u2",
    name: "Dr. Sara Mengistu",
    email: "sara@paul.gov.et",
    role: "receiving_specialist",
    hospital: "St. Paul's Hospital",
    department: "Cardiology",
  },
  {
    id: "u3",
    name: "Ato Dawit Haile",
    email: "dawit@tikur.gov.et",
    role: "hospital_admin",
    hospital: "Tikur Anbessa Hospital",
  },
  {
    id: "u4",
    name: "Sr. Hana Tesfaye",
    email: "hana@paul.gov.et",
    role: "receptionist",
    hospital: "St. Paul's Hospital",
  },
  {
    id: "u5",
    name: "Dr. Yonas Alemu",
    email: "yonas@tikur.gov.et",
    role: "department_head",
    hospital: "Tikur Anbessa Hospital",
    department: "Surgery",
  },
  {
    id: "u6",
    name: "Ato Bekele Worku",
    email: "bekele@tikur.gov.et",
    role: "liaison_officer",
    hospital: "Tikur Anbessa Hospital",
  },
  {
    id: "u7",
    name: "W/ro Meron Tadesse",
    email: "meron@moh.gov.et",
    role: "moh_analyst",
    hospital: "Ministry of Health",
  },
];

export const SPECIALTIES = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Oncology",
  "Nephrology",
  "Pediatrics",
  "Surgery",
  "Ophthalmology",
  "Dermatology",
  "Psychiatry",
  "Obstetrics & Gynecology",
  "ENT",
  "Pulmonology",
  "Gastroenterology",
];

export const HOSPITALS = [
  "Tikur Anbessa Hospital",
  "St. Paul's Hospital",
  "Yekatit 12 Hospital",
  "Zewditu Memorial Hospital",
  "Menelik II Hospital",
  "ALERT Hospital",
  "Ras Desta Hospital",
];

type LegacyReferralStatus =
  | "pending"
  | "approved"
  | "accepted"
  | "rejected"
  | "redirected"
  | "completed";

type LegacyReferral = {
  id: string;
  patient: {
    id: string;
    fullName: string;
    age: number;
    sex: "M" | "F";
    mrn: string;
    phone: string;
  };
  vitals: {
    bp: string;
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
    oxygenSaturation: number;
  };
  reasonForReferral: string;
  clinicalHistory: string;
  provisionalDiagnosis: string;
  requiredSpecialty: string;
  status: LegacyReferralStatus;
  severity: "critical" | "high" | "medium" | "low";
  severityScore: number;
  referringHospital: string;
  referringDoctor: string;
  receivingHospital: string;
  receivingSpecialist?: string;
  createdAt: string;
  updatedAt: string;
  comments: Array<{
    id: string;
    author: string;
    role: UserRole;
    text: string;
    createdAt: string;
  }>;
  appointmentDate?: string;
  arrivalConfirmed?: boolean;
};

const LEGACY_REFERRALS: LegacyReferral[] = [
  {
    id: "REF-001",
    patient: {
      id: "p1",
      fullName: "Almaz Gebremedhin",
      age: 45,
      sex: "F",
      mrn: "MRN-10234",
      phone: "+251911234567",
    },
    vitals: {
      bp: "160/95",
      heartRate: 92,
      temperature: 37.2,
      respiratoryRate: 20,
      oxygenSaturation: 96,
    },
    reasonForReferral:
      "Persistent chest pain with ECG abnormalities. Suspected acute coronary syndrome requiring specialist evaluation.",
    clinicalHistory:
      "Hypertension for 10 years. Type 2 DM. Previous MI in 2023.",
    provisionalDiagnosis: "Acute Coronary Syndrome",
    requiredSpecialty: "Cardiology",
    status: "pending",
    severity: "critical",
    severityScore: 92,
    referringHospital: "Tikur Anbessa Hospital",
    referringDoctor: "Dr. Abebe Kebede",
    receivingHospital: "St. Paul's Hospital",
    createdAt: "2026-02-28T08:30:00Z",
    updatedAt: "2026-02-28T08:30:00Z",
    comments: [],
  },
  {
    id: "REF-002",
    patient: {
      id: "p2",
      fullName: "Tesfaye Berhanu",
      age: 62,
      sex: "M",
      mrn: "MRN-10235",
      phone: "+251922345678",
    },
    vitals: {
      bp: "140/85",
      heartRate: 78,
      temperature: 36.8,
      respiratoryRate: 18,
      oxygenSaturation: 98,
    },
    reasonForReferral:
      "Recurrent seizures not controlled with current medication. Needs neurologist assessment.",
    clinicalHistory:
      "Epilepsy diagnosed 5 years ago. On Carbamazepine 400mg BD.",
    provisionalDiagnosis: "Drug-Resistant Epilepsy",
    requiredSpecialty: "Neurology",
    status: "approved",
    severity: "high",
    severityScore: 78,
    referringHospital: "Tikur Anbessa Hospital",
    referringDoctor: "Dr. Abebe Kebede",
    receivingHospital: "Yekatit 12 Hospital",
    createdAt: "2026-02-27T14:00:00Z",
    updatedAt: "2026-02-28T09:15:00Z",
    comments: [
      {
        id: "c1",
        author: "Ato Dawit Haile",
        role: "hospital_admin",
        text: "Approved. Forwarding to Yekatit 12 Neurology dept.",
        createdAt: "2026-02-28T09:15:00Z",
      },
    ],
  },
  {
    id: "REF-003",
    patient: {
      id: "p3",
      fullName: "Fatima Ahmed",
      age: 28,
      sex: "F",
      mrn: "MRN-10236",
      phone: "+251933456789",
    },
    vitals: {
      bp: "110/70",
      heartRate: 88,
      temperature: 37.0,
      respiratoryRate: 16,
      oxygenSaturation: 99,
    },
    reasonForReferral:
      "Pelvic mass identified on ultrasound. Requires gynecological surgical evaluation.",
    clinicalHistory: "Irregular menses for 6 months. Pelvic pain worsening.",
    provisionalDiagnosis: "Ovarian Mass",
    requiredSpecialty: "Obstetrics & Gynecology",
    status: "accepted",
    severity: "medium",
    severityScore: 55,
    referringHospital: "Zewditu Memorial Hospital",
    referringDoctor: "Dr. Kidist Yilma",
    receivingHospital: "Tikur Anbessa Hospital",
    receivingSpecialist: "Dr. Yonas Alemu",
    createdAt: "2026-02-26T10:00:00Z",
    updatedAt: "2026-02-27T16:30:00Z",
    comments: [
      {
        id: "c2",
        author: "Dr. Yonas Alemu",
        role: "receiving_specialist",
        text: "Accepted. Schedule for next available OR slot.",
        createdAt: "2026-02-27T16:30:00Z",
      },
    ],
    appointmentDate: "2026-03-03T09:00:00Z",
  },
  {
    id: "REF-004",
    patient: {
      id: "p4",
      fullName: "Mohammed Hassan",
      age: 55,
      sex: "M",
      mrn: "MRN-10237",
      phone: "+251944567890",
    },
    vitals: {
      bp: "180/110",
      heartRate: 105,
      temperature: 38.1,
      respiratoryRate: 24,
      oxygenSaturation: 91,
    },
    reasonForReferral:
      "Severe respiratory distress with bilateral infiltrates on CXR. Suspected ARDS.",
    clinicalHistory: "COPD. Smoker for 30 years. Recent pneumonia.",
    provisionalDiagnosis: "ARDS secondary to pneumonia",
    requiredSpecialty: "Pulmonology",
    status: "pending",
    severity: "critical",
    severityScore: 95,
    referringHospital: "Menelik II Hospital",
    referringDoctor: "Dr. Lemma Girma",
    receivingHospital: "St. Paul's Hospital",
    createdAt: "2026-02-28T07:00:00Z",
    updatedAt: "2026-02-28T07:00:00Z",
    comments: [],
  },
  {
    id: "REF-005",
    patient: {
      id: "p5",
      fullName: "Tigist Worku",
      age: 34,
      sex: "F",
      mrn: "MRN-10238",
      phone: "+251955678901",
    },
    vitals: {
      bp: "120/80",
      heartRate: 72,
      temperature: 36.9,
      respiratoryRate: 16,
      oxygenSaturation: 98,
    },
    reasonForReferral:
      "Progressive visual loss in right eye. Fundoscopy shows papilledema.",
    clinicalHistory:
      "No significant past medical history. Visual symptoms for 3 weeks.",
    provisionalDiagnosis: "Papilledema - r/o intracranial pathology",
    requiredSpecialty: "Ophthalmology",
    status: "rejected",
    severity: "medium",
    severityScore: 48,
    referringHospital: "ALERT Hospital",
    referringDoctor: "Dr. Helen Assefa",
    receivingHospital: "Tikur Anbessa Hospital",
    createdAt: "2026-02-25T11:00:00Z",
    updatedAt: "2026-02-26T08:45:00Z",
    comments: [
      {
        id: "c3",
        author: "Ato Dawit Haile",
        role: "hospital_admin",
        text: "Rejected. Please refer to Neurology first for intracranial evaluation.",
        createdAt: "2026-02-26T08:45:00Z",
      },
    ],
  },
  {
    id: "REF-006",
    patient: {
      id: "p6",
      fullName: "Dawit Mulugeta",
      age: 8,
      sex: "M",
      mrn: "MRN-10239",
      phone: "+251966789012",
    },
    vitals: {
      bp: "90/60",
      heartRate: 110,
      temperature: 38.5,
      respiratoryRate: 28,
      oxygenSaturation: 94,
    },
    reasonForReferral:
      "Child with persistent high fever, hepatosplenomegaly, and pancytopenia. Suspect hematologic malignancy.",
    clinicalHistory: "Previously healthy child. Fever and fatigue for 2 weeks.",
    provisionalDiagnosis: "Suspected Acute Leukemia",
    requiredSpecialty: "Pediatrics",
    status: "approved",
    severity: "critical",
    severityScore: 88,
    referringHospital: "Ras Desta Hospital",
    referringDoctor: "Dr. Meaza Tadesse",
    receivingHospital: "Tikur Anbessa Hospital",
    createdAt: "2026-02-27T09:30:00Z",
    updatedAt: "2026-02-28T07:00:00Z",
    comments: [
      {
        id: "c4",
        author: "Ato Dawit Haile",
        role: "hospital_admin",
        text: "Approved. Urgent case - expedite transfer.",
        createdAt: "2026-02-28T07:00:00Z",
      },
    ],
  },
  {
    id: "REF-007",
    patient: {
      id: "p7",
      fullName: "Selam Desta",
      age: 40,
      sex: "F",
      mrn: "MRN-10240",
      phone: "+251977890123",
    },
    vitals: {
      bp: "130/85",
      heartRate: 80,
      temperature: 37.0,
      respiratoryRate: 18,
      oxygenSaturation: 97,
    },
    reasonForReferral:
      "Chronic kidney disease stage 4. Needs nephrology follow-up for dialysis planning.",
    clinicalHistory:
      "Hypertension, DM Type 2. Creatinine rising over 6 months.",
    provisionalDiagnosis: "CKD Stage 4",
    requiredSpecialty: "Nephrology",
    status: "accepted",
    severity: "high",
    severityScore: 72,
    referringHospital: "Zewditu Memorial Hospital",
    referringDoctor: "Dr. Abel Getachew",
    receivingHospital: "St. Paul's Hospital",
    receivingSpecialist: "Dr. Sara Mengistu",
    createdAt: "2026-02-24T15:00:00Z",
    updatedAt: "2026-02-26T10:00:00Z",
    comments: [
      {
        id: "c5",
        author: "Dr. Sara Mengistu",
        role: "receiving_specialist",
        text: "Accepted. Schedule for nephrology clinic.",
        createdAt: "2026-02-26T10:00:00Z",
      },
    ],
    appointmentDate: "2026-03-05T10:00:00Z",
    arrivalConfirmed: true,
  },
  {
    id: "REF-008",
    patient: {
      id: "p8",
      fullName: "Bereket Tadesse",
      age: 70,
      sex: "M",
      mrn: "MRN-10241",
      phone: "+251988901234",
    },
    vitals: {
      bp: "150/90",
      heartRate: 68,
      temperature: 36.7,
      respiratoryRate: 16,
      oxygenSaturation: 97,
    },
    reasonForReferral:
      "Large abdominal mass palpable. CT shows liver lesion. Needs oncology evaluation.",
    clinicalHistory: "Weight loss 10kg in 3 months. Hepatitis B positive.",
    provisionalDiagnosis: "Hepatocellular Carcinoma",
    requiredSpecialty: "Oncology",
    status: "pending",
    severity: "high",
    severityScore: 75,
    referringHospital: "Yekatit 12 Hospital",
    referringDoctor: "Dr. Solomon Bekele",
    receivingHospital: "Tikur Anbessa Hospital",
    createdAt: "2026-02-28T06:00:00Z",
    updatedAt: "2026-02-28T06:00:00Z",
    comments: [],
  },
];

const splitFullName = (fullName: string) => {
  const parts = fullName.split(" ").filter(Boolean);

  if (parts.length <= 1) {
    return { firstName: fullName, middleName: null, lastName: fullName };
  }

  if (parts.length === 2) {
    return { firstName: parts[0], middleName: null, lastName: parts[1] };
  }

  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(" ") || null,
    lastName: parts[parts.length - 1],
  };
};

const estimateDateOfBirth = (age: number) => {
  const birthYear = new Date().getFullYear() - age;
  return new Date(birthYear, 0, 1).toISOString();
};

const toReferralStatus = (status: LegacyReferralStatus): Referral["status"] => {
  switch (status) {
    case "pending":
      return "PENDING";
    case "approved":
      return "SUBMITTED";
    case "accepted":
      return "ACCEPTED";
    case "rejected":
    case "redirected":
      return "REJECTED";
    case "completed":
      return "COMPLETED";
    default:
      return "PENDING";
  }
};

const toPatientSex = (sex: "M" | "F"): "male" | "female" =>
  sex === "M" ? "male" : "female";

const toApiReferral = (referral: LegacyReferral): Referral => {
  const [systolicText, diastolicText] = referral.vitals.bp.split("/");
  const systolic = Number(systolicText) || 0;
  const diastolic = Number(diastolicText) || 0;
  const { firstName, middleName, lastName } = splitFullName(
    referral.patient.fullName,
  );
  const status = toReferralStatus(referral.status);
  const isArchived =
    status === "ACCEPTED" || status === "REJECTED" || status === "COMPLETED";

  return {
    id: referral.id,
    patient_id: referral.patient.id,
    referring_doctor_id: referral.referringDoctor,
    sender_hospital_id: referral.referringHospital,
    target_hospital_id: referral.receivingHospital,
    liaison_officer_id: null,
    target_dept_id: referral.requiredSpecialty,
    status,
    waiting_hours_weight: 0,
    ml_status: "PENDING",
    ml_retry_count: 0,
    created_at: referral.createdAt,
    updated_at: referral.updatedAt,
    is_archived: isArchived,
    severity: referral.severity,
    patient: {
      id: referral.patient.id,
      national_id_enc: null,
      national_id_hash: null,
      phone_number: referral.patient.phone,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      sex: toPatientSex(referral.patient.sex),
      date_of_birth: estimateDateOfBirth(referral.patient.age),
      home_region: null,
      is_deleted: false,
      deleted_at: null,
    },
    diagnoses: [
      {
        id: `${referral.id}-dx-1`,
        referral_id: referral.id,
        icd_code: referral.id,
        is_primary: true,
        diagnosis_certainty: "SUSPECTED",
        code_info: {
          code: referral.id,
          description: referral.provisionalDiagnosis,
          category: referral.requiredSpecialty,
        },
      },
    ],
    vitals: [
      {
        id: `${referral.id}-v1`,
        referral_id: referral.id,
        recorded_at: referral.createdAt,
        systolic_bp: systolic,
        diastolic_bp: diastolic,
        heart_rate: referral.vitals.heartRate,
        sp_o2: referral.vitals.oxygenSaturation,
        temperature: referral.vitals.temperature,
        respiratory_rate: referral.vitals.respiratoryRate,
        gcs_score: null,
      },
    ],
    referral_form: {
      id: `${referral.id}-form-1`,
      referral_id: referral.id,
      clinical_summary: referral.clinicalHistory,
      patient_history: referral.clinicalHistory,
      physical_examination_findings: null,
      investigation_results: null,
      treatment_given_before_referral: null,
      medication_on_transfer: null,
      reason_of_referral: referral.reasonForReferral,
      reason_for_referral_category:
        referral.severity === "critical" ? "EMERGENCY" : "ROUTINE",
      condition_at_referral:
        referral.severity === "critical" ? "CRITICAL" : "STABLE",
      mode_of_transport: null,
      accompanying_person_name: null,
      accompanying_person_phone: null,
    },
    ...(referral.severity === "critical"
      ? {
          emergency_detail: {
            id: `${referral.id}-emergency`,
            referral_id: referral.id,
            emergency_justification: referral.reasonForReferral,
          },
        }
      : {}),
    comments: referral.comments.map((comment) => ({
      id: comment.id,
      author: comment.author,
      role: comment.role,
      text: comment.text,
      created_at: comment.createdAt,
    })),
  };
};

export const MOCK_REFERRALS: Referral[] = LEGACY_REFERRALS.map(toApiReferral);
