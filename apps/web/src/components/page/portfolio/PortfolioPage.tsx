"use client";

import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useConnectedWallet } from "@liberfi.io/wallet-connector";
import { useWalletSummary } from "@liberfi.io/ui-portfolio";
import {
  useHideHeader,
  useSetBottomNavigationBarActiveKey,
  useShowBottomNavigationBar,
} from "../../../application/layout-chrome";
import { PortfolioHeader } from "./PortfolioHeader";
import { PortfolioAllocationChart } from "./PortfolioAllocationChart";
import { PortfolioBottomPanel } from "./PortfolioBottomPanel";
import { PortfolioHeaderSkeleton } from "./skeletons/PortfolioHeaderSkeleton";

/**
 * `/portfolio` page — wallet identity card + token allocation breakdown +
 * tabbed assets/activities tables. Visual rhythm follows TokenTradePage:
 * a max-width container with an ambient glow, a top "summary row" that
 * reflows from row to column on mobile, and a tall bottom panel that owns
 * its own scroll for the long activity / asset feeds.
 *
 * Wallet address resolution: replaces the legacy `useCurrentWalletAddress`
 * (Solana-only) with `useConnectedWallet(chain)?.address` so this page
 * works for SOL, ETH, BNB, and any chain registered in the connector.
 *
 * Polling: `PortfolioProvider` (mounted in `NewAppLayout`) already polls
 * `/v2/wallet/{chain}/{wallet}/{pnl,net-worth}` every 15 s, so the header
 * (`useWalletSummary`) and the allocation chart
 * (`useWalletPortfoliosQuery`) refresh automatically. The bottom-table
 * scripts (`usePortfolioNetWorthTokensScript`,
 * `usePortfolioActivitiesScript`) inherit React Query cache freshness
 * from the same provider — they don't need their own polling layer.
 */
export function PortfolioPage() {
  useHideHeader("tablet");
  useShowBottomNavigationBar("tablet");
  useSetBottomNavigationBarActiveKey("account");

  const { chain } = useCurrentChain();
  const wallet = useConnectedWallet(chain);
  const address = wallet?.address ?? "";

  // First-paint header skeleton — only when the summary query has never
  // resolved on this wallet. Subsequent 15s polls flip `isFetching` true
  // but `data` stays defined, so the skeleton does not flash on every
  // refetch. This is the same pattern other React Query consumers in this
  // app use for "no-flash polling".
  const { data: summaryData, isPending } = useWalletSummary();
  const headerLoading = isPending && !summaryData;

  return (
    <div className="relative w-full h-full">
      {/* Ambient glow — same accent as TokenTradePage */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-[0.07]"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--color-brand-primary) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-[1] mx-auto flex h-full w-full max-w-[1280px] flex-col gap-4 overflow-auto p-4 lg:p-6">
        {/* Top row — header + allocation.
            - Desktop column ratio: header capped at 420px max width;
              the chart card fills the rest. Header content is much
              less dense than the chart (5-line legend), so giving it
              the same width as the chart left it visually overweight.
            - Heights stretch (default `align-items: stretch`) so the
              two cards line up on a flat bottom edge; the header
              compensates internally with `mt-auto` on the actions
              row, anchoring the buttons to the card bottom when the
              chart pulls the row taller. */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          {headerLoading ? <PortfolioHeaderSkeleton /> : <PortfolioHeader />}
          <PortfolioAllocationChart chain={chain} address={address} />
        </div>

        {/* Bottom — tabbed assets / activities */}
        <div className="min-h-[480px] flex-1">
          <PortfolioBottomPanel chain={chain} address={address} />
        </div>
      </div>
    </div>
  );
}
