import {
  GetFinalStretchTokensParams as GetFinalStretchTokensRequest,
  GetHotTokensParams as GetHotTokensRequest,
  GetMigratedTokensParams as GetMigratedTokensRequest,
  GetNewTokensParams as GetNewTokensRequest,
  GetStocksTokensParams as GetStocksTokensRequest,
  GetCandlesParams as GetCandlesRequest,
  GetHoldersParams as GetHoldersRequest,
  GetTokensParams as GetTokensRequest,
  SearchParams as SearchRequest,
  GetTradesParams as GetTradesRequest,
  SendTxInput as SendRequest,
  SwapRouteInput as RouteRequest,
  ChainSymbol,
} from "@chainstream-io/sdk";
import { CHAIN_ID } from "@liberfi/core";

export type ChainParam = ChainSymbol;


export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "24h";

export type HotTokensDuration = "1m" | "5m" | "1h" | "4h" | "24h";

export type UseHotTokensQueryParams = GetHotTokensRequest & {
  chain: CHAIN_ID;
  duration: HotTokensDuration;
};

export type UseNewTokensQueryParams = GetNewTokensRequest & {
  chain: CHAIN_ID;
};

export type UseFinalStretchTokensQueryParams = GetFinalStretchTokensRequest & {
  chain: CHAIN_ID;
};

export type UseMigratedTokensQueryParams = GetMigratedTokensRequest & {
  chain: CHAIN_ID;
};

export type UseSearchTokensQueryParams = Omit<SearchRequest, "chains"> & {
  chains?: CHAIN_ID[];
};

export type UseSendTransactionMutationParams = Omit<SendRequest, "chain"> & {
  chain: CHAIN_ID;
};

export type UseStockTokensQueryParams = GetStocksTokensRequest & {
  chain: CHAIN_ID;
};

export type UseSwapRouteQueryParams = Omit<RouteRequest, "chain"> & {
  chain: CHAIN_ID;
};

export type UseTokenCandlesQueryParams = Omit<GetCandlesRequest, "chain" | "_from"> & {
  chain: CHAIN_ID;
  tokenAddress: string;
  from?: number;
};

export type UseTokenHoldersQueryParams = Omit<GetHoldersRequest, "chain"> & {
  chain: CHAIN_ID;
  tokenAddress: string;
};

export type UseTokensQueryParams = Omit<GetTokensRequest, "chain" | "tokenAddresses"> & {
  chain: CHAIN_ID;
  tokenAddresses: string[];
};

export type UseTokenTradesQueryParams = Omit<
  GetTradesRequest,
  "chain" | "walletAddress" | "tokenAddress"
> & {
  chain: CHAIN_ID;
  tokenAddress: string;
};

export type UseWalletTradesQueryParams = Omit<
  GetTradesRequest,
  "chain" | "walletAddress" | "tokenAddress"
> & {
  chain: CHAIN_ID;
  walletAddress: string;
};

export class InvalidParamError extends Error {
  constructor(param: string) {
    super(`Invalid param "${param}"`);
    this.name = "InvalidParamError";
  }
}
