import { fetchDexToken } from "./fetchDexToken";

const markHomepageCriticalPathMock = jest.fn();

jest.mock("../performance/homepageCriticalPath", () => ({
  markHomepageCriticalPath: (...args: unknown[]) =>
    markHomepageCriticalPathMock(...args),
}));

describe("fetchDexToken", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    markHomepageCriticalPathMock.mockReset();
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: fetchMock,
    });
  });

  it("records the request boundary and the allowlisted server source", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "X-Dex-Token-Source": "l1" }),
      json: async () => ({ accessToken: "opaque-token" }),
    });

    await expect(fetchDexToken()).resolves.toBe("opaque-token");

    expect(markHomepageCriticalPathMock).toHaveBeenNthCalledWith(
      1,
      "dex_request_start",
    );
    expect(markHomepageCriticalPathMock).toHaveBeenNthCalledWith(
      2,
      "dex_request_end",
      expect.objectContaining({ source: "l1", status: 200 }),
    );
  });

  it("rejects a non-success response without exposing the server message", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        error: { code: "DEX_TOKEN_UNAVAILABLE" },
        message: "Auth0 domain and audience must stay private",
      }),
    });

    const request = fetchDexToken();

    await expect(request).rejects.toMatchObject({
      name: "DexTokenRequestError",
      code: "DEX_TOKEN_UNAVAILABLE",
      status: 503,
    });
    await expect(request).rejects.not.toThrow(/Auth0 domain|audience/);
  });

  it("rejects a successful response without a non-empty access token", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: "" }),
    });

    await expect(fetchDexToken()).rejects.toMatchObject({
      name: "DexTokenRequestError",
      code: "DEX_TOKEN_INVALID_RESPONSE",
      status: 200,
    });
  });

  it("classifies an invalid JSON response without leaking parser details", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected private upstream payload");
      },
    });

    const request = fetchDexToken();

    await expect(request).rejects.toMatchObject({
      name: "DexTokenRequestError",
      code: "DEX_TOKEN_INVALID_RESPONSE",
      status: 200,
    });
    await expect(request).rejects.not.toThrow(/private upstream payload/);
  });
});
