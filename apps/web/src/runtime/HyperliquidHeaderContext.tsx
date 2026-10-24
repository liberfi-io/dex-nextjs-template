"use client";

import { createContext, useContext } from "react";

export interface HyperliquidHeaderState {
  evmAddress?: string;
  perpUsdc: string;
  availableMargin: number;
  accountValue: number;
}

export const HyperliquidHeaderContext =
  createContext<HyperliquidHeaderState | null>(null);

export function useHyperliquidHeaderState(): HyperliquidHeaderState {
  const state = useContext(HyperliquidHeaderContext);
  if (!state) {
    throw new Error(
      "useHyperliquidHeaderState must be used within PerpetualsRuntimeProviders",
    );
  }
  return state;
}
