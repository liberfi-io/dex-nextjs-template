/**
 * SOL → Hyperliquid Perp USDC deposit orchestrator.
 *
 * Drives a 3-step user flow:
 *   1. `sendSol(amountSol)` — bridges SOL via Hyperunit to a per-user
 *      Solana deposit address.  The Hyperliquid spot account receives USOL
 *      after ~30 seconds (Solana finality + Unit guardian sign-off).
 *   2. `signSwap()` — places an IoC sell order on the USOL/USDC spot book
 *      to convert the just-bridged USOL into spot USDC.
 *   3. `signTransfer()` — `usdClassTransfer(toPerp: true)` moves the USDC
 *      from the spot account into the perpetuals margin account.
 *
 * State is fully derived from server queries — no localStorage / no
 * persistence.  We track only:
 *   - `pendingSend`: the SOL amount the user just broadcast and the
 *     baseline spot USOL balance, so the detection effect knows when the
 *     USOL has arrived.
 *   - `phase`: state-machine label exposed to the UI.
 *   - `swapAmountUsol` / `transferAmountUsdc`: the size to use for the
 *     next signed action, derived from balance deltas.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Hex } from "viem";

import {
  WalletAdapter,
  type EvmWalletAdapter,
} from "@liberfi.io/wallet-connector";

import { getExchangeClient, getInfoClient } from "../lib/hyperliquid/client";
import {
  buildSolTransferTx,
  solToLamports,
} from "../lib/hyperliquid/solana-transfer";
import {
  estimateSolToUsdc,
  roundLimitPrice,
  roundSize,
  type SwapQuote,
} from "../lib/hyperliquid/quote";
import {
  genSolanaDepositAddress,
  getOperations,
  type GenAddressResponse,
} from "../lib/hyperliquid/unit";
import {
  hyperliquidBalancesQueryKey,
  useHyperliquidBalances,
} from "./useHyperliquidBalances";

const OPS_POLL_MS = 5_000;
const MIDS_POLL_MS = 10_000;
const SPOT_META_TTL_MS = 60 * 60 * 1_000;
const ASSET_ID_OFFSET = 10_000;

export type DepositPhase =
  | "idle"
  | "detecting"
  | "ready_swap"
  | "swapping"
  | "ready_transfer"
  | "transferring"
  | "done"
  | "error";

export type SolToPerpDepositState = {
  phase: DepositPhase;
  error: string | null;

  perpUsdc: string;
  spotUsdc: string;
  spotUsol: string;
  solBalance?: string;

  /** Hyperunit-derived Solana address the user transferred SOL to. */
  depositAddress?: string;
  /** Tx signature returned by the Solana wallet adapter. */
  pendingTxSignature?: string;
  /** USOL amount waiting to be swapped (after Unit credits the deposit). */
  swapAmountUsol?: string;
  /** USDC amount waiting to be transferred to perp (after the swap). */
  transferAmountUsdc?: string;

  /** Current USOL/USDC mid; null when not yet loaded. */
  midPrice: number | null;
  /** Estimate for the user-typed input. */
  estimateForInput: (solAmount: number) => SwapQuote;

  isSendingSol: boolean;
  isSigningSwap: boolean;
  isSigningTransfer: boolean;

  sendSol: (solAmount: number) => Promise<void>;
  signSwap: () => Promise<void>;
  signTransfer: () => Promise<void>;
  reset: () => void;
};

type Args = {
  hlEvmAddress?: string;
  solanaAdapter?: WalletAdapter | null;
  evmAdapter?: EvmWalletAdapter | null;
  /** Optional Solana balance display string ("0.756"). */
  solBalance?: string;
};

export function useSolToPerpDeposit({
  hlEvmAddress,
  solanaAdapter,
  evmAdapter,
  solBalance,
}: Args): SolToPerpDepositState {
  const balances = useHyperliquidBalances(hlEvmAddress);
  const queryClient = useQueryClient();

  // ---------------------------------------------------------------------
  // Server queries: spot meta (one-shot), mids (polled), Unit deposit addr,
  // and Unit operations (polled while detecting).
  // ---------------------------------------------------------------------

  const enabled = Boolean(hlEvmAddress?.startsWith("0x"));

  const spotMetaQuery = useQuery({
    queryKey: ["hyperliquid", "spotMeta"],
    enabled: true,
    staleTime: SPOT_META_TTL_MS,
    queryFn: async ({ signal }) => getInfoClient().spotMeta(signal),
  });

  const midsQuery = useQuery({
    queryKey: ["hyperliquid", "allMids"],
    enabled: true,
    refetchInterval: MIDS_POLL_MS,
    staleTime: MIDS_POLL_MS / 2,
    queryFn: async ({ signal }) => getInfoClient().allMids(signal),
  });

  const depositAddressQuery = useQuery({
    queryKey: ["hyperliquid", "unitDepositAddress", hlEvmAddress?.toLowerCase()],
    enabled,
    staleTime: 24 * 60 * 60 * 1_000,
    queryFn: async ({ signal }): Promise<GenAddressResponse> =>
      genSolanaDepositAddress(hlEvmAddress as string, signal),
  });

  // ---------------------------------------------------------------------
  // Local state machine.
  // ---------------------------------------------------------------------

  const [phase, setPhase] = useState<DepositPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendingTxSignature, setPendingTxSignature] = useState<string>();
  const [swapAmountUsol, setSwapAmountUsol] = useState<string>();
  const [transferAmountUsdc, setTransferAmountUsdc] = useState<string>();

  // Baselines captured at action time so we can detect deltas without
  // relying on persistence across reloads.
  const baselineUsolRef = useRef<number>(0);
  const baselineUsdcRef = useRef<number>(0);
  const isSendingSolRef = useRef(false);
  const isSigningSwapRef = useRef(false);
  const isSigningTransferRef = useRef(false);

  const [isSendingSol, setIsSendingSol] = useState(false);
  const [isSigningSwap, setIsSigningSwap] = useState(false);
  const [isSigningTransfer, setIsSigningTransfer] = useState(false);

  // ---------------------------------------------------------------------
  // Derived: USOL/USDC universe index + asset id + mid price.
  // ---------------------------------------------------------------------

  const usolPair = useMemo(() => {
    const universe = spotMetaQuery.data?.universe;
    const tokens = spotMetaQuery.data?.tokens;
    if (!universe || !tokens) return null;
    const usolToken = tokens.find((t) => t.name === "USOL");
    const usdcToken = tokens.find((t) => t.name === "USDC");
    if (!usolToken || !usdcToken) return null;
    const pair = universe.find(
      (u) =>
        u.tokens.includes(usolToken.index) &&
        u.tokens.includes(usdcToken.index),
    );
    if (!pair) return null;
    return {
      universeIndex: pair.index,
      assetId: ASSET_ID_OFFSET + pair.index,
      pairKey: `@${pair.index}`,
      szDecimals: usolToken.szDecimals,
    };
  }, [spotMetaQuery.data]);

  const midPrice = useMemo<number | null>(() => {
    if (!usolPair || !midsQuery.data) return null;
    const raw = midsQuery.data[usolPair.pairKey];
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, [usolPair, midsQuery.data]);

  const estimateForInput = useCallback(
    (solAmount: number): SwapQuote =>
      estimateSolToUsdc(solAmount, midPrice ?? 0),
    [midPrice],
  );

  // ---------------------------------------------------------------------
  // Detection effect: when we are "detecting", poll spot balance and flip
  // phase once new USOL appears.
  // ---------------------------------------------------------------------

  useEffect(() => {
    if (phase !== "detecting") return;
    const current = Number(balances.spotUsol);
    if (!Number.isFinite(current)) return;
    const delta = current - baselineUsolRef.current;
    if (delta > 0) {
      const sz = roundSize(delta, usolPair?.szDecimals ?? 2);
      setSwapAmountUsol(sz);
      setPhase("ready_swap");
    }
  }, [phase, balances.spotUsol, usolPair?.szDecimals]);

  // ---------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------

  const refreshBalances = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: hyperliquidBalancesQueryKey(hlEvmAddress),
    });
  }, [queryClient, hlEvmAddress]);

  const sendSol = useCallback(
    async (solAmount: number) => {
      if (isSendingSolRef.current) return;
      if (!hlEvmAddress) {
        setError("Hyperliquid EVM address unavailable");
        setPhase("error");
        return;
      }
      if (!solanaAdapter) {
        setError("Solana wallet not connected");
        setPhase("error");
        return;
      }
      if (!Number.isFinite(solAmount) || solAmount <= 0) {
        setError("Enter a valid SOL amount");
        return;
      }
      isSendingSolRef.current = true;
      setIsSendingSol(true);
      setError(null);
      try {
        const addr =
          depositAddressQuery.data?.address ??
          (await genSolanaDepositAddress(hlEvmAddress)).address;
        if (!addr) throw new Error("Failed to obtain Solana deposit address");

        const lamports = solToLamports(solAmount);
        const txBytes = await buildSolTransferTx({
          fromAddress: solanaAdapter.address,
          toAddress: addr,
          lamports,
        });
        const signature = await solanaAdapter.sendTransaction(txBytes);

        baselineUsolRef.current = Number(balances.spotUsol) || 0;
        baselineUsdcRef.current = Number(balances.spotUsdc) || 0;
        setPendingTxSignature(signature);
        setSwapAmountUsol(undefined);
        setTransferAmountUsdc(undefined);
        setPhase("detecting");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        setPhase("error");
      } finally {
        isSendingSolRef.current = false;
        setIsSendingSol(false);
      }
    },
    [
      hlEvmAddress,
      solanaAdapter,
      depositAddressQuery.data?.address,
      balances.spotUsol,
      balances.spotUsdc,
    ],
  );

  const signSwap = useCallback(async () => {
    if (isSigningSwapRef.current) return;
    if (!hlEvmAddress) {
      setError("Hyperliquid EVM address unavailable");
      setPhase("error");
      return;
    }
    if (!evmAdapter) {
      setError("EVM wallet not connected");
      setPhase("error");
      return;
    }
    if (!usolPair) {
      setError("Spot metadata not loaded");
      return;
    }
    if (!midPrice || midPrice <= 0) {
      setError("USOL/USDC mid price unavailable");
      return;
    }
    if (!swapAmountUsol || Number(swapAmountUsol) <= 0) {
      setError("No USOL balance to swap");
      return;
    }

    isSigningSwapRef.current = true;
    setIsSigningSwap(true);
    setError(null);
    setPhase("swapping");
    try {
      const provider = await evmAdapter.getEip1193Provider();
      if (!provider) throw new Error("Cannot obtain EIP-1193 provider");
      const exchange = getExchangeClient(provider, hlEvmAddress as Hex);

      // IoC sell at 0.5% below mid to virtually guarantee fill.
      const limitPx = roundLimitPrice(midPrice * 0.995, 4);

      // Snapshot pre-swap USDC so we can compute the delta after fill.
      baselineUsdcRef.current = Number(balances.spotUsdc) || 0;

      const result = await exchange.order({
        orders: [
          {
            a: usolPair.assetId,
            b: false,
            p: limitPx,
            s: swapAmountUsol,
            r: false,
            t: { limit: { tif: "Ioc" } },
          },
        ],
        grouping: "na",
      });

      if (result.status !== "ok") {
        throw new Error("Order rejected by exchange");
      }

      // Refresh balances and let the effect below pick the delta and
      // move us into ready_transfer.
      await balances.refetch();
      const fresh = await getInfoClient().spotClearinghouseState({
        user: hlEvmAddress as Hex,
      });
      const usdc = fresh.balances.find((b) => b.coin === "USDC");
      const newUsdc = Number(usdc?.total ?? "0");
      const delta = Math.max(0, newUsdc - baselineUsdcRef.current);
      // USDC has 8 weiDecimals on spot; truncate to 6 dp for safety.
      const usdcStr = (Math.floor(delta * 1_000_000) / 1_000_000).toString();
      setTransferAmountUsdc(usdcStr);
      setSwapAmountUsol(undefined);
      setPhase(delta > 0 ? "ready_transfer" : "ready_transfer");
      refreshBalances();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setPhase("error");
    } finally {
      isSigningSwapRef.current = false;
      setIsSigningSwap(false);
    }
  }, [
    hlEvmAddress,
    evmAdapter,
    usolPair,
    midPrice,
    swapAmountUsol,
    balances,
    refreshBalances,
  ]);

  const signTransfer = useCallback(async () => {
    if (isSigningTransferRef.current) return;
    if (!hlEvmAddress) {
      setError("Hyperliquid EVM address unavailable");
      setPhase("error");
      return;
    }
    if (!evmAdapter) {
      setError("EVM wallet not connected");
      setPhase("error");
      return;
    }

    const amount =
      transferAmountUsdc && Number(transferAmountUsdc) > 0
        ? transferAmountUsdc
        : (() => {
            const fresh = Number(balances.spotUsdc);
            if (!Number.isFinite(fresh) || fresh <= 0) return "";
            return (Math.floor(fresh * 1_000_000) / 1_000_000).toString();
          })();
    if (!amount) {
      setError("No spot USDC available to transfer");
      return;
    }

    isSigningTransferRef.current = true;
    setIsSigningTransfer(true);
    setError(null);
    setPhase("transferring");
    try {
      const provider = await evmAdapter.getEip1193Provider();
      if (!provider) throw new Error("Cannot obtain EIP-1193 provider");
      const exchange = getExchangeClient(provider, hlEvmAddress as Hex);
      await exchange.usdClassTransfer({ amount, toPerp: true });

      setPhase("done");
      refreshBalances();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setPhase("error");
    } finally {
      isSigningTransferRef.current = false;
      setIsSigningTransfer(false);
    }
  }, [
    hlEvmAddress,
    evmAdapter,
    transferAmountUsdc,
    balances.spotUsdc,
    refreshBalances,
  ]);

  const reset = useCallback(() => {
    baselineUsolRef.current = 0;
    baselineUsdcRef.current = 0;
    setPhase("idle");
    setError(null);
    setPendingTxSignature(undefined);
    setSwapAmountUsol(undefined);
    setTransferAmountUsdc(undefined);
  }, []);

  // ---------------------------------------------------------------------
  // Polled Unit operations — only used to surface the bridge state in the
  // UI (spinner / "credited"); detection is balance-based, not op-state-
  // based, because the only signal we truly care about is "USOL appeared
  // on the spot account".
  // ---------------------------------------------------------------------

  useQuery({
    queryKey: [
      "hyperliquid",
      "unitOperations",
      hlEvmAddress?.toLowerCase(),
      pendingTxSignature ?? null,
    ],
    enabled: phase === "detecting" && enabled,
    refetchInterval: OPS_POLL_MS,
    queryFn: async ({ signal }) =>
      getOperations(hlEvmAddress as string, signal),
  });

  return {
    phase,
    error,
    perpUsdc: balances.perpUsdc,
    spotUsdc: balances.spotUsdc,
    spotUsol: balances.spotUsol,
    solBalance,
    depositAddress: depositAddressQuery.data?.address,
    pendingTxSignature,
    swapAmountUsol,
    transferAmountUsdc,
    midPrice,
    estimateForInput,
    isSendingSol,
    isSigningSwap,
    isSigningTransfer,
    sendSol,
    signSwap,
    signTransfer,
    reset,
  };
}
