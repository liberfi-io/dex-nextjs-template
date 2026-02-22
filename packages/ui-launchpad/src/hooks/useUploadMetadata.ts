import { createMintMetadataFile } from "../utils";
import { useUpload } from "@liberfi/ui-base";
import { useCallback } from "react";

export function useUploadMetadata() {
  const upload = useUpload();
  return useCallback(
    async (metadata: object) => {
      const file = createMintMetadataFile(metadata);
      const uri = await upload(file);
      return uri;
    },
    [upload],
  );
}
