"use client";

import { cn, PauseIcon } from "@liberfi.io/ui";
import { TweetsWidget } from "@liberfi.io/ui-media-track";
import {
  useSetBottomNavigationBarActiveKey,
  useShowBottomNavigationBar,
  useShowHeader,
} from "@liberfi/ui-base";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { getNativeToken } from "@liberfi.io/utils";
import { useMemo, useState } from "react";
import { SwitchWallet } from "../application/SwitchWallet";
import { INSTANT_TRADE_AMOUNT_ID } from "../application/swapFees";
import { useOpenPresetForm } from "../application/useOpenPresetForm";
import { QuickAmountPresetInputWidget } from "./QuickAmountPresetInput";
import { TweetsLaunchButton } from "./TweetsLaunchButton";

export function MediaTrackPage() {
  // always display header
  useShowHeader();

  // display bottom navigation bar on tablet & mobile
  useShowBottomNavigationBar("tablet");

  // set bottom navigation bar active tab
  useSetBottomNavigationBarActiveKey("track");

  const [isPaused, setIsPaused] = useState(false);
  const { chain } = useCurrentChain();
  const nativeToken = useMemo(() => getNativeToken(chain), [chain]);
  const handlePresetClick = useOpenPresetForm();

  return (
    <div
      className={cn(
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
          {nativeToken && (
            <QuickAmountPresetInputWidget
              id={INSTANT_TRADE_AMOUNT_ID}
              chain={chain}
              token={nativeToken}
              size="sm"
              className="w-48 flex-none"
              onPresetClick={handlePresetClick}
            />
          )}
        </div>
        <TweetsWidget
          onPauseChange={setIsPaused}
          customHeaderActions={(item) => <TweetsLaunchButton data={item} />}
        />
      </div>
    </div>
  );
}
