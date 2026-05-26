import { createContext, PropsWithChildren, useContext } from "react";
import { GraphQLClient } from "graphql-request";

/**
 * Default context value is `null` (cast as the public type so consumers
 * keep a non-nullable `GraphQLClient`). A previous `{} as GraphQLClient`
 * default silently satisfied the `if (!client)` guard below — an empty
 * object is truthy — so a missing provider would only surface several
 * layers deep as `TypeError: client.request is not a function`. Using
 * `null` makes the guard actually fire and produces a clear, immediate
 * error message instead.
 */
export const GraphQLClientContext = createContext<GraphQLClient>(
  null as unknown as GraphQLClient,
);

export function GraphQLClientProvider({
  client,
  children,
}: PropsWithChildren<{ client: GraphQLClient }>) {
  return <GraphQLClientContext.Provider value={client}>{children}</GraphQLClientContext.Provider>;
}

export function useGraphQLClient() {
  const client = useContext(GraphQLClientContext);
  if (!client || typeof client.request !== "function") {
    throw new Error("useGraphQLClient must be used within a GraphQLClientProvider");
  }
  return client;
}
