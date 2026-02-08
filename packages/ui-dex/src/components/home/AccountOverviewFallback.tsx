import { ArrowRightIcon, BullishIcon } from "@/assets/icons";
import { AppRoute, formatPercentage } from "@/libs";
import { Link } from "@heroui/react";
import { CONFIG } from "@liberfi/core";
import { useAuthenticatedCallback, useRouter, useTranslation } from "@liberfi/ui-base";
import { Number } from "../Number";
import { HeaderBalanceChart } from "../account/charts";
import { AddCashAction, ConvertAction, ReceiveAction, SendAction } from "./actions";

export function AccountOverviewFallback() {
  const { t } = useTranslation();

  const { navigate } = useRouter();

  const handleAccountLink = useAuthenticatedCallback(() => {
    navigate(AppRoute.account);
  }, [navigate]);

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
            <Number value={0} abbreviate defaultCurrencySign="$" />
          </p>
          <p
            className="text-sm font-medium flex items-center gap-2 text-bearish data-[bullish=true]:text-bullish"
            data-bullish
          >
            <span>
              <Number value={0} abbreviate defaultCurrencySign="$" />
            </span>
            <span className="flex items-center gap-1">
              (
              <BullishIcon className="mr-1" width={10} height={10} />
              {formatPercentage(0)})
            </span>
            <span className="text-neutral">({t("extend.common.time.24h")})</span>
          </p>
        </section>

        <HeaderBalanceChart className="flex-1 h-[72px]" />
      </div>
      <div className="w-full flex justify-center max-lg:mt-2.5 text-neutral">
        <AddCashAction />
        <ReceiveAction />
        <SendAction />
        <ConvertAction />
      </div>
    </div>
  );
}
