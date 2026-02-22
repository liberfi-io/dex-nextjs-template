import { LineTooltip } from "../../chart/LineTooltip";
import { interpolateTimes } from "../../../libs";
import { Skeleton, Spinner, Tab, Tabs } from "@heroui/react";
import { useTranslation, walletNetWorthAtom } from "@liberfi/ui-base";
import clsx from "clsx";
import { Key, useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import { Number } from "../../Number";
import { useAtomValue } from "jotai";

export type BalanceChartProps = {
  className?: string;
};

export function BalanceChart({ className }: BalanceChartProps) {
  const [time, setTime] = useState("1d");
  return <Chart className={className} time={time} setTime={setTime} />;
}

function Chart({
  className,
  time,
  setTime,
}: {
  className?: string;
  time: string;
  setTime: (time: string) => void;
}) {
  const { t } = useTranslation();

  const walletNetWorth = useAtomValue(walletNetWorthAtom);

  // TODO wait for backend
  const data = useMemo(() => {
    return interpolateTimes(time).map((date) => ({
      value: 0,
      name: time === "1d" ? date.toLocaleTimeString() : date.toLocaleDateString(),
      formattedValue: "$0",
    }));
  }, [time]);

  const domain = useMemo(() => {
    return [Math.min(...data.map((d) => d.value)), Math.max(...data.map((d) => d.value))];
  }, [data]);

  if (!walletNetWorth) {
    return <Skeletons className={className} time={time} setTime={setTime} />;
  }

  return (
    <section className={clsx("w-full flex flex-col", className)}>
      <div className="flex-none h-9 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral">{t("extend.account.balance")}</span>
          <span className="text-sm">
            <Number
              value={walletNetWorth?.totalValueInUsd ?? 0}
              abbreviate
              defaultCurrencySign="$"
            />
          </span>
        </div>

        <TimeTabs time={time} setTime={setTime} />
      </div>
      <div className="flex-1 flex items-center justify-center">
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
            <Tooltip
              cursor={{ stroke: "#999", strokeWidth: 1, strokeDasharray: "2 2" }}
              content={<LineTooltip />}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Skeletons({
  className,
  time,
  setTime,
}: {
  className?: string;
  time: string;
  setTime: (time: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <section className={clsx("w-full flex flex-col", className)}>
      <div className="flex-none h-9 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral">{t("extend.account.balance")}</span>

          <div className="h-5 flex items-center justify-center">
            <Skeleton className="mt-1 h-3 w-12 rounded" />
          </div>
        </div>

        <TimeTabs time={time} setTime={setTime} />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Spinner color="primary" />
      </div>
    </section>
  );
}

function TimeTabs({ time, setTime }: { time: string; setTime: (time: string) => void }) {
  const { t } = useTranslation();

  return (
    <Tabs
      selectedKey={time}
      onSelectionChange={setTime as (key: Key) => void}
      size="sm"
      variant="light"
      classNames={{
        tab: "min-w-0 w-auto h-5 min-h-0 px-2 py-0 data-[hover-unselected=true]:opacity-hover",
        tabList: "gap-0",
        tabContent: "text-neutral group-data-[selected=true]:text-foreground",
        cursor: "bg-content2 dark:bg-content2",
      }}
    >
      <Tab key="1d" title={t("extend.common.time.1d")} />
      <Tab key="1w" title={t("extend.common.time.1w")} />
      <Tab key="1M" title={t("extend.common.time.1M")} />
      <Tab key="3M" title={t("extend.common.time.3M")} />
      <Tab key="6M" title={t("extend.common.time.6M")} />
    </Tabs>
  );
}
