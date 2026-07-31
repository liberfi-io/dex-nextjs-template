import { renderHook } from "@testing-library/react";
import { usePredictWsRouteLifecycle } from "../usePredictWsRouteLifecycle";

describe("usePredictWsRouteLifecycle", () => {
  it("connects on mount and disconnects on unmount", () => {
    const client = {
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    const { unmount } = renderHook(() => usePredictWsRouteLifecycle(client));
    expect(client.connect).toHaveBeenCalledTimes(1);

    unmount();
    expect(client.disconnect).toHaveBeenCalledTimes(1);
  });

  it("does nothing when prediction WebSocket is disabled", () => {
    expect(() => {
      const { unmount } = renderHook(() => usePredictWsRouteLifecycle(null));
      unmount();
    }).not.toThrow();
  });
});
