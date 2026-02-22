import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import {
  useAddTokenToCollectionMutation,
  useRemoveTokenFromCollectionMutation,
  useTokenAddressesInCollectionQuery,
} from "@liberfi/react-backend";
import { Token, TradeDetailDTO } from "@chainstream-io/sdk";
import { CHAIN_ID } from "@liberfi/core";
import { reverse, sortBy, uniqBy } from "lodash-es";
import { useAuth, useAuthenticatedCallback } from "@liberfi/ui-base";
import { tokenInfoAtom } from "../../../states";
import { useAtomValue } from "jotai";
import { useTokensQuery, useTokenTradesQuery } from "@liberfi/react-dex";

export type TradeDataContextType = {
  // token 所属链
  chain: CHAIN_ID;
  // token 合约地址
  address: string;
  // 查看的 token 列表
  viewTokens?: Token[] | null;
  // 查看的 token 列表是否加载中
  isViewTokensLoading: boolean;
  // 是否关注
  isFavorite: boolean;
  // 切换关注状态
  toggleFavorite: () => Promise<void>;
  // TODO deprecated
  trades: TradeDetailDTO[];
  isTradesLoading: boolean;
};

export const TradeDataContext = createContext<TradeDataContextType>({
  chain: CHAIN_ID.SOLANA,
  address: "",
  viewTokens: undefined,
  isViewTokensLoading: true,
  isFavorite: false,
  toggleFavorite: () => Promise.resolve(),
  // TODO deprecated
  trades: [],
  isTradesLoading: true,
});

export type TradeDataProviderProps = PropsWithChildren<{
  chain: CHAIN_ID;
  address: string;
}>;

export function TradeDataProvider({
  children,
  chain,
  address,
}: PropsWithChildren<TradeDataProviderProps>) {
  // 当前登录用户
  const { user, status } = useAuth();

  const token = useAtomValue(tokenInfoAtom);

  const { data: viewTokenAddresses } = useTokenAddressesInCollectionQuery("views");

  // 查询查看的 token 列表
  const { data: viewTokens, isLoading: isViewTokensLoading } = useTokensQuery(
    {
      chain,
      tokenAddresses: viewTokenAddresses ?? [],
    },
    // 只有登录用户才能查询查看的 token 列表
    { enabled: status === "authenticated" && viewTokenAddresses && viewTokenAddresses.length > 0 },
  );

  // 默认将当前 token 加入查看的 token 列表
  const { mutateAsync: addViewTokenAsync } = useAddTokenToCollectionMutation();

  useEffect(() => {
    if (token && viewTokens && user) {
      if (viewTokens.findIndex((it) => it.address === token.address) < 0) {
        addViewTokenAsync({
          tokenAddress: token.address,
          type: "views",
        });
      }
    }
  }, [token, viewTokens, addViewTokenAsync, user]);

  // 是否关注
  const [isFavorite, setIsFavorite] = useState(false);

  // 查询关注列表
  const { data: favoriteTokenAddresses } = useTokenAddressesInCollectionQuery("favorites", {
    enabled: status === "authenticated",
  });

  // 同步关注状态
  useEffect(() => {
    if (favoriteTokenAddresses && token?.address) {
      setIsFavorite(favoriteTokenAddresses.some((it) => it === token.address));
    }
  }, [favoriteTokenAddresses, token?.address]);

  // 添加关注
  const { mutateAsync: favoriteAsync } = useAddTokenToCollectionMutation();

  // 移除关注
  const { mutateAsync: unfavoriteAsync } = useRemoveTokenFromCollectionMutation();

  // 切换关注状态
  const toggleFavorite = useAuthenticatedCallback(async () => {
    if (!token?.address) return;
    if (isFavorite) {
      setIsFavorite(false);
      await unfavoriteAsync({
        tokenAddress: token.address,
        type: "favorites",
      });
    } else {
      setIsFavorite(true);
      await favoriteAsync({
        tokenAddress: token.address,
        type: "favorites",
      });
    }
  }, [isFavorite, favoriteAsync, unfavoriteAsync, token?.address]);

  const { data: tradePage, isLoading: isTradesLoading } = useTokenTradesQuery({
    chain,
    tokenAddress: address,
  });

  const [trades, setTrades] = useState<TradeDetailDTO[]>([]);

  // merge new trades with existing trades
  useEffect(() => {
    if (tradePage) {
      setTrades((prev) => {
        // TODO 等后端处理，先自己临时聚合
        const newTrades = uniqBy(tradePage?.data ?? [], "transactionSignature")
          .map((it) =>
            (tradePage?.data ?? []).findLast(
              (it2) =>
                it.transactionSignature === it2.transactionSignature &&
                it2.sideTokenAmountInUsd !== "0",
            ),
          )
          .filter((it) => !!it);
        return reverse(
          sortBy(uniqBy([...prev, ...newTrades], "transactionSignature"), "blockTimestamp"),
        ).slice(0, 100);
      });
    }
  }, [tradePage]);

  const value = useMemo(
    () => ({
      chain,
      address,
      viewTokens,
      isViewTokensLoading,
      isFavorite,
      toggleFavorite,
      trades,
      isTradesLoading,
    }),
    [
      chain,
      address,
      viewTokens,
      isViewTokensLoading,
      isFavorite,
      toggleFavorite,
      isTradesLoading,
      trades,
    ],
  );

  return <TradeDataContext.Provider value={value}>{children}</TradeDataContext.Provider>;
}

export function useTradeDataContext() {
  const context = useContext(TradeDataContext);
  if (!context) {
    throw new Error("useTradeDataContext must be used within a TradeDataProvider");
  }
  return context;
}
