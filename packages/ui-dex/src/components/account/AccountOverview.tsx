import { ArrowDownIcon, ArrowUpIcon, BearishIcon, BullishIcon, RefreshIcon } from "@/assets/icons";
import { formatPercentage } from "@/libs";
import { Button, Image } from "@heroui/react";
import { CONFIG } from "@liberfi/core";
import {
  useTranslation,
  walletNetWorthAtom,
  walletNetWorthQueryStateAtom,
  walletPnlAtom,
  walletPnlQueryStateAtom,
} from "@liberfi/ui-base";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useCallback, useMemo, useState } from "react";
import { Number } from "../Number";
import { AccountActions } from "./AccountActions";
import { AccountCharts } from "./AccountCharts";
import { AccountOverviewSkeleton } from "./AccountOverviewSkeleton";
import { HeaderBalanceChart } from "./charts";

export function AccountOverview() {
  const { t } = useTranslation();

  const walletNetWorth = useAtomValue(walletNetWorthAtom);

  const walletPnl = useAtomValue(walletPnlAtom);

  const walletNetWorthQueryState = useAtomValue(walletNetWorthQueryStateAtom);

  const walletPnlQueryState = useAtomValue(walletPnlQueryStateAtom);

  const isFetchingWallet = useMemo(
    () =>
      (walletNetWorthQueryState?.isFetching ?? false) || (walletPnlQueryState?.isFetching ?? false),
    [walletNetWorthQueryState, walletPnlQueryState],
  );

  const refetchWallet = useCallback(() => {
    walletNetWorthQueryState?.refetch();
    walletPnlQueryState?.refetch();
  }, [walletNetWorthQueryState, walletPnlQueryState]);

  // TODO wait for backend
  const bullish = useMemo(() => true, []);

  // TODO wait for backend
  const totalProfitInUsdChange = useMemo(() => formatPercentage(0), []);

  // 移动端打开图表
  const [isOpenCharts, setIsOpenCharts] = useState(false);

  const handleToggleCharts = useCallback(() => {
    setIsOpenCharts((prev) => !prev);
  }, []);

  if (!walletNetWorth || !walletPnl) {
    return <AccountOverviewSkeleton />;
  }

  return (
    <div className="w-full lg:h-[243px] max-lg:mt-2 max-lg:px-4 flex flex-col lg:flex-row lg:gap-5 lg:justify-between lg:overflow-hidden">
      {/* overview */}
      <div className="lg:flex-none w-full lg:w-[360px] lg:h-full p-0 lg:p-4 flex flex-col lg:bg-content1 lg:rounded-lg lg:overflow-hidden">
        {/* avatar & balances */}
        <div className="flex items-start lg:items-center gap-4">
          {/* desktop avatar */}
          <Image
            width={64}
            height={64}
            src="/avatar.jpg"
            alt="Avatar"
            classNames={{ wrapper: "flex-none max-lg:hidden rounded-full overflow-hidden" }}
          />

          {/* balance overview */}
          <section className="flex-none flex flex-col justify-center">
            {/* desktop title */}
            <div className="max-lg:hidden mb-1 text-xs font-medium text-neutral">
              {t("extend.account.universal_account", { application_name: CONFIG.branding.name })}
            </div>

            {/* balances */}
            <div className="text-2xl font-semibold flex items-center gap-2">
              {/* balance value */}
              <span>
                <Number
                  value={walletNetWorth?.totalValueInUsd ?? 0}
                  abbreviate
                  defaultCurrencySign="$"
                />
              </span>

              {/* refresh balances */}
              <Button
                isIconOnly
                className="flex min-w-0 w-7 min-h-0 h-7 bg-transparent rounded-full text-neutral"
                disableRipple
                onPress={refetchWallet}
              >
                <RefreshIcon
                  width={24}
                  height={24}
                  className="data-[loading=true]:animate-spin"
                  data-loading={isFetchingWallet}
                />
              </Button>
            </div>

            {/* pnl */}
            <div
              className="text-sm font-medium flex items-center gap-2 text-bearish data-[bullish=true]:text-bullish"
              data-bullish={bullish}
            >
              <span>
                <Number
                  value={walletPnl?.totalProfitInUsd ?? 0}
                  abbreviate
                  defaultCurrencySign="$"
                />
              </span>
              <span className="flex items-center">
                (
                {bullish ? (
                  <BullishIcon width={10} height={10} />
                ) : (
                  <BearishIcon width={10} height={10} />
                )}
                {totalProfitInUsdChange})
              </span>
              <span className="text-neutral">({t("extend.common.time.24h")})</span>
            </div>
          </section>

          {/* mobile balance chart */}
          <div
            className="relative flex-1 h-[52px] lg:hidden data-[open=true]:hidden"
            data-open={isOpenCharts}
          >
            <HeaderBalanceChart className="h-9" />

            {/* mobile open charts button */}
            <Button
              isIconOnly
              className="flex absolute bottom-0 right-1/2 translate-x-1/2 bg-transparent min-w-0 w-20 min-h-0 h-4 rounded-full"
              disableRipple
              onPress={handleToggleCharts}
            >
              <ArrowDownIcon width={16} height={16} className="text-neutral" />
            </Button>
          </div>
        </div>

        {/* desktop actions */}
        <AccountActions className="max-lg:hidden" />
      </div>

      {/* charts */}
      <div
        className={clsx(
          "lg:flex-1 max-lg:w-full max-lg:data-[open=true]:h-[267px] max-lg:data-[open=false]:h-0 lg:h-full flex flex-col overflow-hidden",
          "max-lg:transition-[height] max-lg:duration-200 max-lg:ease-in-out",
        )}
        data-open={isOpenCharts}
      >
        <AccountCharts />

        {/* mobile toggle charts */}
        <Button
          isIconOnly
          className="flex lg:hidden mx-auto bg-transparent min-w-0 w-20 min-h-0 h-6 rounded-full"
          disableRipple
          onPress={handleToggleCharts}
        >
          <ArrowUpIcon width={16} height={16} className="text-neutral" />
        </Button>
      </div>

      {/* mobile actions */}
      <AccountActions className="lg:hidden" />
    </div>
  );
}
