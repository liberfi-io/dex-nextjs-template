"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { IRouter, NavigateOptions } from "@liberfi/ui-dex";
import { useChainAwareRouter } from "./useChainAwareRouter";

export function useRouterAdapter() {
  // Use the chain-aware router so legacy navigation through the IRouter
  // adapter (consumed by `@liberfi/ui-dex` and other packages) also
  // preserves the `?chain=<abbr>` query parameter automatically.
  const router = useChainAwareRouter();

  const navigate = useCallback(
    (toOrDelta: string | number, options?: NavigateOptions) => {
      if (typeof toOrDelta === "string") {
        if (options?.replace) {
          router.replace(toOrDelta);
        } else {
          router.push(toOrDelta);
        }
      } else if (typeof toOrDelta === "number") {
        for (let i = 0; i < Math.abs(toOrDelta); i++) {
          if (toOrDelta > 0) router.forward();
          else router.back();
        }
      }
    },
    [router],
  );

  return useMemo<IRouter>(() => ({ usePathname, navigate, useSearchParams }), [navigate]);
}
