import { useEffect, useState } from "react";
import { Token } from "@chainstream-io/sdk";
import { chainIdBySlug } from "@liberfi/core";
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
        if (!chainId) throw new Error("Invalid chain");

        // fetch token info, and set it to tokens state
        const token = await fetchTokenInfo(chainId, address);
        setToken(token);
      } catch (error) {
        console.error("useTvChartSymbolInfo.fetchSymbolInfo", error);
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
