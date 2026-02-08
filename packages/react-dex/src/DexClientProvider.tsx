import { createContext, PropsWithChildren, useContext } from "react";
import { ChainStreamClient } from "@chainstream-io/sdk";

export type DexClient = ChainStreamClient;

export const DexClientContext = createContext<ChainStreamClient>({} as ChainStreamClient);

export function DexClientProvider({ client, children }: PropsWithChildren<{ client: ChainStreamClient }>) {
  return <DexClientContext.Provider value={client}>{children}</DexClientContext.Provider>;
}

export function useDexClient() {
  const client = useContext(DexClientContext);
  if (!client) {
    throw new Error("useDexClient must be used within a DexClientProvider");
  }
  return client;
}
