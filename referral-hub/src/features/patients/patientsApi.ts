import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { PATIENT_ROUTES } from "@/config/api";
import type { CreatePatientRequest, LookupPatientParams, PatientApiRecord } from "@/types/patient";

const normalizePatientId = (raw: any): string | undefined => {
  if (!raw) return undefined;

  // Some backends may return an array of patients
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const id = normalizePatientId(item);
      if (id) return id;
    }
    return undefined;
  }

  return (
    raw.id ??
    raw.patient_id ??
    raw.patientId ??
    raw.ID ??
    raw._id ??
    raw.patient?.id ??
    raw.patient?.ID
  );
};

export const patientsApi = createApi({
  reducerPath: "patientsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Patient"],
  endpoints: (builder) => ({
    lookupPatient: builder.query<PatientApiRecord, LookupPatientParams>({
      query: (params) => {
        const query = new URLSearchParams();
        // Prefer canonical backend param
        if (params.national_id) query.set("national_id", params.national_id);
        if (params.national_id_enc) query.set("national_id_enc", params.national_id_enc);
        if (params.national_id_hash) query.set("national_id_hash", params.national_id_hash);

        return {
          url: `${PATIENT_ROUTES.LOOKUP}?${query.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: any): PatientApiRecord => {
        // Backend may return `patient` object or `{ data: patient }`
        const raw = response?.data ?? response?.patient ?? response;
        const id = normalizePatientId(raw);
        if (!id) {
          throw new Error("Patient lookup succeeded but id was missing in response.");
        }
        return { id, ...raw };
      },
    }),

    createPatient: builder.mutation<PatientApiRecord, CreatePatientRequest>({
      query: (body) => {
        // Backend expects RFC3339 timestamps (e.g. `YYYY-MM-DDT00:00:00Z`),
        // but the UI provides `YYYY-MM-DD` from <input type="date" />.
        const date_of_birth = body.date_of_birth;
        const rfc3339DateOnly = /^\d{4}-\d{2}-\d{2}$/;
        const normalizedDob = rfc3339DateOnly.test(date_of_birth)
          ? `${date_of_birth}T00:00:00Z`
          : date_of_birth;

        // Backend expects exactly:
        // { date_of_birth, first_name, middle_name?, home_region, last_name, national_id, phone_number, sex }
        const national_id = body.national_id ?? body.national_id_enc;

        if (!national_id) {
          throw new Error("national_id is required to create patient");
        }

        return {
          url: PATIENT_ROUTES.CREATE,
          method: "POST",
          body: {
            date_of_birth: normalizedDob,
            first_name: body.first_name,
            home_region: body.home_region,
            last_name: body.last_name,
            phone_number: body.phone_number,
            sex: body.sex,
            ...(body.middle_name ? { middle_name: body.middle_name } : {}),
            national_id,
          },
        };
      },
      transformResponse: (response: any): PatientApiRecord => {
        const raw = response?.data ?? response?.patient ?? response;
        const id = normalizePatientId(raw);
        if (!id) {
          throw new Error("Patient created but id was missing in response.");
        }
        return { id, ...raw };
      },
      invalidatesTags: ["Patient"],
    }),
  }),
});

export const { useLazyLookupPatientQuery, useCreatePatientMutation } = patientsApi;

