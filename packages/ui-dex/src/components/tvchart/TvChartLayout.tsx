/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { useTvChartContext } from "./TvChartProvider";
import { TvChartAreaTitle } from "./TvChartAreaTitle";

export function TvChartLayout() {
  const { chartManager } = useTvChartContext();

  const compsRef = useRef(new Map<number, Root>());

  const handleLayoutChange = useCallback(() => {
    const widget = chartManager.internalWidget?.widget;
    if (!widget) return;

    const chartCount = chartManager.chartCount;

    // 存在多个图表的时候，才需要追加标题栏
    if (chartCount > 1) {
      for (let i = 0; i < chartCount; i++) {
        if (compsRef.current.has(i)) continue;

        const df = document.createDocumentFragment();
        const div = document.createElement("div");
        df.appendChild(div);
        div.style.width = "100%";
        div.style.zIndex = "100";

        const root = createRoot(div);
        root.render(<TvChartAreaTitle chartManager={chartManager} />);
        (widget.chart(i) as any)._chartWidget._mainDiv.prepend(df.firstChild);

        compsRef.current.set(i, root);
      }
    }

    const count = chartCount === 1 ? 0 : chartCount;
    if (compsRef.current.size > count) {
      for (let i = Math.max(...compsRef.current.keys()); i >= count; i--) {
        const root = compsRef.current.get(i);
        root?.unmount();
        compsRef.current.delete(i);
      }
    }
  }, [chartManager]);

  useEffect(() => {
    const sub = chartManager.internalWidgetReady$.subscribe({
      next: (ready) => {
        if (ready) {
          handleLayoutChange();
          chartManager.internalWidget?.widget?.subscribe("layout_changed", handleLayoutChange);
        }
      },
      error: () => {},
    });

    return () => {
      sub.unsubscribe();
      chartManager.internalWidget?.widget?.unsubscribe("layout_changed", handleLayoutChange);
      if (compsRef.current.size > 0) {
        compsRef.current.forEach((root) => root.unmount());
        compsRef.current = new Map<number, Root>();
      }
    };
  }, [chartManager, handleLayoutChange]);

  return <></>;
}
