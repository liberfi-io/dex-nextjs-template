import { atom } from "jotai";
// import { atomWithStorage } from "jotai/utils";
import { Layout } from "./types";

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
