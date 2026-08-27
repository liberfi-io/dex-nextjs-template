import type { ChainStreamClient } from "@chainstream-io/sdk";
import { createToken, type CreateTokenParams } from "@liberfi/react-launchpad";
import {
  claimRedPacket,
  createFixedAmountRedPacket,
  createRandomAmountRedPacket,
  sendRedPacketTransaction,
  type ClaimRedPacketParams,
  type CreateFixedAmountRedPacketParams,
  type CreateRandomAmountRedPacketParams,
  type SendRedPacketTransactionParams,
} from "@liberfi/react-redpacket";

export type Stage55LaunchpadPorts = {
  createToken: (params: CreateTokenParams) => ReturnType<typeof createToken>;
};

export type Stage55RedpacketPorts = {
  createFixed: (
    params: CreateFixedAmountRedPacketParams,
  ) => ReturnType<typeof createFixedAmountRedPacket>;
  createRandom: (
    params: CreateRandomAmountRedPacketParams,
  ) => ReturnType<typeof createRandomAmountRedPacket>;
  claim: (params: ClaimRedPacketParams) => ReturnType<typeof claimRedPacket>;
  sendTransaction: (
    params: SendRedPacketTransactionParams,
  ) => ReturnType<typeof sendRedPacketTransaction>;
  shareUrl: (shareId: string) => string;
};

export type Stage55Adapters = {
  launchpad: Stage55LaunchpadPorts;
  redpacket: Stage55RedpacketPorts;
};

/**
 * Template-owned launchpad ports. ChainStream DTO stays in this
 * adapter. Unpublished SDK `createLaunchpadCreateRuntime` is not
 * imported until the Stage 5.5 package is consumed.
 */
export function createStage55LaunchpadPorts(
  client: ChainStreamClient,
): Stage55LaunchpadPorts {
  return {
    createToken: (params) => createToken(client, params),
  };
}

/**
 * Template-owned redpacket ports. Share URLs are built against the
 * application origin; signer/upload stay in existing widgets.
 */
export function createStage55RedpacketPorts(
  client: ChainStreamClient,
  origin: string,
): Stage55RedpacketPorts {
  return {
    createFixed: (params) => createFixedAmountRedPacket(client, params),
    createRandom: (params) => createRandomAmountRedPacket(client, params),
    claim: (params) => claimRedPacket(client, params),
    sendTransaction: (params) => sendRedPacketTransaction(client, params),
    shareUrl: (shareId) => {
      const url = new URL("/redpacket", origin);
      url.searchParams.set("share", shareId);
      return url.toString();
    },
  };
}

export function createStage55Adapters(input: {
  client: ChainStreamClient;
  origin: string;
}): Stage55Adapters {
  return {
    launchpad: createStage55LaunchpadPorts(input.client),
    redpacket: createStage55RedpacketPorts(input.client, input.origin),
  };
}
