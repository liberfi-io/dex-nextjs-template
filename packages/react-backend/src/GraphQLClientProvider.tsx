import { createContext, PropsWithChildren, useContext } from "react";
import { GraphQLClient } from "graphql-request";

export const GraphQLClientContext = createContext<GraphQLClient>({} as GraphQLClient);

export function GraphQLClientProvider({
  client,
  children,
}: PropsWithChildren<{ client: GraphQLClient }>) {
  return <GraphQLClientContext.Provider value={client}>{children}</GraphQLClientContext.Provider>;
}

export function useGraphQLClient() {
  const client = useContext(GraphQLClientContext);
  if (!client) {
    throw new Error("useGraphQLClient must be used within a GraphQLClientProvider");
  }
  return client;
}
