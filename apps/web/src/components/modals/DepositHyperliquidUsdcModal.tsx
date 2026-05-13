"use client";

/**
 * Deposit Hyperliquid USDC modal — multi-chain → Hyperliquid Perp USDC.
 *
 * Supports three origin assets:
 *   - Solana SOL  (chainId 792703809, namespace "solana")
 *   - Ethereum ETH (chainId 1,       namespace "evm")
 *   - BNB Chain BNB (chainId 56,     namespace "evm")
 *
 * Behaviour:
 *   - The origin defaults to the user's currently-active chain when the
 *     modal opens (from `useCurrentChain`). The user can swap with the
 *     inline dropdown.
 *   - Recipient is auto-derived from the connected EVM wallet — the
 *     Hyperliquid bridge always credits an EVM address regardless of
 *     origin chain.
 *   - Amount input debounces into `usePerpDepositQuote`; the "Confirm"
 *     button stays disabled until a fresh quote is ready, and the quote's
 *     output amount + rate render inline as preview info.
 *   - Confirm goes straight to sign + submit (no separate preview modal).
 *     For EVM origins the SDK hook owns the chain-switch lifecycle (it
 *     switches the wallet to the origin chain before sending and restores
 *     the previous chain in a `finally` block).
 *   - The SDK's `DepositStatusUI` pops on top of this modal once the
 *     deposit has been submitted, showing progress + final result.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "lodash-es";
import { formatUnits, parseUnits } from "viem";
import { useTranslation } from "@liberfi/ui-base";
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
} from "@liberfi.io/wallet-connector";
import { Chain } from "@liberfi.io/types";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  DepositStatusUI,
  hlUsdcRawToUsdc,
  usePerpDepositClient,
  usePerpDepositExecute,
  usePerpDepositQuote,
  usePerpDepositStatus,
  type DepositQuoteRequest,
  type DepositSigners,
  type DepositSource,
  type EvmDepositAdapter,
} from "@liberfi.io/ui-perpetuals";
import type { PrivyEvmWalletAdapter } from "@liberfi.io/wallet-connector-privy";

import { HyperliquidUsdcIcon } from "../icons/HyperliquidUsdcIcon";
import { useSolBalance } from "../../hooks/useSolBalance";
import {
  useEvmNativeBalance,
  type EvmNativeChain,
} from "../../hooks/useEvmNativeBalance";
import { useHyperliquidBalances } from "../../hooks/useHyperliquidBalances";

export const DEPOSIT_HL_USDC_MODAL_ID = "deposit-hyperliquid-usdc";

const HL_SCAN_TX = "https://app.hyperliquid.xyz/explorer/tx";
const DEPOSIT_SOURCE: DepositSource = "dex";

// ---------------------------------------------------------------------------
// Origin definitions — single source of truth for every per-chain difference
// the modal needs to handle (decimals, chain id, explorer, default selector).
// ---------------------------------------------------------------------------

type OriginNamespace = "solana" | "evm";

interface OriginOption {
  id: "sol" | "eth" | "bnb";
  /** LiberFi chain enum, used by useCurrentChain comparisons. */
  chain: Chain;
  /** Relay/perpetuals-server chain id. */
  chainId: number;
  namespace: OriginNamespace;
  symbol: string;
  /** Native-token decimals (lamports = 9, wei = 18). */
  decimals: number;
  label: string;
  explorerTxPrefix: string;
  /** Maps to the /api/balance `chain` query param when EVM. */
  evmBalanceChain?: EvmNativeChain;
}

const ORIGIN_SOL: OriginOption = {
  id: "sol",
  chain: Chain.SOLANA,
  chainId: 792703809,
  namespace: "solana",
  symbol: "SOL",
  decimals: 9,
  label: "Solana",
  explorerTxPrefix: "https://solscan.io/tx",
};

const ORIGIN_ETH: OriginOption = {
  id: "eth",
  chain: Chain.ETHEREUM,
  chainId: 1,
  namespace: "evm",
  symbol: "ETH",
  decimals: 18,
  label: "Ethereum",
  explorerTxPrefix: "https://etherscan.io/tx",
  evmBalanceChain: "eth",
};

const ORIGIN_BNB: OriginOption = {
  id: "bnb",
  chain: Chain.BINANCE,
  chainId: 56,
  namespace: "evm",
  symbol: "BNB",
  decimals: 18,
  label: "BNB Chain",
  explorerTxPrefix: "https://bscscan.com/tx",
  evmBalanceChain: "bnb",
};

const ORIGIN_OPTIONS: readonly OriginOption[] = [
  ORIGIN_SOL,
  ORIGIN_ETH,
  ORIGIN_BNB,
] as const;

// Inline style mirrored from `ChainSelectDropdown` in NewAppLayout so the
// origin selector and the header's chain selector share the exact same
// surface — radius, background, border, and shadow.
const DROPDOWN_STYLE: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(39,39,42,1)",
  background: "rgba(24,24,27,1)",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
};

function pickDefaultOrigin(chain: Chain | undefined): OriginOption {
  switch (chain) {
    case Chain.ETHEREUM:
      return ORIGIN_ETH;
    case Chain.BINANCE:
      return ORIGIN_BNB;
    case Chain.SOLANA:
    default:
      return ORIGIN_SOL;
  }
}

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
  const { chain: activeChain } = useCurrentChain();
  const sol = useConnectedWallet(Chain.SOLANA);
  const wallets = useWallets();
  const evm = useMemo(
    () =>
      wallets.find((w) => w.chainNamespace === "EVM") as unknown as
        | PrivyEvmWalletAdapter
        | undefined,
    [wallets],
  );

  // The deposit client is provided by `PerpetualsProvider` upstream. If
  // the consumer didn't wire one (env var missing in production), fall
  // back to an inline "needs config" state instead of throwing.
  const depositClient = useSafePerpDepositClient();

  // Origin selection — defaults to the user's currently active chain.
  // The default is re-applied every time the modal transitions from
  // closed to open so opening from a different page picks the latest
  // active chain rather than the last selection.
  const [origin, setOrigin] = useState<OriginOption>(() =>
    pickDefaultOrigin(activeChain),
  );
  const wasOpen = useRef(false);
  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setOrigin(pickDefaultOrigin(activeChain));
    }
    wasOpen.current = isOpen;
  }, [isOpen, activeChain]);

  // Balances — only the hook matching the current origin is "enabled";
  // the other returns immediately from its disabled default and avoids
  // wasted RPC calls.
  const solBalance = useSolBalance(
    origin.namespace === "solana" ? sol?.address : undefined,
  );
  const evmBalance = useEvmNativeBalance({
    chain: origin.evmBalanceChain ?? "eth",
    address: origin.namespace === "evm" ? evm?.address : undefined,
  });
  const hlBalances = useHyperliquidBalances(evm?.address);

  // Address paid in from depends on origin family.
  const userAddress = useMemo(() => {
    if (origin.namespace === "solana") return sol?.address;
    return evm?.address;
  }, [origin.namespace, sol?.address, evm?.address]);

  const balanceSmallestUnit =
    origin.namespace === "solana" ? solBalance.lamports : evmBalance.wei;
  const balanceDisplay =
    origin.namespace === "solana" ? solBalance.sol : evmBalance.native;

  // Two-tier amount state: `inputValue` keeps the raw text the user typed
  // (so the field is responsive); `committedAmount` is the debounced
  // value that drives the quote query.
  const [inputValue, setInputValue] = useState("");
  const [committedAmount, setCommittedAmount] = useState("");

  // Reset input whenever the origin changes — amounts denominated in SOL
  // and ETH are not comparable, so re-entering is the safer UX.
  useEffect(() => {
    setInputValue("");
    setCommittedAmount("");
  }, [origin.id]);

  const debouncedSetCommitted = useMemo(
    () => debounce((v: string) => setCommittedAmount(v), 350),
    [],
  );
  useEffect(
    () => () => debouncedSetCommitted.cancel(),
    [debouncedSetCommitted],
  );

  const handleAmountChange = useCallback(
    (raw: string) => {
      const cleaned = raw.replace(/[^0-9.]/g, "");
      setInputValue(cleaned);
      debouncedSetCommitted(cleaned);
    },
    [debouncedSetCommitted],
  );

  const handleMax = useCallback(() => {
    if (!balanceSmallestUnit || balanceSmallestUnit === "0") return;
    const max = formatUnits(BigInt(balanceSmallestUnit), origin.decimals);
    setInputValue(max);
    setCommittedAmount(max);
  }, [balanceSmallestUnit, origin.decimals]);

  const handleHalf = useCallback(() => {
    if (!balanceSmallestUnit || balanceSmallestUnit === "0") return;
    const halfWei = BigInt(balanceSmallestUnit) / 2n;
    const half = formatUnits(halfWei, origin.decimals);
    setInputValue(half);
    setCommittedAmount(half);
  }, [balanceSmallestUnit, origin.decimals]);

  // Local validation — gates the quote query and the Confirm button.
  // `parseUnits` throws when the string is malformed for the requested
  // precision; we catch and surface a single user-facing error instead.
  const { grossAmount, amountError } = useMemo<{
    grossAmount: string;
    amountError: string | undefined;
  }>(() => {
    const amt = committedAmount.trim();
    if (!amt) return { grossAmount: "", amountError: undefined };
    if (!/^\d+(\.\d+)?$/.test(amt) || Number(amt) <= 0) {
      return {
        grossAmount: "",
        amountError: t("extend.hlDeposit.errorInvalid"),
      };
    }
    let smallest: bigint;
    try {
      smallest = parseUnits(amt, origin.decimals);
    } catch {
      return {
        grossAmount: "",
        amountError: t("extend.hlDeposit.errorInvalid"),
      };
    }
    if (smallest <= 0n) {
      return {
        grossAmount: "",
        amountError: t("extend.hlDeposit.errorInvalid"),
      };
    }
    if (
      balanceSmallestUnit &&
      balanceSmallestUnit !== "0" &&
      smallest > BigInt(balanceSmallestUnit)
    ) {
      return {
        grossAmount: "",
        amountError: t("extend.hlDeposit.errorInsufficient", {
          symbol: origin.symbol,
        }),
      };
    }
    return { grossAmount: smallest.toString(), amountError: undefined };
  }, [committedAmount, origin.decimals, origin.symbol, balanceSmallestUnit, t]);

  const quoteReq = useMemo<DepositQuoteRequest | null>(() => {
    if (!grossAmount || grossAmount === "0") return null;
    if (!userAddress || !evm?.address) return null;
    return {
      originChainId: origin.chainId,
      userAddress,
      hyperliquidRecipient: evm.address,
      grossAmount,
      source: DEPOSIT_SOURCE,
    };
  }, [grossAmount, userAddress, evm?.address, origin.chainId]);

  const quoteQ = usePerpDepositQuote(quoteReq, {
    enabled: Boolean(quoteReq) && Boolean(depositClient),
  });

  // ---------------------------------------------------------------------
  // Signers — solana + evm adapters wired up regardless of origin so the
  // hook can route to the right one based on the quote.kind.
  // ---------------------------------------------------------------------
  const solanaSigner = useCallback(
    async (b64: string) => {
      if (!sol) throw new Error("Solana wallet not connected");
      return sol.sendTransaction(base64ToBytes(b64));
    },
    [sol],
  );

  const evmAdapter = useMemo<EvmDepositAdapter | undefined>(() => {
    if (!evm) return undefined;
    return {
      getChainId: () => evm.getChainId(),
      switchChain: (cid: number) => evm.switchChainId(cid),
      sendTransaction: (tx) => evm.sendEvmTx(tx),
    };
  }, [evm]);

  const signers = useMemo<DepositSigners>(
    () => ({ solana: solanaSigner, evm: evmAdapter }),
    [solanaSigner, evmAdapter],
  );

  const { state, execute, reset, dispatch } = usePerpDepositExecute(signers);

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
  // Track the origin used for the most recent submission so the status
  // modal can render the correct explorer URL even after the user
  // changes the origin selector mid-flow.
  // ---------------------------------------------------------------------
  const [activeOrigin, setActiveOrigin] = useState<OriginOption>(origin);
  useEffect(() => {
    if (state.phase === "idle") setActiveOrigin(origin);
  }, [state.phase, origin]);

  // ---------------------------------------------------------------------
  // Quote-driven preview values
  // ---------------------------------------------------------------------
  const quote = quoteQ.data;

  // Gain — use locale-aware USD formatting so we keep meaningful
  // fractional precision (Hyperliquid credits perp USDC at 8-decimal
  // granularity) without dumping every trailing zero to the user. Ask the
  // helper for 8 decimals so we don't lose precision for sub-cent amounts.
  const gainingAmount = useMemo(() => {
    if (!quote?.breakdown.expectedOutputUSDC) return "0";
    const exact = hlUsdcRawToUsdc(quote.breakdown.expectedOutputUSDC, 8);
    return formatUsdcDisplay(Number(exact));
  }, [quote]);

  // USD value of the input — since 1 USDC ≈ $1 we re-use the expected
  // output as a free approximation. Hidden when there's no quote yet.
  const usdValue = useMemo(() => {
    if (!quote?.breakdown.expectedOutputUSDC) return null;
    const exact = hlUsdcRawToUsdc(quote.breakdown.expectedOutputUSDC, 8);
    return formatUsdcDisplay(Number(exact));
  }, [quote]);

  // Rate displayed under the gaining card — "1 SOL ≈ X USDC".
  // The rate is `expectedOutputUSDC / grossAmount` after both sides
  // are converted to human-readable units of their own decimals.
  const rateText = useMemo(() => {
    if (!quote?.breakdown.expectedOutputUSDC) return null;
    const grossDecimal = Number(
      formatUnits(BigInt(quote.breakdown.grossAmount), origin.decimals),
    );
    const expectedUsdcNum = Number(
      hlUsdcRawToUsdc(quote.breakdown.expectedOutputUSDC, 8),
    );
    if (!grossDecimal || !expectedUsdcNum) return null;
    return formatUsdcDisplay(expectedUsdcNum / grossDecimal);
  }, [quote, origin.decimals]);

  // Platform fee — only render the row when a non-zero fee is charged so
  // we don't add visual noise to free-tier deposits. EVM origins
  // currently waive the fee server-side (platformFeeAmount = "0"), so
  // this row hides itself naturally.
  const platformFeeText = useMemo(() => {
    const feeRaw = quote?.breakdown.platformFeeAmount;
    if (!feeRaw || feeRaw === "0") return null;
    const feeDecimal = formatUnits(BigInt(feeRaw), origin.decimals);
    const feeNum = Number(feeDecimal);
    if (!feeNum) return null;
    return `${feeDecimal} ${origin.symbol}`;
  }, [quote, origin.decimals, origin.symbol]);

  // ---------------------------------------------------------------------
  // Submit handler — Confirm goes straight to sign + submit.
  // ---------------------------------------------------------------------
  const handleSubmit = useCallback(async () => {
    if (!quoteQ.data || !userAddress || !evm) return;
    // Capture the origin used for this attempt so the status modal can
    // surface the correct explorer URL even if the user later changes
    // the selector.
    setActiveOrigin(origin);
    // Move the FSM through quoting → ready_to_sign so SIGN_START is valid.
    dispatch({ type: "QUOTE_REQUEST" });
    dispatch({ type: "QUOTE_RECEIVED", quote: quoteQ.data });
    try {
      await execute({
        quote: quoteQ.data,
        userAddress,
        hyperliquidRecipient: evm.address,
        userId: user?.id ?? userAddress,
        source: DEPOSIT_SOURCE,
      });
    } catch {
      // FSM already transitioned to `failed` — nothing else to do here.
    }
  }, [quoteQ.data, userAddress, evm, origin, user?.id, dispatch, execute]);

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
    : !evm
      ? t("extend.hlDeposit.needsEvmWallet")
      : origin.namespace === "solana" && !sol
        ? t("extend.hlDeposit.needsSolWallet")
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

  // Origin-tx hash (chain-agnostic) extracted from the FSM, preferring
  // the backend's authoritative value once it arrives. We read both
  // `originTxHash` (new) and `solanaTxHash` (legacy) for backward
  // compatibility with older perpetuals-server responses.
  const originTxHash = (() => {
    if (
      state.phase === "tracking" ||
      state.phase === "succeeded" ||
      state.phase === "refunded" ||
      state.phase === "failed"
    ) {
      return state.status?.originTxHash || state.status?.solanaTxHash;
    }
    if (state.phase === "submitted") {
      return state.originTxHash;
    }
    return undefined;
  })();

  // DepositStatusUI only exposes `solanaExplorerUrl` and
  // `hyperliquidExplorerUrl` slots. For non-Solana origins we reuse the
  // Solana slot to render the origin-chain explorer link — the SDK
  // renders the value as a generic link, so the slot name is the only
  // legacy detail leaking through. (We track that as a SDK rename in
  // the deposit UI props.)
  const originExplorerUrl = originTxHash
    ? `${activeOrigin.explorerTxPrefix}/${originTxHash}`
    : undefined;

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
                  balanceValue={balanceDisplay || "0"}
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
                  tokenChip={
                    <OriginSelector
                      value={origin}
                      onChange={setOrigin}
                      disabled={isExecuting}
                    />
                  }
                  belowSlot={
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                        <button
                          type="button"
                          onClick={handleHalf}
                          disabled={
                            !balanceSmallestUnit ||
                            balanceSmallestUnit === "0" ||
                            isExecuting
                          }
                          className="cursor-pointer px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider text-zinc-300 bg-zinc-800/60 hover:bg-zinc-700/80 hover:text-[#C7FF2E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-zinc-800/60 disabled:hover:text-zinc-300"
                        >
                          {t("perpetuals.page.halfBtn")}
                        </button>
                        <button
                          type="button"
                          onClick={handleMax}
                          disabled={
                            !balanceSmallestUnit ||
                            balanceSmallestUnit === "0" ||
                            isExecuting
                          }
                          className="cursor-pointer px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider text-zinc-300 bg-zinc-800/60 hover:bg-zinc-700/80 hover:text-[#C7FF2E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-zinc-800/60 disabled:hover:text-zinc-300"
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
                  // The deposit-margin flow lands funds in the Hyperliquid
                  // perp account, so the figure to surface here is what's
                  // immediately usable for opening positions (withdrawable
                  // / availableBalance) — not the total account value,
                  // which can be inflated by open PnL and isn't free
                  // margin.
                  balanceLabel={t("perpetuals.placeOrder.availableMargin")}
                  balanceValue={
                    evm ? formatHlUsdc(hlBalances.availableMargin) : "—"
                  }
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
                  tokenChip={
                    <TokenChip
                      icon={<HyperliquidUsdcIcon size={20} />}
                      symbol="USDC"
                    />
                  }
                  belowSlot={
                    <div className="flex justify-end">
                      <span className="text-[11px] text-zinc-500 tabular-nums">
                        {rateText
                          ? t("extend.hlDeposit.rate", {
                              rate: rateText,
                              symbol: origin.symbol,
                            })
                          : "\u00A0"}
                      </span>
                    </div>
                  }
                />

                {/* Quote breakdown — currently only platform fee, when > 0 */}
                {platformFeeText && (
                  <div className="mt-3 rounded-[10px] bg-[#0a0a0b] border border-[#27272a] px-3.5 py-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">
                      {t("extend.hlDeposit.platformFee")}
                    </span>
                    <span className="text-zinc-200 tabular-nums">
                      {platformFeeText}
                    </span>
                  </div>
                )}

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
                    "cursor-pointer mt-4 w-full h-12 rounded-[12px] font-semibold text-black",
                    "bg-[#C7FF2E] hover:bg-[#b6ed1c] active:bg-[#a6d913]",
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
        solanaExplorerUrl={originExplorerUrl}
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

function OriginSelector({
  value,
  onChange,
  disabled,
}: {
  value: OriginOption;
  onChange: (next: OriginOption) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((v) => !v)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-1.5 h-8 pl-1.5 pr-1.5 rounded-full bg-[#27272a] border border-[#3f3f46]",
          "transition-colors hover:bg-[#2c2c2f] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer",
          "focus:outline-none focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        )}
      >
        <OriginIcon origin={value} />
        <span className="text-sm font-medium text-white">{value.symbol}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "text-zinc-400 transition-transform",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-44 z-50 overflow-hidden"
          style={DROPDOWN_STYLE}
        >
          <div className="p-1">
            {ORIGIN_OPTIONS.map((opt) => {
              const isActive = opt.id === value.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-sm transition-all cursor-pointer",
                    isActive
                      ? "bg-[#c7ff2e]/[0.08] text-[#c7ff2e]"
                      : "text-zinc-400 hover:text-white hover:bg-[rgba(39,39,42,0.5)]",
                  )}
                >
                  <OriginIcon origin={opt} />
                  <span className="flex-1 text-left font-medium">
                    {opt.symbol}
                  </span>
                  {isActive && (
                    <svg
                      viewBox="0 0 24 24"
                      width={14}
                      height={14}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function OriginIcon({ origin }: { origin: OriginOption }) {
  switch (origin.id) {
    case "sol":
      return <SolCoinBadge />;
    case "eth":
      return <EthCoinBadge />;
    case "bnb":
      return <BnbCoinBadge />;
  }
}

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
          <span className="text-[#C7FF2E] tabular-nums">{balanceValue}</span>
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

function EthCoinBadge() {
  return (
    <div
      className="flex items-center justify-center w-5 h-5 rounded-full bg-[#627EEA]"
      aria-hidden="true"
    >
      <svg width="11" height="14" viewBox="0 0 256 417" fill="none">
        <path d="M127.961 0L125.165 9.502v275.668l2.796 2.79 127.962-75.638z" fill="#fff" />
        <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" fill="#fff" fillOpacity="0.8" />
        <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" fill="#fff" />
        <path d="M127.962 416.905v-104.72L0 236.585z" fill="#fff" fillOpacity="0.8" />
        <path d="M127.961 287.958l127.96-75.637-127.96-58.162z" fill="#fff" fillOpacity="0.5" />
        <path d="M0 212.32l127.96 75.638V154.159z" fill="#fff" fillOpacity="0.6" />
      </svg>
    </div>
  );
}

function BnbCoinBadge() {
  return (
    <div
      className="flex items-center justify-center w-5 h-5 rounded-full bg-[#F0B90B]"
      aria-hidden="true"
    >
      <svg width="12" height="12" viewBox="0 0 32 32" fill="none">
        <path
          d="M9.696 13.92 16 7.616l6.308 6.308 3.668-3.668L16 0 6.028 9.972zM0 16l3.668-3.668L7.336 16l-3.668 3.668zm9.696 2.08L16 24.384l6.308-6.308 3.67 3.666L16 32 6.028 22.028l-.052-.052zm14.968-2.08 3.668-3.668L32 16l-3.668 3.668zM19.72 15.998 16 12.276l-2.75 2.748-.318.318-.65.65-.005.006.004.005L16 19.72l3.72-3.72v-.002z"
          fill="#fff"
        />
      </svg>
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

function formatHlUsdc(value: string | number): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n === 0) return "0.00";
  if (n < 0.01) return n.toFixed(6);
  return n.toFixed(3);
}

/**
 * Render a USDC amount with locale grouping and adaptive precision.
 *
 * - >= 1 USDC → 2 decimal places minimum, up to 4 to keep the
 *   conversion round-trip consistent with the rate display
 *   (`gross × rate ≈ gain` in the form).
 * - < 1 USDC → up to 6 fractional digits so micro-deposits (e.g. dust
 *   left after a rounding fee) don't collapse to "0.00".
 */
function formatUsdcDisplay(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0";
  if (Math.abs(value) < 1) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export default DepositHyperliquidUsdcModal;
