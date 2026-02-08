import { TweetMedia } from "@liberfi.io/types";
import { RocketIcon, StyledButton, StyledTooltip } from "@liberfi.io/ui";
import { useAppSdk, useTranslation } from "@liberfi/ui-base";
import { useCallback } from "react";

export type TweetsLaunchButtonProps = {
  data: TweetMedia;
};

export function TweetsLaunchButton({ data }: TweetsLaunchButtonProps) {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const handleLaunch = useCallback(() => {
    appSdk.events.emit("launchpad:open", {
      prompt: data.tweet.content.text,
      image: data.tweet.user.avatar,
    });
  }, [appSdk, data]);

  return (
    <StyledTooltip closeDelay={0} content={t("extend.toolbar.launch_token")}>
      <StyledButton
        isIconOnly
        color="primary"
        className="w-7 min-w-0 h-7 min-h-0 rounded"
        onPress={handleLaunch}
        disableRipple
        aria-label={t("extend.toolbar.launch_token")}
      >
        <RocketIcon width={16} height={16} />
      </StyledButton>
    </StyledTooltip>
  );
}
