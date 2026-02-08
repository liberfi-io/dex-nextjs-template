import { createContext, PropsWithChildren, useContext, useState } from "react";
import { BigNumber } from "bignumber.js";

export type PulseListContextType = {
  type: "new" | "final_stretch" | "migrated";
  layout: "wide" | "narrow";
  setLayout: (layout: "wide" | "narrow") => void;
  isScrolling: boolean;
  setIsScrolling: (isScrolling: boolean) => void;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  instantBuyAmount: BigNumber.Value | undefined;
  setInstantBuyAmount: (instantBuyAmount: BigNumber.Value | undefined) => void;
};

export const PulseListContext = createContext<PulseListContextType>({
  type: "new",
  layout: "wide",
  setLayout: () => {},
  isScrolling: false,
  setIsScrolling: () => {},
  isPaused: false,
  setIsPaused: () => {},
  instantBuyAmount: undefined,
  setInstantBuyAmount: () => {},
});

export type PulseListProviderProps = PropsWithChildren & {
  type: "new" | "final_stretch" | "migrated";
};

export function PulseListProvider({ type, children }: PulseListProviderProps) {
  const [layout, setLayout] = useState<"wide" | "narrow">("wide");
  const [isScrolling, setIsScrolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [instantBuyAmount, setInstantBuyAmount] = useState<BigNumber.Value | undefined>(undefined);
  return (
    <PulseListContext.Provider
      value={{
        type,
        layout,
        setLayout,
        isScrolling,
        setIsScrolling,
        isPaused,
        setIsPaused,
        instantBuyAmount,
        setInstantBuyAmount,
      }}
    >
      {children}
    </PulseListContext.Provider>
  );
}

export function usePulseListContext() {
  return useContext(PulseListContext);
}
