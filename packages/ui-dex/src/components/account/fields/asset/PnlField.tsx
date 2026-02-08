import { ListField } from "@/components/ListField";
import { formatPercentage } from "@/libs";
import { useMemo } from "react";
import { Token, WalletBalanceDetailDTO } from "@chainstream-io/sdk";
import { Number } from "@/components/Number";
import BigNumber from "bignumber.js";

export interface PnlFieldProps {
  className?: string;
  token?: Token;
  balance: WalletBalanceDetailDTO;
  compact?: boolean;
}

export function PnlField({ className, balance, compact = false }: PnlFieldProps) {
  const profitBearish = useMemo(
    () =>
      balance.totalRealizedProfitInUsd
        ? new BigNumber(balance.totalRealizedProfitInUsd).lt(0)
        : false,
    [balance],
  );

  const profitRatioBearish = useMemo(
    () =>
      balance.totalRealizedProfitRatio
        ? new BigNumber(balance.totalRealizedProfitRatio).lt(0)
        : false,
    [balance],
  );

  return (
    <ListField className={className} shrink>
      <div className="group flex flex-col items-end" data-compact={compact}>
        <div className="max-lg:text-xs text-sm lg:group-data-[compact=true]:text-xs text-foreground">
          {profitBearish ? "-" : "+"}
          <span>
            <Number
              value={new BigNumber(balance.totalRealizedProfitInUsd ?? 0).abs().toNumber()}
              abbreviate
              defaultCurrencySign="$"
            />
          </span>
        </div>
        <div
          className="max-lg:text-xxs text-xs lg:group-data-[compact=true]:text-xxs text-bullish data-[bearish=true]:text-bearish"
          data-bearish={profitRatioBearish}
        >
          {profitRatioBearish ? "-" : "+"}
          {formatPercentage(new BigNumber(balance.totalRealizedProfitRatio ?? 0).abs().toNumber())}
        </div>
      </div>
    </ListField>
  );
}
