/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  ITvChartDataFeedModule,
  TvChartLayout,
  TvChartManager,
  TvChartResolution,
  TvChartSettings,
  TvChartTheme,
  TvChartType,
} from "@/libs/tvchart";
import { TvChartHandle, TvChartProvider } from "./TvChartProvider";
import { Subscription } from "rxjs";
import { TvChartToolbar } from "./TvChartToolbar";
import { TvChartWidgetProvider } from "./TvChartWidgetProvider";
import { TvChartConfig } from "./TvChartConfigProvider";

export interface TvChartInstance {
  get settings(): TvChartSettings | undefined;
  get chartManager(): TvChartManager | undefined;
  getChartWidgetApi(): TvChartHandle | null;
  setActiveChart(index: number): void;
  setSymbol(symbol: string): void;
  setResolution(resolution: TvChartResolution): void;
  setChartType(type: TvChartType): void;
  setLayout(layout: TvChartLayout): void;
  setTheme(theme: TvChartTheme): void;
  setPrecision(precision: number): void;
  createPriceLines(priceLines: any): void;
  setDepth(depth: number): void;
  setMarket(market: any): void;
  setPositions(positions: any): void;
  setOrderInput(on: boolean): void;
  setTradeState(on: boolean): void;
  openPriceAlertDialog(e: any): void;
}

export interface TvChartProps {
  config: Omit<TvChartConfig, "datafeed"> & {
    datafeedModule: new () => ITvChartDataFeedModule;
  };
  onFullscreenSwitch?: (fullscreen: boolean) => void;
  onChartReady?: (chartType: TvChartType) => void;
}

export const TvChart = forwardRef<TvChartInstance, TvChartProps>(
  ({ config, onFullscreenSwitch, onChartReady }, ref) => {
    const [initConfig] = useState<TvChartConfig>({
      ...config,
      datafeed: new config.datafeedModule(),
    });

    const [chartHandle, setChartHandle] = useState<TvChartHandle | null>(null);

    const subsRef = useRef<Subscription[]>([]);
    const watcherCreatedRef = useRef(false);

    useImperativeHandle(
      ref,
      () =>
        new (class implements TvChartInstance {
          get settings(): TvChartSettings | undefined {
            return chartHandle?.getSetting();
          }
          get chartManager(): TvChartManager | undefined {
            return chartHandle?.getChartManager();
          }
          getChartWidgetApi(): TvChartHandle | null {
            return chartHandle;
          }
          setActiveChart(index: number): void {
            chartHandle?.setActiveChart(index);
          }
          setSymbol(symbol: string): void {
            this.chartManager?.activeArea?.setSymbol(symbol).catch((e) => console.error(e));
          }
          setResolution(resolution: TvChartResolution): void {
            this.chartManager?.activeArea?.setResolution(resolution).catch((e) => console.error(e));
          }
          setChartType(type: TvChartType): void {
            chartHandle?.setChartType(type);
          }
          setLayout(layout: TvChartLayout): void {
            chartHandle?.setLayout(layout);
          }
          setTheme(theme: TvChartTheme): void {
            chartHandle?.setTheme(theme);
          }
          setPrecision(precision: number): void {
            this.chartManager?.activeArea?.internalChartWidget?.setPrecision(precision);
          }
          createPriceLines(priceLines: any): void {
            this.chartManager?.activeArea?.internalChartWidget?.legacyCreatePriceLines(priceLines);
          }
          setDepth(depth: number): void {
            this.chartManager?.orderInputStore?.setDepth(depth);
            this.chartManager?.activeArea?.internalChartWidget?.legacySetDepth(depth);
          }
          setMarket(market: any): void {
            this.chartManager?.activeArea?.internalChartWidget?.legacySetMarket(market);
          }
          setPositions(positions: any): void {
            this.chartManager?.positionLinesStore.setPositions(positions);
          }
          setOrderInput(on: boolean): void {
            this.settings?.setFeature("TradeOrderPanel", on);
          }
          setTradeState(on: boolean): void {
            this.settings?.setFeature("Trade", on);
          }
          openPriceAlertDialog(e: any): void {
            this.chartManager?.priceAlertStore?.toggleDialog(true, e, "Button");
            // this.handlePriceAlertDialog(e);
          }
        })(),
      [chartHandle],
    );

    // unmount
    useEffect(
      () => () => {
        subsRef.current.forEach((sub) => sub.unsubscribe());
        subsRef.current = [];
      },
      [],
    );

    const createWatcher = useCallback(
      (handle: TvChartHandle) => {
        const chartManager = handle.chartManager;
        if (chartManager) {
          const sub = chartManager.on("fullscreen").subscribe({
            next: (fullscreen) => {
              if (chartManager.initialized) {
                onFullscreenSwitch?.(fullscreen);
              }
            },
            error: (err) => {
              console.error("TvChart.onFullscreen.error", err);
            },
          });
          subsRef.current.push(sub);
        }
      },
      [onFullscreenSwitch],
    );

    const handleChartRef = useCallback(
      (handle: TvChartHandle) => {
        setChartHandle(handle);
        if (handle && !watcherCreatedRef.current) {
          createWatcher(handle);
          watcherCreatedRef.current = true;
        }
      },
      [setChartHandle, createWatcher],
    );

    const handleChartReady = useCallback(() => {
      onChartReady?.(chartHandle?.setting?.chartType ?? TvChartType.TradingView);
    }, [onChartReady, chartHandle?.setting?.chartType]);

    return (
      <TvChartProvider ref={handleChartRef} initConfig={initConfig}>
        <TvChartToolbar />
        <TvChartWidgetProvider onReady={handleChartReady} />
      </TvChartProvider>
    );
  },
);
