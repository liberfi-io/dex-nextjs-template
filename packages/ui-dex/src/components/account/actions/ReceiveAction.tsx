import { ReceiveOutlinedIcon } from "../../../assets";
import { AccountAction } from "./AccountAction";
import { useAppSdk, useAuthenticatedCallback, useTranslation } from "@liberfi/ui-base";

export function ReceiveAction() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const onAction = useAuthenticatedCallback(async () => {
    appSdk.events.emit("deposit:open");
  }, [appSdk]);

  return (
    <AccountAction
      label={t("extend.account.receive")}
      icon={<ReceiveOutlinedIcon width={16} height={16} className="text-black" />}
      action={onAction}
    />
  );
}
