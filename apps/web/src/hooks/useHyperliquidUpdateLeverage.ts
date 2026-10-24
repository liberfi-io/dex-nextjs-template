/**
 * Sign + relay a Hyperliquid `updateLeverage` action from the browser.
 *
 * The mutation:
 *   1. Resolves the Hyperliquid asset id for `symbol` from a cached
 *      `meta()` query (universe index → asset id, per the public docs).
 *   2. Wraps the connected EVM wallet's EIP-1193 provider into a viem
 *      `WalletClient` and constructs an `ExchangeClient` pinned to the
 *      Arbitrum One signature chain id (`0xa4b1`).
 *   3. POSTs the signed `updateLeverage` action to
 *      `https://api.hyperliquid.xyz/exchange`.
 *   4. Invalidates the SDK's positions and active-asset-leverage
 *      queries so the form's leverage badge — which now reads from the
 *      `activeAssetData` info endpoint as its source of truth —
 *      refetches and reflects the new value on next paint.
 *   5. Returns control to the caller; the consumer surfaces toasts so
 *      the SDK widget stays decoupled from the host's UX library.
 *
 * The hook does NOT track loading state — the leverage modal in
 * `@liberfi.io/ui-perpetuals` already drives its button's spinner from
 * the returned promise's lifecycle. Keeping a single source of truth
 * avoids two dueling pending flags.
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
  activeAssetLeverageQueryKey,
  positionsQueryKey,
} from "@liberfi.io/ui-perpetuals";

import { useStage53VenuePorts } from "../runtime/Stage53AdaptersProvider";
import { getAssetIndex } from "../lib/hyperliquid/asset-index";

/**
 * Cross or isolated margin selector. Hyperliquid stores the choice
 * per-asset, per-user; the modal currently only configures isolated
 * leverage, mirroring the curl example provided by the user.
 */
const DEFAULT_IS_CROSS = false;

export type UpdateLeverageParams = {
  symbol: string;
  leverage: number;
};

/**
 * Returns a stable callback that submits a Hyperliquid `updateLeverage`
 * action for the connected EVM wallet. The function rejects when no
 * EVM wallet is connected, when the wallet doesn't expose an EIP-1193
 * provider, or when the API rejects the action — callers (or the
 * leverage modal) can surface those failures however they like.
 */
export function useHyperliquidUpdateLeverage(): (
  params: UpdateLeverageParams,
) => Promise<void> {
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

  return useCallback(
    async ({ symbol, leverage }: UpdateLeverageParams) => {
      if (!evm?.address) {
        const message = t("perpetuals.leverage.needsEvmWallet");
        toast.error(message);
        throw new Error(message);
      }
      const provider = await evm.getEip1193Provider();
      if (!provider) {
        const message = t("perpetuals.leverage.needsEvmWallet");
        toast.error(message);
        throw new Error(message);
      }
      try {
        const asset = await getAssetIndex(symbol, getInfoClient);
        const exchange = getExchangeClient(provider, evm.address as Hex);
        await exchange.updateLeverage({
          asset,
          isCross: DEFAULT_IS_CROSS,
          leverage,
        });
        // Refresh both the positions query (in case the user has an
        // open position whose displayed leverage now changed) and the
        // active-asset leverage query (the form's source of truth for
        // the leverage badge). Running both in parallel keeps the UI
        // consistent even when the user has no open position for the
        // symbol — `activeAssetData` updates regardless.
        // Positions are keyed by userAddress only — per-symbol forms
        // derive via TanStack Query's `select` option.
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: positionsQueryKey({ userAddress: evm.address }),
          }),
          queryClient.invalidateQueries({
            queryKey: activeAssetLeverageQueryKey({
              userAddress: evm.address,
              symbol,
            }),
          }),
        ]);
        toast.success(
          t("perpetuals.leverage.updated", { value: leverage }),
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t("perpetuals.leverage.updateFailed");
        toast.error(
          t("perpetuals.leverage.updateFailed", { reason: message }),
        );
        throw error;
      }
    },
    [evm, getExchangeClient, getInfoClient, queryClient, t],
  );
}
