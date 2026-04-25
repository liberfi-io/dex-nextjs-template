"use client";

/**
 * SOL → Hyperliquid Perp USDC deposit modal.
 *
 * Drives the three-step flow from `useSolToPerpDeposit`:
 *   1. Convert SOL via Hyperunit.
 *   2. Sign the USOL → USDC IoC sell on the Hyperliquid spot book.
 *   3. Sign the spot → perp `usdClassTransfer`.
 *
 * The user types one number (the SOL amount).  Everything downstream
 * (deposit address, mid price, USOL/USDC swap size, spot USDC delta) is
 * resolved from server queries — no persistent state.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@liberfi.io/i18n";
import { Chain } from "@liberfi.io/types";
import {
  ModalContent,
  StyledModal,
  SolanaIcon,
  XCloseIcon,
  cn,
} from "@liberfi.io/ui";
import {
  AsyncModal,
  type RenderAsyncModalProps,
} from "@liberfi.io/ui-scaffold";
import { useAccountInfo } from "@liberfi.io/ui-portfolio";
import {
  useConnectedWallet,
  useWallets,
  type EvmWalletAdapter,
} from "@liberfi.io/wallet-connector";

import { HyperliquidUsdcIcon } from "../icons/HyperliquidUsdcIcon";
import { useSolToPerpDeposit } from "../../hooks/useSolToPerpDeposit";

export const SOL_TO_PERP_DEPOSIT_MODAL_ID = "sol-to-perp-deposit";

const MIN_DEPOSIT_SOL = 0.12;

export type SolToPerpDepositParams = {
  /** Optional pre-fill (SOL string). */
  initialAmount?: string;
};

export function SolToPerpDepositModal() {
  return (
    <AsyncModal<SolToPerpDepositParams> id={SOL_TO_PERP_DEPOSIT_MODAL_ID}>
      {(props) => <Body {...props} />}
    </AsyncModal>
  );
}

function Body({
  isOpen,
  onOpenChange,
  onClose,
  params,
}: RenderAsyncModalProps<SolToPerpDepositParams>) {
  const { t } = useTranslation();

  const wallets = useWallets();
  const evmAdapter = useMemo(
    () =>
      wallets.find((w) => w.chainNamespace === "EVM") as
        | EvmWalletAdapter
        | undefined,
    [wallets],
  );
  const solanaWallet = useConnectedWallet(Chain.SOLANA);
  const hlEvmAddress = evmAdapter?.address;

  const { balanceNativeFormatted, nativeToken } = useAccountInfo();
  const solBalanceText =
    nativeToken?.symbol === "SOL" ? balanceNativeFormatted : undefined;

  const deposit = useSolToPerpDeposit({
    hlEvmAddress,
    solanaAdapter: solanaWallet ?? null,
    evmAdapter: evmAdapter ?? null,
    solBalance: solBalanceText,
  });

  const [amount, setAmount] = useState<string>(params?.initialAmount ?? "");

  useEffect(() => {
    if (isOpen) {
      // Reset transient flow state every time the modal is reopened.
      deposit.reset();
      setAmount(params?.initialAmount ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const numericAmount = Number(amount);
  const quote = deposit.estimateForInput(
    Number.isFinite(numericAmount) ? numericAmount : 0,
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
    onClose?.();
  }, [onOpenChange, onClose]);

  const action = pickAction({
    phase: deposit.phase,
    amount: numericAmount,
    solBalance: parseSolBalance(solBalanceText),
    hasEvm: Boolean(hlEvmAddress),
    hasSolana: Boolean(solanaWallet),
    isSendingSol: deposit.isSendingSol,
    isSigningSwap: deposit.isSigningSwap,
    isSigningTransfer: deposit.isSigningTransfer,
  });

  const onClickConfirm = useCallback(async () => {
    switch (action.kind) {
      case "send":
        return deposit.sendSol(numericAmount);
      case "swap":
        return deposit.signSwap();
      case "transfer":
        return deposit.signTransfer();
      case "done":
        return handleClose();
      default:
        return undefined;
    }
  }, [
    action.kind,
    deposit,
    numericAmount,
    handleClose,
  ]);

  const balanceSolDisplay = solBalanceText ?? "—";

  return (
    <StyledModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="sm"
      isDismissable={!deposit.isSendingSol && !deposit.isSigningSwap && !deposit.isSigningTransfer}
      hideCloseButton
      backdrop="blur"
      classNames={{
        base: "!bg-[#18181b] !rounded-[14px] !border !border-[rgba(39,39,42,1)] !shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-w-[420px]",
        body: "!p-0",
      }}
    >
      <ModalContent>
        <div className="flex flex-col">
          <div className="flex items-start justify-between px-5 pt-5 pb-2">
            <div>
              <h3 className="text-base font-semibold text-white">
                {t("extend.hlDeposit.title")}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                {t("extend.hlDeposit.subtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-[10px] hover:bg-[rgba(39,39,42,0.5)] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <XCloseIcon width={16} height={16} />
            </button>
          </div>

          <div className="px-5 pb-5 pt-3 flex flex-col gap-2">
            <ConvertingCard
              amount={amount}
              onAmount={setAmount}
              usdEstimate={quote.expectedUsdc}
              balanceText={balanceSolDisplay || "—"}
              t={t}
              disabled={
                deposit.phase !== "idle" &&
                deposit.phase !== "error" &&
                deposit.phase !== "done"
              }
            />

            <div className="flex items-center justify-center -my-2 z-[1] relative">
              <div className="w-9 h-9 rounded-full bg-[#18181b] border-2 border-[#0a0a0b] flex items-center justify-center text-zinc-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m17 3 4 4-4 4" />
                  <path d="M21 7H9" />
                  <path d="m7 21-4-4 4-4" />
                  <path d="M15 17H3" />
                </svg>
              </div>
            </div>

            <GainingCard
              amount={quote.expectedUsdc}
              perpUsdc={deposit.perpUsdc}
              t={t}
            />

            <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 px-1">
              <span>
                {t("extend.hlDeposit.rate", {
                  rate:
                    deposit.midPrice && deposit.midPrice > 0
                      ? deposit.midPrice.toFixed(2)
                      : "—",
                })}
              </span>
              <span>
                {t("extend.hlDeposit.minAmount", {
                  min: MIN_DEPOSIT_SOL,
                })}
              </span>
            </div>

            {deposit.error && (
              <div className="rounded-[10px] bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-300">
                {deposit.error}
              </div>
            )}

            {deposit.phase === "detecting" && (
              <div className="rounded-[10px] bg-zinc-800/40 border border-zinc-700/40 px-3 py-2 text-xs text-zinc-400">
                {t("extend.hlDeposit.detectingDescription")}
              </div>
            )}

            <button
              type="button"
              disabled={action.disabled}
              onClick={onClickConfirm}
              className={cn(
                "mt-2 w-full h-11 rounded-[12px] text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                action.disabled
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-[#c7ff2e] text-zinc-900 hover:bg-[#b6ed1d] cursor-pointer",
              )}
            >
              {action.spinner && (
                <span className="inline-block w-3 h-3 border-[2px] border-current border-t-transparent rounded-full animate-spin" />
              )}
              {action.labelParams
                ? // i18next's TFunction has typed keys; widen for our dynamic key/params.
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (t as any)(action.labelKey, action.labelParams)
                : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (t as any)(action.labelKey)}
            </button>
          </div>
        </div>
      </ModalContent>
    </StyledModal>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ActionKind = "send" | "swap" | "transfer" | "done" | "noop";

type Action = {
  kind: ActionKind;
  labelKey: string;
  labelParams?: Record<string, string | number>;
  disabled: boolean;
  spinner: boolean;
};

function pickAction(args: {
  phase: ReturnType<typeof useSolToPerpDeposit>["phase"];
  amount: number;
  solBalance: number | null;
  hasEvm: boolean;
  hasSolana: boolean;
  isSendingSol: boolean;
  isSigningSwap: boolean;
  isSigningTransfer: boolean;
}): Action {
  const {
    phase,
    amount,
    solBalance,
    hasEvm,
    hasSolana,
    isSendingSol,
    isSigningSwap,
    isSigningTransfer,
  } = args;

  if (!hasEvm) {
    return {
      kind: "noop",
      labelKey: "extend.hlDeposit.noEvmWallet",
      disabled: true,
      spinner: false,
    };
  }
  if (!hasSolana) {
    return {
      kind: "noop",
      labelKey: "extend.hlDeposit.noSolanaWallet",
      disabled: true,
      spinner: false,
    };
  }

  if (phase === "detecting") {
    return {
      kind: "noop",
      labelKey: "extend.hlDeposit.detecting",
      disabled: true,
      spinner: true,
    };
  }
  if (phase === "swapping") {
    return {
      kind: "noop",
      labelKey: "extend.hlDeposit.swapping",
      disabled: true,
      spinner: true,
    };
  }
  if (phase === "transferring") {
    return {
      kind: "noop",
      labelKey: "extend.hlDeposit.transferring",
      disabled: true,
      spinner: true,
    };
  }
  if (phase === "ready_swap") {
    return {
      kind: "swap",
      labelKey: "extend.hlDeposit.swap",
      disabled: false,
      spinner: false,
    };
  }
  if (phase === "ready_transfer") {
    return {
      kind: "transfer",
      labelKey: "extend.hlDeposit.transfer",
      disabled: false,
      spinner: false,
    };
  }
  if (phase === "done") {
    return {
      kind: "done",
      labelKey: "extend.hlDeposit.done",
      disabled: false,
      spinner: false,
    };
  }

  // idle / error
  if (isSendingSol) {
    return {
      kind: "noop",
      labelKey: "extend.hlDeposit.sending",
      disabled: true,
      spinner: true,
    };
  }
  if (isSigningSwap || isSigningTransfer) {
    return {
      kind: "noop",
      labelKey: "extend.hlDeposit.confirm",
      disabled: true,
      spinner: true,
    };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      kind: "noop",
      labelKey: "extend.hlDeposit.confirm",
      disabled: true,
      spinner: false,
    };
  }
  if (amount < MIN_DEPOSIT_SOL) {
    return {
      kind: "noop",
      labelKey: "extend.hlDeposit.minAmount",
      labelParams: { min: MIN_DEPOSIT_SOL },
      disabled: true,
      spinner: false,
    };
  }
  if (solBalance !== null && amount > solBalance) {
    return {
      kind: "noop",
      labelKey: "extend.hlDeposit.insufficient",
      disabled: true,
      spinner: false,
    };
  }
  return {
    kind: "send",
    labelKey: "extend.hlDeposit.confirm",
    disabled: false,
    spinner: false,
  };
}

function parseSolBalance(s: string | undefined): number | null {
  if (!s) return null;
  const cleaned = s.replace(/[^0-9.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function ConvertingCard({
  amount,
  onAmount,
  usdEstimate,
  balanceText,
  t,
  disabled,
}: {
  amount: string;
  onAmount: (v: string) => void;
  usdEstimate: number;
  balanceText: string;
  t: ReturnType<typeof useTranslation>["t"];
  disabled: boolean;
}) {
  return (
    <div className="rounded-[14px] bg-[#0a0a0b] border border-[rgba(39,39,42,0.8)] px-4 py-3">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{t("extend.hlDeposit.converting")}</span>
        <span>
          {t("extend.hlDeposit.balance", { value: balanceText })}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          disabled={disabled}
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            const v = e.target.value.replace(/[^0-9.]/g, "");
            onAmount(v);
          }}
          className="bg-transparent text-2xl font-semibold text-white tabular-nums w-full outline-none placeholder:text-zinc-700 disabled:opacity-50"
        />
        <div className="flex items-center gap-2 shrink-0 rounded-full bg-[rgba(39,39,42,0.7)] px-3 py-1.5">
          <SolanaIcon width={18} height={18} />
          <span className="text-sm font-medium text-zinc-100">SOL</span>
        </div>
      </div>
      <div className="mt-1 text-[11px] text-zinc-500 tabular-nums">
        ${formatUsd(usdEstimate)}
      </div>
    </div>
  );
}

function GainingCard({
  amount,
  perpUsdc,
  t,
}: {
  amount: number;
  perpUsdc: string;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <div className="rounded-[14px] bg-[#0a0a0b] border border-[rgba(39,39,42,0.8)] px-4 py-3">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{t("extend.hlDeposit.gaining")}</span>
        <span>
          {t("extend.hlDeposit.balance", {
            value: formatBalance(perpUsdc),
          })}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-2xl font-semibold text-white tabular-nums truncate">
          {amount > 0 ? amount.toFixed(2) : "0.00"}
        </span>
        <div className="flex items-center gap-2 shrink-0 rounded-full bg-[rgba(39,39,42,0.7)] px-3 py-1.5">
          <HyperliquidUsdcIcon size={18} />
          <span className="text-sm font-medium text-zinc-100">USDC</span>
        </div>
      </div>
      <div className="mt-1 text-[11px] text-zinc-500 tabular-nums">
        {t("extend.hlDeposit.usdcLabel")}
      </div>
    </div>
  );
}

function formatUsd(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0.00";
  return n.toFixed(2);
}

function formatBalance(s: string): string {
  const n = Number(s);
  if (!Number.isFinite(n)) return "0";
  if (n === 0) return "0";
  if (n < 0.01) return n.toFixed(6);
  return n.toFixed(2);
}

export default SolToPerpDepositModal;
