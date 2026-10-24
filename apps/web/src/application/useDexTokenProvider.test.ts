import { act, renderHook, waitFor } from "@testing-library/react";
import { useDexTokenProvider } from "./useDexTokenProvider";

const fetchDexTokenMock = jest.fn();
const markHomepageCriticalPathMock = jest.fn();

jest.mock("./auth/fetchDexToken", () => ({
  ...jest.requireActual("./auth/fetchDexToken"),
  fetchDexToken: (...args: unknown[]) => fetchDexTokenMock(...args),
}));

jest.mock("./performance/homepageCriticalPath", () => ({
  markHomepageCriticalPath: (...args: unknown[]) =>
    markHomepageCriticalPathMock(...args),
}));

function createLoader(token: string | null = null) {
  let storedToken = token;
  return {
    get: jest.fn(async () => storedToken),
    set: jest.fn(async (nextToken: string) => {
      storedToken = nextToken;
    }),
    remove: jest.fn(async () => {
      storedToken = null;
    }),
  };
}

function createJwt(expiresAtSeconds: number) {
  const payload = Buffer.from(
    JSON.stringify({ exp: expiresAtSeconds }),
  ).toString("base64url");
  return `header.${payload}.signature`;
}

describe("useDexTokenProvider", () => {
  beforeEach(() => {
    fetchDexTokenMock.mockReset();
    markHomepageCriticalPathMock.mockReset();
  });

  it("rejects every waiter when the shared token request fails", async () => {
    let rejectRequest: ((reason: Error) => void) | undefined;
    fetchDexTokenMock.mockReturnValue(
      new Promise<string>((_resolve, reject) => {
        rejectRequest = reject;
      }),
    );
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const loader = createLoader();
    const { result, unmount } = renderHook(() => useDexTokenProvider(loader));

    const waiters = Array.from({ length: 3 }, () => result.current.getToken());
    const allWaiters = Promise.all(waiters);
    const rejection = expect(allWaiters).rejects.toThrow("Auth0 unavailable");
    await waitFor(() => expect(fetchDexTokenMock).toHaveBeenCalledTimes(1));

    rejectRequest?.(new Error("Auth0 unavailable"));

    await rejection;
    expect(markHomepageCriticalPathMock).toHaveBeenCalledWith(
      "get_token_reject",
      expect.objectContaining({ source: "unknown" }),
    );
    unmount();
    consoleSpy.mockRestore();
  });

  it("starts a new request after a failed shared request", async () => {
    let rejectRequest: ((reason: Error) => void) | undefined;
    const recoveredToken = createJwt(Math.floor(Date.now() / 1000) + 3_600);
    fetchDexTokenMock
      .mockReturnValueOnce(
        new Promise<string>((_resolve, reject) => {
          rejectRequest = reject;
        }),
      )
      .mockResolvedValueOnce(recoveredToken);
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const loader = createLoader();
    const { result, unmount } = renderHook(() => useDexTokenProvider(loader));
    const firstRequest = result.current.getToken();
    const firstRejection = expect(firstRequest).rejects.toThrow("first failure");
    await waitFor(() => expect(fetchDexTokenMock).toHaveBeenCalledTimes(1));

    rejectRequest?.(new Error("first failure"));
    await firstRejection;

    await expect(result.current.getToken()).resolves.toBe(recoveredToken);
    expect(fetchDexTokenMock).toHaveBeenCalledTimes(2);
    expect(loader.set).toHaveBeenCalledTimes(1);
    unmount();
    consoleSpy.mockRestore();
  });

  it("shares one request across concurrent successful callers", async () => {
    let resolveRequest: ((token: string) => void) | undefined;
    const token = createJwt(Math.floor(Date.now() / 1000) + 3_600);
    fetchDexTokenMock.mockReturnValue(
      new Promise<string>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const loader = createLoader();
    const { result, unmount } = renderHook(() => useDexTokenProvider(loader));
    const requests = Array.from({ length: 10 }, () => result.current.getToken());
    await waitFor(() => expect(fetchDexTokenMock).toHaveBeenCalledTimes(1));

    resolveRequest?.(token);

    await expect(Promise.all(requests)).resolves.toEqual(
      Array.from({ length: 10 }, () => token),
    );
    expect(loader.set).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("starts the shared request with an abort signal", async () => {
    fetchDexTokenMock.mockResolvedValue(
      createJwt(Math.floor(Date.now() / 1000) + 3_600),
    );
    const loader = createLoader();
    const { unmount } = renderHook(() => useDexTokenProvider(loader));

    await act(async () => {
      await Promise.resolve();
    });

    expect(fetchDexTokenMock).toHaveBeenCalledTimes(1);
    expect(fetchDexTokenMock.mock.calls[0]?.[0]).toBeInstanceOf(AbortSignal);
    unmount();
  });

  it("aborts and rejects a shared request after three seconds", async () => {
    jest.useFakeTimers();
    fetchDexTokenMock.mockImplementation((signal: AbortSignal) => {
      return new Promise<string>((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      });
    });
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const loader = createLoader();
    const { result, unmount } = renderHook(() => useDexTokenProvider(loader));
    const request = result.current.getToken();
    const rejection = expect(request).rejects.toMatchObject({
      name: "AbortError",
    });

    await act(async () => {
      await Promise.resolve();
    });
    expect(fetchDexTokenMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(3_000);
      await Promise.resolve();
    });

    await rejection;
    expect(jest.getTimerCount()).toBe(0);
    unmount();
    consoleSpy.mockRestore();
    jest.useRealTimers();
  });

  it("aborts the pending request and clears its timer on unmount", async () => {
    jest.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    fetchDexTokenMock.mockImplementation((signal: AbortSignal) => {
      requestSignal = signal;
      return new Promise<string>((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      });
    });
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const loader = createLoader();
    const { result, unmount } = renderHook(() => useDexTokenProvider(loader));
    const request = result.current.getToken();
    const rejection = expect(request).rejects.toMatchObject({
      name: "AbortError",
    });
    await act(async () => {
      await Promise.resolve();
    });

    unmount();

    await rejection;
    expect(requestSignal?.aborted).toBe(true);
    expect(jest.getTimerCount()).toBe(0);
    consoleSpy.mockRestore();
    jest.useRealTimers();
  });

  it("removes an unreadable stored token before requesting a replacement", async () => {
    const replacement = createJwt(Math.floor(Date.now() / 1000) + 3_600);
    fetchDexTokenMock.mockResolvedValue(replacement);
    const loader = createLoader("not-a-jwt");
    const { result, unmount } = renderHook(() => useDexTokenProvider(loader));

    await expect(result.current.getToken()).resolves.toBe(replacement);

    expect(loader.remove).toHaveBeenCalled();
    expect(fetchDexTokenMock).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("does not return a newly fetched token inside the expiry safety window", async () => {
    const expiringToken = createJwt(Math.floor(Date.now() / 1000) + 120);
    fetchDexTokenMock.mockResolvedValue(expiringToken);
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const loader = createLoader();
    const { result, unmount } = renderHook(() => useDexTokenProvider(loader));

    await expect(result.current.getToken()).rejects.toThrow(
      "DEX_TOKEN_EXPIRES_TOO_SOON",
    );
    expect(loader.set).not.toHaveBeenCalled();
    unmount();
    consoleSpy.mockRestore();
  });

  it("returns a stored token that remains outside the expiry safety window", async () => {
    const storedToken = createJwt(Math.floor(Date.now() / 1000) + 3_600);
    const loader = createLoader(storedToken);
    const { result, unmount } = renderHook(() => useDexTokenProvider(loader));

    await expect(result.current.getToken()).resolves.toBe(storedToken);

    expect(fetchDexTokenMock).not.toHaveBeenCalled();
    expect(loader.remove).not.toHaveBeenCalled();
    expect(markHomepageCriticalPathMock).toHaveBeenCalledWith(
      "get_token_resolve",
      expect.objectContaining({ source: "cookie" }),
    );
    unmount();
  });

  it("replaces a stored token inside the five-minute safety window", async () => {
    const storedToken = createJwt(Math.floor(Date.now() / 1000) + 299);
    const replacement = createJwt(Math.floor(Date.now() / 1000) + 3_600);
    fetchDexTokenMock.mockResolvedValue(replacement);
    const loader = createLoader(storedToken);
    const { result, unmount } = renderHook(() => useDexTokenProvider(loader));

    await expect(result.current.getToken()).resolves.toBe(replacement);

    expect(loader.remove).toHaveBeenCalled();
    expect(fetchDexTokenMock).toHaveBeenCalledTimes(1);
    unmount();
  });
});
