import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { gql, GraphQLClient } from "graphql-request";
import { QueryKeys } from "./queryKeys";
import { Mutation, UpdateTokenCollectionInput } from "./types";
import { useGraphQLClient } from "./GraphQLClientProvider";

export const REMOVE_TOKEN_FROM_COLLECTION_MUTATION = gql`
  mutation RemoveTokenFromCollection($input: UpdateTokenCollectionInput!) {
    removeTokenFromCollection(input: $input) {
      success
    }
  }
`;

export async function removeTokenFromCollection(
  client: GraphQLClient,
  input: UpdateTokenCollectionInput,
) {
  const res = await client.request<Mutation>(REMOVE_TOKEN_FROM_COLLECTION_MUTATION, { input });
  return res.removeTokenFromCollection.success;
}

export const useRemoveTokenFromCollectionMutation = ({
  onSuccess,
  ...options
}: Omit<UseMutationOptions<boolean, Error, UpdateTokenCollectionInput>, "mutationFn"> = {}) => {
  const qglClient = useGraphQLClient();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: UpdateTokenCollectionInput) => {
      return await removeTokenFromCollection(qglClient, input);
    },
    onSuccess(data, variables, result, context) {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.tokenAddressesInCollection(variables.type)],
      });
      onSuccess?.(data, variables, result, context);
    },
  });
};
