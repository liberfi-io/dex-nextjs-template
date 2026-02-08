import { AccountAction } from "./AccountAction";
import { RedPacketOutlinedIcon, useTranslation } from "@liberfi/ui-base";
import { ROUTES } from "@liberfi/core";

export type RedPacketActionProps = {
  className?: string;
};

export function RedPacketAction({ className }: RedPacketActionProps) {
  const { t } = useTranslation();
  return (
    <AccountAction
      label={t("extend.account.redpacket")}
      icon={<RedPacketOutlinedIcon width={32} height={32} className="text-black" />}
      className={className}
      href={ROUTES.redPacket.home()}
    />
  );
}
