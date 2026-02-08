import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { gql, GraphQLClient } from "graphql-request";
import { Mutation, UpdateTokenCollectionInput } from "./types";
import { useGraphQLClient } from "./GraphQLClientProvider";
import { QueryKeys } from "./queryKeys";

export const ADD_TOKEN_TO_COLLECTION_MUTATION = gql`
  mutation AddTokenToCollection($input: UpdateTokenCollectionInput!) {
    addTokenToCollection(input: $input) {
      success
    }
  }
`;

export async function addTokenToCollection(
  client: GraphQLClient,
  input: UpdateTokenCollectionInput,
) {
  const res = await client.request<Mutation>(ADD_TOKEN_TO_COLLECTION_MUTATION, { input });
  return res.addTokenToCollection.success;
}

export const useAddTokenToCollectionMutation = ({
  onSuccess,
  ...options
}: Omit<UseMutationOptions<boolean, Error, UpdateTokenCollectionInput>, "mutationFn"> = {}) => {
  const gqlClient = useGraphQLClient();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: UpdateTokenCollectionInput) => {
      return await addTokenToCollection(gqlClient, input);
    },
    onSuccess(data, variables, result, context) {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.tokenAddressesInCollection, variables.type],
      });
      onSuccess?.(data, variables, result, context);
    },
  });
};
