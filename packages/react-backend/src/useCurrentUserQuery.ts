import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { gql, GraphQLClient } from "graphql-request";
import { QueryKeys } from "./queryKeys";
import { Query, User } from "./types";
import { useGraphQLClient } from "./GraphQLClientProvider";

export const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      id
      ethereumAddress
      solanaAddress
      email
      phone
      username
      firstName
      lastName
      photoUrl
      languageCode
      idp
      metadata
      createdAt
    }
  }
`;

export async function fetchCurrentUser(client: GraphQLClient) {
  const res = await client.request<Query>(CURRENT_USER_QUERY);
  return res.currentUser;
}

export const useCurrentUserQuery = (
  options: Omit<UseQueryOptions<User, Error, User, string[]>, "queryKey" | "queryFn"> = {},
) => {
  const client = useGraphQLClient();
  return useQuery({
    ...options,
    queryKey: QueryKeys.currentUser(),
    queryFn: async () => {
      return await fetchCurrentUser(client);
    },
  });
};
