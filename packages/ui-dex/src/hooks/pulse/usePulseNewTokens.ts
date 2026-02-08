import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { omit, sortBy } from "lodash-es";
import { Token } from "@chainstream-io/sdk";
import {
  WsChannelType,
  WsNewToken,
  WsTokenHolder,
  WsTokenLiquidity,
  WsTokenMetadata,
  WsTokenStat,
  WsTokenSupply,
} from "@chainstream-io/sdk/stream";
import {
  chainParam,
  convertStreamNewToken,
  convertStreamRankingTokenMetadata,
  useDexClient,
  useNewTokensQuery,
} from "@liberfi/react-dex";
import { chainAtom } from "@liberfi/ui-base";
import { usePulseListContext } from "@/components/pulse/PulseListContext";
import { useQuotePrice } from "@/states";
import { getPrimaryTokenSymbol, RecursivePartial } from "@liberfi/core";

export function usePulseWsNewTokens() {
  const chain = useAtomValue(chainAtom);

  const dexClient = useDexClient();

  const { isPaused } = usePulseListContext();

  // use ref to avoid re-render, which will cause the re-subscriptions
  const pausedRef = useRef(isPaused);

  // sync the latest paused state to the ref
  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  const primaryTokenPrice = useQuotePrice(getPrimaryTokenSymbol(chain) ?? "");

  // use ref to avoid re-render, which will cause the re-subscriptions
  const primaryTokenPriceRef = useRef<number | null>(primaryTokenPrice);

  // sync the latest primary token price to the ref
  useEffect(() => {
    primaryTokenPriceRef.current = primaryTokenPrice;
  }, [primaryTokenPrice]);

  // refetch periodically
  const { data, isPending } = useNewTokensQuery({ chain }, { refetchInterval: 10e3 });

  // final token list
  const [tokens, setTokens] = useState<RecursivePartial<Token>[]>([]);

  // add new tokens or update existing tokens
  const mergeTokens = useCallback((inputTokens: RecursivePartial<Token>[], update = true) => {
    setTokens((prev) => {
      const merged = [...prev];
      inputTokens.forEach((it) => {
        const idx = merged.findIndex((t) => t.address === it.address);
        if (idx >= 0) {
          // update existing token
          if (update) {
            const prevToken = merged[idx];
            const newToken = {
              ...prevToken,
              ...omit(it, [
                "marketData",
                "stats",
                "tokenCreators",
                "extra",
                "socialMedias",
                "stats",
                "liquidity",
                "marketData",
              ]),
            };

            if (it.marketData) {
              newToken.marketData = {
                ...prevToken.marketData,
                ...it.marketData,
              };
            }

            if (it.stats) {
              newToken.stats = {
                ...prevToken.stats,
                ...it.stats,
              };
            }

            if (it.extra) {
              newToken.extra = {
                ...prevToken.extra,
                ...it.extra,
              };
            }

            merged[idx] = newToken;
          }
        } else {
          // add new token
          if (!pausedRef.current) merged.push(it);
        }
      });
      // sort by create time desc
      const sorted = sortBy(merged, "tokenCreatedAt").reverse();
      // limit the results
      const next = sorted.slice(0, 80);
      return next;
    });
  }, []);

  // merge fetched tokens
  useEffect(() => {
    if (data) {
      mergeTokens(data);
    }
  }, [data, mergeTokens]);

  // handle the list's changes
  const handleWsNewToken = useCallback(
    (newToken: WsNewToken) => {
      const token = convertStreamNewToken(chain, newToken);
      // only add new tokens, don't replace existing ones to avoid conflicts with other subscriptions
      mergeTokens([token], false);
    },
    [chain, mergeTokens],
  );

  // handle new tokens metadata
  const handleMetadata = useCallback(
    (metadata: WsTokenMetadata[]) => {
      const tokens = metadata.map((it) => convertStreamRankingTokenMetadata(it));
      mergeTokens(tokens);
    },
    [mergeTokens],
  );

  const handleStats = useCallback(
    (_stats: WsTokenStat[]) => {
      // const tokens = stats.map((it) => convertStreamRankingWsTokenStat(it));
      // mergeTokens(tokens);
    },
    [],
  );

  const handleHoldings = useCallback(
    (_holders: WsTokenHolder[]) => {
      // const tokens = holders.map((it) => convertStreamRankingWsTokenHolders(it));
      // mergeTokens(tokens);
    },
    [],
  );

  const handleSupply = useCallback(
    (_supplies: WsTokenSupply[]) => {
      // const tokens = supplies.map((supply) =>
      //   convertStreamRankingWsTokenSupply(supply, primaryTokenPriceRef.current ?? 0),
      // );
      // mergeTokens(tokens);
    },
    [],
  );

  const handleLiquidity = useCallback(
    (_liquidities: WsTokenLiquidity[]) => {
      // const tokens = liquidities.map((it) => convertStreamRankingWsTokenLiquidity(it));
      // mergeTokens(tokens);
    },
    [],
  );

  // subscriptions
  useEffect(() => {
    // subscribe new tokens
    const newTokenSubscription = dexClient.stream.subscribeNewToken({
      chain: chainParam(chain),
      callback: handleWsNewToken,
    });

    // subscribe new tokens metadata
    const metadataSubscription = dexClient.stream.subscribeNewTokensMetadata({
      chain: chainParam(chain),
      callback: handleMetadata,
    });

    // subscribe token stats
    const statsSubscription = dexClient.stream.subscribeRankingTokensStats({
      chain: chainParam(chain),
      channelType: WsChannelType.New,
      callback: handleStats,
    });

    // subscribe token holdings
    const holdingsSubscription = dexClient.stream.subscribeRankingTokensHolders({
      chain: chainParam(chain),
      channelType: WsChannelType.New,
      callback: handleHoldings,
    });

    // subscribe token supply
    const supplySubscription = dexClient.stream.subscribeRankingTokensSupply({
      chain: chainParam(chain),
      channelType: WsChannelType.New,
      callback: handleSupply,
    });

    // subscribe token liquidity
    const liquiditySubscription = dexClient.stream.subscribeRankingTokensLiquidity({
      chain: chainParam(chain),
      channelType: WsChannelType.New,
      callback: handleLiquidity,
    });

    return () => {
      newTokenSubscription.unsubscribe();
      metadataSubscription.unsubscribe();
      statsSubscription.unsubscribe();
      holdingsSubscription.unsubscribe();
      supplySubscription.unsubscribe();
      liquiditySubscription.unsubscribe();
    };
  }, [
    dexClient,
    chain,
    handleWsNewToken,
    handleMetadata,
    handleStats,
    handleHoldings,
    handleSupply,
    handleLiquidity,
  ]);

  // return the merged tokens
  return useMemo(() => (isPending ? undefined : tokens), [tokens, isPending]);
}
