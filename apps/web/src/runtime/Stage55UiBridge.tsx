"use client";

import { useMemo, type PropsWithChildren } from "react";
import { useTranslation } from "@liberfi.io/i18n";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useGenerateTweetMediaMemeMutation } from "@liberfi.io/ui-media-track";
import {
  LaunchpadUiProvider,
  type LaunchpadUiPorts,
} from "@liberfi.io/ui-launchpad";
import {
  RedpacketUiProvider,
  type RedpacketUiPorts,
} from "@liberfi.io/ui-redpacket";
import { toast } from "@liberfi.io/ui";
import { useAuthCallback, useConnectedWallet } from "@liberfi.io/wallet-connector";
import { asJsx } from "../application/jsx";
import { useUpload } from "../application/pinata";
import { browserAppSdk } from "../application/app-sdk";

const LaunchpadProvider = asJsx<PropsWithChildren<{ ports: LaunchpadUiPorts }>>(
  LaunchpadUiProvider,
);
const RedpacketProvider = asJsx<PropsWithChildren<{ ports: RedpacketUiPorts }>>(
  RedpacketUiProvider,
);
import { useChainAwareRouter } from "../hooks/useChainAwareRouter";
import { useStage55Adapters } from "./Stage55AdaptersProvider";

export function LaunchpadUiBridge({ children }: PropsWithChildren) {
  const adapters = useStage55Adapters();
  const { chain } = useCurrentChain();
  const wallet = useConnectedWallet(chain);
  const upload = useUpload();
  const { mutateAsync: generateAsync } = useGenerateTweetMediaMemeMutation();
  const requireAuth = useAuthCallback(async (action: () => Promise<void>) => {
    await action();
  });

  const ports = useMemo<LaunchpadUiPorts>(
    () => ({
      chain,
      requireAuth: (action) => requireAuth(action),
      uploadImage: upload,
      generateMeme: async (prompt) =>
        generateAsync({
          id: Date.now().toString(),
          type: "tweet",
          tweet: {
            tweetId: Date.now().toString(),
            type: "tweet",
            user: { username: "MagicLaunch" },
            content: { text: prompt },
            timestamp: Date.now(),
          },
        }),
      createRuntime: (onChange) =>
        adapters.launchpad.createRuntime({
          onChange,
          userAddress: wallet?.address,
          upload: {
            upload: async (intent) => intent.imageUri ?? "",
          },
          signer: {
            sign: async () => {
              if (!wallet) throw new Error("missing signer");
              return "signed";
            },
          },
        }),
      onCreated: (snapshot) => {
        if (snapshot.txHash) toast.success(snapshot.txHash);
      },
    }),
    [adapters.launchpad, chain, generateAsync, requireAuth, upload, wallet],
  );

  return <LaunchpadProvider ports={ports}>{children}</LaunchpadProvider>;
}

export function RedpacketUiBridge({ children }: PropsWithChildren) {
  const adapters = useStage55Adapters();
  const { chain } = useCurrentChain();
  const wallet = useConnectedWallet(chain);
  const router = useChainAwareRouter();
  const { t } = useTranslation();
  const requireAuth = useAuthCallback(async (action: () => Promise<void>) => {
    await action();
  });

  const ports = useMemo<RedpacketUiPorts>(
    () => ({
      chain,
      walletAddress: wallet?.address,
      requireAuth: (action) => requireAuth(action),
      navigate: (to) => {
        if (typeof to === "number") {
          if (to < 0) router.back();
          return;
        }
        router.push(to);
      },
      fetchPacket: adapters.redpacket.fetchPacket,
      listReceived: adapters.redpacket.listReceived,
      listSent: adapters.redpacket.listSent,
      createRuntime: (onChange) =>
        adapters.redpacket.createRuntime({
          onChange,
          signer: {
            sign: async () => {
              if (!wallet) throw new Error("missing signer");
              return "signed";
            },
          },
        }),
      shareUrl: adapters.redpacket.shareUrl,
      copyText: async (text) => {
        await browserAppSdk.copyToClipboard(text, t("redpacket.share.copy_claim_url"));
      },
    }),
    [adapters.redpacket, chain, requireAuth, router, t, wallet],
  );

  return <RedpacketProvider ports={ports}>{children}</RedpacketProvider>;
}
