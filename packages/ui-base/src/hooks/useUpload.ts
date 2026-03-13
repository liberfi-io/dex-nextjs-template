import { usePinata } from "../providers";
import { fetchUploadPresign, useDexClient } from "@liberfi/react-dex";
import { useCallback } from "react";

export const useUpload = () => {
  const pinata = usePinata();
  const dexClient = useDexClient();

  const upload = useCallback(
    async (file: File) => {
      const presignResponse = await fetchUploadPresign(dexClient);
      const res = await pinata.upload.public.file(file).url(presignResponse.presignUrl);
      return `https://ipfs.io/ipfs/${res.cid}`;
    },
    [pinata, dexClient],
  );
  return upload;
};
