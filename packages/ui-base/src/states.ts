import { BehaviorSubject } from "rxjs";
import { atom } from "jotai";
// import { atomWithStorage } from "jotai/utils";
import { QueryClient, UseQueryResult } from "@tanstack/react-query";
import { ChainStreamClient, WalletBalancesDTO } from "@chainstream-io/sdk";
import { CHAIN_ID } from "@liberfi/core";
import { Layout } from "./types";

// queryClient for non-hooks usage
export const queryClientSubject = new BehaviorSubject<QueryClient | null>(null);

// dexClient for non-hooks usage
export const dexClientSubject = new BehaviorSubject<ChainStreamClient | null>(null);

// tick every second to hold the current timestamp
export const tickAtom = atom(new Date().getTime());

// current layout
export const layoutAtom = atom<Layout>("desktop");

// which layout should the header be hidden as screen shrinks
export const hideHeaderOnLayoutAtom = atom<Layout | null>(null);

// which layout should the bottom navigation bar be shown as screen shrinks
export const showBottomNavigationBarOnLayoutAtom = atom<Layout | null>(null);

// current bottom navigation bar active key
export const bottomNavigationBarActiveKeyAtom = atom<string>();

// current chain
export const chainAtom = atom(CHAIN_ID.SOLANA);

// latest wallet balances query state
export const walletBalancesQueryStateAtom = atom<Pick<
  UseQueryResult<WalletBalancesDTO>,
  "error" | "isLoading" | "isFetching" | "isRefetching" | "refetch"
> | null>(null);

// latest wallet balances, merged from query & subscription
export const walletBalancesAtom = atom<WalletBalancesDTO | null>(null);
