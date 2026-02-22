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
import { Chain } from "@liberfi/core";

export type ChainParam = ChainSymbol;


export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "24h";

export type HotTokensDuration = "1m" | "5m" | "1h" | "4h" | "24h";

export type UseHotTokensQueryParams = GetHotTokensRequest & {
  chain: Chain;
  duration: HotTokensDuration;
};

export type UseNewTokensQueryParams = GetNewTokensRequest & {
  chain: Chain;
};

export type UseFinalStretchTokensQueryParams = GetFinalStretchTokensRequest & {
  chain: Chain;
};

export type UseMigratedTokensQueryParams = GetMigratedTokensRequest & {
  chain: Chain;
};

export type UseSearchTokensQueryParams = Omit<SearchRequest, "chains"> & {
  chains?: Chain[];
};

export type UseSendTransactionMutationParams = Omit<SendRequest, "chain"> & {
  chain: Chain;
};

export type UseStockTokensQueryParams = GetStocksTokensRequest & {
  chain: Chain;
};

export type UseSwapRouteQueryParams = Omit<RouteRequest, "chain"> & {
  chain: Chain;
};

export type UseTokenCandlesQueryParams = Omit<GetCandlesRequest, "chain" | "_from"> & {
  chain: Chain;
  tokenAddress: string;
  from?: number;
};

export type UseTokenHoldersQueryParams = Omit<GetHoldersRequest, "chain"> & {
  chain: Chain;
  tokenAddress: string;
};

export type UseTokensQueryParams = Omit<GetTokensRequest, "chain" | "tokenAddresses"> & {
  chain: Chain;
  tokenAddresses: string[];
};

export type UseTokenTradesQueryParams = Omit<
  GetTradesRequest,
  "chain" | "walletAddress" | "tokenAddress"
> & {
  chain: Chain;
  tokenAddress: string;
};

export type UseWalletTradesQueryParams = Omit<
  GetTradesRequest,
  "chain" | "walletAddress" | "tokenAddress"
> & {
  chain: Chain;
  walletAddress: string;
};

export class InvalidParamError extends Error {
  constructor(param: string) {
    super(`Invalid param "${param}"`);
    this.name = "InvalidParamError";
  }
}
