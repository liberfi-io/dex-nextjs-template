import { useAppSdk, useAuth, useAuthenticatedCallback, useTranslation } from "@liberfi/ui-base";
import { AccountAction } from "./AccountAction";
import { CashInOutlinedIcon } from "../../../assets";
import { Chain } from "@liberfi/core";
import { getBuyTokenUrl } from "../../../libs";

export function AddCashAction() {
  const { t, i18n } = useTranslation();

  const { user } = useAuth();

  const appSdk = useAppSdk();

  const onAction = useAuthenticatedCallback(async () => {
    const url = getBuyTokenUrl({
      chainId: Chain.SOLANA,
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
