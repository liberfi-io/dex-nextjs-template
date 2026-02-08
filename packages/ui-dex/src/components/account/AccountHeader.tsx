import { SettingsIcon } from "@/assets";
import { Button, Image } from "@heroui/react";
import { CONFIG } from "@liberfi/core";
import { useAppSdk, useAuthenticatedCallback, useTranslation } from "@liberfi/ui-base";

export function AccountHeader() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const handleSettings = useAuthenticatedCallback(() => {
    appSdk.events.emit("settings:open");
  }, [appSdk]);

  return (
    <div className="z-20 lg:hidden w-full h-[52px] px-4 bg-background flex justify-between items-center sticky top-0">
      <div className="text-xs font-medium text-neutral flex items-center gap-2">
        <Image
          width={30}
          height={30}
          src="/avatar.jpg"
          alt="Avatar"
          className="rounded-full overflow-hidden"
          removeWrapper
        />
        {t("extend.account.universal_account", { application_name: CONFIG.branding.name })}
      </div>
      <Button
        isIconOnly
        className="flex lg:hidden bg-transparent min-h-0 min-w-0 h-7 w-7 rounded"
        aria-label={t("extend.header.settings")}
        disableRipple
        onPress={handleSettings}
      >
        <SettingsIcon className="max-lg:w-6 max-lg:h-6 w-4 h-4 text-neutral" />
      </Button>
    </div>
  );
}
