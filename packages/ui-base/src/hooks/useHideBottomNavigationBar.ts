import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { showBottomNavigationBarOnLayoutAtom } from "../states";

export function useHideBottomNavigationBar() {
  const setShowBottomNavigationBarOnLayout = useSetAtom(showBottomNavigationBarOnLayoutAtom);
  useEffect(() => {
    setShowBottomNavigationBarOnLayout(null);
  }, [setShowBottomNavigationBarOnLayout]);
}
