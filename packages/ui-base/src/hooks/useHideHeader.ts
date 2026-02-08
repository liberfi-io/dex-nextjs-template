import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { hideHeaderOnLayoutAtom } from "@/states";
import { Layout } from "@/types";

export function useHideHeader(layout: Layout = "mobile") {
  const setHideHeaderOnLayout = useSetAtom(hideHeaderOnLayoutAtom);
  useEffect(() => {
    setHideHeaderOnLayout(layout);
  }, [setHideHeaderOnLayout, layout]);
}
