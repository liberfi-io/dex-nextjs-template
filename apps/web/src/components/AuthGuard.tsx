"use client";

import { PropsWithChildren, useEffect, useRef } from "react";
import { useAuth } from "@liberfi.io/wallet-connector";

export function AuthGuard({ children }: PropsWithChildren) {
  const { status, signIn } = useAuth();
  const signInTriggered = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated" && !signInTriggered.current) {
      signInTriggered.current = true;
      signIn();
    }
  }, [status, signIn]);

  if (status !== "authenticated") {
    return null;
  }

  return <>{children}</>;
}
