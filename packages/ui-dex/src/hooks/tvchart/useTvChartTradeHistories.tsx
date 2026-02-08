import { TvChartInstance } from "@/components/tvchart/TvChart";

export type UseTvChartTradeHistoriesProps = {
  chartRef: React.RefObject<TvChartInstance>;
  options: {
    showHistory: boolean;
    chain: string;
  };
};

export const useTvChartTradeHistories = (_props: UseTvChartTradeHistoriesProps) => {
  // TODO
};
