"use client";

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { IRouter, NavigateOptions } from "@liberfi/ui-dex";

export function useRouterAdapter() {
  const router = useRouter();

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
