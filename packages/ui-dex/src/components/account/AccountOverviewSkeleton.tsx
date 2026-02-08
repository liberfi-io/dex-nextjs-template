import { ArrowDownIcon } from "@/assets/icons";
import { Button, Skeleton } from "@heroui/react";
import { CONFIG } from "@liberfi/core";
import { useTranslation } from "@liberfi/ui-base";
import { AccountActions } from "./AccountActions";
import { AccountCharts } from "./AccountCharts";

export function AccountOverviewSkeleton() {
  const { t } = useTranslation();

  return (
    <div className="w-full lg:h-[243px] max-lg:mt-2 max-lg:px-4 flex flex-col lg:flex-row lg:gap-5 lg:justify-between lg:overflow-hidden">
      {/* overview */}
      <div className="lg:flex-none w-full lg:w-[360px] lg:h-full p-0 lg:p-4 flex flex-col lg:bg-content1 lg:rounded-lg lg:overflow-hidden">
        {/* avatar & balances */}
        <div className="flex items-start lg:items-center gap-4">
          {/* desktop avatar */}
          <Skeleton className="w-16 h-16 rounded-full max-lg:hidden flex-none" />

          {/* balance overview */}
          <section className="flex-none flex flex-col justify-center">
            {/* desktop title */}
            <div className="max-lg:hidden mb-1 text-xs font-medium text-neutral">
              {t("extend.account.universal_account", { application_name: CONFIG.branding.name })}
            </div>

            {/* balances */}
            <div className="w-16 h-8 py-1.5">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>

            <div className="w-24 h-5 py-1">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          </section>

          {/* mobile balance chart */}
          <div className="relative flex-1 h-[52px] lg:hidden">
            <Skeleton className="w-full h-9 rounded-lg" />
            {/* mobile open charts button */}
            <Button
              isIconOnly
              className="flex absolute bottom-0 right-1/2 translate-x-1/2 bg-transparent min-w-0 w-20 min-h-0 h-4 rounded-full"
              disableRipple
              disabled
            >
              <ArrowDownIcon width={16} height={16} className="text-neutral" />
            </Button>
          </div>
        </div>

        {/* desktop actions */}
        <AccountActions className="max-lg:hidden" />
      </div>

      {/* charts */}
      <div className="max-lg:hidden flex-1 h-full flex flex-col overflow-hidden">
        <AccountCharts />
      </div>

      {/* mobile actions */}
      <AccountActions className="lg:hidden" />
    </div>
  );
}
