import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { bottomNavigationBarActiveKeyAtom } from "@/states";

export function useSetBottomNavigationBarActiveKey(key: string) {
  const setBottomNavigationBarActiveKey = useSetAtom(bottomNavigationBarActiveKeyAtom);
  useEffect(() => {
    setBottomNavigationBarActiveKey(key);
  }, [setBottomNavigationBarActiveKey, key]);
}
