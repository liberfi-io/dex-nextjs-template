import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { gql, GraphQLClient } from "graphql-request";
import { QueryKeys } from "./queryKeys";
import { Query, TokensInCollectionInput } from "./types";
import { useGraphQLClient } from "./GraphQLClientProvider";

export const TOKENS_IN_COLLECTION_QUERY = gql`
  query TokensInCollection($input: TokensInCollectionInput!) {
    tokensInCollection(input: $input) {
      type
      tokenAddresses
    }
  }
`;

export async function fetchTokensInCollection(
  client: GraphQLClient,
  input: TokensInCollectionInput,
) {
  const res = await client.request<Query>(TOKENS_IN_COLLECTION_QUERY, { input });
  return res.tokensInCollection.tokenAddresses;
}

export const useTokenAddressesInCollectionQuery = (
  type: string,
  options: Omit<UseQueryOptions<string[], Error, string[], string[]>, "queryKey" | "queryFn"> = {},
) => {
  const client = useGraphQLClient();
  return useQuery({
    ...options,
    queryKey: QueryKeys.tokenAddressesInCollection(type),
    queryFn: async () => {
      return await fetchTokensInCollection(client, { type });
    },
  });
};
