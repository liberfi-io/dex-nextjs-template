import { createContext, PropsWithChildren, useContext } from "react";

export type InstantBuyContextType = {
  amount?: number;
  preset?: number;
};

export const InstantBuyContext = createContext<InstantBuyContextType>({});

export function InstantBuyProvider({
  amount,
  preset,
  children,
}: PropsWithChildren<InstantBuyContextType>) {
  return (
    <InstantBuyContext.Provider value={{ amount, preset }}>{children}</InstantBuyContext.Provider>
  );
}

export function useInstantBuy() {
  return useContext(InstantBuyContext);
}
