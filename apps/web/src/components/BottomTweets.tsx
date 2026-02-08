import { PauseIcon } from "@liberfi.io/ui";
import { InstantBuyAmountInput, SwitchWallet } from "@liberfi/ui-dex";
import { TweetsWidget } from "@liberfi.io/ui-media-track";
import { useState } from "react";
import { TweetsLaunchButton } from "./TweetsLaunchButton";

export function BottomTweets() {
  const [isPaused, setIsPaused] = useState(false);

  const [instantBuyAmount, setInstantBuyAmount] = useState<number | undefined>();

  const [instantBuyPreset, setInstantBuyPreset] = useState<number>(0);

  return (
    <div className="w-full space-y-2.5 px-2 pb-2">
      <div className="w-full h-12 flex items-center gap-2 justify-end sticky top-0 bg-content1 z-10">
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
  );
}
