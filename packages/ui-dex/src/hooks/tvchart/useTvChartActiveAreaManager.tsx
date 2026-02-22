import { useTvChartManager } from "../../components/tvchart/TvChartProvider";
import { TvChartAreaManager } from "../../libs/tvchart/TvChartAreaManager";
import { useEffect, useState } from "react";

export function useTvChartActiveAreaManager() {
  const chartManager = useTvChartManager();
  const [activeAreaManager, setActiveAreaManager] = useState<TvChartAreaManager | null>(null);

  useEffect(() => {
    setActiveAreaManager(chartManager.activeArea ?? null);
    const sub = chartManager.on("selectedIndex").subscribe(() => {
      setActiveAreaManager(chartManager.activeArea ?? null);
    });
    return () => {
      sub.unsubscribe();
    };
  }, [chartManager]);

  return activeAreaManager;
}
