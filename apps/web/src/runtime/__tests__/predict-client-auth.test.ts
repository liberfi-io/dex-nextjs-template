import { createPredictWsClient } from "@liberfi.io/react-predict";
import { createAuthenticatedPredictWsClient } from "../createPredictClients";

jest.mock("@liberfi.io/react-predict", () => ({
  createPredictWsClient: jest.fn(),
  PredictClient: jest.fn(),
}));

const createWs = jest.mocked(createPredictWsClient);

describe("prediction WebSocket authentication", () => {
  const originalApiKey = process.env.NEXT_PUBLIC_PREDICT_API_KEY;

  afterEach(() => {
    jest.clearAllMocks();
    if (originalApiKey === undefined) delete process.env.NEXT_PUBLIC_PREDICT_API_KEY;
    else process.env.NEXT_PUBLIC_PREDICT_API_KEY = originalApiKey;
  });

  it("injects the application API key when no ticket provider is supplied", () => {
    process.env.NEXT_PUBLIC_PREDICT_API_KEY = "test-app-key";
    createAuthenticatedPredictWsClient({ wsUrl: "wss://example.test/ws", autoConnect: false });
    const config = createWs.mock.calls[0][0];
    expect(config.getTicket).toBeUndefined();
    expect(typeof config.apiKey === "function" ? config.apiKey() : config.apiKey).toBe("test-app-key");
  });

  it("preserves ticket authentication without also injecting an API key", () => {
    process.env.NEXT_PUBLIC_PREDICT_API_KEY = "test-app-key";
    const getTicket = jest.fn();
    const config = { wsUrl: "wss://example.test/ws", getTicket, autoConnect: false };
    createAuthenticatedPredictWsClient(config);
    expect(createWs).toHaveBeenCalledWith(config);
    expect(createWs.mock.calls[0][0]).not.toHaveProperty("apiKey");
  });
});
