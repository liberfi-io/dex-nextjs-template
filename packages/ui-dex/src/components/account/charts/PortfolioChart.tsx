import BigNumber from "bignumber.js";
import { PieActiveShape, PiePayload } from "../../chart";
import { useTranslation, useWalletPortfolios } from "@liberfi/ui-base";
import {
  CHART_COLORS,
  formatAbbreviatingNumber2,
  formatPercentage,
  PIE_MAX_COUNT,
} from "../../../libs";
import { Button, Spinner } from "@heroui/react";
import clsx from "clsx";
import { reverse, sortBy } from "lodash-es";
import { useCallback, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Number } from "../../Number";
import { EmptyData } from "../../EmptyData";

export type PortfolioChartProps = {
  className?: string;
  classNames?: {
    chart?: string;
    legends?: string;
    legendItem?: string;
  };
  displayLegendValue?: boolean;
};

export function PortfolioChart({
  className,
  classNames,
  displayLegendValue = true,
}: PortfolioChartProps) {
  return (
    <Chart className={className} classNames={classNames} displayLegendValue={displayLegendValue} />
  );
}

function Chart({ className, classNames, displayLegendValue = true }: PortfolioChartProps) {
  const { t } = useTranslation();

  const { data: walletPortfolios } = useWalletPortfolios();

  // current highlighted token index
  const [activeIndex, setActiveIndex] = useState(0);

  const data = useMemo<PiePayload[]>(() => {
    if (!walletPortfolios) {
      return [
        {
          key: "primary_tokens",
          value: 1,
          name: t("extend.account.primary_tokens"),
          formattedValue: "$0",
          formattedPercentage: "0%",
        },
      ];
    }

    const totalBalancesInUsd = new BigNumber(walletPortfolios.balanceInUsd ?? 0).toNumber();

    // sort tokens by amountInUsd descending
    const allData = reverse(
      sortBy(
        (walletPortfolios.portfolios ?? []).map((portfolio) => {
          const value = new BigNumber(portfolio.amountInUsd ?? 0).toNumber();
          return {
            key: portfolio.address,
            value,
            name: portfolio.symbol,
            formattedValue: formatNumberInChart(value),
            formattedPercentage:
              totalBalancesInUsd > 0 ? formatPercentage(value / totalBalancesInUsd) : "0%",
          };
        }),
        "value",
      ),
    );

    if (allData.length <= PIE_MAX_COUNT) {
      return allData;
    }

    // get top N tokens, and accumulate the rest as "others"
    const mainData = allData.slice(0, PIE_MAX_COUNT - 1);
    const otherData = allData.slice(PIE_MAX_COUNT - 1);
    const totalValue = otherData.reduce((acc, it) => acc + it.value, 0);
    return [
      ...mainData,
      {
        key: "other_tokens",
        value: totalValue,
        name: t("extend.account.other_tokens"),
        formattedValue: formatNumberInChart(totalValue),
        formattedPercentage:
          totalBalancesInUsd > 0 ? formatPercentage(totalValue / totalBalancesInUsd) : "0%",
      },
    ];
  }, [walletPortfolios, t]);

  const handlePieEnter = useCallback(
    (_: unknown, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex],
  );

  if (!walletPortfolios) {
    return (
      <Skeletons
        className={className}
        classNames={classNames}
        displayLegendValue={displayLegendValue}
      />
    );
  }

  if (!walletPortfolios.portfolios || walletPortfolios.portfolios.length === 0) {
    return (
      <Empty
        className={className}
        classNames={classNames}
        displayLegendValue={displayLegendValue}
      />
    );
  }

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
              {displayLegendValue && (
                <div>
                  <Number value={it.value} abbreviate defaultCurrencySign="$" />
                </div>
              )}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Skeletons({ className }: PortfolioChartProps) {
  return (
    <section className={clsx("w-full", className)}>
      <div className="w-full h-full flex items-center justify-center">
        <Spinner color="primary" />
      </div>
    </section>
  );
}

function Empty({ className }: PortfolioChartProps) {
  return (
    <section className={clsx("w-full", className)}>
      <div className="w-full h-full flex items-center justify-center">
        <EmptyData />
      </div>
    </section>
  );
}

function formatNumberInChart(value: number): string {
  const { significantDigits, punctuationSymbol, zeros, decimalDigits } =
    formatAbbreviatingNumber2(value);
  return `$${significantDigits}${punctuationSymbol ?? ""}${
    zeros ? `0<tspan style="baseline-shift: sub;" font-size="12px">${zeros}</tspan>` : ""
  }${decimalDigits ?? ""}`;
}
