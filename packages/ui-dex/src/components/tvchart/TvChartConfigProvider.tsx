/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ITvChartDataFeedModule,
  TvChartFeature,
  TvChartKlineStyle,
  TvChartLayout,
  TvChartResolution,
  TvChartSymbolResolver,
  TvChartTheme,
  TvChartType,
} from "@/libs/tvchart";
import { PropsWithChildren, useEffect, useState } from "react";
import {
  LanguageCode,
  SeriesFormatterFactory,
  SingleBrokerMetaInfo,
  Timezone,
} from "../../../../../apps/web/public/static/charting_library";
import { useTvChartContext } from "./TvChartProvider";

export interface TvChartConfig {
  storageId: string;
  tickerSymbol: string;
  datafeed: ITvChartDataFeedModule;
  resolution: TvChartResolution;
  supportedResolutions?: TvChartResolution[];
  layout: TvChartLayout;
  supportedLayouts?: TvChartLayout[];
  chartType: TvChartType;
  supportedChartTypes?: TvChartType[];
  chartNames?: Record<TvChartType, string>;
  kLineStyle: TvChartKlineStyle;
  theme: TvChartTheme;
  reverseColor?: boolean;
  backgroundColor?: string;
  timezone: Timezone;
  locale: LanguageCode;
  longShortMode?: boolean;
  enabledFeatures?: TvChartFeature[];
  disabledFeatures?: TvChartFeature[];
  brokerFactory?: any;
  brokerConfig?: SingleBrokerMetaInfo;
  priceFormatterFactory?: SeriesFormatterFactory;
}

export type TvChartConfigProviderProps = PropsWithChildren<{
  initConfig: TvChartConfig;
}>;

export const TvChartConfigProvider = ({ initConfig, children }: TvChartConfigProviderProps) => {
  const { chartManager, chartSettings } = useTvChartContext();

  // force re-render when initialized
  const [_, setInitialized] = useState(false);

  // initialize chart configs
  useEffect(() => {
    if (!chartManager.initialized) {
      chartSettings.updateValue("tickerSymbol", initConfig.tickerSymbol);
      chartSettings.updateValue("theme", initConfig.theme);
      chartSettings.updateValue("reverseColor", initConfig.reverseColor);
      chartSettings.updateValue("layout", initConfig.layout);
      chartSettings.updateValue("chartType", initConfig.chartType);
      chartSettings.updateValue("timezone", initConfig.timezone);
      chartSettings.updateValue("locale", initConfig.locale);
      chartSettings.updateValue("longShortMode", initConfig.longShortMode);
      chartSettings.updateValue("chartNames", initConfig.chartNames);
      chartSettings.updateValue("priceFormatterFactory", initConfig.priceFormatterFactory);
      chartSettings.updateValue("supportedResolutions", initConfig.supportedResolutions);
      chartSettings.updateValue("supportedLayouts", initConfig.supportedLayouts);
      chartSettings.updateValue("supportedChartTypes", initConfig.supportedChartTypes);
      chartSettings.updateValue("backgroundColor", initConfig.backgroundColor);
      chartSettings.updateValue("storageId", initConfig.storageId);
      chartSettings.updateValue("enabledFeatures", initConfig.enabledFeatures);
      chartSettings.updateValue("disabledFeatures", initConfig.disabledFeatures);

      chartManager.datafeed = initConfig.datafeed;
      chartManager.symbolResolver = new TvChartSymbolResolver(initConfig.datafeed);

      // TODO
      // if (initConfig.brokerFactory) {
      //   try {
      //     chartManager.brokerTerminalDelegate = new BrokerFactory(chartManager, chartSettings, initConfig.brokerFactory, initConfig.brokerConfig)
      //   } catch (error) {
      //     console.error("TvChartConfigProvider brokerTerminalDelegate initialize error", error);
      //   }
      // }

      // TODO
      // if (initConfig.saveLoadAdapter) {
      //   chartSettings.updateValue("saveLoadAdapter" , initConfig.saveLoadAdapter)
      // }
    }
  }, [chartManager, chartSettings, initConfig]);

  // initialize chartManager
  useEffect(() => {
    chartManager
      .init()
      .then(() => setInitialized(true))
      .catch((e) => {
        console.error("TvChartConfigProvider chartManager initialize error", e);
      });
    return () => {
      chartManager.destroy();
    };
  }, [chartManager, chartSettings]);

  // TODO: display position lines
  useEffect(() => {
    chartManager.activeArea?.internalChartWidget?.legacySetTradeState(chartSettings.enableTrade);
    if (chartSettings.enableTrade) {
      chartManager.positionLinesStore.setPositions();
    } else {
      chartManager.positionLinesStore.clearPositionLines();
    }
  }, [chartManager, chartSettings.enableTrade]);

  // TODO: display position lines
  useEffect(() => {
    if (chartManager.trade.positionLine && chartManager.chartCount === 1) {
      chartManager.positionLinesStore.setPositions();
    } else {
      chartManager.positionLinesStore.clearPositionLines();
    }
  }, [chartManager.positionLinesStore, chartManager.trade.positionLine, chartManager.chartCount]);

  // TODO: record orders
  useEffect(() => {
    chartManager.activeArea?.internalChartWidget?.legacySetOrderRecord(
      chartManager.trade.orderRecord && chartManager.chartCount === 1,
    );
  }, [chartManager, chartManager.trade.orderRecord, chartManager.chartCount]);

  // TODO: keyboard shortcuts
  useEffect(() => {
    chartManager.keyboardShortcutManager.init();
    return () => {
      chartManager.keyboardShortcutManager.destroy();
    };
  }, [chartManager.keyboardShortcutManager]);

  return chartManager.initialized ? children : null;
};
