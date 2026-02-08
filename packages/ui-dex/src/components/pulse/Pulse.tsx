import { Key } from "react";
import { clsx } from "clsx";
import { Tab, Tabs } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import { PulseHeader } from "./PulseHeader";
import { PulseNewList } from "./PulseNewList";
import { PulseFinalStretchList } from "./PulseFinalStretchList";
import { PulseMigratedList } from "./PulseMigratedList";
import { PulseListProvider } from "./PulseListContext";
import { usePulseContext } from "./PulseContext";

export function Pulse() {
  const { t } = useTranslation();

  const { type, setType } = usePulseContext();

  return (
    <div className="w-full h-full flex flex-col gap-2 lg:gap-4 lg:pt-4">
      <PulseHeader />

      <div className="flex-1 w-full flex flex-col gap-2 lg:gap-4">
        {/* switch pulse type on mobile & tablet */}
        <div className="flex-none px-3 w-full flex items-center lg:hidden">
          <Tabs
            size="sm"
            variant="underlined"
            classNames={{ tabList: "gap-0", tab: "px-1.5" }}
            selectedKey={type}
            onSelectionChange={setType as (key: Key) => void}
            // TODO heroui bug: tab animation conflicts with modal animation
            disableAnimation
          >
            <Tab key="new" title={t("extend.pulse.new")} />
            <Tab key="final_stretch" title={t("extend.pulse.final_stretch")} />
            <Tab key="migrated" title={t("extend.pulse.migrated")} />
          </Tabs>
        </div>

        {/* pulse list */}
        <div className="flex-1 w-full flex justify-between">
          <div className={clsx("flex-1 h-full", { "max-lg:hidden": type !== "new" })}>
            <PulseListProvider type="new">
              <PulseNewList />
            </PulseListProvider>
          </div>
          <div
            className={clsx("flex-1 h-full", {
              "max-lg:hidden": type !== "final_stretch",
            })}
          >
            <PulseListProvider type="final_stretch">
              <PulseFinalStretchList />
            </PulseListProvider>
          </div>
          <div className={clsx("flex-1 h-full", { "max-lg:hidden": type !== "migrated" })}>
            <PulseListProvider type="migrated">
              <PulseMigratedList />
            </PulseListProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
