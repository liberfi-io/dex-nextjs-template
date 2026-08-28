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
  redpacketRecordStatus,
  type ClaimRedPacketIntent,
  type CreateFixedAmountRedPacketIntent,
  type CreateRandomAmountRedPacketIntent,
  type RedpacketCommand,
  type RedpacketRecord,
  type RedpacketSignerPort,
} from "@liberfi.io/react-redpacket";

type DexChainParam = "sol" | "eth" | "bsc";

function chainParam(chain: Chain): DexChainParam {
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
    onChange?: (snapshot: import("@liberfi.io/react-launchpad").LaunchpadCreateSnapshot) => void;
  }) => LaunchpadCreateRuntime;
};

export type Stage55RedpacketPorts = {
  createFixed: (intent: CreateFixedAmountRedPacketIntent) => Promise<{ shareId?: string }>;
  createRandom: (intent: CreateRandomAmountRedPacketIntent) => Promise<{ shareId?: string }>;
  claim: (intent: ClaimRedPacketIntent) => Promise<{ alreadyClaimed?: boolean }>;
  sendTransaction: (params: Stage55SendTxParams) => Promise<unknown>;
  shareUrl: (shareId: string) => string;
  fetchPacket: (shareId: string) => Promise<RedpacketRecord>;
  listReceived: (address: string) => Promise<RedpacketRecord[]>;
  listSent: (address: string) => Promise<RedpacketRecord[]>;
  createRuntime: (options?: {
    signer?: RedpacketSignerPort;
    onChange?: (snapshot: import("@liberfi.io/react-redpacket").RedpacketSnapshot) => void;
  }) => ReturnType<typeof createRedpacketRuntime>;
};

function asRecord(raw: Record<string, unknown>): RedpacketRecord {
  const mapped = {
    id: String(raw.id ?? raw.shareId ?? ""),
    shareId: String(raw.shareId ?? raw.id ?? ""),
    totalAmount: String(raw.totalAmount ?? raw.amount ?? "0"),
    claimedAmount: raw.claimedAmount != null ? String(raw.claimedAmount) : undefined,
    claimedCount: raw.claimedCount != null ? Number(raw.claimedCount) : undefined,
    maxClaims: Number(raw.maxClaims ?? 0),
    memo: raw.memo != null ? String(raw.memo) : undefined,
    mint: raw.mint != null ? String(raw.mint) : undefined,
    creator: raw.creator != null ? String(raw.creator) : undefined,
    expiredAt: typeof raw.expiredAt === "number" ? raw.expiredAt : undefined,
    status: "ongoing" as const,
  };
  return { ...mapped, status: redpacketRecordStatus(mapped) };
}

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
      ...(intent.imageUri ? { imageUri: intent.imageUri } : {}),
    } as Parameters<ChainStreamClient["dex"]["createToken"]>[1]);

  return {
    createToken,
    createRuntime: (options = {}) =>
      createLaunchpadCreateRuntime({
        upload: options.upload,
        signer: options.signer,
        onChange: options.onChange,
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

  const claim = async (intent: ClaimRedPacketIntent) => {
    const result = await client.redPacket.claimRedpacket(chainParam(intent.chain), {
      shareId: intent.shareId,
      password: intent.password,
      claimer: intent.claimer,
    });
    return {
      alreadyClaimed: (result as { alreadyClaimed?: boolean }).alreadyClaimed,
    };
  };

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
      alreadyClaimed: (result as { alreadyClaimed?: boolean }).alreadyClaimed,
    };
  };

  return {
    createFixed,
    createRandom,
    claim,
    sendTransaction: async ({ chain, ...rest }) =>
      client.redPacket.redpacketSend(
        chainParam(chain),
        rest as unknown as Parameters<ChainStreamClient["redPacket"]["redpacketSend"]>[1],
      ),
    shareUrl: (shareId) => {
      const url = new URL("/redpacket", origin);
      url.searchParams.set("share", shareId);
      return url.toString();
    },
    fetchPacket: async (shareId) =>
      asRecord((await client.redPacket.getRedpacket(shareId)) as unknown as Record<string, unknown>),
    listReceived: async (address) => {
      const page = await client.redPacket.getClaimsByAddress(address, { limit: 50 });
      return ((page.records ?? []) as unknown as Array<Record<string, unknown>>).map(asRecord);
    },
    listSent: async (address) => {
      const page = await client.redPacket.getRedpacketsByAddress(address, { limit: 50 });
      return ((page.records ?? []) as unknown as Array<Record<string, unknown>>).map(asRecord);
    },
    createRuntime: (options = {}) =>
      createRedpacketRuntime({
        signer: options.signer,
        onChange: options.onChange,
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
