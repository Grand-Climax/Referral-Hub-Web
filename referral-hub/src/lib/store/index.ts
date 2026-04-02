import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/slices/authSlice";
import { authApi } from "@/features/auth/authApi";
import { hospitalsApi } from "@/features/hospitals/hospitalsApi";
import { referralApi } from "@/features/referral/referralApi";
import { liaisonApi } from "@/features/liaison/liaisonApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [authApi.reducerPath]: authApi.reducer,
      [hospitalsApi.reducerPath]: hospitalsApi.reducer,
      [referralApi.reducerPath]: referralApi.reducer,
      [liaisonApi.reducerPath]: liaisonApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        hospitalsApi.middleware,
        referralApi.middleware,
        liaisonApi.middleware
      ),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
