import { useCallback, useMemo } from "react";
import { useSetAtom } from "jotai";
import clsx from "clsx";
import { chainIdBySlug } from "@liberfi.io/utils";
import { isUSDChartAtom } from "../../states";
import { CHAIN_QUOTE_TOKEN_SYMBOLS } from "../../libs";
import { stringifySymbol, TvChartQuoteType } from "../../libs/tvchart";
import { useTvChartToolbarContext } from "./TvChartToolbarProvider";

export function TvChartQuoteTypeSwitch({ className }: { className?: string }) {
  const { activeAreaManager, symbolInfo } = useTvChartToolbarContext();

  const setIsUSDChart = useSetAtom(isUSDChartAtom);

  const handleToggleQuoteType = useCallback(() => {
    if (!activeAreaManager) return;
    if (!symbolInfo) return;

    const chainId = chainIdBySlug(symbolInfo.chain);
    if (!chainId) return;

    const quote =
      symbolInfo.quote === TvChartQuoteType.USD
        ? (CHAIN_QUOTE_TOKEN_SYMBOLS[chainId] as TvChartQuoteType)
        : TvChartQuoteType.USD;

    setIsUSDChart(quote === TvChartQuoteType.USD);

    activeAreaManager.setSymbol(
      stringifySymbol({
        ...symbolInfo,
        quote,
      }),
    );
  }, [activeAreaManager, symbolInfo, setIsUSDChart]);

  const quote = useMemo(() => {
    if (!symbolInfo) return "-";

    const chainId = chainIdBySlug(symbolInfo.chain);
    if (!chainId) return "-";

    return CHAIN_QUOTE_TOKEN_SYMBOLS[chainId] ?? "-";
  }, [symbolInfo]);

  return (
    <div
      className={clsx(
        "flex items-center gap-0.5 text-xs text-neutral cursor-pointer",
        className,
      )}
      onClick={handleToggleQuoteType}
    >
      <span className={clsx(symbolInfo?.quote === TvChartQuoteType.USD && "text-foreground")}>
        {TvChartQuoteType.USD}
      </span>
      /
      <span className={clsx(symbolInfo?.quote !== TvChartQuoteType.USD && "text-foreground")}>
        {quote}
      </span>
    </div>
  );
}
