import { PropsWithChildren, useEffect } from "react";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { setCurrentQuoteSymbol } from "../states";
import { CHAIN_QUOTE_TOKEN_SYMBOLS } from "../libs";
import { useDexDataRuntime } from "../runtime";

export function DexDataProvider({ children }: PropsWithChildren) {
  const { chain } = useCurrentChain();
  const runtime = useDexDataRuntime();

  // reset quote symbol when current chain changes
  useEffect(() => {
    const symbol = CHAIN_QUOTE_TOKEN_SYMBOLS[chain];
    if (symbol) {
      setCurrentQuoteSymbol(runtime, chain, symbol);
    }
  }, [chain, runtime]);

  return children;
}
