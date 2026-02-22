import { ListField } from "../../ListField";
import { Number } from "../../Number";
import { Token } from "@chainstream-io/sdk";

export interface MarketCapFieldProps {
  className?: string;
  token: Token;
}

export function MarketCapField({ className, token }: MarketCapFieldProps) {
  return (
    <ListField width={146} className={className}>
      <div className="flex gap-1 text-xs">
        <div className="text-foreground">
          {token.marketData.marketCapInUsd ? (
            <Number value={token.marketData.marketCapInUsd} abbreviate defaultCurrencySign="$" />
          ) : (
            "-"
          )}
        </div>
        /
        <div>
          {token.marketData.totalTvlInUsd ? (
            <Number value={token.marketData.totalTvlInUsd} abbreviate defaultCurrencySign="$" />
          ) : (
            "-"
          )}
        </div>
      </div>
    </ListField>
  );
}
