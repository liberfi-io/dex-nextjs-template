"use client";

import { PropsWithChildren, useEffect, useRef } from "react";
import { useAuth } from "@liberfi.io/wallet-connector";
import { Skeleton } from "@heroui/react";

function PortfolioSkeleton() {
  return (
    <div className="w-full max-w-[860px] mx-auto lg:px-6 py-4">
      <div className="flex items-center gap-4 px-4 lg:px-0">
        <Skeleton className="w-16 h-16 rounded-full flex-none" />
        <div className="flex flex-col gap-2">
          <Skeleton className="w-24 h-8 rounded-lg" />
          <Skeleton className="w-36 h-5 rounded-lg" />
        </div>
      </div>
      <div className="mt-6 px-4 lg:px-0 flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-full h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function PortfolioAuthGuard({ children }: PropsWithChildren) {
  const { status, signIn } = useAuth();
  const signInTriggered = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated" && !signInTriggered.current) {
      signInTriggered.current = true;
      signIn();
    }
  }, [status, signIn]);

  if (status !== "authenticated") {
    return <PortfolioSkeleton />;
  }

  return <>{children}</>;
}
