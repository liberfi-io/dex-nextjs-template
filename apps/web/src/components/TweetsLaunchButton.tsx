"use client";

import { RocketIcon, Button, StyledTooltip } from "@liberfi.io/ui";
import { useTranslation } from "@liberfi.io/i18n";
import * as UiScaffold from "@liberfi.io/ui-scaffold";
import { useCallback } from "react";
import { LAUNCHPAD_MODAL_ID, type LaunchPadModalParams } from "./modals/LaunchPadModal";

const useAsyncModal = UiScaffold.useAsyncModal;

interface TweetMediaData {
  tweet: {
    content: { text?: string };
    user: { avatar?: string };
  };
}

export type TweetsLaunchButtonProps = {
  data: TweetMediaData;
};

export function TweetsLaunchButton({ data }: TweetsLaunchButtonProps) {
  const { t } = useTranslation();
  const { onOpen } = useAsyncModal<LaunchPadModalParams>(LAUNCHPAD_MODAL_ID);

  const handleLaunch = useCallback(() => {
    void onOpen({
      params: {
        prompt: data.tweet.content.text,
        image: data.tweet.user.avatar,
      },
    });
  }, [data, onOpen]);

  return (
    <StyledTooltip closeDelay={0} content={t("extend.toolbar.launch_token")}>
      <Button
        isIconOnly
        color="primary"
        className="w-7 min-w-0 h-7 min-h-0 rounded"
        onPress={handleLaunch}
        disableRipple
        aria-label={t("extend.toolbar.launch_token")}
      >
        <RocketIcon width={16} height={16} />
      </Button>
    </StyledTooltip>
  );
}
