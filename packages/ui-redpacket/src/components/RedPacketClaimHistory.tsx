import { RedPacketClaimDTO, Token } from "@chainstream-io/sdk";
import { ForwardOutlinedIcon, useAppSdk, useAuth, useTranslation } from "@liberfi/ui-base";
import { TokenAvatar } from "@liberfi/ui-dex/components/TokenAvatar";
import { formatShortAddress } from "@liberfi/ui-dex/libs/format";
import { useCallback, useMemo } from "react";
import BigNumber from "bignumber.js";

export type RedPacketClaimHistoryProps = {
  claim: RedPacketClaimDTO;
  token: Token;
};

export function RedPacketClaimHistory({ claim, token }: RedPacketClaimHistoryProps) {
  const appSdk = useAppSdk();

  const { t } = useTranslation();

  const { user } = useAuth();

  const self = useMemo(
    () => claim.creator === user?.solanaAddress,
    [claim.creator, user?.solanaAddress],
  );

  const amount = useMemo(
    () => new BigNumber(claim?.amount ?? 0).shiftedBy(-(token?.decimals ?? 0)).toNumber(),
    [claim?.amount, token?.decimals],
  );

  const handleRedPacketInfo = useCallback(() => {
    appSdk.events.emit("redpacket:view", { perspective: "received", redPacketId: claim.packetId });
  }, [claim, appSdk.events]);

  return (
    <div className="w-full h-[88px] py-2">
      <div
        className="w-full h-full bg-content1 rounded-lg px-4 py-3 flex flex-col justify-between cursor-pointer"
        onClick={handleRedPacketInfo}
      >
        {/* from user */}
        <div className="flex items-center justify-between">
          {/* from */}
          <p className="inline-flex items-center gap-2 text-xs">
            <span className="text-neutral">{t("extend.redpacket.histories.received.from")}</span>
            <span
              className="data-[self=true]:bg-primary data-[self=true]:rounded data-[self=true]:px-1 data-[self=true]:text-default data-[self=true]:font-medium"
              data-self={self}
            >
              {self ? t("extend.redpacket.histories.received.self") : formatShortAddress(claim.creator)}
            </span>
          </p>
          {/* time */}
          <p className="text-xs text-neutral">{new Date(claim.claimedAt).toLocaleString()}</p>
        </div>
        {/* red packet info */}
        <div className="flex items-center justify-between">
          {/* token */}
          <div className="flex items-center gap-4">
            <TokenAvatar src={token?.imageUrl ?? ""} name={token?.symbol ?? ""} size={24} />
            <p className="text-xs space-x-1">
              <span>{amount}</span>
              <span className="text-neutral">{token?.symbol ?? ""}</span>
            </p>
          </div>
          <ForwardOutlinedIcon className="text-neutral" />
        </div>
      </div>
    </div>
  );
}
