import { useEffect, useState } from "react";
import { Token } from "@chainstream-io/sdk";
import { chainIdBySlug } from "@liberfi.io/utils";
import { fetchTokenInfo } from "../../states";
import { parseSymbol, TvChartSymbol, TvChartAreaManager } from "../../libs/tvchart";

export function useTvChartSymbolInfo(areaManager: TvChartAreaManager | null) {
  const [symbolInfo, setSymbolInfo] = useState<TvChartSymbol | null>(null);
  const [token, setToken] = useState<Token | null>(null);

  useEffect(() => {
    if (!areaManager) return;

    const fetchSymbolInfo = async () => {
      const tickerSymbol = areaManager.tickerSymbol;
      const symbolInfo = parseSymbol(tickerSymbol);
      setSymbolInfo(symbolInfo);

      try {
        const { chain, address } = symbolInfo;
        const chainId = chainIdBySlug(chain);
        if (!chainId) {
          // Non-DEX ticker format (e.g. perpetuals "BTC-USDC") — skip token fetch
          return;
        }

        const token = await fetchTokenInfo(chainId, address);
        setToken(token);
      } catch (error) {
        console.warn("useTvChartSymbolInfo.fetchSymbolInfo", error);
      }
    };

    fetchSymbolInfo();

    const sub = areaManager.on("tickerSymbol").subscribe(() => {
      fetchSymbolInfo();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [areaManager]);

  return { symbolInfo, token };
}
