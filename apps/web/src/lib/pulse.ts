import { Chain } from "@liberfi.io/types";

export const PULSE_SUPPORTED_CHAINS = [Chain.SOLANA] as const;

export function isPulseSupportedChain(chain: Chain): boolean {
  return PULSE_SUPPORTED_CHAINS.includes(chain as (typeof PULSE_SUPPORTED_CHAINS)[number]);
}
