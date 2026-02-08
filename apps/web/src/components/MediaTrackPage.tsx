"use client";

import { clsx, PauseIcon } from "@liberfi.io/ui";
import { TweetsWidget } from "@liberfi.io/ui-media-track";
import {
  useSetBottomNavigationBarActiveKey,
  useShowBottomNavigationBar,
  useShowHeader,
} from "@liberfi/ui-base";
import { InstantBuyAmountInput, SwitchWallet } from "@liberfi/ui-dex";
import { useState } from "react";
import { TweetsLaunchButton } from "./TweetsLaunchButton";

export function MediaTrackPage() {
  // always display header
  useShowHeader();

  // display bottom navigation bar on tablet & mobile
  useShowBottomNavigationBar("tablet");

  // set bottom navigation bar active tab
  useSetBottomNavigationBarActiveKey("track");

  const [isPaused, setIsPaused] = useState(false);

  const [instantBuyAmount, setInstantBuyAmount] = useState<number | undefined>();

  const [instantBuyPreset, setInstantBuyPreset] = useState<number>(0);

  return (
    <div
      className={clsx(
        "max-w-[480px] mx-auto px-1 lg:px-6 overflow-auto",
        // tablet & desktop: full height
        "h-[calc(100vh-var(--header-height)-0.625rem)]",
        "lg:h-[calc(100vh-var(--header-height)-2.875rem)]",
        // mobile: reserved space for footer actions
        "max-sm:h-[calc(100vh-var(--header-height)-0.625rem-var(--footer-height))]",
      )}
    >
      <div className="w-full space-y-2.5 px-2 pb-2">
        <div className="w-full h-12 flex items-center gap-2 justify-end sticky top-0 bg-background z-10">
          {isPaused && <PauseIcon className="w-5 h-5 text-primary" />}
          <SwitchWallet />
          {/* desktop instant buy amount input */}
          <InstantBuyAmountInput
            radius="full"
            size="lg"
            amount={instantBuyAmount}
            onAmountChange={setInstantBuyAmount}
            preset={instantBuyPreset}
            onPresetChange={setInstantBuyPreset}
          />
        </div>
        <TweetsWidget
          onPauseChange={setIsPaused}
          customHeaderActions={(item) => <TweetsLaunchButton data={item} />}
        />
      </div>
    </div>
  );
}
