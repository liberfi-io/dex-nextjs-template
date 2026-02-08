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
import { tokenSort, tokenFilters } from "@/libs";
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
  useStockTokensQuery,
} from "@liberfi/react-dex";
import { Token } from "@chainstream-io/sdk";
import {
  WsChannelType,
  WsTokenHolder,
  WsTokenLiquidity,
  WsTokenStat,
  WsTokenSupply,
} from "@chainstream-io/sdk/stream";
import { StockTokenListHeaders } from "./StockTokenListHeaders";

export function StockTokenList() {
  return (
    <>
      <StockTokenListHeaders />
      <StockTokenListContent />
    </>
  );
}

function StockTokenListContent() {
  const { status } = useAuth();

  const { timeframe, filters, sort } = useTokenListContext();

  const chain = useAtomValue(chainAtom);

  const params = useMemo(() => {
    const sortRequest = sort ? tokenSort(sort, timeframe) : undefined;
    const filterRequest = filters ? tokenFilters(filters, timeframe) : undefined;
    return {
      chain,
      sortBy: sortRequest?.sortBy,
      sortDirection: sortRequest?.sortDirection,
      filterBy: filterRequest?.filterBy,
    };
  }, [timeframe, filters, sort, chain]);

  const [tokens, setTokens] = useState<Token[]>([]);

  // initial fetch & refetch on sort or filter change & refetch periodically
  const {
    data: fetchedTokens,
    isPending,
    error,
  } = useStockTokensQuery(params, { refetchInterval: 12000 });

  // reset to newest tokens when fetched
  useEffect(() => {
    if (fetchedTokens) {
      setTokens(fetchedTokens);
    }
  }, [fetchedTokens]);

  // subscriptions
  const dexClient = useDexClient();

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
        } else {
          console.debug(`subscribe token stats: ${stat.address} isn't in the list`);
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
        } else {
          console.debug(`subscribe token holder: ${holder.tokenAddress} isn't in the list`);
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
            ...convertStreamTokenSupplyToMarketData(
              supply,
              token.marketData?.priceInUsd,
            ),
          };
        } else {
          console.debug(`subscribe token supply: ${supply.tokenAddress} isn't in the list`);
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
        } else {
          // console.debug(`subscribe token liquidity: ${liquidity.tokenAddress} isn't in the list`);
        }
      });
      return [...prev];
    });
  }, []);

  useEffect(() => {
    // subscribe token stats
    const subscribeWsTokenStats = dexClient.stream.subscribeRankingTokensStats({
      chain: chainParam(chain),
      channelType: WsChannelType.US_STOCKS,
      callback: handleWsTokenStats,
    });

    // subscribe token holdings
    const subscribeTokenHoldings = dexClient.stream.subscribeRankingTokensHolders({
      chain: chainParam(chain),
      channelType: WsChannelType.US_STOCKS,
      callback: handleTokenHoldings,
    });

    // subscribe token supply
    const subscribeWsTokenSupply = dexClient.stream.subscribeRankingTokensSupply({
      chain: chainParam(chain),
      channelType: WsChannelType.US_STOCKS,
      callback: handleWsTokenSupply,
    });

    // subscribe token liquidity
    const subscribeWsTokenLiquidity = dexClient.stream.subscribeRankingTokensLiquidity({
      chain: chainParam(chain),
      channelType: WsChannelType.US_STOCKS,
      callback: handleWsTokenLiquidity,
    });

    return () => {
      subscribeWsTokenStats.unsubscribe();
      subscribeTokenHoldings.unsubscribe();
      subscribeWsTokenSupply.unsubscribe();
      subscribeWsTokenLiquidity.unsubscribe();
    };
  }, [
    dexClient,
    chain,
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
