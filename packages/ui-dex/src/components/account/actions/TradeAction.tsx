import { TradeOutlinedIcon } from "../../../assets";
import { AccountAction } from "./AccountAction";
import { useTranslation } from "@liberfi/ui-base";
import { AppRoute } from "../../../libs";

export type TradeActionProps = {
  className?: string;
};

export function TradeAction({ className }: TradeActionProps) {
  const { t } = useTranslation();
  return (
    <AccountAction
      label={t("extend.account.trade")}
      icon={<TradeOutlinedIcon width={16} height={16} className="text-black" />}
      className={className}
      href={AppRoute.trade}
    />
  );
}
