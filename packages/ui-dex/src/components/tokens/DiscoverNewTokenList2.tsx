import { useTokenListContext } from "./TokenListContext";
import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { ListError } from "../ListError";
import { ListEmptyData } from "../ListEmptyData";
import { AppRoute, tokenFilters, tokenSort } from "../../libs";
import { useAtomValue } from "jotai";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { layoutAtom, useRouter, useTranslation } from "@liberfi/ui-base";
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
import { Chain } from "@liberfi/core";
import { chainSlug } from "@liberfi.io/utils";
import { reverse, sortBy } from "lodash-es";
import {
  Spinner,
  TableBody,
  TableCell,
  TableCellProps,
  TableColumn,
  TableColumnProps,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { StyledTable } from "../StyledTable";
import { TokenCell } from "./cells/token-cell.ui";
import { TokenPriceCell } from "./cells/token-price-cell.ui";
import { TokenMarketCapCell } from "./cells/token-market-cap-cell.ui";
import { TokenLiquidityCell } from "./cells/token-liquidity-cell.ui";
import { TokenVolumesCell } from "./cells/token-volumes-cell.ui";
import { TokenTradesCell } from "./cells/token-trades-cell.ui";
import { TokenTradersCell } from "./cells/token-traders-cell.ui";
import { TokenInfoCell } from "./cells/token-info-cell.ui";
import clsx from "clsx";

export function DiscoverWsNewTokenList2({ height }: { height?: number }) {
  const { t } = useTranslation();

  const { navigate } = useRouter();

  const layout = useAtomValue(layoutAtom);

  const isMobile = layout !== "desktop";

  const { timeframe, filters, sort } = useTokenListContext();

  const { chain } = useCurrentChain();

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
              chain: chainSlug(chain) ?? chainSlug(Chain.SOLANA),
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

  if (error) {
    return <ListError />;
  }

  return (
    <StyledTable
      isHeaderSticky
      isVirtualized
      radius="lg"
      className={clsx("h-full mx-auto", "max-w-260 sm:max-w-356")}
      maxTableHeight={height}
      rowHeight={isMobile ? 72 : 88}
      aria-label={t("new tokens")}
    >
      <TableHeader>
        {
          [
            <TableColumn
              key="token"
              textValue={t("tokens.listHeader.token")}
              width={isMobile ? 224 : 324}
            >
              {t("tokens.listHeader.token")}
            </TableColumn>,
            <TableColumn
              key="price"
              textValue={t("tokens.listHeader.price")}
              width={isMobile ? 94 : 144}
            >
              {t("tokens.listHeader.price")}
            </TableColumn>,
            <TableColumn
              key="marketCap"
              textValue={t("tokens.listHeader.marketCap")}
              width={isMobile ? 94 : 144}
            >
              {t("tokens.listHeader.marketCap")}
            </TableColumn>,
            <TableColumn
              key="liquidity"
              textValue={t("tokens.listHeader.liquidity")}
              width={isMobile ? 94 : 144}
            >
              {t("tokens.listHeader.liquidity")}
            </TableColumn>,
            <TableColumn
              key="volumes"
              textValue={t("tokens.listHeader.volumes")}
              width={isMobile ? 126 : 144}
            >
              {t("tokens.listHeader.volumes")}
            </TableColumn>,
            <TableColumn
              key="txs"
              textValue={t("tokens.listHeader.txs")}
              width={isMobile ? 126 : 144}
            >
              {t("tokens.listHeader.txs")}
            </TableColumn>,
            <TableColumn
              key="traders"
              textValue={t("tokens.listHeader.traders")}
              width={isMobile ? 126 : 144}
            >
              {t("tokens.listHeader.traders")}
            </TableColumn>,
            <TableColumn
              key="tokenInfo"
              textValue={t("tokens.listHeader.tokenInfo")}
              width={isMobile ? 204 : 224}
            >
              {t("tokens.listHeader.tokenInfo")}
            </TableColumn>,
          ].filter(Boolean) as ReactElement<TableColumnProps<unknown>>[]
        }
      </TableHeader>

      <TableBody
        items={tokens}
        isLoading={isPending}
        loadingContent={
          <div className="mt-40 flex justify-center">
            <Spinner color="primary" />
          </div>
        }
        emptyContent={<ListEmptyData />}
      >
        {(token) => (
          <TableRow
            key={token.address}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`${AppRoute.trade}/${token.chain}/${token.address}`);
            }}
          >
            {
              [
                <TableCell key="token">
                  <TokenCell token={token} />
                </TableCell>,
                <TableCell key="price">
                  <TokenPriceCell token={token} />
                </TableCell>,
                <TableCell key="marketCap">
                  <TokenMarketCapCell token={token} />
                </TableCell>,
                <TableCell key="liquidity">
                  <TokenLiquidityCell token={token} />
                </TableCell>,
                <TableCell key="volumes">
                  <TokenVolumesCell token={token} />
                </TableCell>,
                <TableCell key="trades">
                  <TokenTradesCell token={token} />
                </TableCell>,
                <TableCell key="traders">
                  <TokenTradersCell token={token} />
                </TableCell>,
                <TableCell key="info">
                  <TokenInfoCell token={token} />
                </TableCell>,
              ].filter(Boolean) as ReactElement<TableCellProps>[]
            }
          </TableRow>
        )}
      </TableBody>
    </StyledTable>
  );
}
