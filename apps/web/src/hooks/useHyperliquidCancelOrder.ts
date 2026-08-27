/**
 * Sign + relay Hyperliquid `cancel` actions from the browser.
 *
 * Mirrors {@link useHyperliquidPlaceOrder} / {@link useHyperliquidUpdateLeverage}:
 * the SDK widget owns UX (table, sort, confirm dialog, spinner), this
 * hook owns venue-specific bits (asset index resolution, EIP-712
 * signature, response parsing, cache invalidation, toast).
 *
 * The hook returns BOTH a single-cancel callback and a batch-cancel
 * callback so the SDK's `OpenOrdersWidget` can use:
 *
 *   - `cancelOrder`  → one signature per leg (per-row x button)
 *   - `cancelOrders` → ONE signature for ALL legs (`Cancel All`)
 *
 * The single-cancel path is implemented by reusing the batch path with
 * a 1-element array, so the venue logic (asset index resolution,
 * status parsing, cache invalidation) lives in exactly one place.
 *
 * Hyperliquid's `cancel` action shape (matches @nktkas/hyperliquid):
 *
 *   { type: "cancel", cancels: [ { a: <assetIdx>, o: <oid> }, ... ] }
 *
 * We deliberately use numeric `oid` cancels rather than `cancelByCloid`
 * because the SDK's `Order.orderId` carries the on-chain oid as a
 * string — `Number(oid)` round-trips exactly within JS's `Number.MAX_SAFE_INTEGER`
 * range and the venue accepts both.
 *
 * The hook does NOT track loading state — `useOpenOrdersScript` already
 * drives `isCanceling` from the returned promise. Keeping a single
 * source of truth avoids two dueling pending flags.
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
  type CancelOrderImpl,
  type CancelOrderParams,
  type CancelOrderResult,
  type CancelOrdersImpl,
} from "@liberfi.io/ui-perpetuals";

import { useStage53VenuePorts } from "../runtime/Stage53AdaptersProvider";
import { getAssetIndex, type GetInfoClient } from "../lib/hyperliquid/asset-index";

/**
 * Resolve a Hyperliquid `cancel` leg from an SDK `CancelOrderParams`.
 * Pulled out as a small helper so the (sync after a single async
 * `getAssetIndex`) parsing logic lives in one place.
 * @throws when the params lack an `orderId` — clientOrderId-only
 *   cancellation would require routing to `cancelByCloid` which
 *   we don't implement (the SDK's open-orders flow always carries
 *   a numeric `orderId`, so this is a defensive guard rather than
 *   a real branch).
 */
async function buildCancelLeg(
  params: CancelOrderParams,
  missingOrderIdMessage: string,
  getInfoClient: GetInfoClient,
): Promise<{ a: number; o: number }> {
  if (!params.orderId) {
    throw new Error(missingOrderIdMessage);
  }
  const a = await getAssetIndex(params.symbol, getInfoClient);
  const o = Number(params.orderId);
  if (!Number.isFinite(o) || !Number.isSafeInteger(o)) {
    throw new Error(`Unsupported orderId: ${params.orderId}`);
  }
  return { a, o };
}

/**
 * Build a `CancelOrderResult` from the SDK params + the venue's
 * status entry. The venue returns `"success"` or `{ error: <msg> }`
 * per leg; we surface the latter as a thrown error so the caller's
 * onError path runs, instead of silently leaving the order resting.
 */
function statusToResult(
  params: CancelOrderParams,
  status: "success" | { error: string },
  raw: unknown,
): CancelOrderResult {
  if (typeof status === "object" && status && "error" in status) {
    throw new Error(status.error);
  }
  return {
    orderId: params.orderId,
    clientOrderId: params.clientOrderId,
    symbol: params.symbol,
    status: "success",
    timestamp: Date.now(),
    raw,
  };
}

/**
 * Returns a stable pair of callbacks that submit Hyperliquid `cancel`
 * actions for the connected EVM wallet. The pair is shaped exactly
 * to match the SDK's `OpenOrdersWidget` IoC props
 * (`cancelOrder` + `cancelOrders`) so the page layer can
 * forward them verbatim.
 *
 * Rejects when no EVM wallet is connected, when the wallet doesn't
 * expose an EIP-1193 provider, or when the venue rejects the action.
 * The widget's `useMutation`-driven spinner surfaces all of those to
 * the caller's `onCancelError` prop, but this hook also fires its own
 * toast so the user gets immediate feedback.
 */
export function useHyperliquidCancelOrder(): {
  cancelOrder: CancelOrderImpl;
  cancelOrders: CancelOrdersImpl;
} {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const wallets = useWallets();
  const { getExchangeClient, getInfoClient } = useStage53VenuePorts();
  const evm = useMemo(
    () =>
      wallets.find(
        (w) => w.chainNamespace === "EVM" && w.isConnected,
      ) as EvmWalletAdapter | undefined,
    [wallets],
  );

  /**
   * Batch implementation. All single-leg paths funnel through here
   * with a 1-element array so the venue + cache logic lives in one
   * place. Returns the per-leg results in the SAME order as the input,
   * matching the {@link CancelOrdersImpl} contract.
   */
  const cancelOrders = useCallback<CancelOrdersImpl>(
    async (paramsList: CancelOrderParams[]): Promise<CancelOrderResult[]> => {
      if (paramsList.length === 0) return [];

      // Auth gate — same shape as the place-order / leverage hooks
      // so the user sees an identical error across all three flows.
      if (!evm?.address) {
        const message = t("extend.perpetuals.cancel.needsEvmWallet");
        toast.error(message);
        throw new Error(message);
      }
      const provider = await evm.getEip1193Provider();
      if (!provider) {
        const message = t("extend.perpetuals.cancel.needsEvmWallet");
        toast.error(message);
        throw new Error(message);
      }

      const missingOrderIdMessage = t(
        "extend.perpetuals.cancel.missingOrderId",
      );

      try {
        // Resolve every leg's asset index in parallel — they go
        // through the same `meta()` cache (see asset-index.ts) so
        // multiple legs collapse onto a single backend round-trip.
        const cancels = await Promise.all(
          paramsList.map((p) =>
            buildCancelLeg(p, missingOrderIdMessage, getInfoClient),
          ),
        );

        const exchange = getExchangeClient(provider, evm.address as Hex);
        const result = await exchange.cancel({ cancels });

        const statuses = result.response.data.statuses;
        if (statuses.length !== paramsList.length) {
          throw new Error(
            `Hyperliquid returned ${statuses.length} statuses for ${paramsList.length} cancels`,
          );
        }

        // Collect per-leg results, but surface the FIRST per-leg
        // error if any leg failed. We refresh caches and toast once
        // before throwing so the UI reflects the partial success
        // (a user with 5 orders sees 4 disappear + 1 error toast,
        // not all 5 still resting).
        const results: CancelOrderResult[] = [];
        let firstError: Error | null = null;
        for (let i = 0; i < statuses.length; i++) {
          try {
            results.push(
              statusToResult(paramsList[i]!, statuses[i]!, result),
            );
          } catch (err) {
            if (!firstError) {
              firstError =
                err instanceof Error ? err : new Error(String(err));
            }
            // Stub a "failed" result so the array stays index-aligned
            // with the input — the caller can filter for `status:
            // 'failed'` if it needs per-leg detail.
            results.push({
              orderId: paramsList[i]!.orderId,
              clientOrderId: paramsList[i]!.clientOrderId,
              symbol: paramsList[i]!.symbol,
              status: "failed",
              timestamp: Date.now(),
              raw: statuses[i],
            });
          }
        }

        // Refresh once at the end of the batch, not per leg, so a
        // 5-leg cancel triggers 1 React Query invalidation
        // round-trip rather than 5. Orders are keyed by user only
        // (per-symbol forms `select` from the same cache), so the
        // single invalidation handles every dependant view.
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ordersQueryKey({ userAddress: evm.address }),
          }),
          // Cancelling a TP/SL trigger could change a position's
          // displayed `tpPrice` / `slPrice` — invalidate positions
          // too so the row stays in sync.
          queryClient.invalidateQueries({
            queryKey: positionsQueryKey({ userAddress: evm.address }),
          }),
        ]);

        if (firstError) {
          throw firstError;
        }

        toast.success(t("extend.perpetuals.cancel.canceled"));
        return results;
      } catch (error) {
        const reason =
          error instanceof Error
            ? error.message
            : t("extend.perpetuals.cancel.cancelFailed", { reason: "" });
        toast.error(t("extend.perpetuals.cancel.cancelFailed", { reason }));
        throw error;
      }
    },
    [evm, getExchangeClient, getInfoClient, queryClient, t],
  );

  /**
   * Single-leg adapter — wraps the batch impl. We could special-case
   * the size-1 path, but routing through the same code keeps cache
   * invalidation, toast wording, and error parsing in lockstep.
   */
  const cancelOrder = useCallback<CancelOrderImpl>(
    async (params: CancelOrderParams): Promise<CancelOrderResult> => {
      const [result] = await cancelOrders([params]);
      if (!result) {
        throw new Error("cancelOrder returned no result");
      }
      return result;
    },
    [cancelOrders],
  );

  return { cancelOrder, cancelOrders };
}
