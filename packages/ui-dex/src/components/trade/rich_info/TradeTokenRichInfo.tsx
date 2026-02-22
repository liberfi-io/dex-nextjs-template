import { Button, Tab, Tabs } from "@heroui/react";
import { useAppSdk, useTranslation } from "@liberfi/ui-base";
import { Key, useCallback, useState } from "react";
import { TradeTokenAbout } from "./TradeTokenAbout";
import { TradeTokenHolders } from "./TradeTokenHolders";
import { TradeTokenTransactions } from "./TradeTokenTransactions";
import { BubbleMapIcon } from "../../../assets";
import { CHAIN_ID } from "@liberfi/core";
import { getBubbleMapUrl } from "../../../libs";
import { tokenInfoAtom } from "../../../states";
import { useAtomValue } from "jotai";

export function TradeTokenRichInfo() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const [type, setType] = useState<"transactions" | "holders" | "info">("transactions");

  const token = useAtomValue(tokenInfoAtom);

  const handleBubbleMap = useCallback(() => {
    if (!token?.chain || !token?.address) return;

    const chainId = CHAIN_ID[token.chain.toUpperCase() as keyof typeof CHAIN_ID];
    const url = getBubbleMapUrl(chainId, token.address);

    if (url) {
      appSdk.events.emit("webview:open", {
        method: "webview:open",
        params: {
          url,
          title: t("extend.trade.holders.bubble_map"),
          size: "5xl",
        },
      });
    }
  }, [appSdk, token?.chain, token?.address, t]);

  return (
    <div className="md:flex-1 w-full md:overflow-hidden md:bg-content1 md:rounded-lg flex flex-col">
      <div className="flex items-center justify-between">
        <Tabs
          variant="underlined"
          selectedKey={type}
          onSelectionChange={setType as (key: Key) => void}
          classNames={{
            base: "flex-none p-3 max-md:bg-background max-md:z-10 max-md:sticky max-md:top-14",
            tab: "min-w-0 w-auto px-2 data-[hover-unselected=true]:opacity-80",
            tabList: "p-0 gap-0",
            tabContent: "text-neutral group-data-[selected=true]:text-foreground",
            cursor: "bg-foreground",
          }}
        >
          <Tab key="transactions" title={t("extend.trade.titles.transactions")}></Tab>
          <Tab key="holders" title={t("extend.trade.titles.holders")}></Tab>
          <Tab key="info" title={t("extend.trade.titles.info")}></Tab>
        </Tabs>

        {token && (
          <Button
            isIconOnly
            className="bg-transparent text-neutral md:hidden"
            disableRipple
            onPress={handleBubbleMap}
          >
            <BubbleMapIcon width={16} height={16} />
          </Button>
        )}
      </div>

      {type === "transactions" && <TradeTokenTransactions />}
      {type === "holders" && <TradeTokenHolders />}
      {type === "info" && <TradeTokenAbout />}
    </div>
  );
}
