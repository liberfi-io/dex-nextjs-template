import { Button } from "@heroui/react";
import { MenuIcon, useAppSdk, useAuthenticatedCallback, useTranslation } from "@liberfi/ui-base";

export function HeaderSettingsMenu() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const handleOpenSettings = useAuthenticatedCallback(
    () => appSdk.events.emit("settings:open"),
    [appSdk],
  );

  return (
    <Button
      isIconOnly
      className="lg:hidden bg-transparent w-7 min-w-0 h-7 min-h-0 text-neutral"
      onPress={handleOpenSettings}
      disableRipple
      aria-label={t("extend.header.settings")}
    >
      <MenuIcon width={24} height={24} />
    </Button>
  );
}
