import { useCallback, useEffect, useRef, useState } from "react";
import { BehaviorSubject, filter, map } from "rxjs";
import { getDefaultStore } from "jotai";
import BigNumber from "bignumber.js";
import { throttle } from "lodash-es";
import { CHAIN_ID } from "@liberfi/core";
import { chainParam, useDexClient } from "@liberfi/react-dex";
import { stringifyTickerSymbol } from "@/libs";
import { tokenLatestMarketCapAtom, tokenLatestPriceAtom } from "./trade";

type PriceInfo = {
  current: number;
  previous?: number;
};

/**
 * rxjs for non-hooks state management
 *
 * tickerSymbol => priceInfo
 */
export const priceMapSubject = new BehaviorSubject(new Map<string, PriceInfo>());

/**
 * Update the latest price of a token
 * @param chainId - the chain id
 * @param address - the token address
 * @param price - the latest price
 */
export function updateTokenLatestPrice(chainId: CHAIN_ID, address: string, price: number) {
  const tickerSymbol = stringifyTickerSymbol(chainId, address);
  const priceMap = priceMapSubject.value;
  priceMap.set(tickerSymbol, { current: price, previous: priceMap.get(tickerSymbol)?.current });
  priceMapSubject.next(priceMap);
}

/**
 * Observe the latest price of a token
 * @param chainId - the chain id
 * @param address - the token address
 * @returns the latest price of the token
 */
function getTokenLatestPriceObservable(chainId: CHAIN_ID, address: string) {
  const tickerSymbol = stringifyTickerSymbol(chainId, address);
  return priceMapSubject.pipe(
    filter((priceMap) => {
      const priceInfo = priceMap.get(tickerSymbol);
      return priceInfo?.current !== priceInfo?.previous;
    }),
    map((priceMap) => priceMap.get(tickerSymbol)?.current),
  );
}

/**
 * Subscribe the latest price of a token
 * @param chainId - the chain id
 * @param address - the token address
 * @param throttleMs - the throttle time in milliseconds
 * @returns the latest price of the token
 */
export function useTokenLatestPrice(chainId: CHAIN_ID, address: string, throttleMs?: number) {
  const [price, setPrice] = useState(0);
  useEffect(() => {
    // reset price when chainId or address changes
    setPrice(0);
    // set price with throttle
    const set = throttleMs
      ? throttle((price: number) => setPrice(price), throttleMs, { leading: true })
      : setPrice;
    // subscribe to the price observable
    const sub = getTokenLatestPriceObservable(chainId, address).subscribe((price) => {
      if (price) {
        set(price);
      }
    });
    return () => {
      sub.unsubscribe();
    };
  }, [chainId, address, throttleMs]);

  return price;
}

const setTokenLatestPriceAtom = throttle(
  (price: number | null) => {
    getDefaultStore().set(tokenLatestPriceAtom, price);
  },
  400,
  { leading: true },
);

const setTokenLatestMarketCapAtom = throttle(
  (marketCap: number | null) => {
    getDefaultStore().set(tokenLatestMarketCapAtom, marketCap);
  },
  400,
  { leading: true },
);

/**
 * Synchronize the latest price of a token from rxjs to atom state
 * @param chainId - The chain id
 * @param address - The token address
 * @param price - The latest price of the token
 * @param totalSupply - The total supply of the token
 */
export function useTokenLatestPriceUpdate(
  chainId: CHAIN_ID,
  address: string,
  price?: number,
  totalSupply?: number,
) {
  const totalSupplyRef = useRef<number | undefined>(totalSupply);

  useEffect(() => {
    totalSupplyRef.current = totalSupply;
  }, [totalSupply]);

  const priceRef = useRef<number | undefined>(price);

  useEffect(() => {
    priceRef.current = price;
  }, [price]);

  useEffect(() => {
    const sub = getTokenLatestPriceObservable(chainId, address).subscribe(
      (latestPrice?: number) => {
        const price = latestPrice || priceRef.current;
        if (price) {
          setTokenLatestPriceAtom(price);
          const totalSupply = totalSupplyRef.current;
          if (totalSupply) {
            setTokenLatestMarketCapAtom(new BigNumber(price).times(totalSupply).toNumber());
          }
        }
      },
    );
    return () => {
      sub.unsubscribe();
      setTokenLatestPriceAtom(null);
      setTokenLatestMarketCapAtom(null);
    };
  }, [chainId, address]);
}

/**
 * Subscribe the token stats events and then synchronize the latest price to atom state
 * @param chainId - The chain id
 * @param address - The token address
 * @param price - The latest price of the token
 * @param totalSupply - The total supply of the token
 */
export function useTokenLatestPriceUpdateByTokenStats(
  chainId: CHAIN_ID,
  address: string,
  price?: number,
  totalSupply?: number,
) {
  const dexClient = useDexClient();

  const totalSupplyRef = useRef<number | undefined>(totalSupply);

  useEffect(() => {
    totalSupplyRef.current = totalSupply;
  }, [totalSupply]);

  const priceRef = useRef<number | undefined>(price);

  useEffect(() => {
    priceRef.current = price;
  }, [price]);

  const hasSetPriceRef = useRef(false);

  const updateTokenLatestPrice = useCallback((latestPrice?: number) => {
    const price = latestPrice || priceRef.current || 0;
    if (price) {
      setTokenLatestPriceAtom(price);
      const totalSupply = totalSupplyRef.current;
      if (totalSupply) {
        setTokenLatestMarketCapAtom(new BigNumber(price).times(totalSupply).toNumber());
      }
    }
  }, []);

  // if the state has not been set when price & market cap changes, set it
  useEffect(() => {
    if (!hasSetPriceRef.current) {
      updateTokenLatestPrice();
    }
  }, [price, totalSupply, updateTokenLatestPrice]);

  // subscribe the latest price and then synchronize it to atom state
  useEffect(() => {
    const chain = chainParam(chainId);
    if (!chain) return;

    const sub = dexClient.stream.subscribeTokenStats({
      chain,
      tokenAddress: address,
      callback: (data) => {
        hasSetPriceRef.current = true;
        updateTokenLatestPrice(Number(data.price));
      },
    });
    return () => {
      setTokenLatestPriceAtom(null);
      setTokenLatestMarketCapAtom(null);
      hasSetPriceRef.current = false;
      sub.unsubscribe();
    };
  }, [chainId, address, dexClient, updateTokenLatestPrice]);
}
