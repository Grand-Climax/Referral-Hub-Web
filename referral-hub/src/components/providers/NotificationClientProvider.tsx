"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { RealtimeProvider } from "@/context/RealtimeProvider";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { isChatEnabledForRole } from "@/lib/chatRoutes";

export function NotificationClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const readToken = () => Cookies.get("access_token") ?? null;
    setToken(readToken);

    const interval = setInterval(readToken, 2000);
    return () => clearInterval(interval);
  }, []);

  const { data: user } = useGetCurrentUserQuery(undefined, { skip: !token });
  const realtimeEnabled = isChatEnabledForRole(user?.role);

  if (!realtimeEnabled) {
    return <>{children}</>;
  }

  return <RealtimeProvider token={token}>{children}</RealtimeProvider>;
}

/** @deprecated Use NotificationClientProvider */
export const RealtimeClientProvider = NotificationClientProvider;
