import { useTokenListContext } from "../tokens";
import { SearchDiscoverTokenListHeaders } from "./SearchDiscoverTokenListHeaders";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useAddTokenToCollectionMutation,
  useRemoveTokenFromCollectionMutation,
  useTokenAddressesInCollectionQuery,
} from "@liberfi/react-backend";
import { ListError } from "../ListError";
import { ListEmptyData } from "../ListEmptyData";
import { Listbox, ListboxItem } from "@heroui/react";
import clsx from "clsx";
import { tokenFilters, tokenSort } from "../../libs";
import { Token } from "@chainstream-io/sdk";
import { SearchDiscoverTokenListSkeleton } from "./SearchDiscoverTokenListSkeleton";
import { SearchDiscoverTokenListItem } from "./SearchDiscoverTokenListItem";
import { AuthGuard } from "../AuthGuard";
import { useAtomValue } from "jotai";
import { chainAtom, useAuth } from "@liberfi/ui-base";
import { useTokensQuery } from "@liberfi/react-dex";

export type SearchViewListTokenListProps = {
  onSelectToken?: (chain: string, tokenAddress: string) => void;
  containerHeight: number;
};

export function SearchViewListTokenList({
  onSelectToken,
  containerHeight,
}: SearchViewListTokenListProps) {
  return (
    <>
      <SearchDiscoverTokenListHeaders />
      <AuthGuard>
        <SearchViewListTokenListContent
          containerHeight={containerHeight - 56}
          onSelectToken={onSelectToken}
        />
      </AuthGuard>
    </>
  );
}

type SearchViewListTokenListContentProps = {
  onSelectToken?: (chain: string, tokenAddress: string) => void;
  containerHeight: number;
};

function SearchViewListTokenListContent({
  onSelectToken,
  containerHeight,
}: SearchViewListTokenListContentProps) {
  const { status } = useAuth();

  const { timeframe, filters, sort } = useTokenListContext();

  const chain = useAtomValue(chainAtom);

  // 标记可以重置展示的 tokens 列表
  const resetTokensRef = useRef(false);

  // 筛选、排序参数
  const param = useMemo(() => {
    // 每次筛选、排序参数变化，可以重置 tokens 列表
    resetTokensRef.current = true;

    const sortRequest = sort ? tokenSort(sort, timeframe) : undefined;
    const filterRequest = filters ? tokenFilters(filters, timeframe) : undefined;
    return sortRequest || filterRequest
      ? {
          ...sortRequest,
          ...filterRequest,
        }
      : undefined;
  }, [timeframe, filters, sort]);

  // 获取视图列表 token 地址
  const { data: viewTokenAddresses } = useTokenAddressesInCollectionQuery("views", {
    enabled: status === "authenticated",
  });

  // 查询 token 列表
  const {
    // 初次加载完成前是 undefined
    data: viewTokens,
    isLoading,
    isFetching,
    error,
  } = useTokensQuery(
    {
      tokenAddresses: viewTokenAddresses ?? [],
      chain: chain,
      ...param,
    },
    {
      enabled: status === "authenticated" && viewTokenAddresses && viewTokenAddresses.length > 0,
    },
  );

  // 用于展示的 token 列表需要额外存一份，因为在移出列表时 viewTokens 会刷新，但是移出的 token 依然需要在列表中显示
  // 初始化时为 undefined，表示还未加载过数据
  const [tokens, setTokens] = useState<Token[] | undefined>(undefined);

  // 记录 token 是否在列表中
  const [viewList, setViewList] = useState<Record<string, boolean>>({});

  // 添加 token 到列表
  const { mutateAsync: addViewToken } = useAddTokenToCollectionMutation();

  // 从列表中移除 token
  const { mutateAsync: removeViewToken } = useRemoveTokenFromCollectionMutation();

  // 初次加载完成后，更新展示的 tokens 列表
  useEffect(() => {
    // 初次可能存在数据 cache，所以要检查 isFetching，等 cache 刷新了再设置
    if (!isFetching && viewTokens !== undefined && tokens === undefined) {
      setTokens(viewTokens);
      setViewList(viewTokens.reduce((acc, it) => ({ ...acc, [it.address]: true }), {}) ?? {});
      resetTokensRef.current = false;
    }
  }, [viewTokens, tokens, isFetching]);

  // 重置 tokens 列表
  useEffect(() => {
    if (!isFetching && viewTokens !== undefined && resetTokensRef.current) {
      setTokens(viewTokens);
      setViewList(viewTokens.reduce((acc, it) => ({ ...acc, [it.address]: true }), {}) ?? {});
      resetTokensRef.current = false;
    }
  }, [viewTokens, isFetching]);

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

  // 初次加载或者后续重置中
  if (tokens === undefined || isLoading || (isFetching && resetTokensRef.current)) {
    return <SearchDiscoverTokenListSkeleton />;
  }

  if (tokens.length === 0) {
    return <ListEmptyData />;
  }

  return (
    <Listbox
      className="w-full overflow-x-hidden"
      classNames={{ base: "p-0", list: "gap-0" }}
      isVirtualized
      virtualization={{ itemHeight: 56, maxListboxHeight: containerHeight }}
    >
      {tokens.map((it) => (
        <ListboxItem
          key={it.address}
          className={clsx(
            "rounded-none p-0",
            "data-[hover=true]:bg-transparent",
            "data-[selectable=true]:focus:bg-transparent",
          )}
          onPress={() => onSelectToken?.(it.chain, it.address)}
        >
          <SearchDiscoverTokenListItem
            token={it}
            isViewed={viewList[it.address]}
            onView={handleAddViewToken}
            onUnview={handleRemoveViewToken}
          />
        </ListboxItem>
      ))}
    </Listbox>
  );
}
