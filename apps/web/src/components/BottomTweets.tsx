import { PauseIcon } from "@liberfi.io/ui";
import { TweetsWidget } from "@liberfi.io/ui-media-track";
import { useState } from "react";
import { TweetsLaunchButton } from "./TweetsLaunchButton";

export function BottomTweets() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="w-full space-y-2.5 px-2 pb-2">
      <div className="sticky top-0 z-10 flex h-12 w-full items-center justify-end bg-content1">
        {isPaused && <PauseIcon className="h-5 w-5 text-primary" />}
      </div>
      <TweetsWidget
        onPauseChange={setIsPaused}
        customHeaderActions={(item) => <TweetsLaunchButton data={item} />}
      />
    </div>
  );
}
