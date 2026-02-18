import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Referral Hub",
  description: "Sign in to Referral Hub",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
