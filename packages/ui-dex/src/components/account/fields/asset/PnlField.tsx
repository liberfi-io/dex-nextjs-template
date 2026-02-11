import { ListField } from "@/components/ListField";
import { formatPercentage } from "@/libs";
import { useMemo } from "react";
import { PnlDetailItemDTO, Token, WalletNetWorthItemDTO } from "@chainstream-io/sdk";
import { Number } from "@/components/Number";
import BigNumber from "bignumber.js";

export interface PnlFieldProps {
  className?: string;
  token?: Token;
  balance: WalletNetWorthItemDTO;
  pnlDetail?: PnlDetailItemDTO;
  compact?: boolean;
}

export function PnlField({ className, pnlDetail, compact = false }: PnlFieldProps) {
  const profitBearish = useMemo(
    () =>
      pnlDetail?.realizedProfitInUsd ? new BigNumber(pnlDetail.realizedProfitInUsd).lt(0) : false,
    [pnlDetail],
  );

  const profitRatioBearish = useMemo(
    () =>
      pnlDetail?.realizedProfitRatio ? new BigNumber(pnlDetail.realizedProfitRatio).lt(0) : false,
    [pnlDetail],
  );

  return (
    <ListField className={className} shrink>
      <div className="group flex flex-col items-end" data-compact={compact}>
        <div className="max-lg:text-xs text-sm lg:group-data-[compact=true]:text-xs text-foreground">
          {profitBearish ? "-" : "+"}
          <span>
            <Number
              value={new BigNumber(pnlDetail?.realizedProfitInUsd ?? 0).abs().toNumber()}
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
          {formatPercentage(new BigNumber(pnlDetail?.realizedProfitRatio ?? 0).abs().toNumber())}
        </div>
      </div>
    </ListField>
  );
}
