import { PauseIcon } from "@liberfi.io/ui";
import { TweetsWidget } from "@liberfi.io/ui-media-track";
import { type PropsWithChildren, useEffect } from "react";
import { TweetsLaunchButton } from "./TweetsLaunchButton";

export interface BottomTweetsProps {
  onPauseChange: (isPaused: boolean) => void;
}

export function BottomTweets({ onPauseChange }: BottomTweetsProps) {
  useEffect(
    () => () => {
      onPauseChange(false);
    },
    [onPauseChange],
  );

  return (
    <div className="w-full px-2 pb-2">
      <TweetsWidget
        onPauseChange={onPauseChange}
        customHeaderActions={(item) => <TweetsLaunchButton data={item} />}
      />
    </div>
  );
}

export function BottomTweetsTitle({
  isPaused,
  children,
}: PropsWithChildren<{ isPaused: boolean }>) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="truncate">{children}</span>
      {isPaused && (
        <PauseIcon
          aria-hidden="true"
          className="h-4 w-4 flex-none text-primary"
        />
      )}
    </span>
  );
}
