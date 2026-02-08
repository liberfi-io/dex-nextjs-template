import { useAppSdk, useAuthenticatedCallback, useTranslation } from "@liberfi/ui-base";
import { AccountAction } from "./AccountAction";
import { ConvertOutlinedIcon } from "@/assets/icons";
import { CHAIN_ID } from "@liberfi/core";

export function ConvertAction() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const onAction = useAuthenticatedCallback(async () => {
    appSdk.events.emit("swap", {
      method: "swap",
      params: {
        chainId: CHAIN_ID.SOLANA,
      },
    });
  }, [appSdk]);

  return (
    <AccountAction
      label={t("extend.account.convert")}
      icon={<ConvertOutlinedIcon width={16} height={16} className="text-black" />}
      action={onAction}
    />
  );
}
