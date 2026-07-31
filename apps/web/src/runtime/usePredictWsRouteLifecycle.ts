import { useEffect, useMemo } from "react";
import { PredictWsLifecycleClient } from "./app-runtime.types";
import { createPredictWsRouteLifecycle } from "./runtime-lifecycle-policy";

export function usePredictWsRouteLifecycle(client: PredictWsLifecycleClient | null): void {
  const lifecycle = useMemo(() => createPredictWsRouteLifecycle(client), [client]);

  useEffect(() => {
    lifecycle.enter();
    return () => lifecycle.leave();
  }, [lifecycle]);
}
