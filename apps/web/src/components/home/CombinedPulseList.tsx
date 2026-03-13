"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "@liberfi.io/i18n";
import { Chain, Token } from "@liberfi.io/types";
import { cn, useScreen } from "@liberfi.io/ui";
import {
  PulseFinalStretchListWidget,
  PulseMigratedListWidget,
  PulseNewListWidget,
} from "@liberfi.io/ui-tokens";
import { getNativeToken } from "@liberfi.io/utils";
import { InstantTradeListButtonWidget } from "@liberfi.io/ui-trade";

type PulseType = "new" | "final_stretch" | "migrated";
const PULSE_TABS: PulseType[] = ["new", "final_stretch", "migrated"];

const PULSE_TAB_I18N_KEYS = {
  new: "tokens.pulse.new",
  final_stretch: "tokens.pulse.finalStretch",
  migrated: "tokens.pulse.migrated",
} as const;

export interface CombinedPulseListProps {
  chain: Chain;
  onSelectToken?: (token: Token) => void;
}

export function CombinedPulseList({ chain, onSelectToken }: CombinedPulseListProps) {
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const [type, setType] = useState<PulseType>("new");
  const nativeToken = useMemo(() => getNativeToken(chain), [chain]);

  return (
    <div className="w-full h-full mx-auto max-w-379 sm:max-w-403 flex flex-col gap-2 lg:gap-4">
      <div className="flex-none w-full flex items-center gap-4 lg:hidden">
        {PULSE_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setType(tab)}
            className={cn(
              "text-sm sm:text-base font-medium transition-colors cursor-pointer whitespace-nowrap",
              type === tab ? "text-foreground" : "text-neutral hover:text-foreground/80",
            )}
          >
            {t(PULSE_TAB_I18N_KEYS[tab])}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 w-full flex justify-between">
        <div
          className={cn("flex-1 min-w-0 h-full overflow-x-auto", {
            "max-lg:hidden": type !== "new",
          })}
        >
          <PulseNewListWidget
            chain={chain}
            title={t("tokens.pulse.new")}
            className="min-w-115 lg:border-r-0 rounded-lg lg:rounded-r-none"
            hideHeader={isMobile}
            onSelectToken={onSelectToken}
            renderItemAction={(token) =>
              nativeToken && (
                <InstantTradeListButtonWidget
                  id="token-list"
                  chain={chain}
                  token={nativeToken}
                  output={token.address}
                  radius="full"
                  size="sm"
                  className="w-auto min-w-auto absolute right-0 -bottom-4"
                />
              )
            }
          />
        </div>
        <div
          className={cn("flex-1 min-w-0 h-full overflow-x-auto", {
            "max-lg:hidden": type !== "final_stretch",
          })}
        >
          <PulseFinalStretchListWidget
            chain={chain}
            title={t("tokens.pulse.finalStretch")}
            className="min-w-115 lg:border-r-0 rounded-lg lg:rounded-none"
            hideHeader={isMobile}
            onSelectToken={onSelectToken}
            renderItemAction={(token) =>
              nativeToken && (
                <InstantTradeListButtonWidget
                  id="token-list"
                  chain={chain}
                  token={nativeToken}
                  output={token.address}
                  radius="full"
                  size="sm"
                  className="w-auto min-w-auto absolute right-0 -bottom-4"
                />
              )
            }
          />
        </div>
        <div
          className={cn("flex-1 min-w-0 h-full overflow-x-auto", {
            "max-lg:hidden": type !== "migrated",
          })}
        >
          <PulseMigratedListWidget
            chain={chain}
            title={t("tokens.pulse.migrated")}
            className="min-w-115 rounded-lg lg:rounded-l-none"
            hideHeader={isMobile}
            onSelectToken={onSelectToken}
            renderItemAction={(token) =>
              nativeToken && (
                <InstantTradeListButtonWidget
                  id="token-list"
                  chain={chain}
                  token={nativeToken}
                  output={token.address}
                  radius="full"
                  size="sm"
                  className="w-auto min-w-auto absolute right-0 -bottom-4"
                />
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
