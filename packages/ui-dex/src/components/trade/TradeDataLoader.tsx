import { PropsWithChildren, useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { BigNumber } from "bignumber.js";
import { useQueryClient } from "@tanstack/react-query";
import { chainAtom } from "@liberfi/ui-base";
import { CHAIN_ID } from "@liberfi/core";
import { QueryKeys, useTokenStatsQuery } from "@liberfi/react-dex";
import {
  tokenAddressAtom,
  tokenInfoAtom,
  tokenStatsAtom,
  updateTokenLatestPrice,
  useRefreshToken,
  useTokenInfo,
  useTokenLatestPriceUpdate,
  useTvChartMultiTokens,
} from "@/states";

export type TradeDataLoaderProps = PropsWithChildren<{
  chainId: CHAIN_ID;
  address: string;
  // synchronize the price to rxjs when refetching the latest token info, used when the trading view is absent, default is false
  synchronizeTokenPrice?: boolean;
}>;

export function TradeDataLoader({
  chainId,
  address,
  synchronizeTokenPrice = false,
  children,
}: TradeDataLoaderProps) {
  // TODO report gtag { key: KLineFirstRender, name: "TradeDataLoader" }

  // switch to current token's chain
  const setChain = useSetAtom(chainAtom);
  useEffect(() => {
    setChain(chainId);
  }, [chainId, setChain]);

  // switch to current token's address
  const setTokenAddress = useSetAtom(tokenAddressAtom);
  useEffect(() => {
    setTokenAddress(address);
  }, [address, setTokenAddress]);

  // refetch the latest token info periodically
  useRefreshToken(chainId, address);

  // subscribe the latest token info
  const tokenInfo = useTokenInfo(chainId, address);

  // synchronize the token info to atom state
  const setToken = useSetAtom(tokenInfoAtom);
  useEffect(() => setToken(tokenInfo), [setToken, tokenInfo]);

  // synchronize the price to rxjs when refetching the latest token info, used when the trading view is absent, default is false
  useEffect(() => {
    if (synchronizeTokenPrice) {
      if (tokenInfo?.marketData?.priceInUsd) {
        updateTokenLatestPrice(
          chainId,
          address,
          new BigNumber(tokenInfo.marketData.priceInUsd).toNumber(),
        );
      }
    }
  }, [chainId, address, tokenInfo?.marketData?.priceInUsd, synchronizeTokenPrice]);

  // refetch the latest token stats periodically
  const { data: tokenStats } = useTokenStatsQuery(chainId, address, { refetchInterval: 5e3 });

  // synchronize the token stats to atom state, used for those stats that are not real-time.
  const setTokenStats = useSetAtom(tokenStatsAtom);
  useEffect(() => setTokenStats(tokenStats ?? null), [setTokenStats, tokenStats]);

  // synchronize the latest price to atom state, the trading view is updating the latest price in real-time
  useTokenLatestPriceUpdate(
    chainId,
    address,
    tokenInfo?.marketData?.priceInUsd ? Number(tokenInfo.marketData.priceInUsd) : undefined,
    tokenInfo?.marketData?.totalSupply ? Number(tokenInfo.marketData.totalSupply) : undefined,
  );

  // fetch token infos of tv charts
  useTvChartMultiTokens(chainId, address);

  // cancel queries when switching token
  const queryClient = useQueryClient();

  useEffect(() => {
    const cancelQueries = () => {
      queryClient
        .cancelQueries({
          queryKey: QueryKeys.token(chainId, address),
        })
        .catch((err) => {
          console.error("TradeDataLoader cancelQueries error", err);
        });
      queryClient
        .cancelQueries({
          queryKey: QueryKeys.tokenStats(chainId, address),
        })
        .catch((err) => {
          console.error("TradeDataLoader cancelQueries error", err);
        });
      queryClient.removeQueries({
        queryKey: QueryKeys.token(chainId, address),
      });
      queryClient.removeQueries({
        queryKey: QueryKeys.tokenStats(chainId, address),
      });
    };
    return cancelQueries;
  }, [chainId, address, queryClient]);

  // wait for state to be set
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setReady(true);
    });
  }, []);

  return ready ? children : <></>;
}
