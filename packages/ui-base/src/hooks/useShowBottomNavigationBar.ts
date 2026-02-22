import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { showBottomNavigationBarOnLayoutAtom } from "../states";
import { Layout } from "../types";

export function useShowBottomNavigationBar(layout: Layout = "mobile") {
  const setShowBottomNavigationBarOnLayout = useSetAtom(showBottomNavigationBarOnLayoutAtom);
  useEffect(() => {
    setShowBottomNavigationBarOnLayout(layout);
  }, [setShowBottomNavigationBarOnLayout, layout]);
}
