import { BitCoinTradeIcon, DashboardIcon, TradeHistoryIcon } from "@/assets";
import { useTranslation } from "@liberfi/ui-base";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { PropsWithChildren, useCallback, useState } from "react";
import { AccountDashboard } from "./AccountDashboard";
import { AccountAssetList } from "./AccountAssetList";
import { AccountActivityList } from "./AccountActivityList";
import { AuthGuard } from "../AuthGuard";

export function AccountSection() {
  const { t } = useTranslation();

  const [tab, setTab] = useState<"accounts" | "dashboard" | "history">("accounts");

  return (
    <div className="flex-1 w-full flex flex-col bg-content1 rounded-lg overflow-hidden">
      <section className="flex-none w-full h-[52px] px-4 flex items-center justify-between">
        <div className="text-sm font-medium text-foreground">{t(`extend.trade.account.${tab}.title`)}</div>
        <div className="flex items-center justify-between">
          <AccountTab
            value="accounts"
            active={tab === "accounts"}
            onSelect={setTab as (value: string) => void}
          >
            <BitCoinTradeIcon width={20} height={20} />
          </AccountTab>
          <AccountTab
            value="dashboard"
            active={tab === "dashboard"}
            onSelect={setTab as (value: string) => void}
          >
            <DashboardIcon width={20} height={20} />
          </AccountTab>
          <AccountTab
            value="history"
            active={tab === "history"}
            onSelect={setTab as (value: string) => void}
          >
            <TradeHistoryIcon width={20} height={20} />
          </AccountTab>
        </div>
      </section>

      <AuthGuard>
        {tab === "accounts" && <AccountAssetList />}
        {tab === "dashboard" && <AccountDashboard />}
        {tab === "history" && <AccountActivityList />}
      </AuthGuard>
    </div>
  );
}

function AccountTab({
  children,
  value,
  active,
  onSelect,
}: PropsWithChildren<{
  value: string;
  active: boolean;
  onSelect: (value: string) => void;
}>) {
  const handleSelect = useCallback(() => onSelect(value), [value, onSelect]);

  return (
    <Button
      isIconOnly
      className={clsx(
        "flex w-7 min-w-7 h-7 min-h-7 rounded",
        active ? "bg-content3 text-foreground" : "bg-transparent text-neutral",
      )}
      disableRipple
      onPress={handleSelect}
    >
      {children}
    </Button>
  );
}
