import { interpolateTimes } from "@/libs";
import clsx from "clsx";
import { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

export type HeaderBalanceChartProps = {
  className?: string;
};

export function HeaderBalanceChart({ className }: HeaderBalanceChartProps) {
  return <Chart className={className} />;
}

function Chart({ className }: HeaderBalanceChartProps) {
  // TODO wait for backend
  const data = useMemo(() => {
    return interpolateTimes("1d").map((date) => ({
      value: 0,
      name: date.toLocaleTimeString(),
      formattedValue: "$0",
    }));
  }, []);

  const domain = useMemo(() => {
    return [Math.min(...data.map((d) => d.value)), Math.max(...data.map((d) => d.value))];
  }, [data]);

  return (
    <div className={clsx("w-full flex items-center justify-center", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={domain} hide={true} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="rgb(var(--bullish-color))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}