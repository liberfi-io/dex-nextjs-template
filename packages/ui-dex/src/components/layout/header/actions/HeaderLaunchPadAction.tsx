import { useCallback } from "react";
import { Button } from "@heroui/react";
import { RocketIcon, useAppSdk, useTranslation } from "@liberfi/ui-base";

export function HeaderLaunchPadAction() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const handleLaunchpad = useCallback(() => {
    appSdk.events.emit("launchpad:open");
  }, [appSdk]);

  return (
    <Button
      isIconOnly
      className="max-lg:hidden bg-content2 w-7 min-w-0 h-7 min-h-0 rounded text-bullish"
      onPress={handleLaunchpad}
      disableRipple
      aria-label={t("extend.header.launchpad")}
    >
      <RocketIcon width={16} height={16} />
    </Button>
  );
}
