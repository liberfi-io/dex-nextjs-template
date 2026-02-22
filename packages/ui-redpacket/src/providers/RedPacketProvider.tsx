import { getRedPacketStatus } from "../utils";
import { useRedPacketQuery } from "@liberfi/react-redpacket";
import { useAppSdk, useTranslation } from "@liberfi/ui-base";
import { PropsWithChildren, useEffect } from "react";
import toast from "react-hot-toast";

export type RedPacketProviderProps = PropsWithChildren<{
  shareId?: string;
}>;

export function RedPacketProvider({ shareId, children }: RedPacketProviderProps) {
  const appSdk = useAppSdk();

  const { t } = useTranslation();

  const { data: redPacket } = useRedPacketQuery(shareId ?? "", { enabled: !!shareId });

  useEffect(() => {
    if (!redPacket) return;
    const status = getRedPacketStatus(redPacket);
    if (status !== "ongoing") {
      toast.error(t("extend.redpacket.claim.error_red_packet_not_ongoing"));
      return;
    }
    appSdk.events.emit("redpacket:claim", { redPacket });
  }, [redPacket, appSdk.events, t]);

  return <>{children}</>;
}
