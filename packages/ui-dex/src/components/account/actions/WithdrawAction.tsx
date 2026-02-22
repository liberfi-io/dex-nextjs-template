import { WithdrawOutlinedIcon } from "../../../assets";
import { AccountAction } from "./AccountAction";
import { useAppSdk, useAuth, useAuthenticatedCallback, useTranslation } from "@liberfi/ui-base";
import { getSellTokenUrl } from "../../../libs";
import { Chain } from "@liberfi/core";

export type WithdrawActionProps = {
  className?: string;
};

export function WithdrawAction({ className }: WithdrawActionProps) {
  const { t, i18n } = useTranslation();

  const { user } = useAuth();

  const appSdk = useAppSdk();

  const onAction = useAuthenticatedCallback(async () => {
    const url = getSellTokenUrl({
      chainId: Chain.SOLANA,
      walletAddress: user?.solanaAddress ?? "",
      language: i18n.language,
    });
    appSdk.openPage(url, {
      title: t("extend.account.withdraw"),
      target: "modal",
    });
  }, [t, appSdk, i18n, user]);

  return (
    <AccountAction
      label={t("extend.account.withdraw")}
      icon={<WithdrawOutlinedIcon width={16} height={16} className="text-black" />}
      action={onAction}
      className={className}
    />
  );
}
