import clsx from "clsx";
import { Tab, Tabs } from "@heroui/react";
import { Key, PropsWithChildren, useCallback } from "react";
import { useTranslation } from "@liberfi/ui-base";

export type AccountTapProps = PropsWithChildren<{
  tab: "assets" | "activities";
  onTabChange: (type: "assets" | "activities") => void;
}>;

export function AccountTap({ children, tab, onTabChange }: AccountTapProps) {
  const { t } = useTranslation();

  const handleSelectionChange = useCallback(
    (key: Key) => {
      onTabChange(key as "assets" | "activities");
    },
    [onTabChange],
  );

  return (
    <>
      <div
        className={clsx(
          "w-full h-10 lg:h-16 max-lg:mt-6 max-lg:px-4 lg:pt-6 bg-background text-neutral",
          "flex justify-between items-center",
        )}
      >
        <Tabs
          selectedKey={tab}
          onSelectionChange={handleSelectionChange}
          variant="light"
          classNames={{
            tab: "min-w-0 w-auto h-auto min-h-0 px-2.5 lg:px-4 py-1 rounded-full data-[hover-unselected=true]:opacity-80",
            tabList: "p-0 gap-0 lg:gap-2.5 rounded-none",
            tabContent:
              "text-neutral group-data-[selected=true]:text-foreground text-sm font-semibold",
            cursor: "bg-content1 dark:bg-content1 rounded-full",
          }}
        >
          <Tab key="assets" title={t("extend.account.asset")} />
          <Tab key="activities" title={t("extend.account.activity")} />
        </Tabs>

        {/* sub taps for different list types */}
        {children}
      </div>

      {/* desktop sticky header padding */}
      <div className="hidden lg:block h-4 w-full bg-background"></div>
    </>
  );
}
