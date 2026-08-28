import { PublicKey } from "@solana/web3.js";
import { Chain } from "@liberfi.io/types";

export const isValidWalletAddress = (chainId: Chain, walletAddress: string) => {
  switch (chainId) {
    case Chain.SOLANA:
      try {
        new PublicKey(walletAddress);
        return true;
      } catch {
        return false;
      }
    default:
      return false;
  }
};
