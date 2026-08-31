"use client";

import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useTranslation } from "@liberfi.io/i18n";
import { Button } from "@liberfi.io/ui";
import { useAuth } from "@liberfi.io/wallet-connector";
import { PortfolioPageSkeleton } from "./page/portfolio/skeletons/PortfolioPageSkeleton";

interface PortfolioSignInPromptProps {
  onSignIn: () => void | Promise<void>;
}

function PortfolioSignInPrompt({ onSignIn }: PortfolioSignInPromptProps) {
  const { t } = useTranslation();

  return (
    <div className="relative flex h-full w-full items-center justify-center p-4 lg:p-6">
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 opacity-[0.07]"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--color-brand-primary) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div
        className="relative z-[1] flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-default-100 bg-content1 p-6 text-center lg:p-8"
        aria-live="polite"
      >
        <div className="flex flex-col gap-1.5">
          <h1 className="text-lg font-semibold text-foreground">
            {t("common.unauthenticated")}
          </h1>
          <p className="text-sm text-text-muted">{t("portfolio.connectWallet.hint")}</p>
        </div>
        <Button color="primary" radius="lg" size="sm" onPress={onSignIn}>
          {t("common.signIn")}
        </Button>
      </div>
    </div>
  );
}

export function PortfolioAuthGuard({ children }: PropsWithChildren) {
  const { status, signIn } = useAuth();
  const signInTriggered = useRef(false);
  const [hasAttemptedAutoSignIn, setHasAttemptedAutoSignIn] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" && !signInTriggered.current) {
      signInTriggered.current = true;
      setHasAttemptedAutoSignIn(true);
      void signIn();
    }
  }, [status, signIn]);

  if (status === "authenticated") {
    return <>{children}</>;
  }

  if (status === "unauthenticated" && hasAttemptedAutoSignIn) {
    return <PortfolioSignInPrompt onSignIn={signIn} />;
  }

  return <PortfolioPageSkeleton />;
}
