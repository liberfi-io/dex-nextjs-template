"use client";

import { useEffect } from "react";
import { atom, useAtomValue, useSetAtom } from "jotai";

export type ShellLayout = "desktop" | "tablet" | "mobile";

export type HeaderNavigationKey =
  | "discover"
  | "pulse"
  | "perpetuals"
  | "predict"
  | "portfolio";

const hideHeaderOnLayoutAtom = atom<ShellLayout | null>(null);
const showBottomNavigationBarOnLayoutAtom = atom<ShellLayout | null>("mobile");
const bottomNavigationBarActiveKeyAtom = atom<string | undefined>(undefined);

export function resolveHeaderNavigationKey(
  pathname: string,
  tokenDetailSource?: string | null,
): HeaderNavigationKey {
  if (pathname.startsWith("/tokens") && tokenDetailSource === "pulse") {
    return "pulse";
  }
  if (pathname.startsWith("/pulse")) return "pulse";
  if (pathname.startsWith("/perpetuals")) return "perpetuals";
  if (pathname.startsWith("/predict")) return "predict";
  if (pathname.startsWith("/portfolio")) return "portfolio";
  return "discover";
}

export function headerVisibleFromHide(
  hide: ShellLayout | null,
): ShellLayout[] {
  if (hide === "desktop") return [];
  if (hide === "tablet") return ["desktop"];
  if (hide === "mobile") return ["desktop", "tablet"];
  return ["desktop", "tablet", "mobile"];
}

export function footerVisibleFromShow(
  show: ShellLayout | null,
): ShellLayout[] {
  if (show === "desktop") return ["desktop", "tablet", "mobile"];
  if (show === "tablet") return ["tablet", "mobile"];
  if (show === "mobile") return ["mobile"];
  return [];
}

export function useShellChrome() {
  const hideHeader = useAtomValue(hideHeaderOnLayoutAtom);
  const showFooter = useAtomValue(showBottomNavigationBarOnLayoutAtom);
  return {
    headerVisible: headerVisibleFromHide(hideHeader),
    footerVisible: footerVisibleFromShow(showFooter),
  };
}

export function useHideHeader(layout: ShellLayout = "mobile") {
  const setHideHeaderOnLayout = useSetAtom(hideHeaderOnLayoutAtom);
  useEffect(() => {
    setHideHeaderOnLayout(layout);
    return () => setHideHeaderOnLayout(null);
  }, [layout, setHideHeaderOnLayout]);
}

export function useShowHeader() {
  const setHideHeaderOnLayout = useSetAtom(hideHeaderOnLayoutAtom);
  useEffect(() => {
    setHideHeaderOnLayout(null);
  }, [setHideHeaderOnLayout]);
}

export function useHideBottomNavigationBar() {
  const setShowFooter = useSetAtom(showBottomNavigationBarOnLayoutAtom);
  useEffect(() => {
    setShowFooter(null);
    return () => setShowFooter("mobile");
  }, [setShowFooter]);
}

export function useShowBottomNavigationBar(layout: ShellLayout = "mobile") {
  const setShowFooter = useSetAtom(showBottomNavigationBarOnLayoutAtom);
  useEffect(() => {
    setShowFooter(layout);
    return () => setShowFooter("mobile");
  }, [layout, setShowFooter]);
}

export function useSetBottomNavigationBarActiveKey(key: string) {
  const setActiveKey = useSetAtom(bottomNavigationBarActiveKeyAtom);
  useEffect(() => {
    setActiveKey(key);
    return () => setActiveKey(undefined);
  }, [key, setActiveKey]);
}
