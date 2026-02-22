import {
  CompositeMobileField,
  FavoriteMobileField,
  PriceMobileField,
  useTokenListContext,
} from "../tokens";
import { SearchDiscoverTokenListHeaders } from "./SearchDiscoverTokenListHeaders";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ListError } from "../ListError";
import { ListEmptyData } from "../ListEmptyData";
import { Listbox, ListboxItem } from "@heroui/react";
import clsx from "clsx";
import {
  useAddTokenToCollectionMutation,
  useRemoveTokenFromCollectionMutation,
  useTokenAddressesInCollectionQuery,
} from "@liberfi/react-backend";
import { SearchDiscoverTokenListSkeleton } from "./SearchDiscoverTokenListSkeleton";
import { tokenFilters, tokenSort } from "../../libs";
import { Token } from "@chainstream-io/sdk";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useAuth, useAuthenticatedCallback } from "@liberfi/ui-base";
import { AuthGuard } from "../AuthGuard";
import { useTokensQuery } from "@liberfi/react-dex";

export type SearchFavoriteTokenListProps = {
  onSelectToken?: (chain: string, tokenAddress: string) => void;
  containerHeight: number;
};

export function SearchFavoriteTokenList({
  onSelectToken,
  containerHeight,
}: SearchFavoriteTokenListProps) {
  return (
    <>
      <SearchDiscoverTokenListHeaders />
      <AuthGuard>
        <SearchFavoriteTokenListContent
          containerHeight={containerHeight - 56}
          onSelectToken={onSelectToken}
        />
      </AuthGuard>
    </>
  );
}

type SearchFavoriteTokenListContentProps = {
  containerHeight: number;
  onSelectToken?: (chain: string, tokenAddress: string) => void;
};

function SearchFavoriteTokenListContent({
  onSelectToken,
  containerHeight,
}: SearchFavoriteTokenListContentProps) {
  const { status } = useAuth();

  const { timeframe, filters, sort } = useTokenListContext();

  const { chain } = useCurrentChain();

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

  const { data: favoriteTokenAddresses } = useTokenAddressesInCollectionQuery("favorites", {
    enabled: status === "authenticated",
  });

  // 查询 token 列表
  const {
    // 初次加载完成前是 undefined
    data: favoriteTokens,
    isLoading,
    isFetching,
    error,
  } = useTokensQuery(
    {
      tokenAddresses: favoriteTokenAddresses ?? [],
      chain,
      ...param,
    },
    {
      enabled:
        status === "authenticated" && favoriteTokenAddresses && favoriteTokenAddresses.length > 0,
    },
  );

  // 用于展示的 token 列表需要额外存一份，因为在移出列表时 viewTokens 会刷新，但是移出的 token 依然需要在列表中显示
  // 初始化时为 undefined，表示还未加载过数据
  const [tokens, setTokens] = useState<Token[] | undefined>(undefined);

  // 记录 token 是否在列表中v
  const [favoriteList, setFavoriteList] = useState<Record<string, boolean>>({});

  // 添加 token 到列表
  const { mutateAsync: addFavoriteToken } = useAddTokenToCollectionMutation();

  // 从列表中移除 token
  const { mutateAsync: removeFavoriteToken } = useRemoveTokenFromCollectionMutation();

  // 初次加载完成后，更新展示的 tokens 列表
  useEffect(() => {
    // 初次可能存在数据 cache，所以要检查 isFetching，等 cache 刷新了再设置
    if (!isFetching && favoriteTokens !== undefined && tokens === undefined) {
      setTokens(favoriteTokens);
      setFavoriteList(
        favoriteTokens.reduce((acc, it) => ({ ...acc, [it.address]: true }), {}) ?? {},
      );
      resetTokensRef.current = false;
    }
  }, [favoriteTokens, tokens, isFetching]);

  // 重置 tokens 列表
  useEffect(() => {
    if (!isFetching && favoriteTokens !== undefined && resetTokensRef.current) {
      setTokens(favoriteTokens);
      setFavoriteList(
        favoriteTokens.reduce((acc, it) => ({ ...acc, [it.address]: true }), {}) ?? {},
      );
      resetTokensRef.current = false;
    }
  }, [favoriteTokens, isFetching]);

  const handleAddFavoriteToken = useCallback(
    async (address: string) => {
      setFavoriteList((prev) => ({ ...prev, [address]: true }));
      await addFavoriteToken({
        tokenAddress: address,
        type: "favorites",
      });
    },
    [addFavoriteToken, setFavoriteList],
  );

  const handleRemoveFavoriteToken = useCallback(
    async (address: string) => {
      setFavoriteList((prev) => ({ ...prev, [address]: false }));
      await removeFavoriteToken({
        tokenAddress: address,
        type: "favorites",
      });
    },
    [removeFavoriteToken, setFavoriteList],
  );

  if (error) {
    return <ListError />;
  }

  // 初次加载或者后续重置中
  if (tokens === undefined || isLoading || (isFetching && resetTokensRef.current)) {
    return <SearchDiscoverTokenListSkeleton />;
  }

  if (tokens.length === 0) {
    return <ListEmptyData className="lg:py-8" />;
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
          <ListItem
            token={it}
            isFavorite={favoriteList[it.address]}
            onFavorite={handleAddFavoriteToken}
            onUnfavorite={handleRemoveFavoriteToken}
          />
        </ListboxItem>
      ))}
    </Listbox>
  );
}

type ListItemProps = {
  token: Token;
  isFavorite: boolean;
  onFavorite: (address: string) => void;
  onUnfavorite: (address: string) => void;
};

function ListItem({ token, isFavorite, onFavorite, onUnfavorite }: ListItemProps) {
  const onToggleFavorite = useAuthenticatedCallback(() => {
    if (isFavorite) {
      onUnfavorite(token.address);
    } else {
      onFavorite(token.address);
    }
  }, [isFavorite, onFavorite, onUnfavorite, token.address]);

  return (
    <div
      className={clsx(
        "w-full h-14 px-3 flex items-center justify-between",
        "hover:cursor-pointer hover:bg-content1 lg:hover:bg-content3 rounded-lg",
      )}
    >
      <CompositeMobileField token={token} />
      <PriceMobileField token={token} />
      <FavoriteMobileField isFavorite={isFavorite} onAction={onToggleFavorite} token={token} />
    </div>
  );
}
