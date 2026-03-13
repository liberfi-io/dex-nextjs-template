"use client";

import { PropsWithChildren } from "react";
import { redirect, usePathname } from "next/navigation";
import { useAuth } from "@liberfi.io/wallet-connector";

export function PortfolioAuthGuard({ children }: PropsWithChildren) {
  const { status } = useAuth();
  const pathname = usePathname();

  if (status !== "authenticated") {
    redirect(`/auth?redirect=${encodeURIComponent(pathname)}`);
  }

  return <>{children}</>;
}
