import { CloseIcon } from "../../assets";
import { formatLongNumber, formatPercentage, tokenPriceChangeRatioInUsd } from "../../libs";
import {
  parseSymbol,
  stringifySymbol,
  TvChartLayout,
  TvChartManager,
  TvChartSymbol,
  TvChartSymbolInfo,
} from "../../libs/tvchart";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultTheme } from "@liberfi/ui-base";

export type TvChartAreaTitleProps = {
  chartManager: TvChartManager;
};

// render in iframe, here ui & tailwind not supported
export function TvChartAreaTitle({ chartManager }: TvChartAreaTitleProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const closeRef = useRef<HTMLDivElement>(null);

  const [hidden, setHidden] = useState(true);

  const [symbol, setSymbol] = useState<TvChartSymbol>();

  const [symbolInfo, setSymbolInfo] = useState<TvChartSymbolInfo | null>();

  const [index, setIndex] = useState<number>();

  useEffect(() => {
    if (!symbol) return;
    chartManager.datafeed
      ?.resolveSymbol(stringifySymbol(symbol))
      ?.then((symbolInfo) => {
        if (!symbolInfo) setSymbolInfo(null);
        setSymbolInfo(symbolInfo as TvChartSymbolInfo);
      })
      ?.catch((error) => {
        console.error("TvChartAreaTitle.resolveSymbol", error);
      });
  }, [chartManager, symbol]);

  useEffect(() => {
    const elem = wrapperRef.current?.parentElement?.parentElement;
    if (!elem?.hasAttribute("aria-label")) return;

    const attri = elem.getAttribute("aria-label");
    const index = attri ? parseInt(attri.split("#")[1]) - 1 : undefined;
    setIndex(index);

    if (index === undefined) return;

    const handleSymbolChange = () => {
      const tickerSymbol = chartManager.areas[index]?.tickerSymbol;
      const symbol = parseSymbol(tickerSymbol);
      setSymbol(symbol);
    };
    handleSymbolChange();

    const symbolSub = chartManager.areas[index]?.on("tickerSymbol").subscribe({
      next: () => {
        handleSymbolChange();
      },
      error: () => {},
    });

    const layoutSub = chartManager.settings.on("layout").subscribe({
      next: () => {
        if (chartManager.chartCount === 1) {
          setHidden(true);
        } else {
          setHidden(false);
        }
      },
      error: () => {},
    });

    return () => {
      symbolSub?.unsubscribe();
      layoutSub?.unsubscribe();
    };
  }, [chartManager, chartManager.chartCount]);

  const handleClose = useCallback(() => {
    const chartCount = chartManager.chartCount;
    if (chartCount === 1) return;

    let newLayout = TvChartLayout.Layout1A;
    switch (chartCount) {
      case 2:
        newLayout = TvChartLayout.Layout1A;
        break;
      case 3:
        newLayout = TvChartLayout.Layout2A;
        break;
      case 4:
        newLayout = TvChartLayout.Layout3E;
        break;
      case 5:
        newLayout = TvChartLayout.Layout4A;
        break;
      case 6:
        newLayout = TvChartLayout.Layout5C;
        break;
      case 7:
        newLayout = TvChartLayout.Layout6A;
        break;
      case 8:
        newLayout = TvChartLayout.Layout7A;
        break;
    }

    const tickerSymbols: string[] = [];
    for (let i = 0; i < chartCount; i++) {
      if (i !== index) {
        const tickerSymbol = chartManager.internalWidget?.widget?.chart(i)?.symbol();
        if (tickerSymbol) {
          tickerSymbols.push(tickerSymbol);
        }
      }
    }

    chartManager.setLayout(newLayout);

    setTimeout(() => {
      for (let i = 0; i < chartManager.chartCount; i++) {
        chartManager.areas[i]?.setSymbol(tickerSymbols[i]);
      }
    });
  }, [chartManager, index]);

  useEffect(() => {
    if (!closeRef.current) return;
    const closeElem = closeRef.current;
    const onMouseDown = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
    };
    const onClick = (e: Event) => {
      onMouseDown(e);
      handleClose();
    };
    closeElem.addEventListener("click", onClick, true);
    closeElem.addEventListener("mousedown", onMouseDown, true);
    return () => {
      closeElem.removeEventListener("click", onClick, true);
      closeElem.removeEventListener("mousedown", onMouseDown, true);
    };
  }, [handleClose]);

  const priceChange = useMemo(
    () =>
      symbolInfo
        ? tokenPriceChangeRatioInUsd(symbolInfo.token, "24h")
          ? formatPercentage(tokenPriceChangeRatioInUsd(symbolInfo.token, "24h")!)
          : undefined
        : undefined,
    [symbolInfo],
  );

  const bearish = useMemo(() => priceChange && priceChange.startsWith("-"), [priceChange]);

  return (
    <div
      ref={wrapperRef}
      style={{
        boxSizing: "border-box",
        display: hidden ? "none" : "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "32px",
        padding: "6px",
        backgroundColor: defaultTheme.colors.content1,
        whiteSpace: "nowrap",
      }}
    >
      {symbolInfo && (
        <div
          style={{
            flex: "1 1 0%",
            display: "flex",
            justifyContent: "start",
            flexDirection: "row",
            width: "100%",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div style={{ width: "20px", height: "20px", position: "relative" }}>
            <img
              style={{ width: "20px", height: "20px", objectFit: "cover", borderRadius: "50%" }}
              src={symbolInfo.token.imageUrl}
              alt={symbolInfo.token.symbol}
            />
          </div>
          <span
            style={{ fontSize: "14px", color: defaultTheme.colors.foreground, fontWeight: 500 }}
          >
            {symbolInfo.token.symbol}
          </span>
          <div style={{ fontSize: "12px", color: defaultTheme.colors.neutral }}>
            ${formatLongNumber(symbolInfo.token.marketData.priceInUsd)}
            <span
              style={{
                color: bearish ? defaultTheme.colors.bearish : defaultTheme.colors.bullish,
              }}
            >
              {" "}
              {priceChange}
            </span>
          </div>
          {/* <span style={{ fontSize: "12px", color: "rgb(196, 204, 204)" }}>MC:$4.8K</span>
          <span style={{ fontSize: "12px", color: "rgb(196, 204, 204)" }}>Liq:$7.32</span> */}
        </div>
      )}
      <div
        style={{
          cursor: "pointer",
          position: "sticky",
          right: "0px",
          padding: "0 4px",
          display: "flex",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1A1A1A",
        }}
        ref={closeRef}
      >
        <CloseIcon color="#999999" />
      </div>
    </div>
  );
}
