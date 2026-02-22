import {
  useAddTokenToCollectionMutation,
  useRemoveTokenFromCollectionMutation,
  useTokenAddressesInCollectionQuery,
} from "@liberfi/react-backend";
import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  layoutAtom,
  useAuth,
  useAuthenticatedCallback,
  useRouter,
} from "@liberfi/ui-base";
import { ListEmptyData } from "../ListEmptyData";
import { ListError } from "../ListError";
import clsx from "clsx";
import {
  AgeField,
  CompositeMobileField,
  ContractField,
  FavoriteField,
  FavoriteMobileField,
  HoldersField,
  MarketCapField,
  PriceField,
  PriceMobileField,
  SocialMediaField,
  TokenField,
  VolumeField,
} from "./fields";
import { FavoriteTokenListHeaders } from "./FavoriteTokenListHeaders";
import { FavoriteTokenListSkeleton } from "./FavoriteTokenListSkeleton";
import { AppRoute, tokenFilters, tokenSort } from "../../libs";
import { useTokenListContext } from "./TokenListContext";
import { Token } from "@chainstream-io/sdk";
import { Virtuoso } from "react-virtuoso";
import { AuthGuard } from "../AuthGuard";
import { useAtomValue } from "jotai";
import { useTokensQuery } from "@liberfi/react-dex";

export function FavoriteTokenList() {
  return (
    <>
      <FavoriteTokenListHeaders />
      <AuthGuard>
        <FavoriteTokenListContent />
      </AuthGuard>
    </>
  );
}

function FavoriteTokenListContent() {
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
    return <FavoriteTokenListSkeleton />;
  }

  if (tokens.length === 0) {
    return <ListEmptyData />;
  }

  return (
    <Virtuoso
      fixedItemHeight={56}
      data={tokens}
      itemContent={(_, token) => (
        <ListItem
          token={token}
          isFavorite={favoriteList[token.address]}
          onFavorite={handleAddFavoriteToken}
          onUnfavorite={handleRemoveFavoriteToken}
        />
      )}
      useWindowScroll
    />
  );
}

type ListItemProps = {
  token: Token;
  isFavorite: boolean;
  onFavorite: (address: string) => void;
  onUnfavorite: (address: string) => void;
};

function ListItem({ token, isFavorite, onFavorite, onUnfavorite }: ListItemProps) {
  const layout = useAtomValue(layoutAtom);

  const { navigate } = useRouter();

  const onToggleFavorite = useAuthenticatedCallback(() => {
    if (isFavorite) {
      onUnfavorite(token.address);
    } else {
      onFavorite(token.address);
    }
  }, [isFavorite, onFavorite, onUnfavorite, token.address]);

  const onSelectToken = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(`${AppRoute.trade}/${token.chain}/${token.address}`);
    },
    [navigate, token.address, token.chain],
  );

  return (
    <div
      className={clsx(
        "w-full h-14 flex items-center justify-between lg:gap-1",
        "hover:cursor-pointer hover:bg-content1 lg:hover:bg-content3 rounded-lg",
      )}
      onClick={onSelectToken}
    >
      {layout === "desktop" && (
        <>
          <FavoriteField isFavorite={isFavorite} onAction={onToggleFavorite} token={token} />
          <TokenField token={token} />
          <PriceField token={token} />
          <MarketCapField token={token} />
          <HoldersField token={token} />
          <VolumeField token={token} />
          <ContractField token={token} className="max-xl:hidden" />
          <AgeField token={token} className="max-xl:hidden" />
          <SocialMediaField token={token} className="max-xl:hidden" />
        </>
      )}

      {layout !== "desktop" && (
        <>
          <CompositeMobileField token={token} />
          <PriceMobileField token={token} />
          <FavoriteMobileField isFavorite={isFavorite} onAction={onToggleFavorite} token={token} />
        </>
      )}
    </div>
  );
}
