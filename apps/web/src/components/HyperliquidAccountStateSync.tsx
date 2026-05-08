"use client";

/**
 * Headless side-effect component that keeps the Hyperliquid account
 * state cache live for the rest of the app.
 *
 * Mounts the SDK's `useAccountStateSubscription` hook once (inside the
 * `PerpetualsProvider`) so a single `webData2` WebSocket subscription
 * drives every consumer:
 *
 *  - `useHyperliquidBalances` (wallet button, deposit modal)
 *  - `usePositionsQuery` (Place Order, positions table)
 *  - `useOrdersQuery` (open-orders widget)
 *
 * Renders nothing — its sole purpose is to subscribe and let
 * `setQueryData` fan the snapshot out across React Query caches. Without
 * this component the cache stays empty and balances render as `0`.
 *
 * Why this lives in a separate component (vs. inlining the hook in
 * `NewAppLayout`):
 *  - Single Responsibility: layout components don't need to know about
 *    venue-specific WS plumbing.
 *  - Easy to gate: the host can mount or unmount this component to
 *    pause / resume the subscription without rerunning the entire layout.
 */
import {
  useAccountStateSubscription,
  useHyperliquidUserBootstrap,
} from "@liberfi.io/ui-perpetuals";
import { type EvmWalletAdapter, useWallets } from "@liberfi.io/wallet-connector";
import { useMemo } from "react";

export function HyperliquidAccountStateSync() {
  const wallets = useWallets();
  const evmWallet = useMemo(
    () =>
      wallets.find((w) => w.chainNamespace === "EVM") as
        | EvmWalletAdapter
        | undefined,
    [wallets],
  );

  useAccountStateSubscription({ userAddress: evmWallet?.address });

  // Single-shot REST fallback for slow webData2 handshakes. Fires at
  // most one positions + open-orders round-trip after a 3 s grace
  // window and only when the subscription hasn't primed the cache
  // yet — keeping HL `/info` traffic at a minimum on cold pages
  // while preserving snappy first-paint when the WS is healthy.
  useHyperliquidUserBootstrap({ userAddress: evmWallet?.address });

  return null;
}
