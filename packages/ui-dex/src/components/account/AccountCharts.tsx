// import { AllocationChart } from "./charts/AllocationChart";
import { BalanceChart } from "./charts/BalanceChart";
import clsx from "clsx";
import { PnlChart } from "./charts/PnlChart";
import { PortfolioChart } from "./charts/PortfolioChart";
import { Tab, Tabs } from "@heroui/react";
import { Key, useState } from "react";
import { useTranslation } from "@liberfi/ui-base";

export type AccountChartsProps = {
  className?: string;
};

export function AccountCharts({ className }: AccountChartsProps) {
  const { t } = useTranslation();

  const [type, setType] = useState("balance");

  return (
    <section
      className={clsx(
        "w-full h-[243px] lg:h-full lg:w-[480px]",
        "flex flex-col lg:rounded-lg lg:bg-content1 px-0 lg:px-4 py-2",
        className,
      )}
    >
      <Tabs
        variant="underlined"
        selectedKey={type}
        onSelectionChange={setType as (key: Key) => void}
        classNames={{
          base: "flex-none h-8",
          tab: "min-w-0 w-auto px-2 data-[hover-unselected=true]:opacity-hover",
          tabList: "p-0 gap-0",
          tabContent: "text-neutral group-data-[selected=true]:text-foreground",
          cursor: "bg-foreground",
        }}
      >
        <Tab key="balance" title={t("extend.account.balance")}></Tab>
        <Tab key="pnl" title={t("extend.account.pnl")}></Tab>
        <Tab key="portfolio" title={t("extend.account.portfolio")}></Tab>
        {/* <Tab key="allocation" title={t("extend.account.allocation")}></Tab> */}
      </Tabs>
      {type === "balance" && <BalanceChart className="flex-1 px-2 pt-4 pb-1" />}
      {type === "pnl" && <PnlChart className="flex-1 px-2 pt-4 pb-1" />}
      {type === "portfolio" && <PortfolioChart className="flex-1 px-2 pt-4 pb-1" />}
      {/* {type === "allocation" && <AllocationChart className="flex-1 px-2 pt-4 pb-1" />} */}
    </section>
  );
}
