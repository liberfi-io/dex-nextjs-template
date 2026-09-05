"use client";

import { useCallback } from "react";
import { useDexClient } from "@liberfi.io/react";

export type PinataUploadClient = {
  upload: {
    public: {
      file: (file: File) => {
        url: (signedUrl: string) => Promise<{ cid: string }>;
      };
    };
  };
};

export function createLazyPinataUploadClient(
  load: () => Promise<PinataUploadClient>,
): () => Promise<PinataUploadClient> {
  let clientPromise: Promise<PinataUploadClient> | undefined;

  return () => {
    clientPromise ??= load().catch((error) => {
      clientPromise = undefined;
      throw error;
    });
    return clientPromise;
  };
}

const getPinataUploadClient = createLazyPinataUploadClient(async () => {
  const { PinataSDK } = await import("pinata");
  return new PinataSDK({
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
  }) as unknown as PinataUploadClient;
});

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
  const { client } = useDexClient();

  return useCallback(
    async (file: File) => {
      const pinata = await getPinataUploadClient();
      return uploadFileToIpfs({
        file,
        getPresignedUploadUrl: () => client.getPresignedUploadUrl(),
        pinata,
      });
    },
    [client],
  );
}
