/**
 * Resolve a Hyperliquid asset index for the SDK's `${coin}-USDC`
 * symbol shape.
 *
 * Hyperliquid keys all signed actions (order, cancel, updateLeverage,
 * setReferrer, …) on a numeric `asset` index. The index is just the
 * position of the coin in `meta.universe` — fetched from the public
 * `info` endpoint and stable across the lifetime of a page session
 * (new listings only appear on hot upgrades, which the user
 * explicitly opts into via reload).
 *
 * The lookup is memoised per page so multiple concurrent callers
 * (leverage modal, order panel, future cancel flow) collapse onto a
 * single network round-trip.
 */
import { getInfoClient } from "./client";

/**
 * Page-session cache for `meta.universe`. Resolved exactly once;
 * subsequent calls reuse the same promise even before it settles.
 */
let universePromise: Promise<readonly { name: string }[]> | null = null;

/**
 * Resolve the Hyperliquid asset index for an SDK-shaped symbol.
 *
 * @param symbol - SDK symbol in `${coin}-USDC` form (e.g. "BTC-USDC").
 * @returns Numeric `asset` index for the coin.
 * @throws when the coin is not present in the venue's universe.
 */
export async function getAssetIndex(symbol: string): Promise<number> {
  if (!universePromise) {
    universePromise = getInfoClient()
      .meta()
      .then((meta) => meta.universe);
  }
  const universe = await universePromise;
  const coin = symbol.split("-")[0];
  const index = universe.findIndex((entry) => entry.name === coin);
  if (index < 0) {
    throw new Error(`Unknown Hyperliquid symbol: ${symbol}`);
  }
  return index;
}
