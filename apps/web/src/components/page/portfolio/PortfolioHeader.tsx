"use client";

import { useCallback, useState } from "react";
import { Tooltip } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import {
  cn,
  RefreshIcon,
  toast,
  TriangleDownIcon,
  TriangleUpIcon,
} from "@liberfi.io/ui";
import { useAsyncModal } from "@liberfi.io/ui-scaffold";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  useAccountInfo,
  useRefetchWalletSummary,
  useWalletSummary,
} from "@liberfi.io/ui-portfolio";
import { formatAmountInUsd, formatPercent, truncateAddress } from "@liberfi.io/utils";
import { useCreateOnrampWidgetUrlMutation } from "@liberfi/react-backend";
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
 *   - Balance + PnL: laid out on the same row (baseline-aligned) so the
 *     ratio reads as a price-tag suffix to the headline number — keeps
 *     the headline visually anchored and uses the available width.
 *   - Actions row: Receive / Send / Buy as circular icon buttons in a
 *     left-aligned cluster directly underneath the basic info. Mirrors
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
          toast.error(err.message || t("extend.account.add_cash_failed"));
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
        "w-full flex flex-col gap-4",
        "p-4 lg:p-5 rounded-2xl border border-default-100 bg-content1",
      )}
    >
      {/* Identity + balance + PnL */}
      <div className="flex items-start gap-4 min-w-0">
        <PortfolioGradientAvatar
          seed={walletAddress || "anonymous"}
          size={56}
          className="rounded-2xl"
        />

        <div className="flex flex-col min-w-0 flex-1 gap-1.5">
          {/* Address + copy */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-default-500 tabular-nums">
              {walletAddress ? truncateAddress(walletAddress) : "—"}
            </span>
            {walletAddress && (
              <Tooltip
                content={
                  copied
                    ? t("extend.portfolio.copied")
                    : t("extend.portfolio.copyAddress")
                }
                placement="top"
                size="sm"
              >
                <button
                  type="button"
                  className="p-1 rounded hover:bg-default-100 text-default-400 hover:text-foreground transition-colors cursor-pointer"
                  aria-label={t("extend.portfolio.copyAddress")}
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
          </div>

          {/* Balance + PnL grouped as a single unit (vertically
              centered so the small PnL chip sits on the headline's
              middle), refresh icon pushed to the far right via
              `ml-auto`. flex-wrap keeps the row from overflowing on
              ultra-narrow viewports. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-2xl lg:text-3xl font-semibold text-foreground tabular-nums leading-none">
              {balanceUsd}
            </span>

            {/* PnL — same row as balance. text-sm so it reads with the
                headline rather than as auxiliary metadata. */}
            <div className="flex items-center gap-1.5 text-sm leading-none">
              <span
                className={cn(
                  "tabular-nums font-medium",
                  bullish ? "text-bullish" : "text-bearish",
                )}
              >
                {profitUsdText}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 tabular-nums",
                  bullish ? "text-bullish" : "text-bearish",
                )}
              >
                {bullish ? (
                  <TriangleUpIcon width={10} height={10} />
                ) : (
                  <TriangleDownIcon width={10} height={10} />
                )}
                {ratioText}
              </span>
              <span className="text-xs text-default-400">
                ({t("extend.common.time.24h")})
              </span>
            </div>

            {/* Refresh — anchored to the far right of the row, isolated
                from the balance+PnL group so it reads as a side
                affordance rather than an inline chip. */}
            <button
              type="button"
              onClick={() => refetchSummary()}
              aria-label={t("extend.portfolio.refresh")}
              className="ml-auto p-1.5 rounded-md hover:bg-default-100 text-default-400 hover:text-foreground transition-colors cursor-pointer"
            >
              <RefreshIcon
                width={14}
                height={14}
                className={cn(isFetching && "animate-spin")}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Actions — circular cluster sitting directly below the basic
          info block. Uses `justify-around` so the three buttons are
          distributed evenly across the card's full width, mirroring
          the wallet dropdown's `WalletActionButton` row in
          `NewAppLayout`. New actions added later (Convert, Stake, …)
          slot in alongside without changing the surrounding layout. */}
      <div className="flex items-start justify-around">
        <ActionButton
          icon={<ReceiveOutlinedIcon width={18} height={18} />}
          label={t("extend.account.receive")}
          onClick={() => openReceive()}
          disabled={disabled}
        />
        <ActionButton
          icon={<SendOutlinedIcon width={18} height={18} />}
          label={t("extend.account.withdraw")}
          onClick={() => openWithdraw()}
          disabled={disabled}
        />
        <ActionButton
          icon={<CashInOutlinedIcon width={18} height={18} />}
          label={t("extend.account.add_cash")}
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
 * card. The dropdown's `WalletActionButton` uses `bg-zinc-700/60` for
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
        "flex flex-col items-center gap-1.5 px-3 py-1 cursor-pointer group rounded-lg",
        "disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      <span className="w-9 h-9 flex items-center justify-center rounded-full bg-default-200 text-default-600 group-hover:bg-default-300 group-hover:text-foreground transition-colors">
        {icon}
      </span>
      <span className="text-[11px] text-default-500 group-hover:text-foreground transition-colors whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}
