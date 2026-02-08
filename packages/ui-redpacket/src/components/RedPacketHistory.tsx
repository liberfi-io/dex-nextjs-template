import { RedPacketDTO, Token } from "@chainstream-io/sdk";
import { ForwardOutlinedIcon, useAppSdk, useTranslation } from "@liberfi/ui-base";
import { TokenAvatar } from "@liberfi/ui-dex/dist/components/TokenAvatar";
import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";
import { getRedPacketStatus } from "@/utils";

export type RedPacketHistoryProps = {
  redPacket: RedPacketDTO;
  token: Token;
};

export function RedPacketHistory({ redPacket, token }: RedPacketHistoryProps) {
  const appSdk = useAppSdk();

  const { t } = useTranslation();

  const totalAmount = useMemo(
    () => new BigNumber(redPacket?.totalAmount ?? 0).shiftedBy(-(token?.decimals ?? 0)).toNumber(),
    [redPacket?.totalAmount, token?.decimals],
  );

  const status = useMemo(() => getRedPacketStatus(redPacket), [redPacket]);

  const handleRedPacketInfo = useCallback(() => {
    appSdk.events.emit("redpacket:view", {
      perspective: "sent",
      redPacket,
      redPacketId: redPacket.id,
    });
  }, [redPacket, appSdk.events]);

  return (
    <div className="w-full h-[88px] py-2">
      <div
        className="w-full h-full bg-content1 rounded-lg px-4 py-3 flex flex-col justify-between cursor-pointer"
        onClick={handleRedPacketInfo}
      >
        <p className="flex items-center justify-between text-xs">
          {/* status */}
          <span
            className="data-[status=ongoing]:text-primary data-[status=finished]:text-secondary data-[status=refunded]:text-danger data-[status=expired]:text-neutral"
            data-status={status}
          >
            {t(`extend.redpacket.histories.sent.status.${status}`)}
          </span>
          {/* time */}
          <span className="text-neutral">{new Date(redPacket.createdAt).toLocaleString()}</span>
        </p>
        {/* red packet info */}
        <div className="flex items-center justify-between">
          {/* token */}
          <div className="flex items-center gap-4">
            <TokenAvatar src={token.imageUrl ?? ""} name={token.symbol} size={24} />
            <p className="text-xs space-x-1">
              <span>{totalAmount}</span>
              <span className="text-neutral">{token.symbol}</span>
            </p>
          </div>
          <ForwardOutlinedIcon className="text-neutral" />
        </div>
      </div>{" "}
    </div>
  );
}
