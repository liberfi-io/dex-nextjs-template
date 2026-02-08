import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient } from "@chainstream-io/sdk";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";

export async function waitForJob<T = object>(
  client: ChainStreamClient,
  jobId: string,
  timeout: number = 600000,
) {
  return await client.waitForJob<T>(jobId, timeout);
}

/**
 * Subscribe to a job and wait for it to complete.
 * @param jobId - The ID of the job to subscribe to.
 * @param timeout - The wait timeout in milliseconds.
 * @param options - The react-query options.
 * @returns The result of the job.
 */
export function useJobSubscription<T = object>(
  jobId: string,
  timeout: number = 600000,
  options: Omit<UseQueryOptions<T, Error, T, string[]>, "queryKey" | "queryFn"> = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.jobSubscription(jobId),
    queryFn: async () => await waitForJob<T>(client, jobId, timeout),
    ...options,
  });
}
