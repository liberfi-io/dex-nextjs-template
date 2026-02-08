import { RedPacketSendTxInput } from "@chainstream-io/sdk";
import { CHAIN_ID } from "@liberfi/core";

export interface CreateFixedAmountRedPacketParams {
  chain: CHAIN_ID;
  creator: string;
  mint: string;
  maxClaims: number;
  fixedAmount: string;
  memo?: string;
  password?: string;
  claimAuthority?: string;
}

export interface CreateRandomAmountRedPacketParams {
  chain: CHAIN_ID;
  creator: string;
  mint: string;
  maxClaims: number;
  totalAmount: string;
  memo?: string;
  password?: string;
  claimAuthority?: string;
}

export interface ClaimRedPacketParams {
  chain: CHAIN_ID;
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
  chain: CHAIN_ID;
};
