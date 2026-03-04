import { Chain } from "@liberfi/core";
import { AssetListHeaders } from "./AssetListHeaders";
import { useMemo, useState } from "react";
import { useTokensQuery } from "@liberfi/react-dex";
import { ListEmptyData } from "../ListEmptyData";
import { AssetListSkeleton } from "./AssetListSkeleton";
import { AppRoute } from "../../libs";
import clsx from "clsx";
import {
  TokenField,
  PriceField,
  BalanceField,
  PnlField,
  ActionsField,
  // ContractField,
  PriceHistoryField,
} from "./fields/asset";
import { Token } from "@chainstream-io/sdk";
import { PortfolioPnl } from "@liberfi.io/types";
import { useWalletPortfolioPnlsInfiniteQuery } from "@liberfi.io/react";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { keyBy } from "lodash-es";
import BigNumber from "bignumber.js";
import { useAuth, useRouter } from "@liberfi/ui-base";
import { useCurrentWalletAddress } from "@liberfi/ui-base";
import { Virtuoso } from "react-virtuoso";

export type AssetListProps = {
  chainId?: Chain;
  hideLowHoldingAssets: boolean;
  compact?: boolean;
  useWindowScroll?: boolean;
  classNames?: {
    header?: string;
    itemWrapper?: string;
    item?: string;
  };
};

export function AssetList({
  chainId = Chain.SOLANA,
  hideLowHoldingAssets,
  classNames,
  compact,
  useWindowScroll,
}: AssetListProps) {
  const { user } = useAuth();

  const [sort, setSort] = useState<Record<string, "asc" | "desc">>({});

  return (
    <>
      <AssetListHeaders
        sort={sort}
        onSortChange={setSort}
        className={classNames?.header}
        compact={compact}
      />
      {!user ? (
        <AssetListSkeleton compact={compact} classNames={classNames} />
      ) : (
        <Content
          chainId={chainId}
          hideLowHoldingAssets={hideLowHoldingAssets}
          sort={sort}
          compact={compact}
          classNames={classNames}
          useWindowScroll={useWindowScroll}
        />
      )}
    </>
  );
}

type ContentProps = {
  chainId?: Chain;
  hideLowHoldingAssets: boolean;
  sort: Record<string, "asc" | "desc">;
  compact?: boolean;
  classNames?: {
    itemWrapper?: string;
    item?: string;
  };
  useWindowScroll?: boolean;
};

function Content({
  chainId = Chain.SOLANA,
  hideLowHoldingAssets,
  sort,
  compact,
  classNames,
  useWindowScroll = false,
}: ContentProps) {
  const { chain } = useCurrentChain();
  const walletAddress = useCurrentWalletAddress();

  // TODO: 当前先假设一页可以取完所有 token，后续提供按 token 批量查询 portfolios 接口后再替换
  const { data: pnlsData, hasNextPage, fetchNextPage } = useWalletPortfolioPnlsInfiniteQuery(
    { chain: chainId ?? chain, address: walletAddress ?? "" },
    { enabled: !!walletAddress },
  );

  const portfolioPnls = useMemo(
    () => pnlsData?.pages?.flatMap((page) => page.portfolios ?? []) ?? [],
    [pnlsData],
  );

  const tokenAddresses = useMemo(
    () => portfolioPnls.map((it) => it.address),
    [portfolioPnls],
  );

  const { data: tokens } = useTokensQuery({ chain: chainId, tokenAddresses });

  const tokenMap = useMemo(() => keyBy(tokens ?? [], "address"), [tokens]);

  const balances = useMemo(() => {
    return portfolioPnls
      .filter((it) => new BigNumber(it.amount).gt(0))
      .filter((it) => !hideLowHoldingAssets || new BigNumber(it.amountInUsd).gte(0.1))
      .sort((a, b) =>
        compareBalances(
          a,
          tokenMap[a.address],
          b,
          tokenMap[b.address],
          sort,
        ),
      );
  }, [portfolioPnls, hideLowHoldingAssets, sort, tokenMap]);

  if (!pnlsData) {
    return <AssetListSkeleton compact={compact} classNames={classNames} />;
  }

  if (balances.length === 0) {
    return <ListEmptyData />;
  }

  return (
    <Virtuoso
      className={clsx(compact && "scrollbar-hide")}
      useWindowScroll={useWindowScroll}
      fixedItemHeight={64}
      data={balances}
      endReached={() => {
        if (hasNextPage) {
          fetchNextPage();
        }
      }}
      itemContent={(_, balance) => (
        <AssetItem
          balance={balance}
          token={tokenMap[balance.address]}
          compact={compact}
          classNames={classNames}
        />
      )}
    />
  );
}

type AssetItemProps = {
  balance: PortfolioPnl;
  token?: Token;
  compact?: boolean;
  classNames?: {
    itemWrapper?: string;
    item?: string;
  };
};

function AssetItem({ balance, token, compact = false, classNames }: AssetItemProps) {
  const { navigate } = useRouter();

  return (
    <div className={clsx("group w-full h-16", classNames?.itemWrapper)} data-compact={compact}>
      <div
        className={clsx(
          "w-full h-full flex items-center justify-between lg:group-data-[compact=false]:gap-1",
          "hover:cursor-pointer rounded-lg hover:bg-content1 lg:group-data-[compact=false]:hover:bg-content3",
          classNames?.item,
        )}
        onClick={() => navigate(`${AppRoute.trade}/${token?.chain}/${token?.address}`)}
      >
        <TokenField
          token={token}
          balance={balance}
          compact={compact}
          className="lg:group-data-[compact=false]:w-[200px] max-lg:flex-1 lg:group-data-[compact=true]:flex-1"
        />
        <PriceField
          token={token}
          balance={balance}
          className="lg:group-data-[compact=false]:w-[120px] max-lg:flex-1 lg:group-data-[compact=true]:flex-1 max-lg:hidden lg:group-data-[compact=true]:hidden"
        />
        <PriceHistoryField
          token={token}
          balance={balance}
          className="lg:group-data-[compact=false]:w-[220px] max-lg:flex-1 lg:group-data-[compact=true]:flex-1 max-lg:hidden lg:group-data-[compact=true]:hidden"
        />
        <BalanceField
          token={token}
          balance={balance}
          compact={compact}
          className="lg:group-data-[compact=false]:w-[110px] max-lg:flex-[0.7] lg:group-data-[compact=true]:flex-[0.7]"
        />
        <PnlField
          token={token}
          balance={balance}
          compact={compact}
          className="lg:group-data-[compact=false]:w-[110px] max-lg:flex-1 lg:group-data-[compact=true]:flex-1"
        />
        {/* <ContractField
        token={token}
        balance={balance}
        className="lg:group-data-[compact=false]:w-[140px] max-lg:flex-1 lg:group-data-[compact=true]:flex-1 max-lg:hidden lg:group-data-[compact=true]:hidden"
      /> */}
        <ActionsField
          token={token}
          balance={balance}
          className="lg:group-data-[compact=false]:w-[50px] max-lg:flex-[0.3] lg:group-data-[compact=true]:flex-[0.3]"
        />
      </div>
    </div>
  );
}

function compareBalances(
  a: PortfolioPnl,
  aToken: Token | undefined,
  b: PortfolioPnl,
  bToken: Token | undefined,
  sort: Record<string, "asc" | "desc">,
) {
  if (sort["balance"]) {
    const aValueInUSD = new BigNumber(a.amountInUsd);
    const bValueInUSD = new BigNumber(b.amountInUsd);
    return sort["balance"] === "asc"
      ? aValueInUSD.minus(bValueInUSD).toNumber()
      : bValueInUSD.minus(aValueInUSD).toNumber();
  }

  if (sort["price"]) {
    const aPriceInUsd = new BigNumber(aToken?.marketData?.priceInUsd ?? a.priceInUsd);
    const bPriceInUsd = new BigNumber(bToken?.marketData?.priceInUsd ?? b.priceInUsd);
    return sort["price"] === "asc"
      ? aPriceInUsd.minus(bPriceInUsd).toNumber()
      : bPriceInUsd.minus(aPriceInUsd).toNumber();
  }

  if (sort["pnl"]) {
    const aProfitInUsd = new BigNumber(a.realizedProfitInUsd ?? 0);
    const bProfitInUsd = new BigNumber(b.realizedProfitInUsd ?? 0);
    return sort["pnl"] === "asc"
      ? aProfitInUsd.minus(bProfitInUsd).toNumber()
      : bProfitInUsd.minus(aProfitInUsd).toNumber();
  }

  if (sort["pnl_change"]) {
    const aProfitRatio = new BigNumber(a.realizedProfitRatio ?? 0);
    const bProfitRatio = new BigNumber(b.realizedProfitRatio ?? 0);
    return sort["pnl_change"] === "asc"
      ? aProfitRatio.minus(bProfitRatio).toNumber()
      : bProfitRatio.minus(aProfitRatio).toNumber();
  }

  return 0;
}
