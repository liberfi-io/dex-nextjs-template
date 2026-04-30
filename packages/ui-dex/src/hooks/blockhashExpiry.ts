import { SwapRouteResponse } from "@chainstream-io/sdk";
import { Chain } from "@liberfi/core";
import { LatestBlock } from "@liberfi/react-dex";

const SOLANA_BLOCKHASH_VALIDITY_BLOCKS = 150;
const LATEST_BLOCK_CACHE_MAX_AGE_MS = 12_000;

export const PRE_SIGN_MIN_REMAINING_BLOCKS = 60;
export const POST_SIGN_MIN_REMAINING_BLOCKS = 40;

export class SwapRouteExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SwapRouteExpiredError";
  }
}

export function assertSwapRouteBlockhashFresh(
  chain: Chain,
  route: SwapRouteResponse,
  latestBlock: { data?: LatestBlock; dataUpdatedAt: number },
  minRemainingBlocks: number,
  messages: { stale: string; expired: string },
): void {
  if (chain !== Chain.SOLANA || route.lastValidBlockHeight == null) return;

  if (
    !latestBlock.data ||
    Date.now() - latestBlock.dataUpdatedAt > LATEST_BLOCK_CACHE_MAX_AGE_MS
  ) {
    throw new SwapRouteExpiredError(messages.stale);
  }

  const estimatedCurrentBlockHeight =
    latestBlock.data.lastValidBlockHeight - SOLANA_BLOCKHASH_VALIDITY_BLOCKS;
  const remainingBlocks =
    route.lastValidBlockHeight - estimatedCurrentBlockHeight;

  if (remainingBlocks < minRemainingBlocks) {
    throw new SwapRouteExpiredError(messages.expired);
  }
}
