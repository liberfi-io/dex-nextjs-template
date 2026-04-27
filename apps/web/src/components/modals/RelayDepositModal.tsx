"use client";

/**
 * Relay Deposit Modal — Solana SOL → Hyperliquid Perp USDC.
 *
 * Wraps the SDK's `DepositFlowWidget` with the host-side concerns the
 * widget purposefully does NOT own:
 *
 *   - signAndBroadcast: bridge a base64 v0 transaction to whichever
 *     Solana wallet adapter is connected (`useConnectedWallet`).
 *   - default recipient: derive from the connected EVM wallet so the
 *     user does not have to paste their own address.
 *   - explorer URL builders: standard Solscan + Hyperliquid scan.
 *   - empty / unconfigured states: surfaced as inline messages so the
 *     button never opens a broken modal.
 *
 * The widget itself owns the form, quote orchestration, FSM, polling,
 * and confirmation/status modals — those concerns live in the SDK so
 * every consumer renders the exact same flow.
 */

import { useCallback, useMemo } from "react";
import { useTranslation } from "@liberfi.io/i18n";
import {
  ModalContent,
  StyledModal,
  XCloseIcon,
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
  DepositFlowWidget,
  usePerpDepositClient,
  type DepositSource,
} from "@liberfi.io/ui-perpetuals";

export const RELAY_DEPOSIT_MODAL_ID = "relay-deposit-sol-hl-perp";

const SOLSCAN_TX = "https://solscan.io/tx";
const HL_SCAN_TX = "https://app.hyperliquid.xyz/explorer/tx";

const DEPOSIT_SOURCE: DepositSource = "dex";

export function RelayDepositModal() {
  return (
    <AsyncModal id={RELAY_DEPOSIT_MODAL_ID}>
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

  // Surface a clear "not configured" message when the deposit client is
  // not wired (e.g. PERPETUALS_API_URL missing in production env). The
  // SDK throws otherwise, which would only surface as a runtime error.
  const depositClient = useSafePerpDepositClient();

  const handleClose = useCallback(() => {
    onOpenChange(false);
    onClose?.();
  }, [onOpenChange, onClose]);

  const signAndBroadcast = useCallback(
    async (serializedTxBase64: string) => {
      if (!sol) {
        throw new Error("Solana wallet not connected");
      }
      const bytes = base64ToBytes(serializedTxBase64);
      return sol.sendTransaction(bytes);
    },
    [sol],
  );

  const blocked = !depositClient
    ? t("extend.relayDeposit.needsConfig")
    : !sol
      ? t("extend.relayDeposit.needsSolWallet")
      : !evm
        ? t("extend.relayDeposit.needsEvmWallet")
        : null;

  return (
    <StyledModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      hideCloseButton
      backdrop="blur"
      classNames={{
        base: "!bg-[#18181b] !rounded-[14px] !border !border-[rgba(39,39,42,1)] !shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-w-[480px]",
        body: "!p-0",
      }}
    >
      <ModalContent>
        <div className="flex flex-col">
          <div className="flex items-start justify-between px-5 pt-5 pb-2">
            <div>
              <h3 className="text-base font-semibold text-white">
                {t("extend.relayDeposit.title")}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {t("extend.relayDeposit.subtitle")}
              </p>
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

          <div className="px-5 pb-5 pt-2">
            {blocked ? (
              <div className="rounded-[10px] border border-amber-500/20 bg-amber-500/5 px-4 py-6 text-sm text-amber-300">
                {blocked}
              </div>
            ) : (
              <DepositFlowWidget
                userSolanaAddress={sol!.address}
                userId={user?.id ?? sol!.address}
                source={DEPOSIT_SOURCE}
                defaultRecipient={evm!.address}
                signAndBroadcast={signAndBroadcast}
                buildSolanaExplorerUrl={(hash) => `${SOLSCAN_TX}/${hash}`}
                buildHyperliquidExplorerUrl={(hash) =>
                  `${HL_SCAN_TX}/${hash}`
                }
                onSettled={handleClose}
              />
            )}
            {!blocked && (
              <p className="mt-3 text-[11px] text-zinc-500 leading-relaxed text-center px-2">
                {t("extend.relayDeposit.recipientHint")}
              </p>
            )}
          </div>
        </div>
      </ModalContent>
    </StyledModal>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wrap `usePerpDepositClient` so that the modal can render an inline
 * "not configured" message instead of throwing when the consumer didn't
 * pass a `depositClient` to the provider.
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

export default RelayDepositModal;
