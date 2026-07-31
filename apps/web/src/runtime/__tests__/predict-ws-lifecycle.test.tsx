import { createPredictWsRouteLifecycle } from "../runtime-lifecycle-policy";
import { createPredictWsLifecycleFake } from "../testing/runtime-fakes";

describe("Predict WebSocket route lifecycle", () => {
  it("keeps at most one active connection during StrictMode replay", () => {
    const fake = createPredictWsLifecycleFake();
    const lifecycle = createPredictWsRouteLifecycle(fake.client);

    lifecycle.enter();
    lifecycle.leave();
    lifecycle.enter();

    expect(fake.counts()).toEqual({
      connectCount: 2,
      disconnectCount: 1,
      activeCount: 1,
      maxActiveCount: 1,
    });

    lifecycle.leave();
    expect(fake.counts().activeCount).toBe(0);
  });

  it("is a no-op while Predict WS is disabled", () => {
    const lifecycle = createPredictWsRouteLifecycle(null);

    expect(() => {
      lifecycle.enter();
      lifecycle.leave();
    }).not.toThrow();
  });
});
