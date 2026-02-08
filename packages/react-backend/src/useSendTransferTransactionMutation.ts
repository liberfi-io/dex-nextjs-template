import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { gql, GraphQLClient } from "graphql-request";
import { Mutation, SendTransactionInput, SignedTransactionDto } from "./types";
import { useGraphQLClient } from "./GraphQLClientProvider";

export const SEND_TRANSACTION_MUTATION = gql`
  mutation SendTransaction($input: SendTransactionInput!) {
    sendTransaction(input: $input) {
      txSignature
    }
  }
`;

export async function sendTransaction(client: GraphQLClient, input: SendTransactionInput) {
  const res = await client.request<Mutation>(SEND_TRANSACTION_MUTATION, { input });
  return res.sendTransaction;
}

export const useSendTransferTransactionMutation = (
  options: Omit<
    UseMutationOptions<SignedTransactionDto, Error, SendTransactionInput>,
    "mutationFn"
  > = {},
) => {
  const client = useGraphQLClient();
  return useMutation({
    ...options,
    mutationFn: async (input: SendTransactionInput) => {
      return await sendTransaction(client, input);
    },
  });
};
