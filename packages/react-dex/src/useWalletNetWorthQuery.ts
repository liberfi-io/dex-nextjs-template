import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, WalletNetWorthPage } from "@chainstream-io/sdk";
import { CHAIN_ID } from "@liberfi/core";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { chainParam } from "./utils";

export async function fetchWalletNetWorth(
  client: ChainStreamClient,
  chain: CHAIN_ID,
  walletAddress: string,
) {
  return await client.wallet.getNetWorth(chainParam(chain), walletAddress, { limit: 100 });
}

export function useWalletNetWorthQuery(
  chain: CHAIN_ID,
  walletAddress: string,
  options: Omit<
    UseQueryOptions<WalletNetWorthPage, Error, WalletNetWorthPage, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.walletNetWorth(chain, walletAddress),
    queryFn: async () => fetchWalletNetWorth(client, chain, walletAddress),
    ...options,
  });
}
