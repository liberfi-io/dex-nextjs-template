import { useTranslation } from "@liberfi/ui-base";
import { useTvChartManager } from "./TvChartProvider";
import { useTvChartToolbarContext } from "./TvChartToolbarProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SeriesType } from "../../../../../apps/web/public/static/charting_library/charting_library";
import { TvChartKlineStyle } from "../../libs/tvchart";
import {
  KlineAreaIcon,
  KlineBarsIcon,
  KlineBaseLineIcon,
  KlineCandlesIcon,
  KlineColumnsIcon,
  KlineHelkinAshiIcon,
  KlineHighLowIcon,
  KlineHollowCandlesIcon,
  KlineLineIcon,
} from "../../assets";
import { Button, Popover, PopoverContent, PopoverTrigger, useDisclosure } from "@heroui/react";
import clsx from "clsx";

export function TvChartKlineStyleSelect({ className }: { className?: string }) {
  const { t } = useTranslation();

  const chartManager = useTvChartManager();

  const { activeAreaManager } = useTvChartToolbarContext();

  const [chartStyle, setChartStyle] = useState<SeriesType | null>(
    activeAreaManager?.chartStyle ?? null,
  );

  const { isOpen, onClose, onOpenChange } = useDisclosure();

  const handleSelectChartStyle = useCallback(
    (chartStyle: SeriesType) => {
      setChartStyle(chartStyle);
      chartManager.activeArea?.setChartStyle(chartStyle);
      onClose();
    },
    [chartManager, onClose],
  );

  useEffect(() => {
    if (!activeAreaManager) return;
    setChartStyle(activeAreaManager.chartStyle);
    const sub = activeAreaManager.on("chartStyle").subscribe(() => {
      setChartStyle(activeAreaManager.chartStyle);
    });
    return () => {
      sub.unsubscribe();
    };
  }, [activeAreaManager]);

  const options = useMemo<Record<number, { title: string; icon: React.ReactNode }>>(
    () => ({
      [TvChartKlineStyle.Bars]: {
        title: t("extend.trade.tvchart.kline_styles.bar"),
        icon: <KlineBarsIcon />,
      },
      [TvChartKlineStyle.Candles]: {
        title: t("extend.trade.tvchart.kline_styles.candles"),
        icon: <KlineCandlesIcon />,
      },
      [TvChartKlineStyle.Line]: {
        title: t("extend.trade.tvchart.kline_styles.line"),
        icon: <KlineLineIcon />,
      },
      [TvChartKlineStyle.Area]: {
        title: t("extend.trade.tvchart.kline_styles.area"),
        icon: <KlineAreaIcon />,
      },
      [TvChartKlineStyle.HeikenAshi]: {
        title: t("extend.trade.tvchart.kline_styles.helkin_ashi"),
        icon: <KlineHelkinAshiIcon />,
      },
      [TvChartKlineStyle.HollowCandles]: {
        title: t("extend.trade.tvchart.kline_styles.hollow_candles"),
        icon: <KlineHollowCandlesIcon />,
      },
      [TvChartKlineStyle.Baseline]: {
        title: t("extend.trade.tvchart.kline_styles.baseline"),
        icon: <KlineBaseLineIcon />,
      },
      [TvChartKlineStyle.HiLo]: {
        title: t("extend.trade.tvchart.kline_styles.high_low"),
        icon: <KlineHighLowIcon />,
      },
      [TvChartKlineStyle.Column]: {
        title: t("extend.trade.tvchart.kline_styles.columns"),
        icon: <KlineColumnsIcon />,
      },
    }),
    [t],
  );

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="bottom-start"
      classNames={{
        trigger: className,
        content: "w-64 bg-content2 rounded-lg p-4",
      }}
    >
      <PopoverTrigger>
        <Button
          isIconOnly
          className="w-auto min-w-0 h-6 min-h-0 px-0 bg-transparent text-foreground"
          disableRipple
        >
          {chartStyle !== null && options[chartStyle]?.icon}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="w-full gap-y-2 flex items-center flex-wrap text-xs text-neutral">
          {Object.keys(options)
            .sort()
            .map((style) => (
              <div
                key={style}
                className={clsx(
                  "w-full h-10 px-2.5 flex items-center gap-2 rounded-lg hover:opacity-hover cursor-pointer",
                  "text-xs text-neutral data-[active=true]:text-foreground data-[active=true]:font-medium",
                  "bg-transparent data-[active=true]:bg-primary/20",
                  "border border-content3 data-[active=true]:border-transparent",
                )}
                data-active={parseInt(style) === chartStyle}
                onClick={() => handleSelectChartStyle(parseInt(style))}
              >
                {options[parseInt(style)].icon}
                <span>{options[parseInt(style)].title}</span>
              </div>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
