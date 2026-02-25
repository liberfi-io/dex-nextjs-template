import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";
import { Chain } from "@liberfi/core";
import { CHAIN_PRIMARY_TOKENS } from "../libs";
import { dexClientSubject, queryClientSubject } from "@liberfi/ui-base";
import { fetchTokenMarketData, QueryKeys } from "@liberfi/react-dex";

export interface QuotePrice {
  symbol: string;
  price: number;
}

export const quotePricesSubject = new BehaviorSubject(new Map<string, QuotePrice>());

function setQuotePrice(symbol: string, price: number) {
  const quotePrices = quotePricesSubject.value;
  const prevQuotePrice = quotePrices.get(symbol) ?? {};
  const newQuotePrice = { symbol, ...prevQuotePrice, price };
  quotePrices.set(symbol, newQuotePrice);
  quotePricesSubject.next(new Map(quotePrices));
}

export async function fetchQuotePrice(chainId: Chain, symbol: string): Promise<number | null> {
  const queryClient = queryClientSubject.value;
  if (!queryClient) throw new Error("QueryClient is not ready");

  const dexClient = dexClientSubject.value;
  if (!dexClient) throw new Error("DexClient is not ready");

  const address = CHAIN_PRIMARY_TOKENS[chainId]?.[symbol];
  if (!address) throw new Error("Address is not found");

  const marketData = await queryClient.fetchQuery({
    queryKey: QueryKeys.tokenMarketData(chainId, address),
    queryFn: () => fetchTokenMarketData(dexClient, chainId, address),
  });
  const price = marketData?.priceInUsd ? Number(marketData.priceInUsd) : null;

  if (price) {
    setQuotePrice(symbol, price);
  }
  return price;
}

let currentSymbol: string | null = null;
let timer: NodeJS.Timeout | null = null;

const QUERY_KEY = "fetchQuotePrice";

// reset current quote symbol and then fetch periodically
export function setCurrentQuoteSymbol(chainId: Chain, symbol: string) {
  if (currentSymbol === symbol) return;

  const queryClient = queryClientSubject.value;
  if (!queryClient) throw new Error("QueryClient is not ready");

  // stop fetching previous quote price
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  queryClient
    .cancelQueries({ queryKey: [QUERY_KEY, currentSymbol] })
    .catch(() => console.error("Cancel quote price query failed"));
  queryClient.removeQueries({ queryKey: [QUERY_KEY, currentSymbol] });

  // start fetching new quote price
  const fetch = () => {
    queryClient
      .fetchQuery({
        queryKey: [QUERY_KEY, symbol],
        queryFn: () => fetchQuotePrice(chainId, symbol),
      })
      .catch(() => {});
  };

  // fetch quote price immediately
  fetch();

  // fetch quote price periodically
  timer = setInterval(fetch, 12e3);

  currentSymbol = symbol;
}

export function useQuotePrice(symbol: string): number | null {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const sub = quotePricesSubject.subscribe((quotePrices) => {
      setPrice(quotePrices.get(symbol)?.price ?? null);
    });
    return () => sub.unsubscribe();
  }, [symbol]);

  return price;
}
