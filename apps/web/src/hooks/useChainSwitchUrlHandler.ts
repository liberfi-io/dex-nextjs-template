"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Chain } from "@liberfi.io/types";
import { chainQueryValue } from "../libs/chainQuery";

/**
 * Returns a callback to wire into the `onSuccess` of `ChainSelectWidget` /
 * `ChainSelectDropdown` so the URL stays in sync with the global chain atom.
 *
 * - On a token detail page (`/tokens/...`), the path encodes the *old* chain,
 *   so we navigate to `/?chain=<newSlug>` instead of appending the query —
 *   otherwise `TradeDataLoader` would immediately overwrite the atom back to
 *   the path's chain.
 * - Elsewhere, we `replace` the URL with `?chain=<newSlug>` while preserving
 *   any other existing query parameters (e.g. `?share=` on redpacket pages).
 */
export function useChainSwitchUrlHandler(): (chain: Chain) => void {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (newChain: Chain) => {
      const value = chainQueryValue(newChain);
      if (!value) return;

      const isTokenDetail = pathname.startsWith("/tokens");
      if (isTokenDetail) {
        router.push(`/?chain=${value}`);
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("chain", value);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );
}
