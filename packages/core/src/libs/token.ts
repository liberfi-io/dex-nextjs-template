import { Chain } from "@liberfi.io/types";

export const SOL_TOKEN_ADDRESS = "11111111111111111111111111111111";
export const SOL_TOKEN_SYMBOL = "SOL";
export const SOL_TOKEN_DECIMALS = 9;
export const SOL_USDC_TOKEN_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const SOL_USDT_TOKEN_ADDRESS = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";
export const SOL_WRAPPED_TOKEN_ADDRESS = "So11111111111111111111111111111111111111112";

export const ETH_TOKEN_SYMBOL = "ETH";
export const ETH_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ETH_TOKEN_DECIMALS = 18;
export const ETH_WRAPPED_TOKEN_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

export const BNB_TOKEN_SYMBOL = "BNB";
export const BNB_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";
export const BNB_WRAPPED_TOKEN_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
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

export const SOLANA_PROTOCOLS = [
  "bags",
  "believe",
  "bonk",
  "boop",
  "heaven",
  "jupstudio",
  "launchlab",
  "meteora",
  "moonit",
  "moonshot",
  "orca",
  "pump",
  "raydium",
  "sugar",
  "virtual-curve",
];

export const getTokenProtocol = (chainId: Chain, protocolFamily: string) => {
  switch (chainId) {
    case Chain.SOLANA:
      return SOLANA_PROTOCOLS.find((p) => new RegExp(p, "i").test(protocolFamily));
    default:
      return undefined;
  }
};

export const getWrappedTokenAddress = (chainId: Chain, tokenAddress: string) => {
  switch (chainId) {
    case Chain.SOLANA:
      return tokenAddress === SOL_TOKEN_ADDRESS ? SOL_WRAPPED_TOKEN_ADDRESS : undefined;
    default:
      return undefined;
  }
};

export const getUnwrappedTokenAddress = (chainId: Chain, tokenAddress: string) => {
  switch (chainId) {
    case Chain.SOLANA:
      return tokenAddress === SOL_WRAPPED_TOKEN_ADDRESS ? SOL_TOKEN_ADDRESS : undefined;
    default:
      return undefined;
  }
};
