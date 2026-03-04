import { PropsWithChildren, useEffect } from "react";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { setCurrentQuoteSymbol } from "../states";
import { CHAIN_QUOTE_TOKEN_SYMBOLS } from "../libs";

export function DexDataProvider({ children }: PropsWithChildren) {
  const { chain } = useCurrentChain();

  // reset quote symbol when current chain changes
  useEffect(() => {
    const symbol = CHAIN_QUOTE_TOKEN_SYMBOLS[chain];
    if (symbol) {
      setCurrentQuoteSymbol(chain, symbol);
    }
  }, [chain]);

  return children;
}
