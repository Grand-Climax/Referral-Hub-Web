import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/slices/authSlice";
import specialistAvailabilityReducer from "@/redux/slices/specialistAvailabilitySlice";
import { authApi } from "@/features/auth/authApi";
import { hospitalsApi } from "@/features/hospitals/hospitalsApi";
import { referralApi } from "@/features/referral/referralApi";
import { liaisonApi } from "@/features/liaison/liaisonApi";
import { patientsApi } from "@/features/patients/patientsApi";
import { icdApi } from "@/features/reference/icdApi";
import { liaisonsApi } from "@/features/reference/liaisonsApi";
import { networkedHospitalsApi } from "@/features/reference/networkedHospitalsApi";
import { departmentApi } from "@/features/department/department";
import { specialistApi } from "@/features/specialist/specialistApi";
import { systemAdminApi } from "@/features/systemAdmin/systemAdminApi";
import { receptionistApi } from "@/features/receptionist/receptionistApi";
import { hospitalAdminApi } from "@/features/hospitalAdmin/hospitalAdminApi";
import { departmentHeadApi } from "@/features/department-head/departmentHeadApi";
import { usersApi } from "@/features/users/usersApi";
import { mohAnalyticsApi } from "@/features/analytics/mohAnalyticsApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      specialistAvailability: specialistAvailabilityReducer,
      [authApi.reducerPath]: authApi.reducer,
      [hospitalsApi.reducerPath]: hospitalsApi.reducer,
      [referralApi.reducerPath]: referralApi.reducer,
      [liaisonApi.reducerPath]: liaisonApi.reducer,
      [patientsApi.reducerPath]: patientsApi.reducer,
      [icdApi.reducerPath]: icdApi.reducer,
      [liaisonsApi.reducerPath]: liaisonsApi.reducer,
      [networkedHospitalsApi.reducerPath]: networkedHospitalsApi.reducer,
      [departmentApi.reducerPath]: departmentApi.reducer,
      [specialistApi.reducerPath]: specialistApi.reducer,
      [systemAdminApi.reducerPath]: systemAdminApi.reducer,
      [receptionistApi.reducerPath]: receptionistApi.reducer,
      [hospitalAdminApi.reducerPath]: hospitalAdminApi.reducer,
      [departmentHeadApi.reducerPath]: departmentHeadApi.reducer,
      [usersApi.reducerPath]: usersApi.reducer,
      [mohAnalyticsApi.reducerPath]: mohAnalyticsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        hospitalsApi.middleware,
        referralApi.middleware,
        liaisonApi.middleware,
        patientsApi.middleware,
        icdApi.middleware,
        liaisonsApi.middleware,
        networkedHospitalsApi.middleware,
        departmentApi.middleware,
        specialistApi.middleware,
        systemAdminApi.middleware,
        receptionistApi.middleware,
        hospitalAdminApi.middleware,
        departmentHeadApi.middleware,
        usersApi.middleware,
        mohAnalyticsApi.middleware,
      ),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
