import { BehaviorSubject } from "rxjs";
import { atom } from "jotai";
// import { atomWithStorage } from "jotai/utils";
import { QueryClient, UseQueryResult } from "@tanstack/react-query";
import { ChainStreamClient, PnlDetailsPage, WalletNetWorthPage, WalletPnlSummaryDTO } from "@chainstream-io/sdk";
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

export const walletNetWorthQueryStateAtom = atom<Pick<
  UseQueryResult<WalletNetWorthPage>,
  "error" | "isLoading" | "isFetching" | "isRefetching" | "refetch"
> | null>(null);

export const walletPnlQueryStateAtom = atom<Pick<
  UseQueryResult<WalletPnlSummaryDTO>,
  "error" | "isLoading" | "isFetching" | "isRefetching" | "refetch"
> | null>(null);

export const walletPnlDetailsQueryStateAtom = atom<Pick<
  UseQueryResult<PnlDetailsPage>,
  "error" | "isLoading" | "isFetching" | "isRefetching" | "refetch"
> | null>(null);

export const walletNetWorthAtom = atom<WalletNetWorthPage | null>(null);

export const walletPnlAtom = atom<WalletPnlSummaryDTO | null>(null);

export const walletPnlDetailsAtom = atom<PnlDetailsPage | null>(null);
