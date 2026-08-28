import fs from "node:fs";
import path from "node:path";
import { createElement, type PropsWithChildren } from "react";
import { renderHook } from "@testing-library/react";
import type { ChainStreamClient } from "@chainstream-io/sdk";
import { LaunchPadPlatform } from "@liberfi.io/react-launchpad";
import { Chain } from "@liberfi.io/types";
import {
  createStage55Adapters,
  createStage55LaunchpadPorts,
  createStage55RedpacketPorts,
} from "../createStage55Adapters";
import {
  Stage55AdaptersProvider,
  useStage55Adapters,
} from "../Stage55AdaptersProvider";

const WEB_SRC = path.resolve(__dirname, "../..");

function readWebSrc(relativePath: string) {
  return fs.readFileSync(path.join(WEB_SRC, relativePath), "utf8");
}

const PRODUCTION_ENTRIES = [
  "components/Modals.tsx",
  "components/modals/LaunchPadModal.tsx",
  "components/TweetsLaunchButton.tsx",
  "components/NewAppLayout.tsx",
  "components/page/RedPacketLayout.tsx",
  "components/page/RedPacketHomePage.tsx",
  "components/page/RedPacketCreatePage.tsx",
  "components/page/RedPacketHistoriesPage.tsx",
  "app/(new)/redpacket/page.tsx",
  "app/(new)/redpacket/layout.tsx",
  "app/(new)/redpacket/create/page.tsx",
  "app/(new)/redpacket/histories/page.tsx",
] as const;

function fakeClient(overrides: {
  createToken?: jest.Mock;
  createRedpacket?: jest.Mock;
  claimRedpacket?: jest.Mock;
  redpacketSend?: jest.Mock;
} = {}): ChainStreamClient {
  return {
    dex: {
      createToken: overrides.createToken ?? jest.fn().mockResolvedValue({ serializedTx: "tx" }),
    },
    redPacket: {
      createRedpacket:
        overrides.createRedpacket ?? jest.fn().mockResolvedValue({ shareId: "share-1" }),
      claimRedpacket: overrides.claimRedpacket ?? jest.fn().mockResolvedValue({ ok: true }),
      redpacketSend: overrides.redpacketSend ?? jest.fn().mockResolvedValue({ ok: true }),
      getRedpacket: jest.fn().mockResolvedValue({
        id: "p1",
        shareId: "share-1",
        totalAmount: "10",
        maxClaims: 4,
        expiredAt: Date.now() + 60_000,
      }),
      getClaimsByAddress: jest.fn().mockResolvedValue({ records: [] }),
      getRedpacketsByAddress: jest.fn().mockResolvedValue({ records: [] }),
    },
  } as unknown as ChainStreamClient;
}

describe("createStage55LaunchpadPorts", () => {
  it("routes createToken through the application ChainStream client", async () => {
    const createToken = jest.fn().mockResolvedValue({ serializedTx: "signed-tx" });
    const client = fakeClient({ createToken });
    const ports = createStage55LaunchpadPorts(client);

    const result = await ports.createToken({
      chain: Chain.SOLANA,
      name: "Demo",
      symbol: "DEMO",
      platform: LaunchPadPlatform.PUMPFUN,
    });

    expect(createToken).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ serializedTx: "signed-tx" });
  });

  it("builds an unpublished SDK create runtime against ChainStream execution", async () => {
    const createToken = jest.fn().mockResolvedValue({ serializedTx: "signed-tx" });
    const ports = createStage55LaunchpadPorts(fakeClient({ createToken }));
    const snapshot = await ports.createRuntime({
      signer: { sign: async () => "sig" },
    }).submit({
      chain: Chain.SOLANA,
      name: "Demo",
      symbol: "DEMO",
      platform: LaunchPadPlatform.PUMPFUN,
    });

    expect(snapshot.status).toBe("succeeded");
    expect(snapshot.txHash).toBe("signed-tx");
    expect(createToken).toHaveBeenCalledTimes(1);
  });
});

describe("createStage55RedpacketPorts", () => {
  it("builds share URLs against the application origin", () => {
    const ports = createStage55RedpacketPorts(fakeClient(), "https://app.example.com");
    expect(ports.shareUrl("abc")).toBe("https://app.example.com/redpacket?share=abc");
  });

  it("delegates create/claim/send to the application ChainStream client", async () => {
    const createRedpacket = jest.fn().mockResolvedValue({ shareId: "s1" });
    const claimRedpacket = jest.fn().mockResolvedValue({ alreadyClaimed: false });
    const redpacketSend = jest.fn().mockResolvedValue({ tx: "sent" });
    const ports = createStage55RedpacketPorts(
      fakeClient({ createRedpacket, claimRedpacket, redpacketSend }),
      "https://app.example.com",
    );

    await ports.createFixed({
      chain: Chain.SOLANA,
      creator: "creator",
      mint: "mint",
      maxClaims: 2,
      fixedAmount: "1",
    });
    await ports.claim({
      chain: Chain.SOLANA,
      shareId: "s1",
      claimer: "claimer",
    });
    await ports.sendTransaction({
      chain: Chain.SOLANA,
    } as Parameters<typeof ports.sendTransaction>[0]);

    expect(createRedpacket).toHaveBeenCalledTimes(1);
    expect(claimRedpacket).toHaveBeenCalledTimes(1);
    expect(redpacketSend).toHaveBeenCalledTimes(1);
  });
});

describe("createStage55Adapters", () => {
  it("owns both domain ports from one ChainStream client", () => {
    const client = fakeClient();
    const adapters = createStage55Adapters({
      client,
      origin: "https://app.example.com",
    });
    expect(adapters.launchpad.createToken).toEqual(expect.any(Function));
    expect(adapters.redpacket.shareUrl("x")).toContain("/redpacket?share=x");
  });
});

describe("Stage55AdaptersProvider", () => {
  it("throws when adapters are read outside the provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useStage55Adapters())).toThrow(
      /must be used within Stage55AdaptersProvider/,
    );
    spy.mockRestore();
  });

  it("supplies the same shareUrl contract as createStage55Adapters", () => {
    const client = fakeClient();
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(
        Stage55AdaptersProvider,
        { client, origin: "https://app.example.com" },
        children,
      );
    const { result } = renderHook(() => useStage55Adapters(), { wrapper });
    expect(result.current.redpacket.shareUrl("z")).toBe(
      "https://app.example.com/redpacket?share=z",
    );
  });
});

describe("Stage 5.5 production wiring", () => {
  it("uploads launchpad images through the application Pinata adapter", () => {
    expect(readWebSrc("runtime/Stage55UiBridge.tsx")).toContain(
      'from "../application/pinata"',
    );
    expect(readWebSrc("runtime/Stage55UiBridge.tsx")).not.toContain("@liberfi/ui-base");
  });

  it("nests Stage55AdaptersProvider inside Stage54AdaptersProvider", () => {
    const source = readWebSrc("runtime/AppRuntimeProviders.tsx");
    const stage54 = source.indexOf("<Stage54AdaptersProvider");
    const stage55 = source.indexOf("<Stage55AdaptersProvider");
    const stage54Close = source.indexOf("</Stage54AdaptersProvider>");
    expect(stage54).toBeGreaterThan(-1);
    expect(stage55).toBeGreaterThan(stage54);
    expect(stage55).toBeLessThan(stage54Close);
  });

  it("keeps production launchpad/redpacket entries on unpublished SDK UI", () => {
    expect(readWebSrc("components/modals/LaunchPadModal.tsx")).toMatch(
      /@liberfi\.io\/ui-launchpad/,
    );
    expect(readWebSrc("components/page/RedPacketHomePage.tsx")).toMatch(
      /@liberfi\.io\/ui-redpacket/,
    );
    expect(readWebSrc("components/page/RedPacketLayout.tsx")).toMatch(
      /@liberfi\.io\/ui-redpacket/,
    );
    expect(readWebSrc("components/Modals.tsx")).not.toMatch(/@liberfi\/ui-launchpad/);
    for (const relativePath of PRODUCTION_ENTRIES) {
      expect(readWebSrc(relativePath)).not.toMatch(
        /@liberfi\/(?:ui-launchpad|ui-redpacket|react-launchpad|react-redpacket)/,
      );
    }
  });
});
