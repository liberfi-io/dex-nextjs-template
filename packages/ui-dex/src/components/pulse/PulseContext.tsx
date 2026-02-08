import { createContext, PropsWithChildren, useContext, useState } from "react";

export type PulseContextType = {
  type: "new" | "final_stretch" | "migrated";
  setType: (type: "new" | "final_stretch" | "migrated") => void;
};

export const PulseContext = createContext<PulseContextType>({
  type: "new",
  setType: () => {},
});

export function PulseProvider({ children }: PropsWithChildren) {
  const [type, setType] = useState<"new" | "final_stretch" | "migrated">("new");
  return <PulseContext.Provider value={{ type, setType }}>{children}</PulseContext.Provider>;
}

export function usePulseContext() {
  return useContext(PulseContext);
}
