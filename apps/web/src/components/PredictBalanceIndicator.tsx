"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  usePositionsMulti,
  dflowKYCQueryKey,
  polymarketSetupQueryKey,
} from "@liberfi.io/react-predict";
import { usePredictWallet, KycModal, SetupModal } from "@liberfi.io/ui-predict";
import { useWallets, type EvmWalletAdapter } from "@liberfi.io/wallet-connector";
import { useTranslation } from "@liberfi.io/i18n";
import { formatAmount, formatAmountInUsd, truncateAddress } from "@liberfi.io/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ChartLineIcon, KalshiIcon, PolymarketIcon, cn, useScreen } from "@liberfi.io/ui";
import { useAsyncModal } from "@liberfi.io/ui-scaffold";
import { createWalletClient, custom, type Hex } from "viem";
import { polygon } from "viem/chains";
import {
  deploySafe,
  executeSafe,
  buildAllApprovalTxns,
  pollTransaction,
  type PolymarketRelayConfig,
} from "../lib/polymarket-relay";
import { FUND_WALLET_MODAL_ID, type FundWalletParams } from "./FundWalletModal";
import { ReceiveOutlinedIcon } from "./icons/ReceiveOutlinedIcon";
import { SendOutlinedIcon } from "./icons/SendOutlinedIcon";

function toCents(amount: number): number {
  return Math.floor(amount * 100);
}

function formatCents(cents: number): string {
  return formatAmountInUsd(cents / 100);
}

function formatUsdc(amount: number): string {
  return formatAmount(Math.floor(amount * 100) / 100);
}

// Inline deposit / withdraw action button, used inside each verified
// WalletEntry. Visually mirrors the verify-status pill used on the
// balance line (rounded-full, small icon + short label) so the row's
// secondary actions read as a consistent family of inline chips
// rather than a separate, heavier control. Neutral zinc fill keeps
// these actions visually quieter than the amber "verify" CTA — they
// only appear once the venue is already set up, so they're a
// follow-up rather than an attention grab.
function PredictActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-surface-strong/60 text-text-secondary hover:bg-surface-strong hover:text-text-primary transition-colors cursor-pointer focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      {icon}
      {label}
    </button>
  );
}

// Wallet row used in the merged dropdown. Each row carries identity
// (address + copy + venue-specific setup status) AND the per-venue USDC
// available balance, so the dropdown no longer needs a separate "Cash
// Breakdown" section — that data is fully represented here. When the
// venue is verified / set up for trading, a per-venue action cluster
// (deposit / withdraw) can be supplied via the `actions` slot so users
// can fund the wallet directly from this row instead of jumping to a
// separate header button.
function WalletEntry({
  address,
  balance,
  venueIcon,
  trailing,
  balancePlaceholder,
  actions,
}: {
  address?: string;
  balance: number | null;
  venueIcon: React.ReactNode;
  trailing?: React.ReactNode;
  balancePlaceholder?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!address) return;
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    [address],
  );

  return (
    // `items-start` keeps the venue icon flush with the address line
    // even when the right column grows a third row (the deposit /
    // withdraw action cluster). With `items-center` the icon would
    // drift down toward the actions and look unanchored from the
    // address it identifies.
    <div className="w-full flex items-start gap-3 px-3 py-2.5 rounded-[10px] hover:bg-surface-strong/50 transition-all">
      {/* No decorative tile bg/border here — the Polymarket logo is a
          square brand chip with its own blue background, and the Kalshi
          logo is a green wordmark; a generic lime gradient tile clashes
          with both. Letting each venue logo speak for itself keeps the
          row visually quieter. The 40px slot height roughly matches the
          right-side address + balance stack so vertical centering looks
          balanced. */}
      <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">{venueIcon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-secondary truncate">
            {address ? truncateAddress(address) : "—"}
          </span>
          {address && (
            <button
              type="button"
              className="p-1 rounded hover:bg-surface-strong text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              title="Copy Address"
              onClick={handleCopy}
            >
              {copied ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              )}
            </button>
          )}
          {trailing}
        </div>
        <div className="flex items-center gap-1.5 text-xs mt-2">
          {balancePlaceholder ?? (
            <>
              <span className="text-text-muted">{t("predict.account.availableBalance")}:</span>
              <span className="text-text-primary font-medium">{formatUsdc(balance ?? 0)} USDC</span>
            </>
          )}
        </div>
        {actions && (
          // Compact horizontal cluster directly under the balance
          // line, sharing the same left edge as the address / balance
          // text. Same vertical rhythm (`mt-1.5`) as the
          // address-to-balance gap so the wallet block reads as one
          // tight three-row stack. Pill style matches the verify CTA
          // / status badge family on the address line above.
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">{actions}</div>
        )}
      </div>
    </div>
  );
}

interface MergedDropdownProps {
  // Wallet rows
  solanaAddress?: string;
  evmAddress?: string;
  kalshiUsdcBalance: number | null;
  polymarketUsdcBalance: number | null;
  kalshiKycLoading: boolean;
  kalshiKycVerified: boolean;
  polymarketSetupLoading: boolean;
  polymarketSetupVerified: boolean;
  isKycRefreshing: boolean;
  onKycOpen: () => void;
  onSetupOpen: () => void;
  onKycRefresh: () => void;
  // Per-venue fund-wallet actions (deposit / withdraw). Rendered only
  // when the corresponding venue is verified / set up — for unverified
  // venues the balance-line CTA still drives the verify flow.
  onKalshiDeposit: () => void;
  onKalshiWithdraw: () => void;
  onPolymarketDeposit: () => void;
  onPolymarketWithdraw: () => void;
  // Portfolio aggregates
  positionsCents: number;
  portfolioTotalCents: number;
  initialLoading: boolean;
}

function MergedDropdownContent({
  solanaAddress,
  evmAddress,
  kalshiUsdcBalance,
  polymarketUsdcBalance,
  kalshiKycLoading,
  kalshiKycVerified,
  polymarketSetupLoading,
  polymarketSetupVerified,
  isKycRefreshing,
  onKycOpen,
  onSetupOpen,
  onKycRefresh,
  onKalshiDeposit,
  onKalshiWithdraw,
  onPolymarketDeposit,
  onPolymarketWithdraw,
  positionsCents,
  portfolioTotalCents,
  initialLoading,
}: MergedDropdownProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Wallet rows — Kalshi (Solana) and Polymarket (Polygon). Address +
          copy + venue setup status + per-venue USDC. Icons reflect the
          prediction venue rather than the underlying chain, because users
          recognize Kalshi / Polymarket faster than the chain logos.

          A border-top divider is inserted between the two rows so that
          each venue reads as its own card-like unit — important because
          their identity (address) and balance are independent and the
          deposit / withdraw actions below each row are scoped to that
          single venue's wallet. */}
      <div className="p-2">
        {solanaAddress && (
          <WalletEntry
            address={solanaAddress}
            balance={kalshiUsdcBalance}
            venueIcon={<KalshiIcon width={40} height={40} />}
            actions={
              kalshiKycVerified ? (
                <>
                  <PredictActionButton
                    icon={<ReceiveOutlinedIcon width={11} height={11} />}
                    label={t("predict.fundWallet.deposit")}
                    onClick={(e) => {
                      e.stopPropagation();
                      onKalshiDeposit();
                    }}
                  />
                  <PredictActionButton
                    icon={<SendOutlinedIcon width={11} height={11} />}
                    label={t("predict.fundWallet.withdraw")}
                    onClick={(e) => {
                      e.stopPropagation();
                      onKalshiWithdraw();
                    }}
                  />
                </>
              ) : undefined
            }
            // Address-line trailing slot is reserved purely for the
            // SUCCESS badge (✓ 已驗證). Both the loading hint and the
            // unverified call-to-action are placed on the balance line
            // via `balancePlaceholder`, so the address line stays clean
            // and all status / action transitions happen in one spot.
            trailing={
              kalshiKycVerified ? (
                <span
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-positive/15 text-positive"
                  title={t("predict.kyc.verified") as string}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t("predict.kyc.verified")}
                </span>
              ) : null
            }
            balancePlaceholder={
              kalshiKycLoading ? (
                <span className="inline-flex items-center gap-1.5 text-text-muted">
                  <span className="inline-block w-3 h-3 border-[1.5px] border-current border-t-transparent rounded-full animate-spin" />
                  {t("predict.kyc.verifying")}
                </span>
              ) : !kalshiKycVerified ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onKycOpen();
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors cursor-pointer"
                    title={t("predict.kyc.unverified") as string}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    {t("predict.kyc.unverifiedShort")}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onKycRefresh();
                    }}
                    className="p-1 rounded hover:bg-surface-strong text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    title={t("predict.kyc.refresh") as string}
                    disabled={isKycRefreshing}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={cn(isKycRefreshing && "animate-spin")}
                    >
                      <polyline points="23 4 23 10 17 10" />
                      <polyline points="1 20 1 14 7 14" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                  </button>
                </div>
              ) : undefined
            }
          />
        )}
        {solanaAddress && evmAddress && (
          // Full-width divider (no horizontal indent) so it visually
          // matches the section dividers above / below the wallet
          // block, making each venue read as its own discrete section
          // rather than two rows in a single card. `-mx-2` cancels the
          // outer wrapper's p-2 to bleed the line edge-to-edge across
          // the dropdown.
          <div
            className="-mx-2 my-1"
            style={{ borderTop: "1px solid var(--color-border-control)" }}
          />
        )}
        {evmAddress && (
          <WalletEntry
            address={evmAddress}
            balance={polymarketUsdcBalance}
            venueIcon={<PolymarketIcon width={40} height={40} />}
            actions={
              polymarketSetupVerified ? (
                <>
                  <PredictActionButton
                    icon={<ReceiveOutlinedIcon width={11} height={11} />}
                    label={t("predict.fundWallet.deposit")}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPolymarketDeposit();
                    }}
                  />
                  <PredictActionButton
                    icon={<SendOutlinedIcon width={11} height={11} />}
                    label={t("predict.fundWallet.withdraw")}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPolymarketWithdraw();
                    }}
                  />
                </>
              ) : undefined
            }
            // Same pattern as the Kalshi row above: trailing slot only
            // ever holds the success badge; loading hint and unverified
            // CTA both live on the balance line.
            trailing={
              polymarketSetupVerified ? (
                <span
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-positive/15 text-positive"
                  title={t("predict.setup.verified") as string}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t("predict.setup.verified")}
                </span>
              ) : null
            }
            balancePlaceholder={
              polymarketSetupLoading ? (
                <span className="inline-flex items-center gap-1.5 text-text-muted">
                  <span className="inline-block w-3 h-3 border-[1.5px] border-current border-t-transparent rounded-full animate-spin" />
                  {t("predict.setup.verifying")}
                </span>
              ) : !polymarketSetupVerified ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetupOpen();
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors cursor-pointer"
                  title={t("predict.setup.unverified") as string}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  {t("predict.setup.unverifiedShort")}
                </button>
              ) : undefined
            }
          />
        )}
      </div>

      {/* Positions */}
      <div style={{ borderTop: "1px solid var(--color-border-control)" }} className="p-2">
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-[10px]">
          <div className="flex items-center gap-2.5">
            <ChartLineIcon width={20} height={20} className="text-positive" />
            <span className="text-sm text-text-secondary">{t("predict.account.positions")}</span>
          </div>
          <span className="text-sm font-medium text-text-primary tabular-nums">
            {formatCents(positionsCents)}
          </span>
        </div>
      </div>

      {/* Portfolio total */}
      <div style={{ borderTop: "1px solid var(--color-border-control)" }} className="p-2">
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <span className="text-sm text-text-secondary font-medium">
            {t("predict.account.portfolioTotal")}
          </span>
          <span className="text-sm font-bold text-brand-primary tabular-nums">
            {initialLoading ? "..." : formatCents(portfolioTotalCents)}
          </span>
        </div>
      </div>
    </>
  );
}

export function PredictBalanceIndicator() {
  const {
    kalshiUsdcBalance,
    polymarketUsdcBalance,
    solanaAddress,
    evmAddress,
    kalshiKycVerified,
    kalshiKycUrl,
    kalshiKycLoading,
    polymarketSetupVerified,
    polymarketSafeDeployed,
    polymarketTokenApproved,
    polymarketSetupLoading,
    isLoading: balanceLoading,
  } = usePredictWallet();
  const queryClient = useQueryClient();
  const wallets = useWallets();
  const { isMobile } = useScreen();

  const { data: positionsData } = usePositionsMulti({
    kalshi_user: solanaAddress || undefined,
    polymarket_user: evmAddress || undefined,
  });

  const positionsCents = useMemo(() => {
    const all = positionsData?.positions ?? [];
    let total = 0;
    for (const p of all) {
      total += p.current_value ?? p.size * (p.current_price ?? 0);
    }
    return toCents(total);
  }, [positionsData]);

  // Portfolio = cash (Kalshi + Polymarket USDC) + open positions market
  // value. The per-venue cash subtotals are now only surfaced inside the
  // dropdown's WalletEntry rows, so we collapse them into this single
  // sum here.
  const portfolioTotalCents =
    toCents(kalshiUsdcBalance ?? 0) + toCents(polymarketUsdcBalance ?? 0) + positionsCents;

  const initialLoading =
    balanceLoading && kalshiUsdcBalance === null && polymarketUsdcBalance === null;

  const [isOpen, setIsOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isKycRefreshing, setIsKycRefreshing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Open the shared `FundWalletModal` (mounted once at the
  // NewAppLayout level alongside this component). The
  // `initialScreen` + `initialWallet` params jump straight to the
  // deposit / withdraw screen for the specific venue, and
  // `lockWallet` additionally hides the in-modal wallet selector +
  // back button — the user already picked the venue one click ago, so
  // re-presenting a picker would just ask them to re-confirm the same
  // choice.
  const { onOpen: openFundWallet } = useAsyncModal<FundWalletParams>(FUND_WALLET_MODAL_ID);

  // Each handler closes the dropdown first (the modal will own the
  // user's focus next) and then opens the fund-wallet flow with the
  // correct screen + wallet preselection in locked mode.
  const handleKalshiDeposit = useCallback(() => {
    setIsOpen(false);
    void openFundWallet({
      params: {
        initialScreen: "deposit",
        initialWallet: "solana",
        lockWallet: true,
      },
    });
  }, [openFundWallet]);

  const handleKalshiWithdraw = useCallback(() => {
    setIsOpen(false);
    void openFundWallet({
      params: {
        initialScreen: "withdraw",
        initialWallet: "solana",
        lockWallet: true,
      },
    });
  }, [openFundWallet]);

  const handlePolymarketDeposit = useCallback(() => {
    setIsOpen(false);
    void openFundWallet({
      params: {
        initialScreen: "deposit",
        initialWallet: "evm",
        lockWallet: true,
      },
    });
  }, [openFundWallet]);

  const handlePolymarketWithdraw = useCallback(() => {
    setIsOpen(false);
    void openFundWallet({
      params: {
        initialScreen: "withdraw",
        initialWallet: "evm",
        lockWallet: true,
      },
    });
  }, [openFundWallet]);

  const relayConfig: PolymarketRelayConfig = useMemo(
    () => ({ signProxyUrl: "/predict-api/api/v1/polymarket/sign" }),
    [],
  );

  const handleDeployAndApprove = useCallback(async () => {
    const evmWallet = wallets.find((w) => w.chainNamespace === "EVM" && w.isConnected) as
      | EvmWalletAdapter
      | undefined;
    if (!evmWallet || !evmAddress) {
      throw new Error("EVM wallet not connected");
    }

    await evmWallet.switchChain("137" as never);

    const provider = await evmWallet.getEip1193Provider();
    if (!provider) throw new Error("Cannot get EIP-1193 provider");

    const walletClient = createWalletClient({
      account: evmAddress as Hex,
      chain: polygon,
      transport: custom(provider),
    });

    if (!polymarketSafeDeployed) {
      const deployResult = await deploySafe(walletClient, relayConfig);
      if (deployResult.transactionID) {
        await pollTransaction(relayConfig, deployResult.transactionID);
      }
    }

    if (!polymarketTokenApproved) {
      const approvalTxns = buildAllApprovalTxns();
      const approveResult = await executeSafe(walletClient, approvalTxns, relayConfig);
      if (approveResult.transactionID) {
        await pollTransaction(relayConfig, approveResult.transactionID);
      }
    }

    queryClient.invalidateQueries({
      queryKey: polymarketSetupQueryKey(evmAddress),
    });
  }, [
    wallets,
    evmAddress,
    polymarketSafeDeployed,
    polymarketTokenApproved,
    relayConfig,
    queryClient,
  ]);

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsOpen(true);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    closeTimer.current = setTimeout(() => setIsOpen(false), 150);
  }, [isMobile]);

  const handleClick = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleKycRefresh = useCallback(async () => {
    if (!solanaAddress) return;
    setIsKycRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: dflowKYCQueryKey(solanaAddress),
    });
    setIsKycRefreshing(false);
  }, [queryClient, solanaAddress]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const dropdownProps: MergedDropdownProps = {
    solanaAddress,
    evmAddress,
    kalshiUsdcBalance,
    polymarketUsdcBalance,
    kalshiKycLoading,
    kalshiKycVerified,
    polymarketSetupLoading,
    polymarketSetupVerified,
    isKycRefreshing,
    onKycOpen: () => setIsKycModalOpen(true),
    onSetupOpen: () => setIsSetupModalOpen(true),
    onKycRefresh: handleKycRefresh,
    onKalshiDeposit: handleKalshiDeposit,
    onKalshiWithdraw: handleKalshiWithdraw,
    onPolymarketDeposit: handlePolymarketDeposit,
    onPolymarketWithdraw: handlePolymarketWithdraw,
    positionsCents,
    portfolioTotalCents,
    initialLoading,
  };

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger styling intentionally mirrors `TRIGGER_CLASS` in
          NewAppLayout (h-8, rounded-full, identical border / bg / hover /
          focus ring) so this button sits on the same baseline as the
          adjacent ChainSelectDropdown and DexAccountButton triggers and
          their hover / focus affordances match. The leading icon is the
          same up-trending line chart that represents PnL on the predict
          profile page, signalling that this trigger summarises the
          user's prediction-market net worth. */}
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center justify-center gap-1.5 h-8 px-2.5 bg-surface-interactive/60 hover:bg-surface-interactive border border-border-control/50 rounded-full transition-colors cursor-pointer focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <ChartLineIcon width={16} height={16} className="text-positive" aria-hidden="true" />
        <span className="text-xs font-medium text-text-primary tabular-nums">
          {initialLoading ? "..." : formatCents(portfolioTotalCents)}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* KYC + Setup modals are owned here because the dropdown's status
          badges (rendered inside MergedDropdownContent) open them. */}
      <KycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        kycUrl={kalshiKycUrl}
      />
      {evmAddress && (
        <SetupModal
          isOpen={isSetupModalOpen}
          onClose={() => setIsSetupModalOpen(false)}
          evmAddress={evmAddress}
          safeDeployed={polymarketSafeDeployed}
          tokenApproved={polymarketTokenApproved}
          onDeployAndApprove={handleDeployAndApprove}
        />
      )}

      {/* Mobile: bottom sheet */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-surface-scrim" />
          <div
            className="relative w-full max-w-sm mb-safe animate-in slide-in-from-bottom duration-200"
            style={{
              borderRadius: "14px 14px 0 0",
              border: "1px solid var(--color-border-control)",
              borderBottom: "none",
              background: "var(--color-surface-interactive)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full bg-surface-strong" />
            </div>
            <MergedDropdownContent {...dropdownProps} />
            <div className="pb-safe" />
          </div>
        </div>
      )}

      {/* Tablet & Desktop: popover */}
      {!isMobile && isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 z-50 overflow-hidden"
          style={{
            borderRadius: 14,
            border: "1px solid var(--color-border-control)",
            background: "var(--color-surface-interactive)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          }}
        >
          <MergedDropdownContent {...dropdownProps} />
        </div>
      )}
    </div>
  );
}
