import { CashInOutlinedIcon } from "../../../assets";
import { AccountAction } from "./AccountAction";
import { useAuthenticatedCallback, useTranslation, useAppSdk, useAuth } from "@liberfi/ui-base";
import { getBuyTokenUrl } from "../../../libs";
import { CHAIN_ID } from "@liberfi/core";

export function AddCashAction() {
  const { t, i18n } = useTranslation();

  const { user } = useAuth();

  const appSdk = useAppSdk();

  const onAction = useAuthenticatedCallback(async () => {
    const url = getBuyTokenUrl({
      chainId: CHAIN_ID.SOLANA,
      walletAddress: user?.solanaAddress ?? "",
      language: i18n.language,
    });
    appSdk.openPage(url, {
      title: t("extend.account.add_cash"),
      target: "modal",
    });
  }, [t, appSdk, i18n, user]);

  return (
    <AccountAction
      label={t("extend.account.add_cash")}
      icon={<CashInOutlinedIcon width={16} height={16} className="text-black" />}
      action={onAction}
    />
  );
}
