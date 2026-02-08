import { TooltipProps } from "recharts";

export type LinePayload = {
  name: string;
  value: number;
  formattedValue: string;
};

export function LineTooltip({ active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    const { formattedValue, name } = payload[0].payload as LinePayload;
    return (
      <div className="bg-content2 rounded px-4 py-2 flex gap-2">
        <div className="text-xs text-neutral">{name}</div>
        <div className="text-xs text-foreground">{formattedValue}</div>
      </div>
    );
  }
  return null;
}
