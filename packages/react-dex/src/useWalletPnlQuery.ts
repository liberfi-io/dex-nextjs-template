import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChainStreamClient, WalletPnlSummaryDTO } from "@chainstream-io/sdk";
import { Chain } from "@liberfi/core";
import { useDexClient } from "./DexClientProvider";
import { QueryKeys } from "./queryKeys";
import { chainParam } from "./utils";

export async function fetchWalletPnl(
  client: ChainStreamClient,
  chain: Chain,
  walletAddress: string,
) {
  return await client.wallet.getPnl(chainParam(chain), walletAddress);
}

export function useWalletPnlQuery(
  chain: Chain,
  walletAddress: string,
  options: Omit<
    UseQueryOptions<WalletPnlSummaryDTO, Error, WalletPnlSummaryDTO, string[]>,
    "queryKey" | "queryFn"
  > = {},
) {
  const client = useDexClient();
  return useQuery({
    queryKey: QueryKeys.walletPnl(chain, walletAddress),
    queryFn: async () => fetchWalletPnl(client, chain, walletAddress),
    ...options,
  });
}
