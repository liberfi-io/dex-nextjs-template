import {
  FetchRedPacketClaimsParams,
  FetchWalletClaimsParams,
  FetchWalletRedPacketsParams,
} from "./types";

export const QueryKeys = {
  redPacket: (idOrShareId: string) => ["redPacket", idOrShareId],
  walletClaims: (params: FetchWalletClaimsParams) => [
    "walletClaims",
    params.address,
    params.cursor ?? "",
    params.limit ? `${params.limit}` : "",
    params.direction ?? "",
  ],
  redPacketClaims: (params: FetchRedPacketClaimsParams) => [
    "redPacketClaims",
    params.redPacketId,
    params.cursor ?? "",
    params.limit ? `${params.limit}` : "",
    params.direction ?? "",
  ],
  walletRedPackets: (params: FetchWalletRedPacketsParams) => [
    "walletRedPackets",
    params.address,
    params.cursor ?? "",
    params.limit ? `${params.limit}` : "",
    params.direction ?? "",
  ],
};
