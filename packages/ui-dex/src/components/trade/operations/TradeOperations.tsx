import { useTranslation } from "@liberfi/ui-base";
import { Tab, Tabs } from "@heroui/react";
import { Key, useState } from "react";
import { TradeBuy } from "./TradeBuy";
import { TradeSell } from "./TradeSell";
import clsx from "clsx";

export function TradeOperations({ className }: { className?: string }) {
  const { t } = useTranslation();

  const [type, setType] = useState("buy");

  return (
    <div
      className={clsx(
        "flex-none w-full p-3 bg-content1 rounded-lg overflow-hidden flex flex-col",
        className,
      )}
    >
      <div className="flex items-center">
        <Tabs
          selectedKey={type}
          onSelectionChange={setType as (key: Key) => void}
          classNames={{
            tab: "min-w-0 w-auto h-auto min-h-0 px-2.5 lg:px-4 py-1 rounded-full data-[hover-unselected=true]:opacity-80",
            tabList: "p-0 gap-0 lg:gap-2.5 rounded-none bg-transparent",
            tabContent:
              "text-neutral group-data-[selected=true]:text-foreground text-sm font-semibold",
            cursor: "bg-content3 dark:bg-content3 rounded-full",
          }}
        >
          <Tab key="buy" title={t("extend.trade.operations.buy")} />
          <Tab key="sell" title={t("extend.trade.operations.sell")} />
        </Tabs>
      </div>
      <div className="w-full pt-3">
        {type === "buy" && <TradeBuy />}
        {type === "sell" && <TradeSell />}
      </div>
    </div>
  );
}
