import { Key, useCallback, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import { Image, Tab, Tabs } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import { LaunchPadPlatform } from "@liberfi/react-launchpad";
import { launchPadPlatform } from "@/states";
import { PumpLaunchPadForm } from "./pump";
import { RaydiumLaunchPadForm } from "./raydium";
import { LaunchPadCurveAreaChart } from "./LaunchPadCurveAreaChart";
import { MagicLaunch } from "./MagicLaunch";
import { GeneratedMemeInfo } from "@liberfi.io/types";

const platforms = [
  {
    platform: LaunchPadPlatform.PUMPFUN,
    name: "Pump",
    icon: "/images/launchpad/pumpfun.svg",
  },
  {
    platform: LaunchPadPlatform.RAYDIUM,
    name: "Raydium",
    icon: "/images/launchpad/raydium.svg",
  },
];

export interface LaunchPadHomeProps {
  prompt?: string;
  image?: string;
}

export function LaunchPadHome({ prompt, image }: LaunchPadHomeProps) {
  const { t } = useTranslation();

  const [platform, setPlatform] = useAtom(launchPadPlatform);

  const [suggestedImage, setSuggestedImage] = useState<string | undefined>(image);

  const [suggestedName, setSuggestedName] = useState<string | undefined>(undefined);

  const [suggestedSymbol, setSuggestedSymbol] = useState<string | undefined>(undefined);

  const onGenerate = useCallback((result: GeneratedMemeInfo) => {
    setSuggestedImage(result.image);
    setSuggestedName(result.name);
    setSuggestedSymbol(result.symbol);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <MagicLaunch prompt={prompt} onGenerate={onGenerate} />

      <div className="flex-1 flex items-start justify-center gap-4">
        {/* form */}
        <div className={clsx("h-full flex flex-col gap-4 max-lg:w-full lg:flex-1 lg:basis-1/2")}>
          <Tabs
            fullWidth
            selectedKey={platform}
            onSelectionChange={setPlatform as (key: Key) => void}
            classNames={{ tabList: "bg-content2", tab: "data-[selected=true]:bg-content3" }}
            // TODO heroui bug: tab animation conflicts with modal animation
            disableAnimation
          >
            {platforms.map((platform) => (
              <Tab
                key={platform.platform}
                title={
                  <div className="flex items-center gap-2">
                    <Image src={platform.icon} alt={platform.name} width={20} height={20} />
                    <span>{platform.name}</span>
                  </div>
                }
              />
            ))}
          </Tabs>

          <PumpLaunchPadForm
            className={clsx("grow-1 shrink-0", { hidden: platform !== LaunchPadPlatform.PUMPFUN })}
            suggestedImage={suggestedImage}
            suggestedName={suggestedName}
            suggestedSymbol={suggestedSymbol}
          />

          <RaydiumLaunchPadForm
            suggestedImage={suggestedImage}
            suggestedName={suggestedName}
            suggestedSymbol={suggestedSymbol}
            className={clsx("grow-1 shrink-0", { hidden: platform !== LaunchPadPlatform.RAYDIUM })}
          />

          {/* bottom padding & mask */}
          {/* <div className="w-full h-4 bg-content1 sticky bottom-0 z-10" /> */}
        </div>

        {/* curve preview */}
        <div
          className={clsx(
            "px-4 py-6 space-y-4",
            "bg-content2 rounded-lg overflow-hidden",
            "lg:flex-1 lg:basis-1/2 lg:sticky lg:top-0 max-lg:hidden",
          )}
        >
          <h2 className="text-sm font-medium">{t("extend.launchpad.curve_preview")}</h2>
          <LaunchPadCurveAreaChart />
        </div>
      </div>
    </div>
  );
}
