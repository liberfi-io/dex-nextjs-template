import { TvChartWrapper } from "../tvchart/TvChartWrapper";

export function TradingChart() {
  return (
    <div className="md:flex-1 max-md:w-full h-[400px] md:h-full md:bg-content1 md:rounded-lg md:overflow-hidden flex flex-col">
      <TvChartWrapper className="flex-1 w-full" />
    </div>
  );
}
