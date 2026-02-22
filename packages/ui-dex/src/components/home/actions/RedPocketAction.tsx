import { useTranslation } from "@liberfi/ui-base";
import { AccountAction } from "./AccountAction";
import { RedPocketIcon } from "../../../assets/icons";

export function RedPocketAction() {
  const { t } = useTranslation();
  return (
    <AccountAction
      className="min-w-[68px]"
      label={t("extend.account.red_pocket")}
      href="#"
      icon={<RedPocketIcon width={32} height={32} />}
    />
  );
}
