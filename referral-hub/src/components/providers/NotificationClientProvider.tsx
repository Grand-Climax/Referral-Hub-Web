"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { NotificationProvider } from "@/context/NotificationProvider";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { isNotificationsEnabledForRole } from "@/lib/notificationRoutes";

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
  const notificationsEnabled = isNotificationsEnabledForRole(user?.role);

  if (!notificationsEnabled) {
    return <>{children}</>;
  }

  return (
    <NotificationProvider token={token}>{children}</NotificationProvider>
  );
}
