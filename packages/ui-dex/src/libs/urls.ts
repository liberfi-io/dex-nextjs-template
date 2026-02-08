import { CHAIN_ID } from "@liberfi/core";

export function searchImageUrl(image: string) {
  return `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(image)}`;
}

export function searchTwitterUrl(q: string) {
  return `https://x.com/search?q=${encodeURIComponent(q)}`;
}

export const accountExplorerUrl = (chainId: CHAIN_ID, ca: string) => {
  switch (chainId) {
    case CHAIN_ID.SOLANA:
      return `https://solscan.io/account/${ca}`;
  }
  return undefined;
};
