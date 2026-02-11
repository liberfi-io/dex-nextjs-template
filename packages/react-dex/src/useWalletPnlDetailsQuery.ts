import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, PnlDetailsPage } from "@chainstream-io/sdk";
import { CHAIN_ID } from "@liberfi/core";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { chainParam } from "./utils";

export async function fetchWalletPnlDetails(
  client: ChainStreamClient,
  chain: CHAIN_ID,
  walletAddress: string,
) {
  return await client.wallet.getPnlDetails(chainParam(chain), walletAddress, { limit: 100 });
}

export function useWalletPnlDetailsQuery(
  chain: CHAIN_ID,
  walletAddress: string,
  options: Omit<
    UseQueryOptions<PnlDetailsPage, Error, PnlDetailsPage, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.walletPnlDetails(chain, walletAddress),
    queryFn: async () => fetchWalletPnlDetails(client, chain, walletAddress),
    ...options,
  });
}
