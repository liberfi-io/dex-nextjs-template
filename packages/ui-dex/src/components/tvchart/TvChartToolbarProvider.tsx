import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { Token } from "@chainstream-io/sdk";
import { useTvChartActiveAreaManager, useTvChartSymbolInfo } from "@/hooks/tvchart";
import { TvChartAreaManager, TvChartSymbol } from "@/libs/tvchart";

export interface TvChartToolbarContextValue {
  activeAreaManager: TvChartAreaManager | null;
  symbolInfo: TvChartSymbol | null;
  token: Token | null;
}

export const TvChartToolbarContext = createContext<TvChartToolbarContextValue>(
  {} as TvChartToolbarContextValue,
);

export const TvChartToolbarProvider = ({ children }: PropsWithChildren) => {
  const activeAreaManager = useTvChartActiveAreaManager();
  const { symbolInfo, token } = useTvChartSymbolInfo(activeAreaManager);
  const value = useMemo<TvChartToolbarContextValue>(
    () => ({
      activeAreaManager,
      symbolInfo,
      token,
    }),
    [activeAreaManager, symbolInfo, token],
  );
  return <TvChartToolbarContext.Provider value={value}>{children}</TvChartToolbarContext.Provider>;
};

export const useTvChartToolbarContext = () => {
  const context = useContext(TvChartToolbarContext);
  if (!context) {
    throw new Error("useTvChartToolbarContext must be used within a TvChartToolbarProvider");
  }
  return context;
};
