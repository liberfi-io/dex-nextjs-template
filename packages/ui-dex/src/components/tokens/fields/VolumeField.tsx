import { ListField } from "@/components/ListField";
import { Number } from "@/components/Number";
import { tokenTraders, tokenTrades, tokenVolumesInUsd } from "@/libs";
import { Token } from "@chainstream-io/sdk";
import { useMemo } from "react";
import { useTokenListContext } from "../TokenListContext";

interface VolumeFieldProps {
  className?: string;
  token: Token;
}

export function VolumeField({ className, token }: VolumeFieldProps) {
  const { timeframe } = useTokenListContext();

  const volumesInUsd = useMemo(() => tokenVolumesInUsd(token, timeframe), [token, timeframe]);

  const trades = useMemo(() => tokenTrades(token, timeframe), [token, timeframe]);

  const traders = useMemo(() => tokenTraders(token, timeframe), [token, timeframe]);

  return (
    <ListField width={190} className={className}>
      <div className="flex gap-1 text-xs">
        <div className="text-foreground">
          {volumesInUsd ? <Number value={volumesInUsd} abbreviate defaultCurrencySign="$" /> : "-"}
        </div>
        /<div>{trades ? <Number value={trades} abbreviate /> : "-"}</div>/
        <div>{traders ? <Number value={traders} abbreviate /> : "-"}</div>
      </div>
    </ListField>
  );
}
