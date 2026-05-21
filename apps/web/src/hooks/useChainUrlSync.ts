"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { chainIdBySlug } from "@liberfi.io/utils";
import { useCurrentChain, useSelectChain } from "@liberfi.io/ui-chain-select";
import { useSwitchEvmWalletsToChain } from "@liberfi.io/wallet-connector";
import { chainQueryValue } from "../libs/chainQuery";

/**
 * Synchronizes the global chain atom with the `?chain=<slug>` query parameter.
 *
 * Behavior:
 * - On non-detail pages, when the parsed query slug yields a valid chain
 *   different from the current chain atom, the hook calls `selectChain` to
 *   align the atom (and the connected EVM wallet via `onSwitchChain`).
 * - On a token detail page (`/tokens/{slug}/{address}`), the *path* encodes
 *   the canonical chain. The conflict that matters here is between **path
 *   chain and query chain** — not between query chain and atom. Comparing
 *   to the atom would cause a race when the user switches chain via the
 *   dropdown: the atom mutates before the page navigates away, and the
 *   stale `?chain=` would otherwise be treated as the source of truth and
 *   replace the in-flight navigation back to the old chain. Comparing to
 *   the path-derived chain is stable and matches the original intent of
 *   the "query wins on shared links with conflicting chain" rule.
 *
 * Designed to be mounted high in the tree (e.g. inside `ServiceProviders`)
 * where `useCurrentChain` is already available.
 */
export function useChainUrlSync(): void {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { chain: currentChain } = useCurrentChain();
  const switchEvmWalletsToChain = useSwitchEvmWalletsToChain();
  const { selectChain } = useSelectChain({
    onSwitchChain: switchEvmWalletsToChain,
  });

  // Stable dep: searchParams is a new object each render, so derive a string.
  const queryString = searchParams.toString();

  useEffect(() => {
    const slug = searchParams.get("chain");
    if (!slug) return;

    const queryChain = chainIdBySlug(slug);
    if (!queryChain) return;

    if (pathname.startsWith("/tokens/")) {
      // Token detail page: compare the URL path's chain segment against the
      // `?chain=` query parameter. They are the source of truth for this
      // route — the atom is downstream of the path (TradeDataLoader writes
      // to it on mount), so it MUST NOT participate in this conflict check.
      const segments = pathname.split("/").filter(Boolean);
      const pathChain = segments[1] ? chainIdBySlug(segments[1]) : undefined;
      if (!pathChain || pathChain === queryChain) return;

      // Path and query disagree → query wins. Redirect to the home page with
      // a normalized abbreviation so the URL stays canonical.
      const value = chainQueryValue(queryChain) ?? slug;
      router.replace(`/?chain=${value}`);
      return;
    }

    // Non-detail page: align the atom with the URL query.
    if (queryChain === currentChain) return;
    void selectChain(queryChain);
    // searchParams is intentionally referenced via the captured queryString
    // dependency. selectChain is referenced as a stable callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString, pathname, currentChain, selectChain, router]);
}
