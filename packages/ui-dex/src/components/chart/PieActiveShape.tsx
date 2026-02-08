import { Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

export interface PiePayload {
  key: string;
  name: string;
  value: number;
  formattedValue: string;
  formattedPercentage: string;
}

export const PieActiveShape = (props: PieSectorDataItem) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  const payload = props.payload as PiePayload;
  return (
    <g>
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
        <tspan x="50%" dy="-1.2em" fill="#999" fontSize={12}>
          {payload.name}
        </tspan>
        <tspan x="50%" dy="1.2em" fill="#999" fontSize={12}>
          {payload.formattedPercentage}
        </tspan>
        <tspan
          x="50%"
          dy="1.2em"
          fill="#fff"
          fontSize={16}
          dangerouslySetInnerHTML={{ __html: payload.formattedValue }}
        />
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={(innerRadius ?? 0) - 4}
        outerRadius={(outerRadius ?? 0) + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};
