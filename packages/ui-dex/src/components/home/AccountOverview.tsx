import { ArrowRightIcon, BearishIcon, BullishIcon } from "../../assets/icons";
import { AppRoute, formatPercentage } from "../../libs";
import { Link } from "@heroui/react";
import { CONFIG } from "@liberfi/core";
import {
  useAuth,
  useAuthenticatedCallback,
  useRouter,
  useTranslation,
  walletNetWorthAtom,
  walletPnlAtom,
} from "@liberfi/ui-base";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { HeaderBalanceChart } from "../account/charts";
import { Number } from "../Number";
import { AccountOverviewFallback } from "./AccountOverviewFallback";
import { AccountOverviewSkeleton } from "./AccountOverviewSkeleton";
import { AddCashAction, ConvertAction, ReceiveAction, SendAction } from "./actions";

export function AccountOverview() {
  const { status } = useAuth();

  if (status === "authenticating") {
    return <AccountOverviewSkeleton />;
  }

  if (status === "unauthenticated") {
    return <AccountOverviewFallback />;
  }

  return <AccountOverviewContent />;
}

function AccountOverviewContent() {
  const { t } = useTranslation();

  const { navigate } = useRouter();

  const walletNetWorth = useAtomValue(walletNetWorthAtom);

  const walletPnl = useAtomValue(walletPnlAtom);

  // TODO wait for backend
  const bullish = useMemo(() => true, []);

  // TODO wait for backend
  const totalProfitInUsdChange = useMemo(() => formatPercentage(0), []);

  const handleAccountLink = useAuthenticatedCallback(() => {
    navigate(AppRoute.account);
  }, [navigate]);

  if (!walletNetWorth || !walletPnl) {
    return <AccountOverviewSkeleton />;
  }

  return (
    <div className="w-full lg:h-full p-0 lg:py-3 lg:px-5 flex flex-col lg:justify-between">
      <div className="w-full flex justify-between gap-2">
        <section className="flex-none flex flex-col justify-between">
          <Link
            className="flex items-center text-xs font-medium text-neutral cursor-pointer"
            onPress={handleAccountLink}
          >
            {t("extend.account.universal_account", { application_name: CONFIG.branding.name })}
            <ArrowRightIcon width={14} height={14} />
          </Link>

          <p className="text-2xl font-semibold">
            <Number
              value={walletNetWorth?.totalValueInUsd ?? 0}
              abbreviate
              defaultCurrencySign="$"
            />
          </p>
          <p
            className="text-sm font-medium flex items-center gap-2 text-bearish data-[bullish=true]:text-bullish"
            data-bullish={bullish}
          >
            <span>
              <Number value={walletPnl?.totalProfitInUsd ?? 0} abbreviate defaultCurrencySign="$" />
            </span>
            <span className="flex items-center gap-1">
              (
              {bullish ? (
                <BullishIcon width={10} height={10} />
              ) : (
                <BearishIcon width={10} height={10} />
              )}
              {totalProfitInUsdChange})
            </span>
            <span className="text-neutral">({t("extend.common.time.24h")})</span>
          </p>
        </section>

        <HeaderBalanceChart className="flex-1 h-[72px]" />
      </div>
      <div className="w-full flex justify-center max-lg:mt-3 text-neutral">
        <AddCashAction />
        <ReceiveAction />
        <SendAction />
        <ConvertAction />
      </div>
    </div>
  );
}
