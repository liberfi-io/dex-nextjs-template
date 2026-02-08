/* eslint-disable @typescript-eslint/no-explicit-any */
import { omit } from "lodash-es";

export class TvChartSettingsStore {
  static settingsKey: string = "TvChart.Settings";
  static shapesKey: string = "TvChart.Shapes";
  static simulatedShapesKey: string = "TvChart.Simulated.Shapes";

  private storageId: string;

  constructor(storageId: string) {
    this.storageId = storageId;
  }

  getSettings(): any {
    const localSettings = this.getLocalSettingsData();
    const chartStoreData = this.getChartStoreData();

    const settings = {
      layout: chartStoreData?.layout,
      selectedIndex: chartStoreData?.currentAreaIndex,
      chartType: chartStoreData?.chartType,
      pinnedResolutions: chartStoreData?.pinnedResolutions,
      chartSetting: chartStoreData?.chartSetting,
      syncSetting: chartStoreData?.syncSetting,
      timeAnchorSetting: chartStoreData?.timeAnchorSetting,
      areaContents: chartStoreData?.areas?.map((v: any) => ({
        resolution: v.resolution || v.period || "defaultResolution",
        chartStyle: v.chartStyle,
        symbol: v.symbol,
        tickerSymbol: v.tickerSymbol,
        rightOffset: v.rightOffset,
        barSpacing: v.barSpacing,
      })),
      trade: {
        orderLine: chartStoreData?.trade?.showOrderLine,
        orderLineQuickAttachTpSl: chartStoreData?.trade?.orderLineQuickAttachTpSl,
        orderLineValueDisplayType: chartStoreData?.trade?.orderLineValueDisplayType,
        orderLinePosition: chartStoreData?.trade?.orderLinePosition,
        orderLineHorzVisible: chartStoreData?.trade?.orderHorzLineVisible,
        orderRecord: chartStoreData?.trade?.showOrderRecord,
        orderPanel:
          chartStoreData?.trade?.floatOrderInputEnabled ?? chartStoreData?.trade?.showOrderInput,
        orderButton:
          chartStoreData?.trade?.crosshairOrderBtnEnabled ?? chartStoreData?.trade?.showOrderInput,
        orderLineQuickChange: chartStoreData?.trade?.orderLineQuicklyChange,
        positionLineQuickClose: chartStoreData?.trade?.positionLineCloseAll,
        positionLine: chartStoreData?.trade?.showPositionLine,
        devHistoryTrades: chartStoreData?.trade?.showDevHistoryTrades,
        positionLineQuickTpSl: chartStoreData?.trade?.positionLineQuicklyTPSL,
        positionLinePosition: chartStoreData?.trade?.positionLinePosition,
        positionLineHorzVisible: chartStoreData?.trade?.positionHorzLineVisible,
        trade: chartStoreData?.trade?.trade,
        quickTpSl: chartStoreData?.trade?.quickTpSl,
        quickEdit: chartStoreData?.trade?.quickEdit,
        quickClose: chartStoreData?.trade?.quickClose,
        valueDisplayType: chartStoreData?.trade?.valueDisplayType,
        linePosition: chartStoreData?.trade?.linePosition,
        lineHorzVisible: chartStoreData?.trade?.lineHorzVisible,
      },
      orderPanelPosition: chartStoreData?.orderInputPosition,
      showDrawingToolbar: chartStoreData?.drawing?.toolbarSwitch,
      showPriceAlertLabel: chartStoreData?.trade?.priceAlertLabel,
      drawing: {
        ...localSettings?.drawing,
        lastUsedTools: localSettings?.DrawingToolGroupLastUsedTool,
      },
    };

    if (localSettings) {
      settings.drawing = {
        ...localSettings.drawing,
        defaultStates: omit(localSettings, [
          "drawing",
          "DrawingToolGroupLastUsedTool",
          "riskRewardAvailableChanged",
          "riskRewardRiskSizeChanged",
          "drawingShapeTemplate",
        ]),
        lastUsedTools: localSettings.DrawingToolGroupLastUsedTool,
        riskRewardAvailableChanged: localSettings.riskRewardAvailableChanged,
        riskRewardRiskSizeChanged: localSettings.riskRewardRiskSizeChanged,
        drawingShapeTemplate: localSettings.drawingShapeTemplate,
      };
    }
    return settings;
  }

  getChartStoreData() {
    return this.getLocalData(this.storageId);
  }

  setChartStoreData(data: any) {
    this.setLocalData(this.storageId, data);
  }

  async saveSettings(data: any) {
    const chartStoreData = this.getChartStoreData();
    const newChartStoreData = {
      ...chartStoreData,
      layout: data.layout,
      currentAreaIndex: data.selectedIndex,
      chartType: data.chartType,
      pinnedResolutions: data.pinnedResolutions,
      areas: data.areaContents?.map((v: any, i: number) => ({
        indicatorVer: "0",
        indicatorData: [],
        ...chartStoreData?.areas?.[i],
        ...v,
      })),
      trade: {
        ...chartStoreData?.trade,
        showPositionLine: data.trade?.positionLine,
        showOrderLine: data.trade?.orderLine,
        showDevHistoryTrades: data.trade?.devHistoryTrades,
        orderLineQuickAttachTpSl: data.trade?.orderLineQuickAttachTpSl,
        orderLineValueDisplayType: data.trade?.orderLineValueDisplayType,
        orderLinePosition: data.trade?.orderLinePosition,
        orderHorzLineVisible: data.trade?.orderLineHorzVisible,
        showOrderRecord: data.trade?.orderRecord,
        showOrderInput: data.trade?.orderPanel,
        floatOrderInputEnabled: data.trade?.orderPanel,
        crosshairOrderBtnEnabled: data.trade?.orderButton,
        orderLineQuicklyChange: data.trade?.orderLineQuickChange,
        positionLineQuicklyTPSL: data.trade?.positionLineQuickTpSl,
        positionLineCloseAll: data.trade?.positionLineQuickClose,
        positionLinePosition: data.trade?.positionLinePosition,
        positionHorzLineVisible: data.trade?.positionLineHorzVisible,
        trade: data.trade?.trade,
        quickTpSl: data.trade?.quickTpSl,
        quickEdit: data.trade?.quickEdit,
        quickClose: data.trade?.quickClose,
        valueDisplayType: data.trade?.valueDisplayType,
        linePosition: data.trade?.linePosition,
        lineHorzVisible: data.trade?.lineHorzVisible,
        priceAlertLabel: data.showPriceAlertLabel,
        chartSetting: data.chartSetting,
        syncSetting: data.syncSetting,
        timeAnchorSetting: data.timeAnchorSetting,
        orderInputPosition: data.orderPanelPosition,
        drawing: {
          ...chartStoreData?.drawing,
          toolbarSwitch: data.showDrawingToolbar,
        },
      },
    };
    this.setChartStoreData(newChartStoreData);
  }

  async getShapes(key: string): Promise<any[]> {
    const data = this.getLocalShapesData();
    if (!data || !data[key]) return [];
    return Object.values(data[key]);
  }

  async saveShapes(key: string, updated: any) {
    const data = this.getLocalShapesData() || {};
    data[key] = { ...data[key], ...updated };
    Object.keys(data[key]).forEach((k) => {
      if (!data[key][k]) delete data[key][k];
    });
    this.setLocalShapesData(data);
  }

  getLocalData(key: string): any | null {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  setLocalData(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getLocalSettingsData(): any | null {
    const key = TvChartSettingsStore.settingsKey;
    return this.getLocalData(key);
  }

  setLocalSettingsData(data: any) {
    const key = TvChartSettingsStore.settingsKey;
    this.setLocalData(key, data);
  }

  getLocalShapesData(): any | null {
    const key = TvChartSettingsStore.shapesKey;
    return this.getLocalData(key);
  }

  setLocalShapesData(data: any) {
    const key = TvChartSettingsStore.shapesKey;
    this.setLocalData(key, data);
  }
}
