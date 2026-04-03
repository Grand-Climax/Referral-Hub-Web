export type PatientCreationFormFields = {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string; // YYYY-MM-DD
  sex: "male" | "female";
  home_region: string;
  phone_number: string;

  // UI + legacy fields (backend may accept/expect `national_id`)
  national_id_enc?: string;
  national_id_hash?: string;
};

export type LookupPatientParams = {
  national_id?: string;
  // legacy/backwards-compat
  national_id_enc?: string;
  national_id_hash?: string;
};

export type CreatePatientRequest = {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string; // YYYY-MM-DD
  sex: "male" | "female";
  home_region: string;
  phone_number: string;

  // Prefer canonical backend field
  national_id?: string;
  // legacy/backwards-compat
  national_id_enc?: string;
  national_id_hash?: string;
};

export type PatientApiRecord = {
  id: string;
  [key: string]: any;
};

