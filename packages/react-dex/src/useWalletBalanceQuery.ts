import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, WalletBalancesDTO } from "@chainstream-io/sdk";
import { CHAIN_ID } from "@liberfi/core";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { chainParam } from "./utils";

export async function fetchWalletBalance(
  client: ChainStreamClient,
  chain: CHAIN_ID,
  walletAddress: string,
) {
  return await client.wallet.getBalance(chainParam(chain), walletAddress);
}

export function useWalletBalanceQuery(
  chain: CHAIN_ID,
  walletAddress: string,
  options: Omit<
    UseQueryOptions<WalletBalancesDTO, Error, WalletBalancesDTO, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.walletBalance(chain, walletAddress),
    queryFn: async () => fetchWalletBalance(client, chain, walletAddress),
    ...options,
  });
}
