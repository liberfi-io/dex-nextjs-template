import { launchPadCurvePoints } from "../states";
import { formatAmount3, formatPrice } from "@liberfi/core";
import { defaultTheme, useTranslation } from "@liberfi/ui-base";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  DotProps,
} from "recharts";

export type LaunchPadCurveAreaChartPoint = {
  x: number;
  price: number;
};

export function LaunchPadCurveAreaChart() {
  const { t } = useTranslation();

  const data = useAtomValue(launchPadCurvePoints);
  const hasData = Array.isArray(data) && data.length > 0;
  const firstPoint = hasData ? data[0] : null;
  const lastPoint = hasData ? data[data.length - 1] : null;
  const maxPrice = hasData ? lastPoint?.price ?? 1 : 1;

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div className="w-full h-[280px]">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
            <CartesianGrid stroke={defaultTheme.colors.primary.default} opacity={0.1} />
            <XAxis
              dataKey="x"
              domain={["dataMin", "dataMax"]}
              stroke={defaultTheme.colors.neutral}
              strokeWidth={0.5}
              fontSize={12}
              tickFormatter={(value) => formatAmount3(value)}
              tickMargin={8}
              tickCount={8}
            />
            <YAxis
              yAxisId="left"
              width={65}
              stroke={defaultTheme.colors.neutral}
              strokeWidth={0.5}
              fontSize={12}
              label={{
                value: "price (SOL)",
                angle: -90,
                position: "insideLeft",
                fontSize: 12,
              }}
              domain={[0, maxPrice * 1.05]}
              tickMargin={8}
              tickCount={6}
              tickFormatter={(val) => formatPrice(val)}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="price"
              stroke={defaultTheme.colors.primary.default}
              strokeDasharray="5 5"
              strokeWidth={4}
              fill="url(#curve-area-color)"
              dot={false}
              activeDot={CustomActiveDot}
            />
            <Tooltip
              content={(props) => <CustomTooltip {...props} />}
              cursor={{
                stroke: defaultTheme.colors.neutral,
                opacity: 0.5,
                strokeDasharray: "4",
              }}
            />
            <defs>
              <linearGradient id="curve-area-color" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(164, 255, 8, 1)" stopOpacity={1} />
                <stop offset="100%" stopColor="rgba(159, 218, 151, 0.1)" stopOpacity={1} />
              </linearGradient>
            </defs>
            {firstPoint && (
              <ReferenceDot
                x={firstPoint.x}
                y={firstPoint.price}
                yAxisId="left"
                r={6}
                fill="#facc15"
                stroke="#f0fdf4"
              />
            )}
            {lastPoint && (
              <ReferenceDot
                x={lastPoint.x}
                y={lastPoint.price}
                yAxisId="left"
                r={6}
                fill="#0ea5e9"
                stroke="#f0fdf4"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-neutral text-xs">{t("extend.launchpad.curve_preview_token_supply")}</p>
      <div className="flex items-center justify-between gap-12 text-neutral text-xxs">
        <p className="flex items-center">
          <span className="inline-block w-2 h-2 bg-[#facc15] rounded-full mr-1"></span>
          <span className="mr-2">{t("extend.launchpad.curve_preview_starting_mc")}</span>
          <span>$100.00</span>
        </p>
        <p className="flex items-center">
          <span className="inline-block w-2 h-2 bg-[#0ea5e9] rounded-full mr-1"></span>
          <span className="mr-2">{t("extend.launchpad.curve_preview_migration_mc")}</span>
          <span>$100,000.0</span>
        </p>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload?.length) {
    const data = payload[0]?.payload;
    const dateText = formatPrice(data.price);
    if (!data) return null;
    return (
      <div className="flex flex-col p-2 rounded bg-content2 shadow-md">
        <p className="text-sm text-neutral">{dateText}</p>
      </div>
    );
  }
};

const CustomActiveDot = (props: unknown) => {
  const { cx = 0, cy = 0 } = props as DotProps;
  return <ActiveDot x={cx} y={cy} stroke={defaultTheme.colors.primary.default} />;
};

const ActiveDot = ({
  x,
  y,
  stroke,
  size = 32,
  strokeWidth = 8,
  fill,
}: {
  x: number;
  y: number;
  stroke: string;
  size?: number;
  strokeWidth?: number;
  fill?: string;
}) => {
  const radius = size / 2;
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.transform = "scale(1)";
    }
  }, []);

  return (
    <svg
      x={x - radius}
      y={y - radius}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        ref={circleRef}
        style={{
          transition: "transform 0.3s ease-in-out",
          transformOrigin: "center center",
          transform: "scale(0.3)",
        }}
        cx={radius}
        cy={radius}
        r={radius - strokeWidth / 2}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
      />
    </svg>
  );
};
