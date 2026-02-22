import { PnlDetailItemDTO, PnlDetailsPage, WalletNetWorthItemDTO, WalletNetWorthPage } from "@chainstream-io/sdk";
import { Chain } from "@liberfi/core";
import { chainSlug } from "@liberfi.io/utils";
import { PRIMARY_TOKENS_MAP } from "./tokenUtils";
import { capitalize } from "lodash-es";
import { PublicKey } from "@solana/web3.js";

export function appendPrimaryTokenNetWorth(
  chainId: Chain,
  inWalletNetWorth: WalletNetWorthPage,
): WalletNetWorthPage {
  const walletNetWorth = { ...inWalletNetWorth, data: [...(inWalletNetWorth.data ?? [])] };
  (PRIMARY_TOKENS_MAP[chainId] ?? []).forEach((token) => {
    const balance = walletNetWorth.data.find((it) => it.tokenAddress === token.address);
    if (!balance) {
      walletNetWorth.data.push({
        tokenAddress: token.address,
        name: token.name,
        symbol: token.symbol,
        logoUri: token.imageUrl,
        amount: "0",
        valueInUsd: "0",
        valueInNative: "0",
        priceInUsd: "0",
        priceInNative: "0",
      } as WalletNetWorthItemDTO);
    }
  });
  return walletNetWorth;
}

export function appendPrimaryTokenPnl(
  chainId: Chain,
  inWalletPnl: PnlDetailsPage,
): PnlDetailsPage {
  const walletPnl = { ...inWalletPnl, data: [...(inWalletPnl.data ?? [])] };
  (PRIMARY_TOKENS_MAP[chainId] ?? []).forEach((token) => {
    const details = walletPnl.data.find((it) => it.tokenAddress === token.address);
    if (!details) {
      walletPnl.data.push({
        tokenAddress: token.address,
        name: token.name,
        symbol: token.symbol,
        logoUri: token.imageUrl,
      } as PnlDetailItemDTO);
    }
  });
  return walletPnl;
}

// 示例: https://opencrypto.pro/widget-page/mobileTran?widgetId=STlhSHJkZEc&tradeType=buy&cryptoCoin=USDT&network=Solana&walletAddress=2efnxsDRZRoFgdPRk2CadaN8SvmiZMHChd285AAjPU86&locale=en&fiatCoin=USD&fiatAmt=200
export const getBuyTokenUrl = ({
  chainId,
  walletAddress,
  language = "en",
  token = "usdt",
  fiatCurrency = "usd",
  fiatAmount = "200",
}: {
  chainId: Chain;
  walletAddress: string;
  language?: string;
  token?: string;
  fiatCurrency?: string;
  fiatAmount?: number | string;
}) => {
  const params = new URLSearchParams({
    widgetId: "STlhSHJkZEc",
    tradeType: "buy",
    cryptoCoin: token.toUpperCase(),
    walletAddress,
    network: capitalize(chainSlug(chainId)),
    fiatCoin: fiatCurrency.toUpperCase(),
    fiatAmt: fiatAmount.toString(),
    locale: language,
  });
  return `https://opencrypto.pro/widget-page/mobileTran?${params.toString()}`;
};

// 示例: https://opencrypto.pro/widget-page/mobileTran?widgetId=STlhSHJkZEc&tradeType=sell&cryptoCoin=USDT&network=Solana&walletAddress=2efnxsDRZRoFgdPRk2CadaN8SvmiZMHChd285AAjPU86&locale=en&fiatCoin=USD&fiatAmt=200
export const getSellTokenUrl = ({
  chainId,
  walletAddress,
  language = "en",
  token = "usdt",
  fiatCurrency = "usd",
  fiatAmount = "200",
}: {
  chainId: Chain;
  walletAddress: string;
  language?: string;
  token?: string;
  fiatCurrency?: string;
  fiatAmount?: number | string;
}) => {
  const params = new URLSearchParams({
    widgetId: "STlhSHJkZEc",
    tradeType: "sell",
    cryptoCoin: token.toUpperCase(),
    walletAddress,
    network: capitalize(chainSlug(chainId)),
    fiatCoin: fiatCurrency.toUpperCase(),
    fiatAmt: fiatAmount.toString(),
    locale: language,
  });
  return `https://opencrypto.pro/widget-page/mobileTran?${params.toString()}`;
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
