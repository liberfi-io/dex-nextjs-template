import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { gql, GraphQLClient } from "graphql-request";
import { CreateTransactionInput, Mutation, UnsignedTransactionDto } from "./types";
import { useGraphQLClient } from "./GraphQLClientProvider";

export const CREATE_TRANSFER_TRANSACTION_MUTATION = gql`
  mutation CreateTransferTransaction($input: CreateTransactionInput!) {
    createTransferTransaction(input: $input) {
      amount
      destinationAddress
      estimatedFee
      mintAddress
      serializedTx
      sourceAddress
    }
  }
`;

export async function createTransferTransaction(
  client: GraphQLClient,
  input: CreateTransactionInput,
) {
  const res = await client.request<Mutation>(CREATE_TRANSFER_TRANSACTION_MUTATION, { input });
  return res.createTransferTransaction;
}

export const useCreateTransferTransactionMutation = (
  options: Omit<
    UseMutationOptions<UnsignedTransactionDto, Error, CreateTransactionInput>,
    "mutationFn"
  > = {},
) => {
  const client = useGraphQLClient();
  return useMutation({
    ...options,
    mutationFn: async (input: CreateTransactionInput) => {
      return await createTransferTransaction(client, input);
    },
  });
};
