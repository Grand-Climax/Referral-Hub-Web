import type { AppDispatch } from "@/lib/store/index";
import { clearAuthSession } from "@/lib/authSession";
import { authApi } from "@/features/auth/authApi";
import { hospitalsApi } from "@/features/hospitals/hospitalsApi";
import { referralApi } from "@/features/referral/referralApi";
import { liaisonApi } from "@/features/liaison/liaisonApi";
import { patientsApi } from "@/features/patients/patientsApi";
import { icdApi } from "@/features/reference/icdApi";
import { liaisonsApi } from "@/features/reference/liaisonsApi";
import { networkedHospitalsApi } from "@/features/reference/networkedHospitalsApi";
import { regionsApi } from "@/features/reference/regionsApi";
import { departmentApi } from "@/features/department/department";
import { specialistApi } from "@/features/specialist/specialistApi";
import { systemAdminApi } from "@/features/systemAdmin/systemAdminApi";
import { receptionistApi } from "@/features/receptionist/receptionistApi";
import { hospitalAdminApi } from "@/features/hospitalAdmin/hospitalAdminApi";
import { departmentHeadApi } from "@/features/department-head/departmentHeadApi";
import { usersApi } from "@/features/users/usersApi";
import { networkRoutesApi } from "@/features/networkRoutes/networkRoutesApi";
import { adminConfigApi } from "@/features/adminConfig/adminConfigApi";
import { notificationsApi } from "@/features/notifications/notificationsApi";
import { chatApi } from "@/features/chat/chatApi";
import { mohAnalyticsApi } from "@/features/analytics/mohAnalyticsApi";
import { clinicalApi } from "@/features/clinical/clinicalApi";
import { doctorReferralApi } from "@/features/doctor/doctorReferralApi";

const apiSlices = [
  authApi,
  hospitalsApi,
  referralApi,
  liaisonApi,
  patientsApi,
  icdApi,
  liaisonsApi,
  networkedHospitalsApi,
  regionsApi,
  departmentApi,
  specialistApi,
  systemAdminApi,
  receptionistApi,
  hospitalAdminApi,
  departmentHeadApi,
  usersApi,
  networkRoutesApi,
  adminConfigApi,
  notificationsApi,
  chatApi,
  mohAnalyticsApi,
  clinicalApi,
  doctorReferralApi,
] as const;

/** Clears data API caches but keeps authApi state (safe during login). */
export function resetDataApiCaches(dispatch: AppDispatch) {
  for (const api of apiSlices) {
    if (api === authApi) continue;
    dispatch(api.util.resetApiState());
  }
}

/** Clears all RTK Query caches so the next session fetches fresh data. */
export function resetAllApiCaches(dispatch: AppDispatch) {
  for (const api of apiSlices) {
    dispatch(api.util.resetApiState());
  }
}

/** Full sign-out / pre-login cleanup: cookies, Redux auth, and all API caches. */
export function resetAuthSession(dispatch: AppDispatch) {
  clearAuthSession(dispatch);
  resetAllApiCaches(dispatch);
}
