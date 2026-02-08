import { BalanceChart, PnlChart, PortfolioChart } from "../account/charts";
import { useTranslation } from "@liberfi/ui-base";

export function AccountDashboard() {
  const { t } = useTranslation();
  return (
    <div className="flex-1 w-full space-y-3 py-2 px-3 overflow-y-auto scrollbar-hide">
      <BalanceChart className="w-full h-[206px]" />
      <PnlChart className="w-full h-[206px]" />
      <div>
        <div className="text-neutral text-xs">{t("extend.account.portfolio")}</div>
        <PortfolioChart
          className="w-full h-[206px]"
          classNames={{
            chart: "w-[calc(70%-4px)]",
            legends: "w-[calc(30%-4px)]",
            legendItem: "text-xs",
          }}
          displayLegendValue={false}
        />
      </div>
    </div>
  );
}
