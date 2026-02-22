/**
 * Manage multiple token infos
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BehaviorSubject, EMPTY, filter, switchMap, take } from "rxjs";
import { flatten, groupBy, isArray, isEqual } from "lodash-es";
import { Token } from "@chainstream-io/sdk";
import { CHAIN_ID } from "@liberfi/core";
import { parseTickerSymbol, stringifyTickerSymbol, stringifyTickerSymbolByChainSlug } from "../libs";
import { dexClientSubject, queryClientSubject } from "@liberfi/ui-base";
import { fetchToken, fetchTokens, QueryKeys, useTokenQuery } from "@liberfi/react-dex";

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
export function getTokenInfo(chainId: CHAIN_ID, address: string): Token | null {
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
  chainId: CHAIN_ID,
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
 * @param chainId - The chain id
 * @param addresses - The token addresses
 */
async function fetchTokenInfos(chainId: CHAIN_ID, addresses: string | string[]): Promise<Token[]> {
  const queryClient = queryClientSubject.value;
  if (!queryClient) throw new Error("QueryClient subject is not initialized");

  const dexClient = dexClientSubject.value;
  if (!dexClient) throw new Error("DexClient subject is not initialized");

  let tokenInfos: Token[];

  if (isArray(addresses) && addresses.length > 1) {
    tokenInfos = await queryClient.fetchQuery({
      queryKey: QueryKeys.tokens({
        chain: chainId,
        tokenAddresses: addresses,
      }),
      queryFn: () => fetchTokens(dexClient, { chain: chainId, tokenAddresses: addresses }),
    });
  } else {
    const address = isArray(addresses) ? addresses[0] : addresses;
    const tokenInfo = await queryClient.fetchQuery({
      queryKey: QueryKeys.token(chainId, address),
      queryFn: () => fetchToken(dexClient, chainId, address),
    });
    tokenInfos = [tokenInfo];
  }
  setTokenInfo(tokenInfos, "merge");
  return tokenInfos;
}

let batchTimer: NodeJS.Timeout | null = null;

const batchWindow = 0;
const batchTickerSymbols = new Set<string>();
const batchResolversMap = new Map<
  string,
  { resolve: (tokenInfo: Token | null) => void; reject: (err: unknown) => void }
>();

/**
 * Combine multiple token info fetch requests
 * @param chainId - The chain id
 * @param address - The token address
 * @returns The token info
 */
async function fetchTokenInfoInBatch(chainId: CHAIN_ID, address: string) {
  if (batchTimer) {
    clearTimeout(batchTimer);
    batchTimer = null;
  }

  const tickerSymbol = stringifyTickerSymbol(chainId, address);
  batchTickerSymbols.add(tickerSymbol);

  batchTimer = setTimeout(async () => {
    const resolvers = Array.from(batchResolversMap.entries());
    try {
      const groupedTickerSymbols = groupBy(
        Array.from(batchTickerSymbols),
        (tickerSymbol) => parseTickerSymbol(tickerSymbol).chainId,
      );

      const tokenInfos = flatten(
        await Promise.all(
          Object.entries(groupedTickerSymbols).map(([chainId, tickerSymbols]) =>
            fetchTokenInfos(
              chainId as CHAIN_ID,
              tickerSymbols.map((tickerSymbol) => parseTickerSymbol(tickerSymbol).address),
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
      batchResolversMap.clear();
    }
    batchTimer = null;
    batchTickerSymbols.clear();
  }, batchWindow);

  return new Promise<Token | null>((resolve, reject) => {
    batchResolversMap.set(tickerSymbol, { resolve, reject });
  });
}

export async function fetchTokenInfo(
  chainId: CHAIN_ID,
  address: string,
  mode: string = "single",
): Promise<Token | null> {
  // TODO check address is valid
  if (mode === "batch") {
    return fetchTokenInfoInBatch(chainId, address);
  } else {
    const tokenInfos = await fetchTokenInfos(chainId, address);
    return tokenInfos[0] || null;
  }
}

/**
 * Fetch the token infos for the multiple trading view charts
 * @param chainId - The chain id
 * @param address - The current selected chart's token address
 */
export function useTvChartMultiTokens(chainId: CHAIN_ID, address: string) {
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
            const { chainId: areaChainId, address: areaAddress } = parseTickerSymbol(
              area.tickerSymbol,
            );
            fetchTokenInfo(areaChainId, areaAddress, "batch");
            if (areaChainId === chainId && areaAddress === address) {
              fetched = true;
            }
          }
        });
      }
    }

    if (!fetched) {
      fetchTokenInfo(chainId, address, "batch");
    }
  }, [chainId, address]);
}

/**
 * Refetch the token repeatedly
 * @param chainId - The chain id
 * @param address - The token address
 */
export function useRefreshToken(chainId: CHAIN_ID, address: string) {
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
  chainId: CHAIN_ID,
  address: string,
  transform?: (tokenInfo: Token) => Token,
): Token | null {
  const [tokenInfo, setTokenInfo] = useState<Token | null>(null);
  // used to avoid re-rendering
  const tokenInfoRef = useRef<Token | null>(null);

  useLayoutEffect(() => {
    // initial load
    if (!getTokenInfo(chainId, address)) {
      fetchTokenInfo(chainId, address);
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
  }, [chainId, address, transform]);

  return tokenInfo;
}
