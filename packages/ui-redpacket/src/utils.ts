import { BigNumber } from "bignumber.js";
import { RedPacketDTO } from "@chainstream-io/sdk";

export function getRedPacketStatus(redPacket: RedPacketDTO) {
  if (
    new BigNumber(redPacket.claimedAmount).gte(redPacket.totalAmount) ||
    redPacket.claimedCount >= redPacket.maxClaims
  ) {
    return "finished";
  }
  if (redPacket.expiredAt > Date.now()) {
    return "ongoing";
  }
  return "expired";
}
