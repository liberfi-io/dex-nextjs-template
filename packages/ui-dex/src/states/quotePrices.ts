import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";
import { Chain } from "@liberfi/core";
import { CHAIN_PRIMARY_TOKENS } from "../libs";
import { DexDataRuntime } from "../runtime";

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

export async function fetchQuotePrice(
  runtime: DexDataRuntime,
  chainId: Chain,
  symbol: string,
): Promise<number | null> {
  const address = CHAIN_PRIMARY_TOKENS[chainId]?.[symbol];
  if (!address) throw new Error("Address is not found");

  const marketData = await runtime.getTokenMarketData(chainId, address);
  const price = marketData?.priceInUsd ? Number(marketData.priceInUsd) : null;

  if (price) {
    setQuotePrice(symbol, price);
  }
  return price;
}

// reset current quote symbol and then fetch periodically
export function setCurrentQuoteSymbol(runtime: DexDataRuntime, chainId: Chain, symbol: string) {
  const address = CHAIN_PRIMARY_TOKENS[chainId]?.[symbol];
  if (!address) throw new Error("Address is not found");
  runtime.startQuotePricePolling(chainId, address, symbol, (price) => {
    setQuotePrice(symbol, price);
  });
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
