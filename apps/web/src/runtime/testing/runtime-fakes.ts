import { PredictWsLifecycleClient } from "../app-runtime.types";

export interface PredictWsLifecycleCounts {
  connectCount: number;
  disconnectCount: number;
  activeCount: number;
  maxActiveCount: number;
}

export function createPredictWsLifecycleFake(): {
  client: PredictWsLifecycleClient;
  counts(): PredictWsLifecycleCounts;
} {
  const counts: PredictWsLifecycleCounts = {
    connectCount: 0,
    disconnectCount: 0,
    activeCount: 0,
    maxActiveCount: 0,
  };

  return {
    client: {
      connect() {
        counts.connectCount += 1;
        counts.activeCount += 1;
        counts.maxActiveCount = Math.max(counts.maxActiveCount, counts.activeCount);
      },
      disconnect() {
        counts.disconnectCount += 1;
        counts.activeCount -= 1;
      },
    },
    counts() {
      return { ...counts };
    },
  };
}
