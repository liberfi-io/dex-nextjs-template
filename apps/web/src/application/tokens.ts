import { Chain } from "@liberfi.io/types";

export const SOL_TOKEN_ADDRESS = "11111111111111111111111111111111";
export const SOL_TOKEN_SYMBOL = "SOL";
export const SOL_TOKEN_DECIMALS = 9;

export const ETH_TOKEN_SYMBOL = "ETH";
export const ETH_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ETH_TOKEN_DECIMALS = 18;

export const BNB_TOKEN_SYMBOL = "BNB";
export const BNB_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";
export const BNB_TOKEN_DECIMALS = 18;

export const getPrimaryTokenSymbol = (chainId: Chain) => {
  switch (chainId) {
    case Chain.SOLANA:
      return SOL_TOKEN_SYMBOL;
    case Chain.ETHEREUM:
      return ETH_TOKEN_SYMBOL;
    case Chain.BINANCE:
      return BNB_TOKEN_SYMBOL;
    default:
      return undefined;
  }
};

export const getPrimaryTokenAddress = (chainId: Chain) => {
  switch (chainId) {
    case Chain.SOLANA:
      return SOL_TOKEN_ADDRESS;
    case Chain.ETHEREUM:
      return ETH_TOKEN_ADDRESS;
    case Chain.BINANCE:
      return BNB_TOKEN_ADDRESS;
    default:
      return undefined;
  }
};

export const getPrimaryTokenDecimals = (chainId: Chain) => {
  switch (chainId) {
    case Chain.SOLANA:
      return SOL_TOKEN_DECIMALS;
    case Chain.ETHEREUM:
      return ETH_TOKEN_DECIMALS;
    case Chain.BINANCE:
      return BNB_TOKEN_DECIMALS;
    default:
      return undefined;
  }
};

export const getPrimaryTokenAvatar = (chainId: Chain) => {
  switch (chainId) {
    case Chain.SOLANA:
      return "/images/tokens/sol.svg";
    case Chain.ETHEREUM:
      return "/images/tokens/eth.webp";
    case Chain.BINANCE:
      return "/images/tokens/bnb.svg";
    default:
      return undefined;
  }
};
