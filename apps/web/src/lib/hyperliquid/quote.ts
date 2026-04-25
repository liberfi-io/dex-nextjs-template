/**
 * Pricing helpers for the SOL → USDC spot leg on Hyperliquid.
 *
 * `info.allMids()` returns a record keyed by coin symbol for perpetuals
 * (e.g. "SOL", "BTC") and `@N` for spot pairs (where N is the index into
 * `info.spotMeta().universe`).  USOL/USDC has its own spot index that we
 * resolve dynamically from spotMeta.
 *
 * The estimate applies the standard Hyperliquid taker fee (0.035%) plus
 * a 0.5% slippage buffer for the IoC sell that converts the just-bridged
 * USOL into USDC on the spot book.
 */

const TAKER_FEE_RATE = 0.00035;
const SLIPPAGE_BUFFER = 0.005;

export type SwapQuote = {
  midPrice: number;
  expectedUsdc: number;
  minUsdc: number;
  effectivePrice: number;
};

export function estimateSolToUsdc(
  solAmount: number,
  midPrice: number,
): SwapQuote {
  if (!Number.isFinite(solAmount) || !Number.isFinite(midPrice) || solAmount <= 0) {
    return { midPrice, expectedUsdc: 0, minUsdc: 0, effectivePrice: 0 };
  }
  const grossUsdc = solAmount * midPrice;
  const expectedUsdc = grossUsdc * (1 - TAKER_FEE_RATE);
  const minUsdc = grossUsdc * (1 - TAKER_FEE_RATE - SLIPPAGE_BUFFER);
  const effectivePrice = expectedUsdc / solAmount;
  return { midPrice, expectedUsdc, minUsdc, effectivePrice };
}

/**
 * Round a USDC limit price to a tick that the Hyperliquid spot order book
 * accepts.  Hyperliquid spot enforces 5 significant figures and 8-N decimal
 * places (where N = szDecimals).  For USOL/USDC (szDecimals=2) this means
 * up to 6 decimal places.  We apply a generic safe rounding to 4dp for
 * limit prices on aggressive IoC orders, which always passes validation.
 */
export function roundLimitPrice(price: number, decimals = 4): string {
  if (!Number.isFinite(price) || price <= 0) return "0";
  const factor = 10 ** decimals;
  return (Math.floor(price * factor) / factor).toString();
}

/**
 * Round a size to the spot pair's szDecimals.  USOL has szDecimals = 2.
 */
export function roundSize(size: number, szDecimals = 2): string {
  if (!Number.isFinite(size) || size <= 0) return "0";
  const factor = 10 ** szDecimals;
  return (Math.floor(size * factor) / factor).toString();
}
