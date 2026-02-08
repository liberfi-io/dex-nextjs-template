"use client";

import { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@liberfi/ui-base";

export function GuestGuard({ children }: PropsWithChildren) {
  const { status } = useAuth();

  if (status === "authenticated") {
    redirect("/");
  }

  return <>{children}</>;
}
