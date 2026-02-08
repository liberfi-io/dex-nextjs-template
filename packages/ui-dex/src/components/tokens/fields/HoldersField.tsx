import { ListField } from "@/components/ListField";
import { Number } from "@/components/Number";
import { formatPercentage } from "@/libs/format";
import { Token } from "@chainstream-io/sdk";

interface HoldersFieldProps {
  className?: string;
  token: Token;
}

export function HoldersField({ className, token }: HoldersFieldProps) {
  return (
    <ListField width={184} className={className}>
      <div className="flex gap-1 text-xs">
        <div className="text-foreground">
          {token.marketData.holders ? <Number value={token.marketData.holders} abbreviate /> : "-"}
        </div>
        /
        <div>
          {token.marketData.top10HoldingsRatio
            ? formatPercentage(token.marketData.top10HoldingsRatio)
            : "-"}
        </div>
        /
        <div>
          {token.marketData.top100HoldingsRatio
            ? formatPercentage(token.marketData.top100HoldingsRatio)
            : "-"}
        </div>
      </div>
    </ListField>
  );
}
