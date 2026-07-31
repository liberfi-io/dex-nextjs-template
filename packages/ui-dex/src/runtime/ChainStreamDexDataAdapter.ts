import {
  ChainStreamClient,
  Resolution,
  Token,
  TokenCandle,
  TokenMarketData,
} from "@chainstream-io/sdk";
import { Unsubscribable, WsCandle } from "@chainstream-io/sdk/stream";
import { Chain } from "@liberfi/core";
import {
  chainParam,
  fetchToken,
  fetchTokenCandles,
  fetchTokenMarketData,
  fetchTokens,
  UseTokenCandlesQueryParams,
  UseTokensQueryParams,
} from "@liberfi/react-dex";

export interface SubscribeTokenCandlesParams {
  chain: Chain;
  tokenAddress: string;
  resolution: Resolution;
  callback: (candle: WsCandle) => void;
}

export interface ChainStreamDexDataAdapter {
  getToken(chain: Chain, tokenAddress: string): Promise<Token>;
  getTokens(params: UseTokensQueryParams): Promise<Token[]>;
  getTokenMarketData(chain: Chain, tokenAddress: string): Promise<TokenMarketData | null>;
  getTokenCandles(params: UseTokenCandlesQueryParams): Promise<TokenCandle[]>;
  subscribeTokenCandles(params: SubscribeTokenCandlesParams): Unsubscribable | undefined;
}

export function createChainStreamDexDataAdapter(
  client: ChainStreamClient,
): ChainStreamDexDataAdapter {
  return {
    getToken: (chain, tokenAddress) => fetchToken(client, chain, tokenAddress),
    getTokens: (params) => fetchTokens(client, params),
    getTokenMarketData: (chain, tokenAddress) => fetchTokenMarketData(client, chain, tokenAddress),
    getTokenCandles: (params) => fetchTokenCandles(client, params),
    subscribeTokenCandles: ({ chain, ...params }) =>
      client.stream.subscribeTokenCandles({
        ...params,
        chain: chainParam(chain),
      }),
  };
}
