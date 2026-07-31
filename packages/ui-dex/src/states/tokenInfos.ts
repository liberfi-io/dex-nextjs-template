/**
 * Manage multiple token infos
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BehaviorSubject, EMPTY, filter, switchMap, take } from "rxjs";
import { flatten, groupBy, isArray, isEqual } from "lodash-es";
import { Token } from "@chainstream-io/sdk";
import { Chain } from "@liberfi/core";
import {
  parseTickerSymbol,
  stringifyTickerSymbol,
  stringifyTickerSymbolByChainSlug,
} from "../libs";
import { useTokenQuery } from "@liberfi/react-dex";
import { DexDataRuntime, useDexDataRuntime } from "../runtime";

/**
 * rxjs for non-hooks state management
 */
export const tokenInfoMapSubject = new BehaviorSubject(new Map<string, Token>());

/**
 * Set the token info to the state, for non-hooks usage
 * @param tokenInfos - The token info or token infos
 * @param mode - The mode, "merge" or "replace"
 */
export function setTokenInfo(tokenInfos: Token | Token[], mode: "merge" | "replace" = "merge") {
  let updated = false;

  const tokenInfoMap = tokenInfoMapSubject.value;

  if (isArray(tokenInfos)) {
    tokenInfos.forEach((tokenInfo) => {
      const tickerSymbol = stringifyTickerSymbolByChainSlug(tokenInfo.chain, tokenInfo.address);
      if (mode === "replace") {
        tokenInfoMap.set(tickerSymbol, tokenInfo);
        updated = true;
      } else {
        const prev = tokenInfoMap.get(tickerSymbol);
        const merged = { ...prev, ...tokenInfo };
        if (!isEqual(prev, merged)) {
          tokenInfoMap.set(tickerSymbol, merged);
          updated = true;
        }
      }
    });
  } else {
    const tokenInfo = tokenInfos;
    const tickerSymbol = stringifyTickerSymbolByChainSlug(tokenInfo.chain, tokenInfo.address);
    if (mode === "replace") {
      tokenInfoMap.set(tickerSymbol, tokenInfo);
      updated = true;
    } else {
      const prev = tokenInfoMap.get(tickerSymbol);
      const merged = { ...prev, ...tokenInfo };
      if (!isEqual(prev, merged)) {
        tokenInfoMap.set(tickerSymbol, merged);
        updated = true;
      }
    }
  }

  if (updated) {
    tokenInfoMapSubject.next(new Map(tokenInfoMap));
  }
}

/**
 * Get the token info from the state, for non-hooks usage
 * @param chainId - The chain id
 * @param address - The token address
 * @returns The token info
 */
export function getTokenInfo(chainId: Chain, address: string): Token | null {
  const tickerSymbol = stringifyTickerSymbol(chainId, address);
  return tokenInfoMapSubject.value.get(tickerSymbol) || null;
}

/**
 * Wait for the token to be loaded, and then merge the token info
 * @param chainId - The chain id
 * @param address - The token address
 * @param tokenInfo - The token info to merge
 */
export function mergeTokenInfoAfterBaseInfoLoaded(
  chainId: Chain,
  address: string,
  tokenInfo: Pick<Token, "chain" | "address"> & Partial<Omit<Token, "chain" | "address">>,
) {
  const tickerSymbol = stringifyTickerSymbol(chainId, address);
  return tokenInfoMapSubject.pipe(
    filter((tokenInfoMap) => !!tokenInfoMap.get(tickerSymbol)),
    take(1), // wait for the token info to be loaded
    switchMap(() => {
      setTokenInfo(tokenInfo as Token, "merge");
      return EMPTY;
    }),
  );
}

/**
 * Fetch the token infos and then set it to the token info map state
 * @param runtime - The instance-scoped data runtime
 * @param chainId - The chain id
 * @param addresses - The token addresses
 */
async function fetchTokenInfos(
  runtime: DexDataRuntime,
  chainId: Chain,
  addresses: string | string[],
): Promise<Token[]> {
  let tokenInfos: Token[];

  if (isArray(addresses) && addresses.length > 1) {
    tokenInfos = await runtime.getTokens({ chain: chainId, tokenAddresses: addresses });
  } else {
    const address = isArray(addresses) ? addresses[0] : addresses;
    const tokenInfo = await runtime.getToken(chainId, address);
    tokenInfos = [tokenInfo];
  }
  setTokenInfo(tokenInfos, "merge");
  return tokenInfos;
}

const batchWindow = 0;
interface TokenBatchState {
  timer: unknown;
  tickerSymbols: Set<string>;
  resolvers: Map<
    string,
    { resolve: (tokenInfo: Token | null) => void; reject: (err: unknown) => void }
  >;
}
const tokenBatchStates = new WeakMap<DexDataRuntime, TokenBatchState>();

function getTokenBatchState(runtime: DexDataRuntime): TokenBatchState {
  const current = tokenBatchStates.get(runtime);
  if (current) return current;
  const created: TokenBatchState = {
    timer: undefined,
    tickerSymbols: new Set(),
    resolvers: new Map(),
  };
  tokenBatchStates.set(runtime, created);
  return created;
}

/**
 * Combine multiple token info fetch requests
 * @param runtime - The instance-scoped data runtime
 * @param chainId - The chain id
 * @param address - The token address
 * @returns The token info
 */
async function fetchTokenInfoInBatch(runtime: DexDataRuntime, chainId: Chain, address: string) {
  const batch = getTokenBatchState(runtime);
  if (batch.timer) {
    runtime.cancelScheduled(batch.timer);
    batch.timer = undefined;
  }

  const tickerSymbol = stringifyTickerSymbol(chainId, address);
  batch.tickerSymbols.add(tickerSymbol);

  batch.timer = runtime.schedule(async () => {
    const resolvers = Array.from(batch.resolvers.entries());
    try {
      const validTickerSymbols = Array.from(batch.tickerSymbols).filter(
        (ts) => parseTickerSymbol(ts) !== null,
      );
      const groupedTickerSymbols = groupBy(
        validTickerSymbols,
        (tickerSymbol) => parseTickerSymbol(tickerSymbol)!.chainId,
      );

      const tokenInfos = flatten(
        await Promise.all(
          Object.entries(groupedTickerSymbols).map(([chainId, tickerSymbols]) =>
            fetchTokenInfos(
              runtime,
              chainId as Chain,
              tickerSymbols.map((tickerSymbol) => parseTickerSymbol(tickerSymbol)!.address),
            ),
          ),
        ),
      );

      resolvers.forEach(([tickerSymbol, { resolve }]) => {
        const tokenInfo = tokenInfos.find(
          (tokenInfo) =>
            stringifyTickerSymbolByChainSlug(tokenInfo.chain, tokenInfo.address) === tickerSymbol,
        );
        resolve(tokenInfo || null);
      });
    } catch (err) {
      resolvers.forEach(([_tickerSymbol, { reject }]) => {
        reject(err);
      });
    } finally {
      batch.resolvers.clear();
    }
    batch.timer = undefined;
    batch.tickerSymbols.clear();
  }, batchWindow);

  return new Promise<Token | null>((resolve, reject) => {
    batch.resolvers.set(tickerSymbol, { resolve, reject });
  });
}

export async function fetchTokenInfo(
  runtime: DexDataRuntime,
  chainId: Chain,
  address: string,
  mode: string = "single",
): Promise<Token | null> {
  // TODO check address is valid
  if (mode === "batch") {
    return fetchTokenInfoInBatch(runtime, chainId, address);
  } else {
    const tokenInfos = await fetchTokenInfos(runtime, chainId, address);
    return tokenInfos[0] || null;
  }
}

/**
 * Fetch the token infos for the multiple trading view charts
 * @param chainId - The chain id
 * @param address - The current selected chart's token address
 */
export function useTvChartMultiTokens(chainId: Chain, address: string) {
  const runtime = useDexDataRuntime();
  useLayoutEffect(() => {
    let fetched = false;
    // load the tv chart configs
    // TODO storage adapter
    const tvChartConfigStr = localStorage.getItem("kline");
    if (tvChartConfigStr) {
      const tvChartConfig = JSON.parse(tvChartConfigStr);
      const tvChartAreas = tvChartConfig?.areas;
      if (tvChartAreas && tvChartAreas.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tvChartAreas.forEach((area: any) => {
          if (area.dataReady) {
            const parsed = parseTickerSymbol(area.tickerSymbol);
            if (!parsed) return;
            fetchTokenInfo(runtime, parsed.chainId, parsed.address, "batch");
            if (parsed.chainId === chainId && parsed.address === address) {
              fetched = true;
            }
          }
        });
      }
    }

    if (!fetched) {
      fetchTokenInfo(runtime, chainId, address, "batch");
    }
  }, [chainId, address, runtime]);
}

/**
 * Refetch the token repeatedly
 * @param chainId - The chain id
 * @param address - The token address
 */
export function useRefreshToken(chainId: Chain, address: string) {
  const { data: tokenInfo } = useTokenQuery(chainId, address, {
    refetchInterval: 15e3,
    enabled: !!address,
  });

  useEffect(() => {
    if (tokenInfo) {
      setTokenInfo(tokenInfo, "merge");
    }
  }, [tokenInfo]);
}

/**
 * Get the latest token info from rxjs subject, used in hooks
 * @param chainId - The chain id
 * @param address - The token address
 * @param transform - The transform function, if not provided, the token info will be returned as is
 * @returns The token info
 */
export function useTokenInfo(
  chainId: Chain,
  address: string,
  transform?: (tokenInfo: Token) => Token,
): Token | null {
  const runtime = useDexDataRuntime();
  const [tokenInfo, setTokenInfo] = useState<Token | null>(null);
  // used to avoid re-rendering
  const tokenInfoRef = useRef<Token | null>(null);

  useLayoutEffect(() => {
    // initial load
    if (!getTokenInfo(chainId, address)) {
      fetchTokenInfo(runtime, chainId, address);
    }

    // reset when the chainId or address changes
    setTokenInfo(null);
    tokenInfoRef.current = null;

    // subscribe the token changes
    const sub = tokenInfoMapSubject.subscribe({
      next: (tokenInfoMap) => {
        const tickerSymbol = stringifyTickerSymbol(chainId, address);
        const tokenInfo = tokenInfoMap.get(tickerSymbol) || null;
        const transformed = transform && tokenInfo ? transform(tokenInfo) : tokenInfo;
        if (transformed && !isEqual(transformed, tokenInfoRef.current)) {
          setTokenInfo(transformed);
          tokenInfoRef.current = transformed;
        }
      },
      error: (err) => {
        console.error("useTokenInfo subscription error", err);
      },
    });

    return () => {
      sub.unsubscribe();
      setTokenInfo(null);
      tokenInfoRef.current = null;
    };
  }, [chainId, address, runtime, transform]);

  return tokenInfo;
}
