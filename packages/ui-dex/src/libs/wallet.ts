import { Chain } from "@liberfi/core";
import { chainSlug } from "@liberfi.io/utils";
import { PublicKey } from "@solana/web3.js";

const TRANSAK_BASE_URL = "https://global.transak.com";

/** Maps internal Chain enum to Transak's network identifier. */
const TRANSAK_NETWORK_MAP: Partial<Record<Chain, string>> = {
  [Chain.SOLANA]: "solana",
  [Chain.ETHEREUM]: "ethereum",
  [Chain.BINANCE]: "bsc",
  [Chain.POLYGON]: "polygon",
  [Chain.ARBITRUM]: "arbitrum",
  [Chain.OPTIMISM]: "optimism",
  [Chain.BASE]: "base",
};

/** Default token per network for the buy flow. */
const TRANSAK_DEFAULT_TOKEN: Partial<Record<Chain, string>> = {
  [Chain.SOLANA]: "SOL",
  [Chain.ETHEREUM]: "ETH",
  [Chain.BINANCE]: "BNB",
  [Chain.POLYGON]: "MATIC",
  [Chain.ARBITRUM]: "ETH",
  [Chain.OPTIMISM]: "ETH",
  [Chain.BASE]: "ETH",
};

const getTransakApiKey = () =>
  process.env.NEXT_PUBLIC_TRANSAK_API_KEY ?? "";

export const getBuyTokenUrl = ({
  chainId,
  walletAddress,
  language = "en",
  token,
  fiatCurrency = "USD",
  fiatAmount = "200",
}: {
  chainId: Chain;
  walletAddress: string;
  language?: string;
  token?: string;
  fiatCurrency?: string;
  fiatAmount?: number | string;
}) => {
  const network = TRANSAK_NETWORK_MAP[chainId] ?? "solana";
  const cryptoCurrency = token?.toUpperCase() ?? TRANSAK_DEFAULT_TOKEN[chainId] ?? "USDT";
  const params = new URLSearchParams({
    apiKey: getTransakApiKey(),
    network,
    cryptoCurrencyCode: cryptoCurrency,
    walletAddress,
    fiatCurrency: fiatCurrency.toUpperCase(),
    fiatAmount: fiatAmount.toString(),
    defaultPaymentMethod: "credit_debit_card",
    disableWalletAddressForm: "true",
    isFeeCalculationHidden: "false",
    hideMenu: "true",
    ...(language && { language }),
  });
  return `${TRANSAK_BASE_URL}?${params.toString()}`;
};

export const getSellTokenUrl = ({
  chainId,
  walletAddress,
  language = "en",
  token,
  fiatCurrency = "USD",
  fiatAmount = "200",
}: {
  chainId: Chain;
  walletAddress: string;
  language?: string;
  token?: string;
  fiatCurrency?: string;
  fiatAmount?: number | string;
}) => {
  const network = TRANSAK_NETWORK_MAP[chainId] ?? "solana";
  const cryptoCurrency = token?.toUpperCase() ?? TRANSAK_DEFAULT_TOKEN[chainId] ?? "USDT";
  const params = new URLSearchParams({
    apiKey: getTransakApiKey(),
    network,
    cryptoCurrencyCode: cryptoCurrency,
    walletAddress,
    fiatCurrency: fiatCurrency.toUpperCase(),
    fiatAmount: fiatAmount.toString(),
    defaultPaymentMethod: "credit_debit_card",
    disableWalletAddressForm: "true",
    hideMenu: "true",
    transakFlowType: "sell",
    ...(language && { language }),
  });
  return `${TRANSAK_BASE_URL}?${params.toString()}`;
};

export const getTxExplorerUrl = (chainId: Chain, txHash: string) => {
  switch (chainId) {
    case Chain.SOLANA:
      return `https://solscan.io/tx/${txHash}`;
  }
  return undefined;
};

export const WRAPPED_ADDRESSES: Record<string, Record<string, string>> = {
  [chainSlug(Chain.SOLANA)!]: {
    "11111111111111111111111111111111": "So11111111111111111111111111111111111111112",
  },
};

export const getWrappedAddress = (chainId: Chain, tokenAddress: string) => {
  const wrappedAddresses = WRAPPED_ADDRESSES[chainSlug(chainId)!] ?? {};
  if (wrappedAddresses[tokenAddress]) {
    return wrappedAddresses[tokenAddress];
  }
  return undefined;
};

export const getUnwrappedAddress = (chainId: Chain, tokenAddress: string) => {
  const wrappedAddresses = WRAPPED_ADDRESSES[chainSlug(chainId)!] ?? {};
  for (const [key, value] of Object.entries(wrappedAddresses)) {
    if (value === tokenAddress) {
      return key;
    }
  }
  return undefined;
};

export const SOL_TOKEN_ADDRESS = "11111111111111111111111111111111";

export const SOL_TOKEN_SYMBOL = "SOL";

export const SOL_TOKEN_DECIMALS = 9;

export const PRIMARY_TOKEN_ADDRESSES: Record<string, string[]> = {
  [chainSlug(Chain.SOLANA)!]: [
    // sol
    SOL_TOKEN_ADDRESS,
    // usdc
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    // usdt
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  ],
};

export const isValidWalletAddress = (chainId: Chain, walletAddress: string) => {
  switch (chainId) {
    case Chain.SOLANA:
      try {
        new PublicKey(walletAddress);
        return true;
        // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (_: unknown) {
        return false;
      }
    default:
      return false;
  }
};

export const getBubbleMapUrl = (chainId: Chain, tokenAddress: string) => {
  switch (chainId) {
    case Chain.SOLANA:
      return `https://app.insightx.network/bubblemaps/solana/${tokenAddress}`;
    // return `https://faster100x.com/zh/embedded?tokenAddress=${tokenAddress}&tokenChain=sol`;
  }
  return undefined;
};
