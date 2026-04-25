/**
 * Hyperliquid client factories.
 *
 * - `getInfoClient()` returns an unauthenticated `InfoClient` for read-only
 *   queries against `https://api.hyperliquid.xyz/info`.
 * - `getExchangeClient(provider, account)` wraps a browser EIP-1193 provider
 *   into a viem `WalletClient` and constructs an `ExchangeClient` for signed
 *   actions against `https://api.hyperliquid.xyz/exchange`.
 *
 * Hyperliquid user-signed actions (order, usdClassTransfer, etc.) require
 * `chainId = 0xa4b1` (Arbitrum One) in the EIP-712 domain regardless of
 * which chain the wallet is currently on.  We pin `signatureChainId` so
 * the SDK does not fall back to the wallet's reported chain.
 */
import { ExchangeClient, HttpTransport, InfoClient } from "@nktkas/hyperliquid";
import type { Eip1193Provider } from "@liberfi.io/wallet-connector";
import { createWalletClient, custom, type Hex } from "viem";
import { arbitrum } from "viem/chains";

export const HL_SIGNATURE_CHAIN_ID = "0xa4b1" as const;

export function getInfoClient(): InfoClient {
  const transport = new HttpTransport();
  return new InfoClient({ transport });
}

export function getExchangeClient(
  provider: Eip1193Provider,
  account: Hex,
): ExchangeClient {
  const wallet = createWalletClient({
    account,
    chain: arbitrum,
    transport: custom(provider as never),
  });
  const transport = new HttpTransport();
  return new ExchangeClient({
    transport,
    wallet,
    signatureChainId: HL_SIGNATURE_CHAIN_ID,
  });
}
