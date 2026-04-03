import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/slices/authSlice";
import { authApi } from "@/features/auth/authApi";
import { hospitalsApi } from "@/features/hospitals/hospitalsApi";
import { referralApi } from "@/features/referral/referralApi";
import { liaisonApi } from "@/features/liaison/liaisonApi";
import { patientsApi } from "@/features/patients/patientsApi";
import { icdApi } from "@/features/reference/icdApi";
import { liaisonsApi } from "@/features/reference/liaisonsApi";
import { networkedHospitalsApi } from "@/features/reference/networkedHospitalsApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [authApi.reducerPath]: authApi.reducer,
      [hospitalsApi.reducerPath]: hospitalsApi.reducer,
      [referralApi.reducerPath]: referralApi.reducer,
      [liaisonApi.reducerPath]: liaisonApi.reducer,
      [patientsApi.reducerPath]: patientsApi.reducer,
      [icdApi.reducerPath]: icdApi.reducer,
      [liaisonsApi.reducerPath]: liaisonsApi.reducer,
      [networkedHospitalsApi.reducerPath]: networkedHospitalsApi.reducer,
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
        networkedHospitalsApi.middleware
      ),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
