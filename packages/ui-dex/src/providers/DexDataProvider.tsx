import { PropsWithChildren, useEffect } from "react";
import { useAtomValue } from "jotai";
import {
  chainAtom,
  useRefreshWalletNetWorth,
  useRefreshWalletPnl,
  useRefreshWalletPnlDetails,
} from "@liberfi/ui-base";
import { setCurrentQuoteSymbol } from "@/states";
import { CHAIN_QUOTE_TOKEN_SYMBOLS } from "@/libs";

export function DexDataProvider({ children }: PropsWithChildren) {
  const chain = useAtomValue(chainAtom);

  // reset quote symbol when current chain changes
  useEffect(() => {
    const symbol = CHAIN_QUOTE_TOKEN_SYMBOLS[chain];
    if (symbol) {
      setCurrentQuoteSymbol(chain, symbol);
    }
  }, [chain]);

  // keep wallet balances updated
  useRefreshWalletNetWorth();

  useRefreshWalletPnl();

  useRefreshWalletPnlDetails();

  return children;
}
