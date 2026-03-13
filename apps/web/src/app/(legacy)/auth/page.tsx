"use client";

import { useLogin, usePrivy } from "@privy-io/react-auth";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const searchParams = useSearchParams();

  const [isSigningIn, setIsSigningIn] = useState(false);

  const { ready, authenticated } = usePrivy();

  const { login } = useLogin({
    onComplete: () => {
      console.info("privy login complete");
      setIsSigningIn(false);
    },
    onError: (e) => {
      console.error(e);
      setIsSigningIn(false);
    },
  });

  useEffect(() => {
    if (!ready) return;
    if (authenticated) {
      console.info("privy authenticated, redirecting back");
      redirect(decodeURIComponent(searchParams.get("redirect") || "/"));
    } else if (!isSigningIn) {
      console.info("privy unauthenticated, signing in");
      setIsSigningIn(true);
      login();
    }
  }, [ready, isSigningIn, authenticated, searchParams, login]);

  return <></>;
}
