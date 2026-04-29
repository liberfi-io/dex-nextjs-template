"use client";

/**
 * Deposit Hyperliquid USDC modal — Solana SOL → Hyperliquid Perp USDC.
 *
 * Custom swap-style form (Converting / Gaining cards) wired to the SDK's
 * deposit hooks:
 *
 *   - Recipient is auto-derived from the connected EVM wallet — never shown.
 *   - Amount input debounces into `usePerpDepositQuote`; the "Confirm"
 *     button stays disabled until a fresh quote is ready, and the quote's
 *     output amount + rate render inline as preview info.
 *   - Confirm goes straight to sign + submit (no separate preview modal).
 *   - The SDK's `DepositStatusUI` pops on top of this modal once the
 *     deposit has been submitted, showing progress + final result.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash-es";
import { useTranslation } from "@liberfi.io/i18n";
import {
  ModalContent,
  SolanaIcon,
  Spinner,
  StyledModal,
  XCloseIcon,
  cn,
} from "@liberfi.io/ui";
import {
  AsyncModal,
  type RenderAsyncModalProps,
} from "@liberfi.io/ui-scaffold";
import {
  useAuth,
  useConnectedWallet,
  useWallets,
  type EvmWalletAdapter,
} from "@liberfi.io/wallet-connector";
import { Chain } from "@liberfi.io/types";
import {
  DepositStatusUI,
  lamportsToSol,
  microUsdcToUsdc,
  solToLamports,
  usePerpDepositClient,
  usePerpDepositExecute,
  usePerpDepositQuote,
  usePerpDepositStatus,
  type DepositQuoteRequest,
  type DepositSource,
} from "@liberfi.io/ui-perpetuals";

import { HyperliquidUsdcIcon } from "../icons/HyperliquidUsdcIcon";
import { useSolBalance } from "../../hooks/useSolBalance";
import { useHyperliquidBalances } from "../../hooks/useHyperliquidBalances";

export const DEPOSIT_HL_USDC_MODAL_ID = "deposit-hyperliquid-usdc";

const SOLSCAN_TX = "https://solscan.io/tx";
const HL_SCAN_TX = "https://app.hyperliquid.xyz/explorer/tx";
const DEPOSIT_SOURCE: DepositSource = "dex";

export function DepositHyperliquidUsdcModal() {
  return (
    <AsyncModal id={DEPOSIT_HL_USDC_MODAL_ID}>
      {(props) => <Body {...props} />}
    </AsyncModal>
  );
}

function Body({ isOpen, onOpenChange, onClose }: RenderAsyncModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const sol = useConnectedWallet(Chain.SOLANA);
  const wallets = useWallets();
  const evm = useMemo(
    () =>
      wallets.find((w) => w.chainNamespace === "EVM") as
        | EvmWalletAdapter
        | undefined,
    [wallets],
  );

  // The deposit client is provided by `PerpetualsProvider` upstream. If
  // the consumer didn't wire one (env var missing in production), fall
  // back to an inline "needs config" state instead of throwing.
  const depositClient = useSafePerpDepositClient();

  const solBalance = useSolBalance(sol?.address);
  const hlBalances = useHyperliquidBalances(evm?.address);

  // Two-tier amount state: `inputValue` keeps the raw text the user typed
  // (so the field is responsive); `committedAmount` is the debounced
  // value that drives the quote query.
  const [inputValue, setInputValue] = useState("");
  const [committedAmount, setCommittedAmount] = useState("");

  const debouncedSetCommitted = useMemo(
    () => debounce((v: string) => setCommittedAmount(v), 350),
    [],
  );
  useEffect(() => () => debouncedSetCommitted.cancel(), [debouncedSetCommitted]);

  const handleAmountChange = useCallback(
    (raw: string) => {
      const cleaned = raw.replace(/[^0-9.]/g, "");
      setInputValue(cleaned);
      debouncedSetCommitted(cleaned);
    },
    [debouncedSetCommitted],
  );

  const handleMax = useCallback(() => {
    if (!solBalance.lamports || solBalance.lamports === "0") return;
    const max = lamportsToSol(solBalance.lamports, 9);
    setInputValue(max);
    setCommittedAmount(max);
  }, [solBalance.lamports]);

  const handleHalf = useCallback(() => {
    if (!solBalance.lamports || solBalance.lamports === "0") return;
    const halfLamports = (BigInt(solBalance.lamports) / 2n).toString();
    const half = lamportsToSol(halfLamports, 9);
    setInputValue(half);
    setCommittedAmount(half);
  }, [solBalance.lamports]);

  // Local validation — gates the quote query and the Confirm button.
  const amountError = useMemo<string | undefined>(() => {
    const amt = committedAmount.trim();
    if (!amt) return undefined;
    if (!/^\d+(\.\d+)?$/.test(amt)) return t("extend.hlDeposit.errorInvalid");
    if (Number(amt) <= 0) return t("extend.hlDeposit.errorInvalid");
    if (
      solBalance.lamports &&
      solBalance.lamports !== "0" &&
      BigInt(solToLamports(amt)) > BigInt(solBalance.lamports)
    ) {
      return t("extend.hlDeposit.errorInsufficient");
    }
    return undefined;
  }, [committedAmount, solBalance.lamports, t]);

  const grossLamports = useMemo(
    () => (committedAmount && !amountError ? solToLamports(committedAmount) : ""),
    [committedAmount, amountError],
  );

  const quoteReq = useMemo<DepositQuoteRequest | null>(() => {
    if (!grossLamports || grossLamports === "0") return null;
    if (!sol?.address || !evm?.address) return null;
    return {
      userSolanaAddress: sol.address,
      hyperliquidRecipient: evm.address,
      grossLamports,
      source: DEPOSIT_SOURCE,
    };
  }, [grossLamports, sol?.address, evm?.address]);

  const quoteQ = usePerpDepositQuote(quoteReq, {
    enabled: Boolean(quoteReq) && Boolean(depositClient),
  });

  const { state, execute, reset, dispatch } = usePerpDepositExecute(
    useCallback(
      async (b64: string) => {
        if (!sol) throw new Error("Solana wallet not connected");
        return sol.sendTransaction(base64ToBytes(b64));
      },
      [sol],
    ),
  );

  // Forward backend status into the FSM so the status modal advances.
  const intentId =
    state.phase === "submitted" ||
    state.phase === "tracking" ||
    state.phase === "succeeded" ||
    state.phase === "refunded" ||
    state.phase === "failed"
      ? state.intentId
      : undefined;
  const statusQ = usePerpDepositStatus(intentId, {
    enabled:
      Boolean(intentId) &&
      state.phase !== "succeeded" &&
      state.phase !== "refunded" &&
      state.phase !== "failed",
  });
  useEffect(() => {
    if (statusQ.data) dispatch({ type: "STATUS_UPDATE", status: statusQ.data });
  }, [statusQ.data, dispatch]);

  // ---------------------------------------------------------------------
  // Quote-driven preview values
  // ---------------------------------------------------------------------
  const quote = quoteQ.data;
  const gainingAmount = useMemo(() => {
    if (!quote?.breakdown.expectedOutputUSDC) return "0";
    return microUsdcToUsdc(quote.breakdown.expectedOutputUSDC, 4);
  }, [quote]);

  // USD value of the input — since 1 USDC ≈ $1 we re-use the expected
  // output as a free approximation. Hidden when there's no quote yet.
  const usdValue = useMemo(() => {
    if (!quote?.breakdown.expectedOutputUSDC) return null;
    return microUsdcToUsdc(quote.breakdown.expectedOutputUSDC, 2);
  }, [quote]);

  // Rate displayed under the gaining card — "1 SOL ≈ X USDC".
  const rateText = useMemo(() => {
    if (!quote?.breakdown.expectedOutputUSDC) return null;
    const grossSol = lamportsToSol(quote.breakdown.grossLamports, 9);
    const expectedUsdc = microUsdcToUsdc(quote.breakdown.expectedOutputUSDC, 6);
    const grossSolNum = Number(grossSol);
    const expectedUsdcNum = Number(expectedUsdc);
    if (!grossSolNum || !expectedUsdcNum) return null;
    const rate = expectedUsdcNum / grossSolNum;
    return rate.toFixed(2);
  }, [quote]);

  // ---------------------------------------------------------------------
  // Submit handler — Confirm goes straight to sign + submit.
  // ---------------------------------------------------------------------
  const handleSubmit = useCallback(async () => {
    if (!quoteQ.data || !sol || !evm) return;
    // Move the FSM through quoting → ready_to_sign so SIGN_START is valid.
    dispatch({ type: "QUOTE_REQUEST" });
    dispatch({ type: "QUOTE_RECEIVED", quote: quoteQ.data });
    try {
      await execute({
        quote: quoteQ.data,
        userSolanaAddress: sol.address,
        hyperliquidRecipient: evm.address,
        userId: user?.id ?? sol.address,
        source: DEPOSIT_SOURCE,
      });
    } catch {
      // FSM already transitioned to `failed` — nothing else to do here.
    }
  }, [quoteQ.data, sol, evm, user?.id, dispatch, execute]);

  // ---------------------------------------------------------------------
  // Lifecycle: on close, reset both UI + FSM so the next open is fresh.
  // ---------------------------------------------------------------------
  const handleClose = useCallback(() => {
    onOpenChange(false);
    onClose?.();
    setInputValue("");
    setCommittedAmount("");
    reset();
  }, [onOpenChange, onClose, reset]);

  const handleStatusClose = useCallback(() => {
    reset();
    handleClose();
  }, [reset, handleClose]);

  // ---------------------------------------------------------------------
  // Visual gating
  // ---------------------------------------------------------------------
  const blocked = !depositClient
    ? t("extend.hlDeposit.needsConfig")
    : !sol
      ? t("extend.hlDeposit.needsSolWallet")
      : !evm
        ? t("extend.hlDeposit.needsEvmWallet")
        : null;

  const isExecuting =
    state.phase === "signing" || state.phase === "broadcasting";
  const showStatus =
    state.phase === "submitted" ||
    state.phase === "tracking" ||
    state.phase === "succeeded" ||
    state.phase === "refunded" ||
    (state.phase === "failed" && Boolean(state.intentId));

  const confirmDisabled =
    Boolean(blocked) ||
    Boolean(amountError) ||
    !quoteReq ||
    !quoteQ.data ||
    quoteQ.isFetching ||
    isExecuting;

  const confirmLabelText = (() => {
    if (isExecuting) return t("extend.hlDeposit.signing");
    if (quoteQ.isFetching && committedAmount) {
      return t("extend.hlDeposit.fetchingQuote");
    }
    if (!committedAmount) return t("extend.hlDeposit.enterAmount");
    if (!quoteQ.data) return t("extend.hlDeposit.waitingQuote");
    return t("extend.hlDeposit.confirm");
  })();

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------
  return (
    <>
      <StyledModal
        isOpen={isOpen && !showStatus}
        onOpenChange={(next) => !next && handleClose()}
        size="md"
        hideCloseButton
        backdrop="blur"
        classNames={{
          base: "!bg-[#18181b] !rounded-[14px] !border !border-[rgba(39,39,42,1)] !shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-w-[420px]",
          body: "!p-0",
        }}
      >
        <ModalContent>
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-5 pb-2">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-9 h-9 rounded-[12px] bg-[#97FCE4]/10">
                  <HyperliquidUsdcIcon size={22} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {t("extend.hlDeposit.title")}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {t("extend.hlDeposit.exchangeSubtitle")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 rounded-[10px] hover:bg-[rgba(39,39,42,0.5)] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <XCloseIcon width={16} height={16} />
              </button>
            </div>

            {blocked ? (
              <div className="px-5 pb-5 pt-2">
                <div className="rounded-[10px] border border-amber-500/20 bg-amber-500/5 px-4 py-6 text-sm text-amber-300">
                  {blocked}
                </div>
              </div>
            ) : (
              <div className="px-5 pb-5 pt-2">
                {/* Converting card */}
                <ExchangeCard
                  label={t("extend.hlDeposit.converting")}
                  balanceLabel={t("extend.hlDeposit.balance")}
                  balanceValue={solBalance.sol || "0"}
                  amountInput={
                    <input
                      type="text"
                      inputMode="decimal"
                      value={inputValue}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="0.0"
                      disabled={isExecuting}
                      className={cn(
                        "w-full bg-transparent border-0 outline-none text-3xl font-medium text-white placeholder:text-zinc-600 tabular-nums",
                        "disabled:opacity-60",
                      )}
                    />
                  }
                  tokenChip={<TokenChip icon={<SolCoinBadge />} symbol="SOL" />}
                  belowSlot={
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                        <button
                          type="button"
                          onClick={handleHalf}
                          disabled={!solBalance.lamports || solBalance.lamports === "0" || isExecuting}
                          className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider text-zinc-400 hover:text-[#c7ff2e] hover:bg-zinc-800/60 transition-colors disabled:opacity-50 disabled:hover:text-zinc-400 disabled:hover:bg-transparent"
                        >
                          50%
                        </button>
                        <button
                          type="button"
                          onClick={handleMax}
                          disabled={!solBalance.lamports || solBalance.lamports === "0" || isExecuting}
                          className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider text-zinc-400 hover:text-[#c7ff2e] hover:bg-zinc-800/60 transition-colors disabled:opacity-50 disabled:hover:text-zinc-400 disabled:hover:bg-transparent"
                        >
                          {t("extend.hlDeposit.max")}
                        </button>
                      </div>
                      <span className="text-[11px] text-zinc-500 tabular-nums">
                        {usdValue ? `(${`$${usdValue}`})` : "\u00A0"}
                      </span>
                    </div>
                  }
                />

                {/* Direction divider */}
                <div className="relative -my-2 flex items-center justify-center pointer-events-none">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-zinc-800/0" />
                  <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[#27272a] border-2 border-[#18181b] text-zinc-300">
                    <SwapArrowIcon />
                  </div>
                </div>

                {/* Gaining card */}
                <ExchangeCard
                  label={t("extend.hlDeposit.gaining")}
                  balanceLabel={t("extend.hlDeposit.balance")}
                  balanceValue={evm ? formatHlUsdc(hlBalances.perpUsdc) : "—"}
                  amountInput={
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-medium text-white tabular-nums">
                        {gainingAmount}
                      </span>
                      {quoteQ.isFetching && Boolean(quoteReq) && (
                        <Spinner size="sm" />
                      )}
                    </div>
                  }
                  tokenChip={<TokenChip icon={<HyperliquidUsdcIcon size={20} />} symbol="USDC" />}
                  belowSlot={
                    <div className="flex justify-end">
                      <span className="text-[11px] text-zinc-500 tabular-nums">
                        {rateText
                          ? t("extend.hlDeposit.rate", { rate: rateText })
                          : "\u00A0"}
                      </span>
                    </div>
                  }
                />

                {/* Inline errors */}
                {(amountError || quoteQ.error) && (
                  <p className="mt-3 text-xs text-rose-400">
                    {amountError ?? t("extend.hlDeposit.errorQuote")}
                  </p>
                )}

                {/* Confirm */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={confirmDisabled}
                  className={cn(
                    "mt-4 w-full h-12 rounded-[12px] font-medium text-white",
                    "bg-[#4338CA] hover:bg-[#3730A3] active:bg-[#312E81]",
                    "transition-colors flex items-center justify-center gap-2",
                    "disabled:bg-[#3f3f46] disabled:text-zinc-500 disabled:cursor-not-allowed",
                  )}
                >
                  {isExecuting && <Spinner size="sm" color="current" />}
                  {confirmLabelText}
                </button>
              </div>
            )}
          </div>
        </ModalContent>
      </StyledModal>

      {/* Status modal — pops on top once /submit returns. */}
      <DepositStatusUI
        isOpen={showStatus}
        phase={state.phase}
        status={
          state.phase === "tracking" ||
          state.phase === "succeeded" ||
          state.phase === "refunded"
            ? state.status
            : state.phase === "failed"
              ? state.status
              : undefined
        }
        solanaExplorerUrl={
          (state.phase === "tracking" ||
            state.phase === "succeeded" ||
            state.phase === "refunded" ||
            state.phase === "failed") &&
          state.status?.solanaTxHash
            ? `${SOLSCAN_TX}/${state.status.solanaTxHash}`
            : state.phase === "submitted"
              ? `${SOLSCAN_TX}/${state.solanaTxHash}`
              : undefined
        }
        hyperliquidExplorerUrl={
          (state.phase === "tracking" ||
            state.phase === "succeeded" ||
            state.phase === "refunded" ||
            state.phase === "failed") &&
          state.status?.hyperliquidTxHash
            ? `${HL_SCAN_TX}/${state.status.hyperliquidTxHash}`
            : undefined
        }
        onClose={handleStatusClose}
        errorMessage={
          state.phase === "failed" ? state.error.message : undefined
        }
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ExchangeCard({
  label,
  balanceLabel,
  balanceValue,
  amountInput,
  tokenChip,
  belowSlot,
}: {
  label: string;
  balanceLabel: string;
  balanceValue: string;
  amountInput: React.ReactNode;
  tokenChip: React.ReactNode;
  belowSlot: React.ReactNode;
}) {
  return (
    <div className="rounded-[12px] bg-[#0a0a0b] border border-[#27272a] px-3.5 py-3">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-zinc-500">{label}</span>
        <span className="text-zinc-500">
          {balanceLabel}{" "}
          <span className="text-[#4A8FFF] tabular-nums">{balanceValue}</span>
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="flex-1 min-w-0">{amountInput}</div>
        <div className="shrink-0">{tokenChip}</div>
      </div>
      <div className="mt-1.5">{belowSlot}</div>
    </div>
  );
}

function TokenChip({
  icon,
  symbol,
}: {
  icon: React.ReactNode;
  symbol: string;
}) {
  return (
    <div className="flex items-center gap-1.5 h-8 pl-1.5 pr-2.5 rounded-full bg-[#27272a] border border-[#3f3f46]">
      {icon}
      <span className="text-sm font-medium text-white">{symbol}</span>
    </div>
  );
}

function SolCoinBadge() {
  return (
    <div
      className="flex items-center justify-center w-5 h-5 rounded-full bg-black"
      aria-hidden="true"
    >
      <SolanaIcon width={14} height={14} />
    </div>
  );
}

function SwapArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 10l5 -5 5 5" />
      <path d="M7 14l5 5 5 -5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wrap `usePerpDepositClient` so the modal renders an inline "not
 * configured" message instead of throwing when the consumer didn't pass
 * a `depositClient` to `PerpetualsProvider`.
 */
function useSafePerpDepositClient() {
  try {
    return usePerpDepositClient();
  } catch {
    return undefined;
  }
}

function base64ToBytes(b64: string): Uint8Array {
  if (typeof atob === "function") {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

function formatHlUsdc(s: string): string {
  const n = Number(s);
  if (!Number.isFinite(n) || n === 0) return "0.00";
  if (n < 0.01) return n.toFixed(6);
  return n.toFixed(3);
}

export default DepositHyperliquidUsdcModal;
