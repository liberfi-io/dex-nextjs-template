import { RedPacketSendTxInput } from "@chainstream-io/sdk";
import { Chain } from "@liberfi/core";

export interface CreateFixedAmountRedPacketParams {
  chain: Chain;
  creator: string;
  mint: string;
  maxClaims: number;
  fixedAmount: string;
  memo?: string;
  password?: string;
  claimAuthority?: string;
}

export interface CreateRandomAmountRedPacketParams {
  chain: Chain;
  creator: string;
  mint: string;
  maxClaims: number;
  totalAmount: string;
  memo?: string;
  password?: string;
  claimAuthority?: string;
}

export interface ClaimRedPacketParams {
  chain: Chain;
  shareId: string;
  password?: string;
  claimer: string;
}

export interface FetchWalletClaimsParams {
  address: string;
  cursor?: string;
  direction?: "next" | "prev";
  limit?: number;
}

export interface FetchRedPacketClaimsParams {
  redPacketId: string;
  cursor?: string;
  direction?: "next" | "prev";
  limit?: number;
}

export interface FetchWalletRedPacketsParams {
  address: string;
  cursor?: string;
  direction?: "next" | "prev";
  limit?: number;
}

export type SendRedPacketTransactionParams = RedPacketSendTxInput & {
  chain: Chain;
};
