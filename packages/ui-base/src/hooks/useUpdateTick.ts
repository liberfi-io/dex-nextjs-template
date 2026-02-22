import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { tickAtom } from "../states";

export function useUpdateTick() {
  const setTick = useSetAtom(tickAtom);

  // update tick every second
  useEffect(() => {
    const interval = setInterval(() => setTick(new Date().getTime()), 1000);
    return () => clearInterval(interval);
  }, [setTick]);
}
