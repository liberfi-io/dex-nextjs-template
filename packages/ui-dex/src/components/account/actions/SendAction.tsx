import { SendOutlinedIcon } from "@/assets";
import { AccountAction } from "./AccountAction";
import { useAppSdk, useAuthenticatedCallback, useTranslation } from "@liberfi/ui-base";

export function SendAction() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const onAction = useAuthenticatedCallback(async () => {
    appSdk.events.emit("transfer", {
      method: "transfer",
      params: {},
    });
  }, [appSdk]);

  return (
    <AccountAction
      label={t("extend.account.transfer")}
      icon={<SendOutlinedIcon width={16} height={16} className="text-black" />}
      action={onAction}
    />
  );
}
