const mockClientCredentialsGrant = jest.fn();
const originalDexAudience = process.env.DEX_AUTH0_AUDIENCE;

jest.mock("next/server", () => ({
  NextResponse: {
    json: (
      body: unknown,
      init?: { status?: number; headers?: Record<string, string> },
    ) => ({
      status: init?.status ?? 200,
      headers: new Headers(init?.headers),
      json: async () => body,
    }),
  },
}));

jest.mock("../../../../libs/auth0Client", () => ({
  auth0Client: {
    oauth: {
      clientCredentialsGrant: (...args: unknown[]) =>
        mockClientCredentialsGrant(...args),
    },
  },
}));

async function loadPost() {
  const route = await import("./route");
  return route.POST;
}

async function readJson(response: { json(): Promise<unknown> }) {
  return (await response.json()) as {
    accessToken?: string;
    error?: { code: string };
  };
}

describe("POST /api/auth/dex", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-05T00:00:00.000Z"));
    mockClientCredentialsGrant.mockReset();
    process.env.DEX_AUTH0_AUDIENCE = "https://dex.test.example";
    jest.spyOn(console, "info").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    if (originalDexAudience === undefined) {
      Reflect.deleteProperty(process.env, "DEX_AUTH0_AUDIENCE");
    } else {
      process.env.DEX_AUTH0_AUDIENCE = originalDexAudience;
    }
  });

  it("shares one grant across concurrent requests", async () => {
    let resolveGrant: ((value: unknown) => void) | undefined;
    mockClientCredentialsGrant.mockReturnValue(
      new Promise((resolve) => {
        resolveGrant = resolve;
      }),
    );
    const POST = await loadPost();

    const responsesPromise = Promise.all(
      Array.from({ length: 10 }, () => POST({} as never)),
    );
    expect(mockClientCredentialsGrant).toHaveBeenCalledTimes(1);

    resolveGrant?.({
      data: { access_token: "shared-token", expires_in: 3600 },
    });
    const responses = await responsesPromise;

    await expect(Promise.all(responses.map(readJson))).resolves.toEqual(
      Array.from({ length: 10 }, () => ({ accessToken: "shared-token" })),
    );
  });

  it("reuses a token until the five-minute safety window begins", async () => {
    mockClientCredentialsGrant
      .mockResolvedValueOnce({
        data: { access_token: "first-token", expires_in: 600 },
      })
      .mockResolvedValueOnce({
        data: { access_token: "second-token", expires_in: 600 },
      });
    const POST = await loadPost();

    const first = await POST({} as never);
    expect(await readJson(first)).toEqual({
      accessToken: "first-token",
    });
    expect(first.headers.get("x-dex-token-source")).toBe("grant");
    jest.advanceTimersByTime(299_999);
    const cached = await POST({} as never);
    expect(await readJson(cached)).toEqual({
      accessToken: "first-token",
    });
    expect(cached.headers.get("x-dex-token-source")).toBe("l1");
    expect(cached.headers.get("server-timing")).toContain(
      'dex-token;desc="l1"',
    );
    jest.advanceTimersByTime(1);
    const refreshed = await POST({} as never);
    expect(await readJson(refreshed)).toEqual({
      accessToken: "second-token",
    });
    expect(refreshed.headers.get("cache-control")).toBe("private, no-store");
    expect(refreshed.headers.get("server-timing")).toContain(
      'dex-token;desc="grant"',
    );
    expect(refreshed.headers.get("x-dex-token-source")).toBe("grant");
    expect(mockClientCredentialsGrant).toHaveBeenCalledTimes(2);
  });

  it("returns a retryable fixed error without leaking upstream details", async () => {
    const sensitiveError =
      "Auth0 unavailable at tenant.example.com for https://dex.example.com with fake-token-value";
    mockClientCredentialsGrant
      .mockRejectedValueOnce(new Error(sensitiveError))
      .mockResolvedValueOnce({
        data: { access_token: "recovered-token", expires_in: 3600 },
      });
    const POST = await loadPost();

    const failed = await POST({} as never);
    expect(failed.status).toBe(503);
    const failedBody = await readJson(failed);
    expect(failedBody).toEqual({
      error: { code: "DEX_TOKEN_UNAVAILABLE" },
    });
    expect(JSON.stringify(failedBody)).not.toContain(sensitiveError);
    expect(JSON.stringify(failedBody)).not.toContain("tenant.example.com");
    expect(JSON.stringify(failedBody)).not.toContain("https://dex.example.com");
    expect(JSON.stringify(failedBody)).not.toContain("fake-token-value");
    const serializedLogs = JSON.stringify(
      (console.error as jest.Mock).mock.calls,
    );
    expect(serializedLogs).toContain("DEX_TOKEN_UNAVAILABLE");
    expect(serializedLogs).not.toContain(sensitiveError);
    expect(serializedLogs).not.toContain("tenant.example.com");
    expect(serializedLogs).not.toContain("https://dex.example.com");
    expect(serializedLogs).not.toContain("fake-token-value");

    const recovered = await POST({} as never);
    expect(recovered.status).toBe(200);
    expect(await readJson(recovered)).toEqual({
      accessToken: "recovered-token",
    });
    expect(mockClientCredentialsGrant).toHaveBeenCalledTimes(2);
  });

  it("returns a non-retryable fixed error for an invalid grant payload", async () => {
    mockClientCredentialsGrant.mockResolvedValueOnce({
      data: { access_token: "", expires_in: 3600 },
    });
    const POST = await loadPost();

    const failed = await POST({} as never);

    expect(failed.status).toBe(500);
    expect(await readJson(failed)).toEqual({
      error: { code: "DEX_TOKEN_INTERNAL" },
    });
  });

  it.each([
    [429, 503, "DEX_TOKEN_UNAVAILABLE"],
    [502, 503, "DEX_TOKEN_UNAVAILABLE"],
    [401, 500, "DEX_TOKEN_INTERNAL"],
  ] as const)(
    "maps upstream status %s to HTTP %s and %s",
    async (upstreamStatus, expectedStatus, expectedCode) => {
      mockClientCredentialsGrant.mockRejectedValueOnce(
        Object.assign(new Error("private upstream diagnostics"), {
          statusCode: upstreamStatus,
        }),
      );
      const POST = await loadPost();

      const failed = await POST({} as never);

      expect(failed.status).toBe(expectedStatus);
      expect(await readJson(failed)).toEqual({
        error: { code: expectedCode },
      });
      expect((console.error as jest.Mock).mock.calls.at(-1)?.[1]).toMatchObject({
        errorCategory: expectedCode,
        upstreamStatus,
        status: expectedStatus,
      });
    },
  );

  it("returns an internal error when the audience configuration is missing", async () => {
    Reflect.deleteProperty(process.env, "DEX_AUTH0_AUDIENCE");
    const POST = await loadPost();

    const failed = await POST({} as never);

    expect(failed.status).toBe(500);
    expect(await readJson(failed)).toEqual({
      error: { code: "DEX_TOKEN_INTERNAL" },
    });
    expect(mockClientCredentialsGrant).not.toHaveBeenCalled();
  });

  it("uses the JWT expiry when expires_in is absent", async () => {
    const expiresAtSeconds = Math.floor(Date.now() / 1000) + 601;
    const payload = Buffer.from(
      JSON.stringify({ exp: expiresAtSeconds }),
    ).toString("base64url");
    const jwt = `header.${payload}.signature`;
    mockClientCredentialsGrant
      .mockResolvedValueOnce({ data: { access_token: jwt } })
      .mockResolvedValueOnce({
        data: { access_token: "renewed-token", expires_in: 3600 },
      });
    const POST = await loadPost();

    expect(await readJson(await POST({} as never))).toEqual({
      accessToken: jwt,
    });
    jest.advanceTimersByTime(300_999);
    expect(await readJson(await POST({} as never))).toEqual({
      accessToken: jwt,
    });
    jest.advanceTimersByTime(1);
    expect(await readJson(await POST({} as never))).toEqual({
      accessToken: "renewed-token",
    });
  });
});
