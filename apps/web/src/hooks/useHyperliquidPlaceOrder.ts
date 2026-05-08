/**
 * Sign + relay a Hyperliquid `order` action from the browser.
 *
 * Mirrors {@link useHyperliquidUpdateLeverage} — the SDK widget owns
 * UX (form, validation, mark-price snapshot, coin-unit size), this
 * hook owns venue-specific bits (asset index, slippage cap, price /
 * size formatting, signature, response parsing, cache invalidation,
 * toasts).
 *
 * Decisions worth highlighting:
 *
 *   - Slippage is hardcoded to 8%, matching axiom's market-order
 *     payloads. We round the cap UP for buys and DOWN for sells so
 *     the result is always strictly worse than mark — the venue then
 *     fills at any price up to that cap.
 *   - TP/SL bracket orders piggy-back on the same `order` action.
 *     When the user fills in `takeProfitPrice` and/or `stopLossPrice`
 *     we ship a 2- or 3-leg payload with `grouping: "normalTpsl"`,
 *     each close leg `r: true`, opposite side, same size as entry.
 *     The close leg's `p` is `triggerPx × (close_isBuy ? 1.08 : 0.92)`
 *     — same 8% cap, rebased on the user-chosen trigger so the close
 *     market order can fill regardless of where the venue's mark sits
 *     when the trigger fires. Without TP/SL we fall back to a single
 *     leg + `grouping: "na"`. Mirrors axiom's market+TP/SL payloads.
 *   - We bypass the `IPerpetualsClient.placeOrder` path entirely
 *     because the active client (`HyperliquidPerpetualsClient`) is
 *     read-only and throws on submit. The `LiberFi*` adapter still
 *     uses the SDK path; that's untouched.
 *   - The response shape is `{statuses: [filled|resting|error|
 *     "waitingForFill"|"waitingForTrigger"]}` with one entry per leg.
 *     The entry leg is interpreted as filled/resting/error (current
 *     behaviour). Trigger legs are expected to come back as
 *     `"waitingForTrigger"` or `{resting}`; we still inspect every
 *     entry for the `error` variant so a rejected TP/SL aborts the
 *     whole flow rather than silently leaving the entry on its own.
 *   - We deliberately do NOT include the `builder` field. The address
 *     in axiom's curl examples is *axiom's own*; copying it would
 *     route referral fees to them. We can re-enable later via an
 *     `approveBuilderFee` action + the LiberFi-owned builder address.
 *
 * The hook does NOT track loading state — the SDK widget already
 * drives its submit-button spinner from the returned promise's
 * `useMutation` lifecycle. Keeping a single source of truth avoids
 * two dueling pending flags.
 */
"use client";

import { useCallback, useMemo } from "react";
import type { Hex } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@liberfi.io/i18n";
import { toast } from "@liberfi.io/ui";
import {
  useWallets,
  type EvmWalletAdapter,
} from "@liberfi.io/wallet-connector";
import {
  ordersQueryKey,
  positionsQueryKey,
  tradesQueryKey,
  type PlaceOrderRequest,
  type PlaceOrderResult,
} from "@liberfi.io/ui-perpetuals";

import { getExchangeClient } from "../lib/hyperliquid/client";
import { getAssetIndex } from "../lib/hyperliquid/asset-index";
import { formatHlPx, formatHlSz } from "../lib/hyperliquid/format";

/**
 * Slippage tolerance for market orders. Mirrors axiom (and the
 * Hyperliquid frontend default). Buys cap at `mark × (1 + SLIPPAGE)`
 * and sells at `mark × (1 - SLIPPAGE)`.
 */
const MARKET_SLIPPAGE = 0.08;

/**
 * Returns a stable callback that submits a Hyperliquid `order` action
 * for the connected EVM wallet. Rejects when no EVM wallet is
 * connected, when the wallet doesn't expose an EIP-1193 provider, or
 * when the venue rejects the action — the SDK widget's `useMutation`
 * surfaces all of those to the caller's `onError` prop, but this hook
 * also fires its own toast so the user gets immediate feedback.
 */
export function useHyperliquidPlaceOrder(): (
  request: PlaceOrderRequest,
) => Promise<PlaceOrderResult> {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const wallets = useWallets();
  const evm = useMemo(
    () =>
      wallets.find(
        (w) => w.chainNamespace === "EVM" && w.isConnected,
      ) as EvmWalletAdapter | undefined,
    [wallets],
  );

  return useCallback(
    async (request: PlaceOrderRequest): Promise<PlaceOrderResult> => {
      // Auth gate — same shape as the leverage hook so the user
      // sees the identical error in both flows.
      if (!evm?.address) {
        const message = t("extend.perpetuals.order.needsEvmWallet");
        toast.error(message);
        throw new Error(message);
      }
      const provider = await evm.getEip1193Provider();
      if (!provider) {
        const message = t("extend.perpetuals.order.needsEvmWallet");
        toast.error(message);
        throw new Error(message);
      }

      try {
        const {
          symbol,
          side,
          orderType,
          size,
          refPrice,
          szDecimals,
          price: limitPrice,
          reduceOnly,
          takeProfitPrice,
          stopLossPrice,
        } = request;

        const isBuy = side === "long";
        const asset = await getAssetIndex(symbol);

        // Slippage cap for market orders; for limit orders, use the
        // user-typed price as-is. Both still go through the formatter
        // so they respect HL's tick rules.
        const targetPx =
          orderType === "market"
            ? refPrice * (isBuy ? 1 + MARKET_SLIPPAGE : 1 - MARKET_SLIPPAGE)
            : (limitPrice ?? refPrice);
        const priceStr = formatHlPx(
          targetPx,
          szDecimals,
          isBuy ? "ceil" : "floor",
        );
        const sizeStr = formatHlSz(size, szDecimals);

        // TIF maps directly to the user-selected order type. We
        // default limit orders to GTC (resting indefinitely until
        // filled or cancelled); IOC / Alo are out of scope for v1.
        const tif: "FrontendMarket" | "Gtc" =
          orderType === "market" ? "FrontendMarket" : "Gtc";

        // Bracket legs close the entry, so they trade in the opposite
        // direction. The 8% slippage cap is applied to the *close*
        // direction — buy → ceil, sell → floor — same rule as entry,
        // just rebased on `triggerPx` instead of `refPrice`.
        const closeIsBuy = !isBuy;
        const closeRound: "ceil" | "floor" = closeIsBuy ? "ceil" : "floor";
        const closeSlipMul = closeIsBuy
          ? 1 + MARKET_SLIPPAGE
          : 1 - MARKET_SLIPPAGE;

        type TriggerLeg = {
          a: number;
          b: boolean;
          p: string;
          s: string;
          r: boolean;
          t: {
            trigger: {
              isMarket: boolean;
              triggerPx: string;
              tpsl: "tp" | "sl";
            };
          };
        };

        const buildTriggerLeg = (
          triggerPx: number,
          tpsl: "tp" | "sl",
        ): TriggerLeg => ({
          a: asset,
          b: closeIsBuy,
          p: formatHlPx(triggerPx * closeSlipMul, szDecimals, closeRound),
          // Same size as entry — `normalTpsl` brackets are fixed-size
          // (Hyperliquid won't auto-scale them when the position
          // grows), so we close the exact quantity we just opened.
          s: sizeStr,
          r: true,
          t: {
            trigger: {
              isMarket: true,
              triggerPx: formatHlPx(triggerPx, szDecimals, closeRound),
              tpsl,
            },
          },
        });

        // Treat 0 / NaN / undefined uniformly as "not set" — the form
        // models an unset TP/SL as `undefined`, but defensive parsing
        // of cached form values can occasionally surface `0`.
        const tpPx =
          takeProfitPrice && takeProfitPrice > 0 ? takeProfitPrice : undefined;
        const slPx =
          stopLossPrice && stopLossPrice > 0 ? stopLossPrice : undefined;
        const hasBracket = tpPx !== undefined || slPx !== undefined;

        const orders = [
          {
            a: asset,
            b: isBuy,
            p: priceStr,
            s: sizeStr,
            r: reduceOnly ?? false,
            t: { limit: { tif } },
          },
          ...(tpPx !== undefined ? [buildTriggerLeg(tpPx, "tp")] : []),
          ...(slPx !== undefined ? [buildTriggerLeg(slPx, "sl")] : []),
        ];

        const exchange = getExchangeClient(provider, evm.address as Hex);
        const result = await exchange.order({
          orders,
          // `normalTpsl` ships entry + TP/SL atomically; the venue
          // links the legs so a cancel of the parent also clears the
          // brackets. `na` is the lighter path for plain entry-only.
          grouping: hasBracket ? "normalTpsl" : "na",
        });

        const statuses = result.response.data.statuses;

        // Surface a rejected TP/SL leg as a hard failure rather than
        // letting the user's order go through with broken brackets.
        // We check ALL legs (not just `[0]`) because the venue
        // sometimes accepts entry while rejecting a leg whose trigger
        // crosses the spread.
        for (let i = 1; i < statuses.length; i++) {
          const legStatus = statuses[i];
          if (
            legStatus &&
            typeof legStatus === "object" &&
            "error" in legStatus
          ) {
            const legName = i === 1 && tpPx !== undefined ? "TP" : "SL";
            throw new Error(`${legName} leg rejected: ${String(legStatus.error)}`);
          }
        }

        const status = statuses[0];

        // The schema is a discriminated union with two flavours:
        //   - object variants: `{ filled }`, `{ resting }`, `{ error }`
        //   - string variants: `"waitingForFill"`, `"waitingForTrigger"`
        // The entry leg should never come back as a string variant
        // (those only apply to triggers), but we keep the guard so
        // TypeScript narrows the object variants safely below —
        // `'error' in status` doesn't compile when `status` could be
        // a string.
        if (typeof status === "string") {
          throw new Error(`Order accepted in unexpected state: ${status}`);
        }
        if ("error" in status) {
          throw new Error(String(status.error));
        }

        const filled = "filled" in status ? status.filled : undefined;
        const resting = "resting" in status ? status.resting : undefined;
        const oid = filled?.oid ?? resting?.oid;
        if (!oid) {
          throw new Error("Order accepted but no order ID returned");
        }
        const avgPrice = filled ? parseFloat(filled.avgPx) : undefined;

        // Refresh everything that could have changed:
        //   - positions: filled orders open / close positions
        //   - orders:    resting orders show up here
        //   - trades:    filled orders create new trade entries
        // Positions and orders share a single user-level cache slot
        // (per-symbol consumers derive via `select`), so we invalidate
        // by userAddress only — symbol-specific subtree slicing is no
        // longer part of the queryKey. Trades are still per-symbol.
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: positionsQueryKey({ userAddress: evm.address }),
          }),
          queryClient.invalidateQueries({
            queryKey: ordersQueryKey({ userAddress: evm.address }),
          }),
          queryClient.invalidateQueries({
            queryKey: tradesQueryKey({ userAddress: evm.address, symbol }),
          }),
        ]);

        // Different toast for filled vs resting so the user knows
        // whether they actually got fills (market) or just placed a
        // resting limit order.
        if (filled) {
          toast.success(
            t("extend.perpetuals.order.placed", {
              symbol,
              side: isBuy ? "Long" : "Short",
              avgPrice: avgPrice?.toLocaleString(undefined, {
                maximumFractionDigits: 6,
              }),
            }),
          );
        } else {
          toast.success(
            t("extend.perpetuals.order.resting", {
              symbol,
              side: isBuy ? "Long" : "Short",
            }),
          );
        }

        return {
          orderId: String(oid),
          symbol,
          side,
          orderType,
          status: filled ? "filled" : "pending",
          timestamp: Date.now(),
          avgPrice,
          raw: result,
        };
      } catch (error) {
        const reason =
          error instanceof Error
            ? error.message
            : t("extend.perpetuals.order.placeFailed");
        toast.error(t("extend.perpetuals.order.placeFailed", { reason }));
        throw error;
      }
    },
    [evm, queryClient, t],
  );
}
