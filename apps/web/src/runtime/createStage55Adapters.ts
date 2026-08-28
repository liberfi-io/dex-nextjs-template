import type { ChainStreamClient } from "@chainstream-io/sdk";
import { Chain } from "@liberfi.io/types";
import {
  createLaunchpadCreateRuntime,
  type CreateTokenIntent,
  type LaunchpadCreateRuntime,
  type LaunchpadSignerPort,
  type LaunchpadUploadPort,
} from "@liberfi.io/react-launchpad";
import {
  createRedpacketRuntime,
  type ClaimRedPacketIntent,
  type CreateFixedAmountRedPacketIntent,
  type CreateRandomAmountRedPacketIntent,
  type RedpacketCommand,
  type RedpacketSignerPort,
} from "@liberfi.io/react-redpacket";

function chainParam(chain: Chain): string {
  switch (chain) {
    case Chain.SOLANA:
      return "sol";
    case Chain.BINANCE:
      return "bsc";
    case Chain.ETHEREUM:
      return "eth";
    default:
      throw new Error("unsupported chain");
  }
}

export type Stage55SendTxParams = {
  chain: Chain;
} & Record<string, unknown>;

export type Stage55LaunchpadPorts = {
  createToken: (intent: CreateTokenIntent) => Promise<{ serializedTx?: string }>;
  createRuntime: (options?: {
    upload?: LaunchpadUploadPort;
    signer?: LaunchpadSignerPort;
  }) => LaunchpadCreateRuntime;
};

export type Stage55RedpacketPorts = {
  createFixed: (intent: CreateFixedAmountRedPacketIntent) => Promise<{ shareId?: string }>;
  createRandom: (intent: CreateRandomAmountRedPacketIntent) => Promise<{ shareId?: string }>;
  claim: (intent: ClaimRedPacketIntent) => Promise<{ alreadyClaimed?: boolean }>;
  sendTransaction: (params: Stage55SendTxParams) => Promise<unknown>;
  shareUrl: (shareId: string) => string;
  createRuntime: (options?: { signer?: RedpacketSignerPort }) => ReturnType<
    typeof createRedpacketRuntime
  >;
};

export type Stage55Adapters = {
  launchpad: Stage55LaunchpadPorts;
  redpacket: Stage55RedpacketPorts;
};

/**
 * Template-owned launchpad ports. ChainStream DTO stays here.
 * Unpublished `@liberfi.io/react-launchpad` is resolved via local-sdk
 * aliases until the package is published.
 */
export function createStage55LaunchpadPorts(
  client: ChainStreamClient,
): Stage55LaunchpadPorts {
  const createToken = async (intent: CreateTokenIntent) =>
    client.dex.createToken(chainParam(intent.chain), {
      name: intent.name,
      symbol: intent.symbol,
      imageUri: intent.imageUri,
    });

  return {
    createToken,
    createRuntime: (options = {}) =>
      createLaunchpadCreateRuntime({
        upload: options.upload,
        signer: options.signer,
        execution: {
          async submit(signed, intent) {
            void signed;
            const result = await createToken(intent);
            return { txHash: result.serializedTx ?? "tx" };
          },
        },
      }),
  };
}

/**
 * Template-owned redpacket ports. Share URLs use the application origin.
 * Unpublished `@liberfi.io/react-redpacket` is resolved via local-sdk.
 */
export function createStage55RedpacketPorts(
  client: ChainStreamClient,
  origin: string,
): Stage55RedpacketPorts {
  const createFixed = async (intent: CreateFixedAmountRedPacketIntent) =>
    client.redPacket.createRedpacket(chainParam(intent.chain), {
      creator: intent.creator,
      mint: intent.mint,
      maxClaims: intent.maxClaims,
      fixedAmount: intent.fixedAmount,
      memo: intent.memo,
      password: intent.password,
    });

  const createRandom = async (intent: CreateRandomAmountRedPacketIntent) =>
    client.redPacket.createRedpacket(chainParam(intent.chain), {
      creator: intent.creator,
      mint: intent.mint,
      maxClaims: intent.maxClaims,
      totalAmount: intent.totalAmount,
      memo: intent.memo,
      password: intent.password,
    });

  const claim = async (intent: ClaimRedPacketIntent) =>
    client.redPacket.claimRedpacket(chainParam(intent.chain), {
      shareId: intent.shareId,
      password: intent.password,
      claimer: intent.claimer,
    });

  const submitCommand = async (command: RedpacketCommand) => {
    if (command.kind === "create-fixed") {
      const result = await createFixed(command.intent);
      return { packetId: result.shareId ?? "packet" };
    }
    if (command.kind === "create-random") {
      const result = await createRandom(command.intent);
      return { packetId: result.shareId ?? "packet" };
    }
    const result = await claim(command.intent);
    return {
      packetId: command.intent.shareId,
      alreadyClaimed: result.alreadyClaimed,
    };
  };

  return {
    createFixed,
    createRandom,
    claim,
    sendTransaction: async ({ chain, ...rest }) =>
      client.redPacket.redpacketSend(chainParam(chain), rest),
    shareUrl: (shareId) => {
      const url = new URL("/redpacket", origin);
      url.searchParams.set("share", shareId);
      return url.toString();
    },
    createRuntime: (options = {}) =>
      createRedpacketRuntime({
        signer: options.signer,
        execution: {
          async submit(signed, command) {
            void signed;
            return submitCommand(command);
          },
        },
      }),
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
