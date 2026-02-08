import { createContext, PropsWithChildren, useContext } from "react";
import { PinataSDK } from "pinata";

export const PinataContext = createContext<PinataSDK>({} as PinataSDK);

export function PinataProvider({ client, children }: PropsWithChildren<{ client: PinataSDK }>) {
  return <PinataContext.Provider value={client}>{children}</PinataContext.Provider>;
}

export function usePinata() {
  const client = useContext(PinataContext);
  if (!client) {
    throw new Error("usePinata must be used within a PinataProvider");
  }
  return client;
}
