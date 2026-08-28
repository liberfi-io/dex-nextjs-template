import { PauseIcon } from "@liberfi.io/ui";
import { TweetsWidget } from "@liberfi.io/ui-media-track";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { getNativeToken } from "@liberfi.io/utils";
import { useMemo, useState } from "react";
import { SwitchWallet } from "../application/SwitchWallet";
import { INSTANT_TRADE_AMOUNT_ID } from "../application/swapFees";
import { useOpenPresetForm } from "../application/useOpenPresetForm";
import { QuickAmountPresetInputWidget } from "./QuickAmountPresetInput";
import { TweetsLaunchButton } from "./TweetsLaunchButton";

export function BottomTweets() {
  const [isPaused, setIsPaused] = useState(false);
  const { chain } = useCurrentChain();
  const nativeToken = useMemo(() => getNativeToken(chain), [chain]);
  const handlePresetClick = useOpenPresetForm();

  return (
    <div className="w-full space-y-2.5 px-2 pb-2">
      <div className="w-full h-12 flex items-center gap-2 justify-end sticky top-0 bg-content1 z-10">
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
  );
}
