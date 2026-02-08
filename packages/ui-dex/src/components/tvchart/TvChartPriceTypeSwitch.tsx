import { useCallback } from "react";
import { useSetAtom } from "jotai";
import clsx from "clsx";
import { useTranslation } from "@liberfi/ui-base";
import { isPriceChartAtom } from "@/states";
import { stringifySymbol, TvChartPriceType } from "@/libs/tvchart";
import { useTvChartToolbarContext } from "./TvChartToolbarProvider";

export function TvChartPriceTypeSwitch({ className }: { className?: string }) {
  const { t } = useTranslation();

  const { activeAreaManager, symbolInfo } = useTvChartToolbarContext();

  const setIsPriceChart = useSetAtom(isPriceChartAtom);

  const handleTogglePriceType = useCallback(() => {
    if (!activeAreaManager) return;
    if (!symbolInfo) return;

    const priceType =
      symbolInfo.priceType === TvChartPriceType.Price
        ? TvChartPriceType.MarketCap
        : TvChartPriceType.Price;

    setIsPriceChart(priceType === TvChartPriceType.Price);

    activeAreaManager.setSymbol(
      stringifySymbol({
        ...symbolInfo,
        priceType,
      }),
    );
  }, [activeAreaManager, symbolInfo, setIsPriceChart]);

  return (
    <div
      className={clsx(
        "flex items-center gap-0.5 text-xs text-neutral cursor-pointer",
        className,
      )}
      onClick={handleTogglePriceType}
    >
      <span className={clsx(symbolInfo?.priceType === TvChartPriceType.Price && "text-foreground")}>
        {t("extend.trade.tvchart.price_types.price")}
      </span>
      /
      <span
        className={clsx(symbolInfo?.priceType === TvChartPriceType.MarketCap && "text-foreground")}
      >
        {t("extend.trade.tvchart.price_types.market_cap")}
      </span>
    </div>
  );
}
