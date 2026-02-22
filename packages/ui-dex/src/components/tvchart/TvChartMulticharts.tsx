import { SplitWindowIcon } from "../../assets";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useAppSdk, useTranslation } from "@liberfi/ui-base";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { useTvChartContext } from "./TvChartProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { stringifySymbol, TvChartLayout, TvChartPriceType, TvChartQuoteType } from "../../libs/tvchart";
import { chainSlug } from "@liberfi.io/utils";
import { isPriceChartAtom, isUSDChartAtom } from "../../states";
import { useAtomValue } from "jotai";
import { CHAIN_QUOTE_TOKEN_SYMBOLS } from "../../libs";

export function TvChartMulticharts({ className }: { className?: string }) {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const { chain } = useCurrentChain();

  const isPriceChart = useAtomValue(isPriceChartAtom);

  const isUSDChart = useAtomValue(isUSDChartAtom);

  const slug = useMemo(() => chainSlug(chain), [chain]);

  const { chartManager, chartSettings } = useTvChartContext();

  const [chartCount, setChartCount] = useState(chartManager?.chartCount ?? 0);

  useEffect(() => {
    const sub = chartSettings.on("layout").subscribe(() => {
      setChartCount(chartManager?.chartCount ?? 0);
    });
    return () => {
      sub.unsubscribe();
    };
  }, [chartSettings, chartManager]);

  const [requestId, setRequestId] = useState<number | undefined>(undefined);

  const handleAddChart = useCallback(() => {
    const chartCount = chartManager?.chartCount ?? 0;
    if (chartCount >= 8 || chartCount === 0) return;

    const id = Date.now();
    appSdk.events.emit("select_token", { method: "select_token", id, params: undefined });
    setRequestId(id);
  }, [chartManager, appSdk]);

  useEffect(() => {
    const handler = (options: {
      method: "response";
      id?: number | undefined;
      params: { tokenAddress: string };
    }) => {
      if (options.id === requestId) {
        const chartCount = chartManager?.chartCount ?? 0;
        if (chartCount >= 8 || chartCount === 0) return;

        let newLayout = TvChartLayout.Layout1A;
        switch (chartCount) {
          case 1:
            newLayout = TvChartLayout.Layout2A;
            break;
          case 2:
            newLayout = TvChartLayout.Layout3E;
            break;
          case 3:
            newLayout = TvChartLayout.Layout4A;
            break;
          case 4:
            newLayout = TvChartLayout.Layout5C;
            break;
          case 5:
            newLayout = TvChartLayout.Layout6A;
            break;
          case 6:
            newLayout = TvChartLayout.Layout7A;
            break;
          case 7:
            newLayout = TvChartLayout.Layout8A;
            break;
        }

        chartManager.setLayout(newLayout);

        const sub = chartManager.settings.on("layout").subscribe(() => {
          chartManager.areas[chartCount].setSymbol(
            stringifySymbol({
              address: options.params.tokenAddress,
              chain: slug!,
              quote: isUSDChart
                ? TvChartQuoteType.USD
                : (CHAIN_QUOTE_TOKEN_SYMBOLS[chain] as TvChartQuoteType),
              priceType: isPriceChart ? TvChartPriceType.Price : TvChartPriceType.MarketCap,
            }),
          );
          setTimeout(() => {
            sub.unsubscribe();
          });
        });
      }
    };
    appSdk.events.on("response", handler);
    return () => {
      appSdk.events.off("response", handler);
    };
  }, [appSdk, requestId, chartManager, chain, slug, isUSDChart, isPriceChart]);

  return (
    <Button
      className={clsx(
        "h-6 min-h-0 w-auot min-w-0 p-0 gap-1 text-xs text-foreground bg-transparent",
        "disabled:cursor-not-allowed",
        className,
      )}
      disabled={chartCount >= 8 || chartCount === 0}
      startContent={<SplitWindowIcon width={16} height={16} />}
      disableRipple
      onPress={handleAddChart}
    >
      {t("extend.trade.tvchart.multicharts")}
    </Button>
  );
}
