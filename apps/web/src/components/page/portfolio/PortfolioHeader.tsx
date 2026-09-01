"use client";

import { useCallback, useState } from "react";
import { Tooltip } from "@heroui/react";
import { useTranslation } from "@liberfi.io/i18n";
import { cn, RefreshIcon, toast, TriangleDownIcon, TriangleUpIcon } from "@liberfi.io/ui";
import { useAsyncModal } from "@liberfi.io/ui-scaffold";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  useAccountInfo,
  useRefetchWalletSummary,
  useWalletSummary,
} from "@liberfi.io/ui-portfolio";
import { formatAmountInUsd, formatPercent, truncateAddress } from "@liberfi.io/utils";
import { useCreateOnrampWidgetUrlMutation } from "../../../application/server/useCreateOnrampWidgetUrlMutation";
import { CashInOutlinedIcon } from "../../icons/CashInOutlinedIcon";
import { ReceiveOutlinedIcon } from "../../icons/ReceiveOutlinedIcon";
import { SendOutlinedIcon } from "../../icons/SendOutlinedIcon";
import { RECEIVE_MODAL_ID } from "../../modals/ReceiveModal";
import { WITHDRAW_MODAL_ID } from "../../modals/WithdrawModal";
import { PortfolioGradientAvatar } from "./PortfolioGradientAvatar";

/**
 * Portfolio page header — wallet identity + balance + PnL + action cluster.
 *
 * Visual contract:
 *   - Avatar: 56×56 deterministic gradient seeded by the wallet address.
 *   - Address row: truncated 0xABCD…WXYZ + copy affordance.
 *   - Balance + PnL: the balance remains the visual headline while the
 *     24-hour change sits on its own supporting row, preventing the
 *     narrower summary card from feeling crowded.
 *   - Actions row: Receive / Send / Buy as circular icon buttons in a
 *     bottom-aligned cluster underneath the basic info. Mirrors
 *     the wallet dropdown's `WalletActionButton` so the visual identity
 *     of these actions is consistent across the app, and leaves room to
 *     extend with new operations (Convert, Stake, …) without changing
 *     the surrounding layout.
 *
 * Removed (relative to the original draft):
 *   - The native (SOL/ETH) balance line — duplicated information from
 *     the global header dropdown and added vertical noise without
 *     improving the page's primary task (portfolio analytics).
 *   - The right-side action column — actions now live with the identity
 *     block, freeing horizontal space for the allocation chart on the
 *     same row.
 */
export function PortfolioHeader() {
  const { t } = useTranslation();
  const { chain } = useCurrentChain();
  const { walletAddress, nativeToken } = useAccountInfo();
  const { data: summary, isFetching } = useWalletSummary();
  const refetchSummary = useRefetchWalletSummary();

  const totalProfitInUsd = parseFloat(summary?.totalProfitInUsd ?? "0");
  const totalProfitRatio = parseFloat(summary?.totalProfitRatio ?? "0");
  const bullish = totalProfitInUsd >= 0;

  // Modal openers
  const { onOpen: openReceive } = useAsyncModal(RECEIVE_MODAL_ID);
  const { onOpen: openWithdraw } = useAsyncModal(WITHDRAW_MODAL_ID);
  const { mutate: createOnrampWidgetUrl, isPending: isCreatingOnramp } =
    useCreateOnrampWidgetUrlMutation();

  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  // Same on-ramp flow as `DexAccountMenuContent` — open about:blank
  // synchronously to survive popup blockers, then patch the URL once the
  // mutation resolves.
  const handleAddCash = useCallback(() => {
    if (!walletAddress || isCreatingOnramp) return;
    const win = window.open("about:blank", "_blank");
    if (win) win.opener = null;
    createOnrampWidgetUrl(
      { chain, walletAddress, cryptoCurrency: nativeToken?.symbol },
      {
        onSuccess: (data) => {
          if (win && !win.closed) {
            win.location.href = data.widgetUrl;
          } else {
            window.open(data.widgetUrl, "_blank", "noopener,noreferrer");
          }
        },
        onError: (err) => {
          if (win && !win.closed) win.close();
          toast.error(err.message || t("account.add_cash_failed"));
        },
      },
    );
  }, [chain, walletAddress, nativeToken, isCreatingOnramp, createOnrampWidgetUrl, t]);

  const balanceUsd = formatAmountInUsd(summary?.balanceInUsd ?? "0");
  const profitUsdSign = bullish ? "+" : "";
  const profitUsdText = `${profitUsdSign}${formatAmountInUsd(
    Math.abs(totalProfitInUsd).toString(),
  )}`;
  const ratioText = formatPercent(Math.abs(totalProfitRatio));

  const disabled = !walletAddress;

  return (
    <div
      className={cn(
        "w-full flex flex-col gap-5",
        "p-5 lg:p-6 rounded-2xl border border-default-100 bg-content1",
      )}
    >
      {/* Identity + balance + PnL */}
      <div className="flex items-start gap-4 min-w-0">
        <PortfolioGradientAvatar
          seed={walletAddress || "anonymous"}
          size={56}
          className="rounded-2xl"
        />

        <div className="flex flex-col min-w-0 flex-1 gap-2">
          {/* Address + copy */}
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="text-xs font-medium text-text-muted tabular-nums">
              {walletAddress ? truncateAddress(walletAddress) : "—"}
            </span>
            {walletAddress && (
              <Tooltip
                content={copied ? t("portfolio.copied") : t("portfolio.copyAddress")}
                placement="top"
                size="sm"
              >
                <button
                  type="button"
                  className="p-1 rounded hover:bg-default-100 text-text-muted hover:text-foreground transition-colors cursor-pointer"
                  aria-label={t("portfolio.copyAddress")}
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
              </Tooltip>
            )}

            <button
              type="button"
              onClick={() => refetchSummary()}
              aria-label={t("portfolio.refresh")}
              className="ml-auto shrink-0 rounded-md p-1.5 text-text-muted transition-colors hover:bg-default-100 hover:text-foreground cursor-pointer"
            >
              <RefreshIcon width={14} height={14} className={cn(isFetching && "animate-spin")} />
            </button>
          </div>

          <span className="text-3xl font-semibold leading-none text-foreground tabular-nums lg:text-4xl">
            {balanceUsd}
          </span>

          {/* The period change is supporting information, so keeping it
              below the headline preserves a clear reading order. */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm leading-none">
            <span
              className={cn(
                "tabular-nums font-medium",
                bullish ? "text-positive" : "text-negative",
              )}
            >
              {profitUsdText}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 tabular-nums",
                bullish ? "text-positive" : "text-negative",
              )}
            >
              {bullish ? (
                <TriangleUpIcon width={10} height={10} />
              ) : (
                <TriangleDownIcon width={10} height={10} />
              )}
              {ratioText}
            </span>
            <span className="text-xs text-text-muted">({t("extend.common.time.24h")})</span>
          </div>
        </div>
      </div>

      {/* The chart determines this row's height on desktop. `mt-auto`
          intentionally consumes the remaining space above the actions,
          distributing the card's whitespace instead of leaving a dead
          area below the controls. */}
      <div className="mt-auto grid grid-cols-3 gap-2 pt-2">
        <ActionButton
          icon={<ReceiveOutlinedIcon width={18} height={18} />}
          label={t("account.receive")}
          onClick={() => openReceive()}
          disabled={disabled}
        />
        <ActionButton
          icon={<SendOutlinedIcon width={18} height={18} />}
          label={t("account.withdraw")}
          onClick={() => openWithdraw()}
          disabled={disabled}
        />
        <ActionButton
          icon={<CashInOutlinedIcon width={18} height={18} />}
          label={t("account.add_cash")}
          onClick={handleAddCash}
          disabled={disabled || isCreatingOnramp}
        />
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Action chip used in the Portfolio header. Visually mirrors the wallet
 * dropdown's `WalletActionButton` (in `NewAppLayout`) — circular icon
 * cap + small label below — so the actions feel identical across both
 * surfaces.
 *
 * Background color: `bg-default-200` (and `bg-default-300` on hover).
 * `bg-default-100` (the lightest neutral) is too close to `bg-content1`
 * in the dark theme, leaving the circle nearly invisible against the
 * card. The dropdown's `WalletActionButton` uses `bg-surface-strong/60` for
 * the same reason — we use the equivalent HeroUI token so the contrast
 * holds across themes.
 */
function ActionButton({ icon, label, onClick, disabled }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex min-w-0 flex-col items-center gap-2 rounded-xl px-3 py-2 cursor-pointer group",
        "transition-colors hover:bg-default-50 focus-visible:bg-default-50",
        "disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-default-200 text-text-muted transition-colors group-hover:bg-default-300 group-hover:text-foreground">
        {icon}
      </span>
      <span className="text-xs text-text-muted group-hover:text-foreground transition-colors whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}
