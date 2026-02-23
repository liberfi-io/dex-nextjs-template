"use client";

import { Key, useCallback, useMemo, useState } from "react";
import { Tab, Tabs } from "@heroui/react";
import { clsx } from "@liberfi.io/ui";
import { useTranslation } from "@liberfi.io/i18n";
import { Token } from "@liberfi.io/types";
import { chainSlug } from "@liberfi.io/utils";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  PulseNewListWidget,
  PulseFinalStretchListWidget,
  PulseMigratedListWidget,
  PulseListType,
} from "@liberfi.io/ui-tokens";
import {
  useSetBottomNavigationBarActiveKey,
  useShowBottomNavigationBar,
  useShowHeader,
  useRouter,
} from "@liberfi/ui-base";
import { SwitchWallet } from "@liberfi/ui-dex";
import { AppRoute } from "@liberfi/ui-dex/libs/routes";
import { PulseInstantBuyAmountInput } from "./PulseInstantBuyAmountInput";
import { PulseInstantBuyProvider } from "./PulseInstantBuyContext";
import { PulseInstantBuy } from "./PulseInstantBuy";

export function PulsePage() {
  useShowHeader();
  useShowBottomNavigationBar("tablet");
  useSetBottomNavigationBarActiveKey("pulse");

  const { t } = useTranslation();
  const { chain: chainId } = useCurrentChain();
  const { navigate } = useRouter();

  const [type, setType] = useState<PulseListType>("new");

  const handleSelectToken = useCallback(
    (token: Token) => {
      const slug = chainSlug(token.chain);
      if (slug) {
        navigate(`${AppRoute.trade}/${slug}/${token.address}`);
      }
    },
    [navigate],
  );

  const renderNewHeaderExtra = useMemo(
    () => <PulseInstantBuyAmountInput type="new" variant="bordered" />,
    [],
  );
  const renderFinalStretchHeaderExtra = useMemo(
    () => <PulseInstantBuyAmountInput type="final_stretch" variant="bordered" />,
    [],
  );
  const renderMigratedHeaderExtra = useMemo(
    () => <PulseInstantBuyAmountInput type="migrated" variant="bordered" />,
    [],
  );

  const renderItemAction = useCallback(
    (token: Token) => <PulseInstantBuy token={token} />,
    [],
  );

  return (
    <div
      className={clsx(
        "max-w-[1920px] mx-auto px-1 lg:px-6",
        "h-[calc(100vh-var(--header-height)-0.625rem)]",
        "lg:h-[calc(100vh-var(--header-height)-2.875rem)]",
        "max-sm:h-[calc(100vh-var(--header-height)-0.625rem-var(--footer-height))]",
      )}
    >
      <div className="w-full h-full flex flex-col gap-2 lg:gap-4 lg:pt-4">
        {/* header: title + wallet + mobile instant buy input */}
        <div className="flex-none w-full h-8 px-3 flex items-center justify-between max-lg:justify-start gap-4">
          <div className="max-lg:hidden">
            <h1 className="text-lg font-semibold">{t("extend.pulse.title")}</h1>
          </div>
          <div className="flex items-center gap-4 max-lg:w-full max-lg:justify-between">
            <SwitchWallet />
            <PulseInstantBuyAmountInput
              type={type}
              radius="lg"
              size="lg"
              fullWidth
              className="lg:hidden"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 w-full flex flex-col gap-2 lg:gap-4">
          {/* mobile/tablet tab switching */}
          <div className="flex-none px-3 w-full flex items-center lg:hidden">
            <Tabs
              size="sm"
              variant="underlined"
              classNames={{ tabList: "gap-0", tab: "px-1.5" }}
              selectedKey={type}
              onSelectionChange={setType as (key: Key) => void}
              disableAnimation
            >
              <Tab key="new" title={t("extend.pulse.new")} />
              <Tab key="final_stretch" title={t("extend.pulse.final_stretch")} />
              <Tab key="migrated" title={t("extend.pulse.migrated")} />
            </Tabs>
          </div>

          {/* three-column list layout */}
          <div className="flex-1 min-h-0 w-full flex justify-between">
            <div className={clsx("flex-1 h-full", { "max-lg:hidden": type !== "new" })}>
              <PulseInstantBuyProvider type="new">
                <PulseNewListWidget
                  chain={chainId}
                  title={t("extend.pulse.new")}
                  renderHeaderExtra={renderNewHeaderExtra}
                  renderItemAction={renderItemAction}
                  onSelectToken={handleSelectToken}
                  className="border-r-0 rounded-lg lg:rounded-r-none"
                />
              </PulseInstantBuyProvider>
            </div>
            <div
              className={clsx("flex-1 h-full", {
                "max-lg:hidden": type !== "final_stretch",
              })}
            >
              <PulseInstantBuyProvider type="final_stretch">
                <PulseFinalStretchListWidget
                  chain={chainId}
                  title={t("extend.pulse.final_stretch")}
                  renderHeaderExtra={renderFinalStretchHeaderExtra}
                  renderItemAction={renderItemAction}
                  onSelectToken={handleSelectToken}
                  className="border-r-0 rounded-lg lg:rounded-none"
                />
              </PulseInstantBuyProvider>
            </div>
            <div className={clsx("flex-1 h-full", { "max-lg:hidden": type !== "migrated" })}>
              <PulseInstantBuyProvider type="migrated">
                <PulseMigratedListWidget
                  chain={chainId}
                  title={t("extend.pulse.migrated")}
                  renderHeaderExtra={renderMigratedHeaderExtra}
                  renderItemAction={renderItemAction}
                  onSelectToken={handleSelectToken}
                  className="rounded-lg lg:rounded-l-none"
                />
              </PulseInstantBuyProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
