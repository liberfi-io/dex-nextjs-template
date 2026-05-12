"use client";

import BigNumber from "bignumber.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash-es";
import { useTranslation } from "@liberfi.io/i18n";
import { ModalContent, StyledModal, TokenIcon, XCloseIcon, cn } from "@liberfi.io/ui";
import { AsyncModal, type RenderAsyncModalProps } from "@liberfi.io/ui-scaffold";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useAccountInfo } from "@liberfi.io/ui-portfolio";
import { Chain } from "@liberfi.io/types";
import { chainDisplayName } from "@liberfi.io/utils";
import { useTimerToast, useWalletPortfolios } from "@liberfi/ui-base";
import { useConnectedWallet } from "@liberfi.io/wallet-connector";
import { isValidWalletAddress } from "@liberfi/ui-dex";
import {
  getPrimaryTokenAddress,
  getPrimaryTokenDecimals,
  getPrimaryTokenSymbol,
} from "@liberfi/core";
import {
  TransferApiError,
  chainToTransferSymbol,
  getTransferStatus,
  isTerminalTransferStatus,
  useCreateTransferTransactionMutation,
  useSendTransferTransactionMutation,
  type TransferStatusResponse,
} from "@liberfi/react-backend";

export const WITHDRAW_MODAL_ID = "withdraw-wallet";

// ---------------------------------------------------------------------------
// Confirmation polling
// ---------------------------------------------------------------------------
//
// `watchTransferConfirmation` is a fire-and-forget background task started
// after a transfer is broadcast. It polls `GET .../status/{sig}` on a
// fixed interval and, on terminal status (success / failed) or the
// per-chain timeout, updates the same toast id the modal opened so the
// user sees a single toast progress from "submitted" → "confirmed".
//
// Implementation notes:
//   - Lives outside the React component on purpose. The modal closes
//     immediately after broadcast, so any polling pinned to component
//     lifecycle would be cancelled before the chain confirms. The
//     react-hot-toast store is module-level (see next.config.mjs
//     singleton alias), so toast.update calls from this task reach the
//     same <StyledToaster /> rendered at the app shell.
//   - Transient network errors don't immediately fail the toast. We
//     tolerate up to MAX_CONSECUTIVE_ERRORS in a row before surfacing.
//
type ToastFn = ReturnType<typeof useTimerToast>;

const POLL_INTERVAL_MS = 3_000;
const MAX_CONSECUTIVE_ERRORS = 3;

// Solana blockhashes expire after ~90s; allow a margin so the user sees
// "submitted" until the chain decides one way or another.
const CONFIRMATION_TIMEOUT_MS: Record<Chain, number> = {
  [Chain.SOLANA]: 120_000,
  [Chain.ETHEREUM]: 240_000,
  [Chain.BINANCE]: 240_000,
} as unknown as Record<Chain, number>;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function shortSig(sig: string): string {
  return sig.length > 12 ? `${sig.slice(0, 8)}…${sig.slice(-4)}` : sig;
}

async function watchTransferConfirmation(
  chain: Chain,
  signature: string,
  toast: ToastFn,
): Promise<void> {
  const symbol = chainToTransferSymbol(chain);
  if (!symbol) return;

  const deadline = Date.now() + (CONFIRMATION_TIMEOUT_MS[chain] ?? 120_000);
  let consecutiveErrors = 0;
  let lastResult: TransferStatusResponse | undefined;

  while (Date.now() < deadline) {
    try {
      lastResult = await getTransferStatus(symbol, signature);
      consecutiveErrors = 0;

      if (isTerminalTransferStatus(lastResult.status)) {
        if (lastResult.status === "success") {
          toast({
            id: signature,
            type: "success",
            message: `转账已上链 · ${shortSig(signature)}`,
            duration: 5_000,
          });
        } else {
          toast({
            id: signature,
            type: "error",
            message: `转账失败 · ${lastResult.error ?? shortSig(signature)}`,
            duration: 8_000,
          });
        }
        return;
      }
    } catch (err) {
      consecutiveErrors += 1;
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        const msg = err instanceof Error ? err.message : "网络错误";
        toast({
          id: signature,
          type: "error",
          message: `无法确认上链状态 · ${msg}`,
          duration: 8_000,
        });
        return;
      }
    }
    await sleep(POLL_INTERVAL_MS);
  }

  // Timed out. Solana: blockhash likely expired and tx will never land.
  // EVM: tx is probably stuck in mempool — user should check explorer.
  toast({
    id: signature,
    type: "error",
    message: `等待上链超时 · ${shortSig(signature)}，请稍后在区块浏览器查看`,
    duration: 10_000,
  });
}

// ---------------------------------------------------------------------------
// Native token resolved from @liberfi/core (single source of truth shared
// with the header balance display so the token address always matches the
// portfolio data returned by the backend).
// ---------------------------------------------------------------------------

type NativeToken = { symbol: string; address: string; decimals: number };

function getNativeToken(chain: Chain): NativeToken | undefined {
  const symbol = getPrimaryTokenSymbol(chain);
  const address = getPrimaryTokenAddress(chain);
  const decimals = getPrimaryTokenDecimals(chain);
  if (!symbol || !address || decimals === undefined) return undefined;
  return { symbol, address, decimals };
}

/** Validate a wallet address for the given chain. Returns an error string or undefined. */
function validateAddress(chain: Chain, address: string): string | undefined {
  if (!address) return undefined;
  switch (chain) {
    case Chain.SOLANA:
      return isValidWalletAddress(chain, address) ? undefined : "无效的 Solana 钱包地址";
    case Chain.ETHEREUM:
    case Chain.BINANCE:
      return /^0x[0-9a-fA-F]{40}$/.test(address) ? undefined : "无效的 EVM 钱包地址";
    default:
      return undefined;
  }
}

// ---------------------------------------------------------------------------
// Modal shell
// ---------------------------------------------------------------------------

export function WithdrawModal() {
  return (
    <AsyncModal id={WITHDRAW_MODAL_ID}>
      {(props) => <Body {...props} />}
    </AsyncModal>
  );
}

// ---------------------------------------------------------------------------
// Body
// ---------------------------------------------------------------------------

function Body({ isOpen, onOpenChange, onClose }: RenderAsyncModalProps) {
  const { t } = useTranslation();
  const { chain } = useCurrentChain();
  const chainName = chainDisplayName(chain);
  const { walletAddress } = useAccountInfo();
  const walletInstance = useConnectedWallet(chain);
  const toast = useTimerToast();

  // Fixed to the chain's native token — no selection needed.
  const nativeToken = useMemo(() => getNativeToken(chain), [chain]);

  // Portfolio data for balance of the native token.
  const { data: portfolioData } = useWalletPortfolios();
  const portfolios = portfolioData?.portfolios ?? [];

  const nativeBalance = useMemo(
    () => portfolios.find((p) => p.address === nativeToken?.address),
    [portfolios, nativeToken],
  );

  const balanceDisplay = useMemo(() => {
    if (!nativeBalance) return "0";
    const n = Number(nativeBalance.amount);
    if (!n) return "0";
    return n < 0.0001 ? n.toExponential(4) : n.toLocaleString("en-US", { maximumFractionDigits: 8 });
  }, [nativeBalance]);

  // -------------------------------------------------------------------------
  // Amount state — responsive inputValue + debounced committedAmount
  // -------------------------------------------------------------------------
  const [inputValue, setInputValue] = useState("");
  const [committedAmount, setCommittedAmount] = useState("");

  const debouncedSetCommitted = useMemo(
    () => debounce((v: string) => setCommittedAmount(v), 350),
    [],
  );
  useEffect(() => () => debouncedSetCommitted.cancel(), [debouncedSetCommitted]);

  const handleAmountChange = useCallback(
    (raw: string) => {
      const cleaned = raw.replace(/[^0-9.]/g, "").replace(/^(\d*\.?\d*).*/, "$1");
      setInputValue(cleaned);
      debouncedSetCommitted(cleaned);
    },
    [debouncedSetCommitted],
  );

  const handleMax = useCallback(() => {
    const bal = nativeBalance?.amount;
    if (!bal || bal === "0") return;
    setInputValue(bal);
    setCommittedAmount(bal);
  }, [nativeBalance?.amount]);

  const handleHalf = useCallback(() => {
    const bal = nativeBalance?.amount;
    if (!bal || bal === "0") return;
    const half = new BigNumber(bal).dividedBy(2).toFixed();
    setInputValue(half);
    setCommittedAmount(half);
  }, [nativeBalance?.amount]);

  // -------------------------------------------------------------------------
  // Address state
  // -------------------------------------------------------------------------
  const [addressValue, setAddressValue] = useState("");

  const handleAddressChange = useCallback(
    (raw: string) => setAddressValue(raw.trim()),
    [],
  );

  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    setAddressValue(text.trim());
  }, []);

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------
  const amountError = useMemo<string | undefined>(() => {
    const amt = committedAmount.trim();
    if (!amt) return undefined;
    if (!/^\d+(\.\d+)?$/.test(amt)) return "请输入有效的金额";
    if (Number(amt) <= 0) return "金额必须大于 0";
    const bal = nativeBalance?.amount;
    if (bal && new BigNumber(amt).gt(new BigNumber(bal))) return "余额不足";
    return undefined;
  }, [committedAmount, nativeBalance?.amount]);

  const addressError = useMemo<string | undefined>(
    () => validateAddress(chain, addressValue),
    [chain, addressValue],
  );

  // -------------------------------------------------------------------------
  // Amount in smallest units (for the mutation)
  // -------------------------------------------------------------------------
  const amountInDecimals = useMemo(() => {
    if (!committedAmount || amountError || !nativeToken) return undefined;
    return new BigNumber(committedAmount).shiftedBy(nativeToken.decimals).toFixed(0);
  }, [committedAmount, amountError, nativeToken]);

  const usdValue = useMemo(() => {
    if (!committedAmount || !nativeBalance?.priceInUsd) return null;
    const val = new BigNumber(committedAmount).multipliedBy(nativeBalance.priceInUsd);
    if (!val.isFinite() || val.isZero()) return null;
    return `$${val.toFixed(2)}`;
  }, [committedAmount, nativeBalance]);

  // -------------------------------------------------------------------------
  // Transaction mutations
  // -------------------------------------------------------------------------
  const {
    mutateAsync: createTx,
    isPending: isCreatingTx,
    error: createTxError,
  } = useCreateTransferTransactionMutation();

  const { mutateAsync: sendTx, isPending: isSending } = useSendTransferTransactionMutation();

  const sourceAddress = walletAddress ?? "";

  // -------------------------------------------------------------------------
  // Close / reset
  // -------------------------------------------------------------------------
  const [txError, setTxError] = useState<string | undefined>();

  const handleClose = useCallback(() => {
    onOpenChange(false);
    onClose?.();
    setInputValue("");
    setCommittedAmount("");
    setAddressValue("");
    setTxError(undefined);
  }, [onOpenChange, onClose]);

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  const handleSubmit = useCallback(async () => {
    if (!nativeToken || !amountInDecimals || !addressValue || !walletInstance) return;
    setTxError(undefined);

    try {
      // 1. Build unsigned transaction via dex-server. The chain is part of
      //    the URL path; the hook maps `Chain` enum → `sol`/`eth`/`bsc`.
      const unsigned = await createTx({
        chain,
        sourceAddress,
        destinationAddress: addressValue,
        amount: amountInDecimals,
      });

      // 2. Sign with the connected wallet. Backend always returns
      //    serializedTx as base64 raw bytes; the wallet adapter's
      //    signTransaction accepts Uint8Array and returns Uint8Array.
      const serializedBytes = Buffer.from(unsigned.serializedTx, "base64");
      const signedBytes = await walletInstance.signTransaction(serializedBytes);

      // 3. Re-encode for broadcast — Solana expects base64, EVM expects 0x hex.
      const signedTx =
        chain === Chain.SOLANA
          ? Buffer.from(signedBytes).toString("base64")
          : "0x" + Buffer.from(signedBytes).toString("hex");

      // 4. Broadcast via dex-server.
      const result = await sendTx({ chain, signedTx });

      // Show a long-lived progress toast while we wait for chain
      // confirmation. The same toast id is reused below so success /
      // failure / timeout updates replace this toast in place instead of
      // stacking new ones.
      toast({
        id: result.txSignature,
        message: `转账已提交，等待上链确认 · ${shortSig(result.txSignature)}`,
        progress: true,
        duration: CONFIRMATION_TIMEOUT_MS[chain] ?? 120_000,
      });

      // Close the modal immediately — the user shouldn't wait for chain
      // confirmation behind a blocking dialog. The polling task below
      // lives independently of this component and updates the toast
      // when the chain decides.
      handleClose();

      // Fire-and-forget. Any unexpected throw in the watcher is logged
      // but must not break the broadcast flow.
      void watchTransferConfirmation(chain, result.txSignature, toast).catch(
        (err: unknown) => {
          // eslint-disable-next-line no-console
          console.error("[withdraw] confirmation watcher crashed", err);
        },
      );
    } catch (err: unknown) {
      // Surface server-side validation messages when available.
      let msg: string;
      if (err instanceof TransferApiError) {
        msg = err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      } else {
        msg = "转账失败，请重试";
      }
      setTxError(msg);
      toast({
        type: "error",
        message: msg,
        duration: 5000,
      });
    }
  }, [
    nativeToken,
    amountInDecimals,
    addressValue,
    walletInstance,
    sourceAddress,
    chain,
    createTx,
    sendTx,
    toast,
    handleClose,
  ]);

  // -------------------------------------------------------------------------
  // Button state
  // -------------------------------------------------------------------------
  const isExecuting = isCreatingTx || isSending;

  const submitDisabled =
    isExecuting ||
    !committedAmount ||
    !!amountError ||
    !addressValue ||
    !!addressError ||
    !amountInDecimals ||
    !walletInstance;

  const submitLabel = (() => {
    if (isCreatingTx) return "构建交易中…";
    if (isSending) return "广播交易中…";
    if (!committedAmount) return "请输入金额";
    if (!addressValue) return "请输入收款地址";
    return "确认转账";
  })();

  const isSupportedChain = !!nativeToken;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <StyledModal
      isOpen={isOpen}
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
              <div className="flex items-center justify-center w-9 h-9 rounded-[12px] bg-zinc-700/40">
                {nativeToken ? (
                  <TokenIcon symbol={nativeToken.symbol} size={22} />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-zinc-600" />
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  {t("extend.account.withdraw")}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  发送 {chainName} 网络资产至钱包地址
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

          <div className="px-5 pb-5 pt-2 flex flex-col gap-3">
            {!isSupportedChain ? (
              <div className="rounded-[10px] border border-amber-500/20 bg-amber-500/5 px-4 py-6 text-sm text-amber-300 text-center">
                {chainName} 链转账即将支持，敬请期待
              </div>
            ) : (
              <>
                {/* Amount card */}
                <div className="rounded-[12px] bg-[#0a0a0b] border border-[#27272a] px-3.5 py-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">发送数量</span>
                    <span className="text-zinc-500">
                      余额{" "}
                      <span className="text-[#C7FF2E] tabular-nums">
                        {balanceDisplay} {nativeToken.symbol}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={inputValue}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="0.0"
                      disabled={isExecuting}
                      className={cn(
                        "flex-1 min-w-0 bg-transparent border-0 outline-none text-3xl font-medium text-white placeholder:text-zinc-600 tabular-nums",
                        "disabled:opacity-60",
                      )}
                    />
                    <div className="flex items-center gap-1.5 h-8 pl-1.5 pr-2.5 rounded-full bg-[#27272a] border border-[#3f3f46] shrink-0">
                      <TokenIcon symbol={nativeToken.symbol} size={18} />
                      <span className="text-sm font-medium text-white">{nativeToken.symbol}</span>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleHalf}
                        disabled={!nativeBalance?.amount || nativeBalance.amount === "0" || isExecuting}
                        className="cursor-pointer px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider text-zinc-300 bg-zinc-800/60 hover:bg-zinc-700/80 hover:text-[#C7FF2E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-zinc-800/60 disabled:hover:text-zinc-300"
                      >
                        半仓
                      </button>
                      <button
                        type="button"
                        onClick={handleMax}
                        disabled={!nativeBalance?.amount || nativeBalance.amount === "0" || isExecuting}
                        className="cursor-pointer px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider text-zinc-300 bg-zinc-800/60 hover:bg-zinc-700/80 hover:text-[#C7FF2E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-zinc-800/60 disabled:hover:text-zinc-300"
                      >
                        全部
                      </button>
                    </div>
                    <span className="text-[11px] text-zinc-500 tabular-nums">
                      {usdValue ?? "\u00A0"}
                    </span>
                  </div>
                </div>

                {amountError && (
                  <p className="text-xs text-rose-400 -mt-1">{amountError}</p>
                )}

                {/* Address card */}
                <div className="rounded-[12px] bg-[#0a0a0b] border border-[#27272a] px-3.5 py-3">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-zinc-500">{chainName} 钱包地址</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={addressValue}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      placeholder={`请输入 ${chainName} 收款地址`}
                      disabled={isExecuting}
                      className={cn(
                        "flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-white placeholder:text-zinc-600",
                        "disabled:opacity-60",
                      )}
                    />
                    {!addressValue && (
                      <button
                        type="button"
                        onClick={handlePaste}
                        disabled={isExecuting}
                        className="shrink-0 flex items-center gap-1 h-7 px-2.5 rounded-[8px] text-xs font-medium transition-colors cursor-pointer bg-zinc-700/60 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                        粘贴
                      </button>
                    )}
                    {addressValue && (
                      <button
                        type="button"
                        onClick={() => setAddressValue("")}
                        disabled={isExecuting}
                        className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/60 transition-colors cursor-pointer disabled:opacity-40"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {addressError && (
                  <p className="text-xs text-rose-400 -mt-1">{addressError}</p>
                )}

                {createTxError && !txError && (
                  <p className="text-xs text-rose-400">{t("extend.account.transfer_errors.create_transaction_error")}</p>
                )}
                {txError && (
                  <p className="text-xs text-rose-400">{txError}</p>
                )}

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitDisabled}
                  className={cn(
                    "cursor-pointer mt-1 w-full h-12 rounded-[12px] font-semibold text-black",
                    "bg-[#C7FF2E] hover:bg-[#b6ed1c] active:bg-[#a6d913]",
                    "transition-colors flex items-center justify-center gap-2",
                    "disabled:bg-[#3f3f46] disabled:text-zinc-500 disabled:cursor-not-allowed",
                  )}
                >
                  {isExecuting && (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                  )}
                  {submitLabel}
                </button>
              </>
            )}
          </div>
        </div>
      </ModalContent>
    </StyledModal>
  );
}
