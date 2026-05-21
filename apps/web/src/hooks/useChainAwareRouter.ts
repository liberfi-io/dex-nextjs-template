"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { withChainQuery } from "../libs/chainQuery";

/**
 * Drop-in replacement for `useRouter()` from `next/navigation` that carries
 * the current `?chain=<abbr>` query parameter across navigations.
 *
 * Behavior:
 * - When the *current* URL has `?chain=<value>`, any `push` / `replace` /
 *   `prefetch` call without an explicit `chain` query gets the same value
 *   appended automatically.
 * - When the *current* URL has no `chain` query, navigation targets are
 *   passed through unchanged. This avoids leaking a chain hint when the
 *   user has not opted in via the URL.
 *
 * The chain query is read on every render (via `useSearchParams`), so the
 * returned router stays in sync with the latest URL value.
 */
export function useChainAwareRouter(): AppRouterInstance {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chainQuery = searchParams.get("chain");

  return useMemo<AppRouterInstance>(() => {
    const augment = (href: string) =>
      chainQuery ? withChainQuery(href, chainQuery) : href;

    return {
      back: () => router.back(),
      forward: () => router.forward(),
      refresh: () => router.refresh(),
      push: (href, options) => router.push(augment(href), options),
      replace: (href, options) => router.replace(augment(href), options),
      prefetch: (href, options) => router.prefetch(augment(href), options),
    };
  }, [router, chainQuery]);
}
