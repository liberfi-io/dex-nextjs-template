import { useCallback } from "react";
import { toast } from "react-hot-toast";
import { TimerToast, TimerToastProps } from "../components";

export function useTimerToast() {
  return useCallback(
    (options: TimerToastProps) =>
      toast.custom(() => <TimerToast {...options} />, {
        id: options.id,
        duration: options.duration,
      }),
    [],
  );
}
