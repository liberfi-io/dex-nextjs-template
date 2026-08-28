"use client";

import { createContext, PropsWithChildren, useCallback, useContext } from "react";
import { useDexClient } from "@liberfi.io/react";
import { PinataSDK } from "pinata";

export type PinataUploadClient = {
  upload: {
    public: {
      file: (file: File) => {
        url: (signedUrl: string) => Promise<{ cid: string }>;
      };
    };
  };
};

const PinataContext = createContext<PinataSDK | null>(null);

export function PinataProvider({
  client,
  children,
}: PropsWithChildren<{ client: PinataSDK }>) {
  return <PinataContext.Provider value={client}>{children}</PinataContext.Provider>;
}

export function usePinata() {
  const client = useContext(PinataContext);
  if (!client) {
    throw new Error("usePinata must be used within a PinataProvider");
  }
  return client;
}

export async function uploadFileToIpfs(params: {
  file: File;
  getPresignedUploadUrl: () => Promise<string>;
  pinata: PinataUploadClient;
}): Promise<string> {
  const signedURL = await params.getPresignedUploadUrl();
  const res = await params.pinata.upload.public.file(params.file).url(signedURL);
  return `https://ipfs.io/ipfs/${res.cid}`;
}

export function useUpload() {
  const pinata = usePinata();
  const { client } = useDexClient();

  return useCallback(
    async (file: File) =>
      uploadFileToIpfs({
        file,
        getPresignedUploadUrl: () => client.getPresignedUploadUrl(),
        pinata,
      }),
    [client, pinata],
  );
}
