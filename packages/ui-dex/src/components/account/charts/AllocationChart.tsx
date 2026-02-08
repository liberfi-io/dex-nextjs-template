import { PieActiveShape, PiePayload } from "@/components/chart";
import { CHART_COLORS } from "@/libs";
import { Button } from "@heroui/react";
import { CHAIN_ID, chainSlugs } from "@liberfi/core";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const skeletonData: PiePayload[] = [
  CHAIN_ID.ETHEREUM,
  // CHAIN_ID.ARBITRUM,
  CHAIN_ID.SOLANA,
  // CHAIN_ID.BASE,
  // CHAIN_ID.OPTIMISM,
  CHAIN_ID.BINANCE,
].map((chainId) => ({
  key: chainId,
  value: 1,
  name: chainSlugs[chainId]!,
  formattedValue: "$0",
  formattedPercentage: "0%",
}));

export type AllocationChartProps = {
  className?: string;
  classNames?: {
    chart?: string;
    legends?: string;
    legendItem?: string;
  };
  displayLegendValue?: boolean;
};

export function AllocationChart({
  className,
  classNames,
  displayLegendValue,
}: AllocationChartProps) {
  return (
    <Chart className={className} classNames={classNames} displayLegendValue={displayLegendValue} />
  );
}

function Chart({ className, classNames, displayLegendValue = true }: AllocationChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // TODO: wait for backend
  const data = useMemo<PiePayload[]>(() => {
    return skeletonData;
  }, []);

  const handlePieEnter = useCallback(
    (_: unknown, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex],
  );

  return (
    <section className={clsx("w-full", className)}>
      <div className="w-full h-full flex items-center justify-center">
        <div className={clsx("flex w-[calc(50%-4px)] h-full items-center", classNames?.chart)}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={70}
                labelLine={false}
                dataKey="value"
                onMouseEnter={handlePieEnter}
                activeShape={PieActiveShape}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.key}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* legends */}
        <div
          className={clsx(
            "w-[calc(50%-4px)] h-full ml-2 flex flex-col items-center justify-center gap-1",
            classNames?.legends,
          )}
        >
          {data.map((it, index) => (
            <Button
              key={it.key}
              className={clsx(
                "flex min-w-0 w-full min-h-0 h-6 px-2",
                "justify-between items-center rounded",
                "text-xs text-neutral data-[active=true]:text-foreground",
                "bg-transparent data-[active=true]:bg-primary/20",
                classNames?.legendItem,
              )}
              onPress={() => setActiveIndex(index)}
              disableRipple
              disableAnimation
              data-active={index === activeIndex}
            >
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span>{it.name}</span>
              </div>
              {displayLegendValue && <div>{it.formattedValue}</div>}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
