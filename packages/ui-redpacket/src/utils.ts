import { BigNumber } from "bignumber.js";
import { RedPacket } from "@chainstream-io/sdk";

export function getRedPacketStatus(redPacket: RedPacket) {
  if (
    new BigNumber(redPacket.claimedAmount ?? 0).gte(redPacket.totalAmount) ||
    (redPacket.claimedCount ?? 0) >= redPacket.maxClaims
  ) {
    return "finished";
  }
  if ((redPacket.expiredAt ?? 0) > Date.now()) {
    return "ongoing";
  }
  return "expired";
}
