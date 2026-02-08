import { ChainStreamClient } from "@chainstream-io/sdk";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";

export async function fetchUploadPresign(client: ChainStreamClient) {
  return await client.ipfs.presign();
}

export function useUploadPresignQuery(
  options: Omit<UseQueryOptions<string, Error, string, string[]>, "queryKey" | "queryFn"> = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.uploadPresign(),
    queryFn: async () => fetchUploadPresign(client),
    staleTime: 0,
    ...options,
  });
}
