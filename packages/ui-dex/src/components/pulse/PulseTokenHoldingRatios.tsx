import { clsx } from "clsx";
import { BigNumber } from "bignumber.js";
import { Tooltip } from "@heroui/react";
import { Token } from "@chainstream-io/sdk";
import { formatPercent, RecursivePartial } from "@liberfi/core";
import {
  BundlesIcon,
  DevHoldingIcon,
  InsidersHoldingIcon,
  SniperIcon,
  Top10HoldingIcon,
  useTranslation,
} from "@liberfi/ui-base";
import { PulseInstantBuy } from "./PulseInstantBuy";

export type PulseTokenHoldingRatiosProps = {
  token: RecursivePartial<Token>;
  className?: string;
};

export function PulseTokenHoldingRatios({ token, className }: PulseTokenHoldingRatiosProps) {
  const { t } = useTranslation();

  return (
    <div className={clsx("relative flex items-center gap-1.5", className)}>
      {/* top10 holdings */}
      <Tooltip
        content={t("extend.pulse.top10_holdings")}
        classNames={{ content: "text-xs text-neutral py-2 px-4" }}
        closeDelay={0}
      >
        <div
          className="px-2 py-0.5 flex items-center gap-1 bg-background rounded-full text-xs text-primary data-[danger=true]:text-danger-500"
          data-danger={
            token.marketData?.top10HoldingsRatio
              ? new BigNumber(token.marketData.top10HoldingsRatio).shiftedBy(2).gt(10)
              : false
          }
        >
          <Top10HoldingIcon width={12} height={12} />
          <span>
            {token.marketData?.top10HoldingsRatio
              ? formatPercent(token.marketData.top10HoldingsRatio, { precision: 0 })
              : "--"}
          </span>
        </div>
      </Tooltip>

      {/* dev holdings */}
      <Tooltip
        content={t("extend.pulse.dev_holding")}
        classNames={{ content: "text-xs text-neutral py-2 px-4" }}
        closeDelay={0}
      >
        <div
          className="px-2 py-0.5 flex items-center gap-1 bg-background rounded-full text-xs text-primary data-[danger=true]:text-danger-500"
          data-danger={
            token.marketData?.devHoldingsRatio
              ? new BigNumber(token.marketData.devHoldingsRatio).shiftedBy(2).gt(10)
              : false
          }
        >
          <DevHoldingIcon width={12} height={12} />
          <span>
            {token.marketData?.devHoldingsRatio
              ? formatPercent(token.marketData.devHoldingsRatio, { precision: 0 })
              : "--"}
          </span>
        </div>
      </Tooltip>

      {/* insiders holdings */}
      <Tooltip
        content={t("extend.pulse.insiders_holding")}
        classNames={{ content: "text-xs text-neutral py-2 px-4" }}
        closeDelay={0}
      >
        <div
          className="px-2 py-0.5 flex items-center gap-1 bg-background rounded-full text-xs text-primary data-[danger=true]:text-danger-500"
          data-danger={
            token.marketData?.insiderHoldingsRatio
              ? new BigNumber(token.marketData.insiderHoldingsRatio).shiftedBy(2).gt(10)
              : false
          }
        >
          <InsidersHoldingIcon width={12} height={12} />
          <span>
            {token.marketData?.insiderHoldingsRatio
              ? formatPercent(token.marketData.insiderHoldingsRatio, { precision: 0 })
              : "--"}
          </span>
        </div>
      </Tooltip>

      {/* snipers holdings */}
      <Tooltip
        content={t("extend.pulse.sniper_holding")}
        classNames={{ content: "text-xs text-neutral py-2 px-4" }}
        closeDelay={0}
      >
        <div
          className="px-2 py-0.5 flex items-center gap-1 bg-background rounded-full text-xs text-primary data-[danger=true]:text-danger-500"
          data-danger={
            token.marketData?.sniperHoldingsRatio
              ? new BigNumber(token.marketData.sniperHoldingsRatio).shiftedBy(2).gt(10)
              : false
          }
        >
          <SniperIcon width={12} height={12} />
          <span>
            {token.marketData?.sniperHoldingsRatio
              ? formatPercent(token.marketData.sniperHoldingsRatio, { precision: 0 })
              : "--"}
          </span>
        </div>
      </Tooltip>

      {/* bundles holdings */}
      <Tooltip
        content={t("extend.pulse.bundle_holding")}
        classNames={{ content: "text-xs text-neutral py-2 px-4" }}
        closeDelay={0}
      >
        <div
          className="px-2 py-0.5 flex items-center gap-1 bg-background rounded-full text-xs text-primary data-[danger=true]:text-danger-500"
          data-danger={
            token.marketData?.bundleHoldingsRatio
              ? new BigNumber(token.marketData.bundleHoldingsRatio).shiftedBy(2).gt(10)
              : false
          }
        >
          <BundlesIcon width={12} height={12} />
          <span>
            {token.marketData?.bundleHoldingsRatio
              ? formatPercent(token.marketData.bundleHoldingsRatio, { precision: 0 })
              : "--"}
          </span>
        </div>
      </Tooltip>

      <PulseInstantBuy token={token} />
    </div>
  );
}
