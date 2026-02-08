import { clsx } from "clsx";
import { BigNumber } from "bignumber.js";
import { Avatar, Tooltip } from "@heroui/react";
import { Token } from "@chainstream-io/sdk";
import {
  chainIdBySlug,
  formatAmount,
  formatAmountUSD3,
  getPrimaryTokenAvatar,
  RecursivePartial,
} from "@liberfi/core";
import { chainAtom, useTranslation } from "@liberfi/ui-base";
import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { usePulseListContext } from "./PulseListContext";

export type PulseTokenMarketCapProps = {
  token: RecursivePartial<Token>;
};

export function PulseTokenMarketCap({ token }: PulseTokenMarketCapProps) {
  const { t } = useTranslation();

  const { layout } = usePulseListContext();

  const chain = useAtomValue(chainAtom);

  const primaryTokenAvatar = useMemo(
    () => getPrimaryTokenAvatar(chainIdBySlug(token.chain ?? "") ?? chain),
    [token.chain, chain],
  );

  const [buyW, sellW] = useMemo(() => {
    const buys = Number(token.stats?.buys1h ?? 0);
    const sells = Number(token.stats?.sells1h ?? 0);
    const trades = buys + sells;
    const width = layout === "narrow" ? 40 : 24;
    if (trades === 0) return [width / 2, width / 2];

    const buyWidth = new BigNumber(buys)
      .div(trades)
      .times(width)
      .decimalPlaces(0, BigNumber.ROUND_HALF_DOWN)
      .toNumber();
    const sellWidth = width - buyWidth;
    return [buyWidth, sellWidth];
  }, [layout, token.stats?.buys1h, token.stats?.sells1h]);

  return (
    <div className="absolute top-0 right-0 flex flex-col gap-2 items-end">
      {/* market cap */}
      <Tooltip
        content={t("extend.pulse.market_cap_explained")}
        classNames={{ content: "text-xs text-neutral py-2 px-4" }}
        closeDelay={0}
      >
        <div className="flex items-end gap-1">
          <div className="text-xs leading-none text-neutral">{t("extend.pulse.market_cap")}</div>
          <div
            className={clsx(
              "text-base font-medium leading-none",
              new BigNumber(token.marketData?.marketCapInUsd ?? 0).lt(1000)
                ? "text-foreground"
                : new BigNumber(token.marketData?.marketCapInUsd ?? 0).lt(1000_000)
                ? "text-secondary"
                : "text-primary",
            )}
          >
            {formatAmountUSD3(token.marketData?.marketCapInUsd ?? 0)}
          </div>
        </div>
      </Tooltip>

      {/* volume */}
      <Tooltip
        content={t("extend.pulse.volume_explained")}
        classNames={{ content: "text-xs text-neutral py-2 px-4" }}
        closeDelay={0}
      >
        <div className="flex items-end gap-1">
          <div className="text-xs leading-none text-neutral">{t("extend.pulse.volume")}</div>
          <div className="text-base font-medium leading-none text-foreground">
            {formatAmountUSD3(token.stats?.volumesInUsd1h ?? 0)}
          </div>
        </div>
      </Tooltip>

      {/* txs & fee */}
      <div className="flex items-center gap-2 group-data-[layout=narrow]:flex-col group-data-[layout=narrow]:items-end">
        {/* fee */}
        <Tooltip
          content={t("extend.pulse.fee_explained")}
          classNames={{ content: "text-xs text-neutral py-2 px-4" }}
          closeDelay={0}
        >
          <div className="flex justify-end items-center gap-1">
            <div className="text-xs leading-none text-neutral">{t("extend.pulse.fee")}</div>
            <Avatar className="w-4 h-4 bg-transparent" src={primaryTokenAvatar} />
            <div className="text-xs leading-none text-foreground">--</div>
          </div>
        </Tooltip>

        {/* txs */}
        <Tooltip
          content={
            <div className="flex flex-col gap-1">
              <div className="w-full flex justify-between gap-4">
                <div className="text-xs text-enutral">{t("extend.pulse.txs_explained")}</div>
                <div className="text-xs text-foreground">{formatAmount(token.stats?.trades1h ?? 0)}</div>
              </div>
              <div className="w-full flex justify-between gap-2">
                <div className="text-xs text-enutral">{t("extend.pulse.buys_explained")}</div>
                <div className="text-xs text-foreground">{formatAmount(token.stats?.buys1h ?? 0)}</div>
              </div>
              <div className="w-full flex justify-between gap-2">
                <div className="text-xs text-enutral">{t("extend.pulse.sells_explained")}</div>
                <div className="text-xs text-foreground">{formatAmount(token.stats?.sells1h ?? 0)}</div>
              </div>
            </div>
          }
          classNames={{ content: "text-xs text-neutral py-2 px-4" }}
          closeDelay={0}
        >
          <div className="flex group-data-[layout=narrow]:flex-col items-center group-data-[layout=narrow]:items-end gap-2 group-data-[layout=narrow]:gap-1">
            <div className="flex items-center gap-1">
              <div className="text-xs leading-none text-neutral">{t("extend.pulse.txs")}</div>
              <div className="text-xs leading-none text-foreground">
                {formatAmount(token.stats?.trades1h ?? 0)}
              </div>
            </div>
            <div className="w-6 group-data-[layout=narrow]:w-10 flex rounded-full overflow-hidden">
              <div className="h-1 bg-bullish" style={{ width: `${buyW}px` }}></div>
              <div className="h-1 bg-bearish" style={{ width: `${sellW}px` }}></div>
            </div>
          </div>
        </Tooltip>
      </div>
    </div>
  );
}
