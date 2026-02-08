import { useTokenListContext } from "./TokenListContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAddTokenToCollectionMutation,
  useRemoveTokenFromCollectionMutation,
  useTokenAddressesInCollectionQuery,
} from "@liberfi/react-backend";
import { ListError } from "../ListError";
import { DiscoverTokenListSkeleton } from "./DiscoverTokenListSkeleton";
import { ListEmptyData } from "../ListEmptyData";
import { tokenFilters, tokenSort } from "@/libs";
import { DiscoverTokenListItem } from "./DiscoverTokenListItem";
import { Virtuoso } from "react-virtuoso";
import { useAtomValue } from "jotai";
import { chainAtom, useAuth } from "@liberfi/ui-base";
import {
  chainParam,
  convertStreamTokenHoldersToMarketData,
  convertStreamTokenLiquidityToMarketData,
  convertStreamTokenStatToMarketData,
  convertStreamTokenSupplyToMarketData,
  useDexClient,
  useNewTokensQuery,
} from "@liberfi/react-dex";
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
import { CHAIN_ID, chainSlugs } from "@liberfi/core";
import { reverse, sortBy } from "lodash-es";

export function DiscoverWsNewTokenList() {
  const { status } = useAuth();

  const { timeframe, filters, sort } = useTokenListContext();

  const chain = useAtomValue(chainAtom);

  const [tokens, setTokens] = useState<Token[]>([]);

  const params = useMemo(() => {
    const sortRequest = sort ? tokenSort(sort, timeframe) : undefined;
    const filterRequest = filters ? tokenFilters(filters, timeframe) : undefined;
    return {
      chain,
      duration: timeframe,
      sortBy: sortRequest?.sortBy,
      sortDirection: sortRequest?.sortDirection,
      filterBy: filterRequest?.filterBy,
    };
  }, [timeframe, filters, sort, chain]);

  // initial fetch & refetch on sort or filter change
  const { data: fetchedTokens, isPending, error } = useNewTokensQuery(params);

  // reset to newest tokens when fetched
  useEffect(() => {
    if (fetchedTokens) {
      setTokens(fetchedTokens.filter((it: Token) => !!it.address));
    }
  }, [fetchedTokens]);

  // subscriptions
  const dexClient = useDexClient();

  const handleWsNewTokens = useCallback(
    (newToken: WsNewToken) => {
      setTokens((prev) => {
        const tokens = [newToken].map(
          (it) =>
            ({
              chain: chainSlugs[chain] ?? chainSlugs[CHAIN_ID.SOLANA],
              address: it.tokenAddress,
              name: it.name,
              symbol: it.symbol,
              tokenCreatedAt: it.createdAtMs,
              stats: {},
              marketData: {},
            } as Token),
        );
        // sort by create time desc
        return reverse(sortBy([...tokens, ...prev], "tokenCreatedAt")).slice(0, 100);
      });
    },
    [chain],
  );

  const handleWsNewTokensMetadata = useCallback((newTokensMetadata: WsTokenMetadata[]) => {
    setTokens((prev) => {
      newTokensMetadata.forEach((it) => {
        const token = prev.find((t) => t.address === it.tokenAddress);
        if (token) {
          token.imageUrl = it.imageUrl;
          token.socialMedias = {
            ...token.socialMedias,
            ...it.socialMedia,
          };
          token.tokenCreatedAt = it.createdAtMs;
        }
      });
      return [...prev];
    });
  }, []);

  const handleWsTokenStats = useCallback((stats: WsTokenStat[]) => {
    setTokens((prev) => {
      stats.forEach((stat) => {
        const token = prev.find((t) => t.address === stat.address);
        if (token) {
          // token.stats = { ...token.stats, ...convertStreamWsTokenStat(stat) };
          token.marketData = {
            ...token.marketData,
            ...convertStreamTokenStatToMarketData(stat, token.marketData?.totalSupply),
          };
        }
      });
      return [...prev];
    });
  }, []);

  const handleTokenHoldings = useCallback((holders: WsTokenHolder[]) => {
    setTokens((prev) => {
      holders.forEach((holder) => {
        const token = prev.find((t) => t.address === holder.tokenAddress);
        if (token) {
          token.marketData = {
            ...token.marketData,
            ...convertStreamTokenHoldersToMarketData(holder),
          };
        }
      });
      return [...prev];
    });
  }, []);

  const handleWsTokenSupply = useCallback((supplies: WsTokenSupply[]) => {
    setTokens((prev) => {
      supplies.forEach((supply) => {
        const token = prev.find((t) => t.address === supply.tokenAddress);
        if (token) {
          token.marketData = {
            ...token.marketData,
            ...convertStreamTokenSupplyToMarketData(supply, token.marketData?.priceInUsd),
          };
        }
      });
      return [...prev];
    });
  }, []);

  const handleWsTokenLiquidity = useCallback((liquidities: WsTokenLiquidity[]) => {
    setTokens((prev) => {
      liquidities.forEach((liquidity) => {
        const token = prev.find((t) => t.address === liquidity.tokenAddress);
        if (token) {
          token.marketData = {
            ...token.marketData,
            ...convertStreamTokenLiquidityToMarketData(liquidity),
          };
        }
      });
      return [...prev];
    });
  }, []);

  useEffect(() => {
    // subscribe new tokens
    const subscribeNewTokens = dexClient.stream.subscribeNewToken({
      chain: chainParam(chain),
      callback: handleWsNewTokens,
    });

    // subscribe new token metadata
    const subscribeNewTokensMetadata = dexClient.stream.subscribeNewTokensMetadata({
      chain: chainParam(chain),
      callback: handleWsNewTokensMetadata,
    });

    // subscribe token stats
    const subscribeWsTokenStats = dexClient.stream.subscribeRankingTokensStats({
      chain: chainParam(chain),
      channelType: WsChannelType.New,
      callback: handleWsTokenStats,
    });

    // subscribe token holdings
    const subscribeTokenHoldings = dexClient.stream.subscribeRankingTokensHolders({
      chain: chainParam(chain),
      channelType: WsChannelType.New,
      callback: handleTokenHoldings,
    });

    // subscribe token supply
    const subscribeWsTokenSupply = dexClient.stream.subscribeRankingTokensSupply({
      chain: chainParam(chain),
      channelType: WsChannelType.New,
      callback: handleWsTokenSupply,
    });

    // subscribe token liquidity
    const subscribeWsTokenLiquidity = dexClient.stream.subscribeRankingTokensLiquidity({
      chain: chainParam(chain),
      channelType: WsChannelType.New,
      callback: handleWsTokenLiquidity,
    });

    return () => {
      subscribeNewTokens.unsubscribe();
      subscribeNewTokensMetadata.unsubscribe();
      subscribeWsTokenStats.unsubscribe();
      subscribeTokenHoldings.unsubscribe();
      subscribeWsTokenSupply.unsubscribe();
      subscribeWsTokenLiquidity.unsubscribe();
    };
  }, [
    dexClient,
    chain,
    handleWsNewTokens,
    handleWsNewTokensMetadata,
    handleWsTokenStats,
    handleTokenHoldings,
    handleWsTokenSupply,
    handleWsTokenLiquidity,
  ]);

  const { data: viewTokenAddressees } = useTokenAddressesInCollectionQuery("views", {
    enabled: status === "authenticated",
  });

  const { mutateAsync: addViewToken } = useAddTokenToCollectionMutation();

  const { mutateAsync: removeViewToken } = useRemoveTokenFromCollectionMutation();

  const [viewList, setViewList] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (viewTokenAddressees) {
      setViewList(viewTokenAddressees.reduce((acc, it) => ({ ...acc, [it]: true }), {}));
    }
  }, [viewTokenAddressees]);

  const handleAddViewToken = useCallback(
    async (address: string) => {
      setViewList((prev) => ({ ...prev, [address]: true }));
      await addViewToken({
        tokenAddress: address,
        type: "views",
      });
    },
    [addViewToken, setViewList],
  );

  const handleRemoveViewToken = useCallback(
    async (address: string) => {
      setViewList((prev) => ({ ...prev, [address]: false }));
      await removeViewToken({
        tokenAddress: address,
        type: "views",
      });
    },
    [removeViewToken, setViewList],
  );

  if (error) {
    return <ListError />;
  }

  if (isPending) {
    return <DiscoverTokenListSkeleton />;
  }

  if (!tokens || tokens.length === 0) {
    return <ListEmptyData />;
  }

  return (
    <Virtuoso
      fixedItemHeight={56}
      data={tokens}
      itemContent={(_, token) => (
        <DiscoverTokenListItem
          token={token}
          isViewed={viewList[token.address]}
          onView={handleAddViewToken}
          onUnview={handleRemoveViewToken}
        />
      )}
      useWindowScroll
    />
  );
}
