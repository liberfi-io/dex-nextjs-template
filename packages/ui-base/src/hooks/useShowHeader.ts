import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { hideHeaderOnLayoutAtom } from "../states";

export function useShowHeader() {
  const setHideHeaderOnLayout = useSetAtom(hideHeaderOnLayoutAtom);
  useEffect(() => {
    setHideHeaderOnLayout(null);
  }, [setHideHeaderOnLayout]);
}
