const mockClientCredentialsGrant = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
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
    error?: string;
  };
}

describe("POST /api/auth/dex", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-05T00:00:00.000Z"));
    mockClientCredentialsGrant.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
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

    expect(await readJson(await POST({} as never))).toEqual({
      accessToken: "first-token",
    });
    jest.advanceTimersByTime(299_999);
    expect(await readJson(await POST({} as never))).toEqual({
      accessToken: "first-token",
    });
    jest.advanceTimersByTime(1);
    expect(await readJson(await POST({} as never))).toEqual({
      accessToken: "second-token",
    });
    expect(mockClientCredentialsGrant).toHaveBeenCalledTimes(2);
  });

  it("does not cache a failed grant", async () => {
    mockClientCredentialsGrant
      .mockRejectedValueOnce(new Error("Auth0 unavailable"))
      .mockResolvedValueOnce({
        data: { access_token: "recovered-token", expires_in: 3600 },
      });
    const POST = await loadPost();

    const failed = await POST({} as never);
    expect(failed.status).toBe(500);
    expect(await readJson(failed)).toEqual({ error: "Auth0 unavailable" });

    const recovered = await POST({} as never);
    expect(recovered.status).toBe(200);
    expect(await readJson(recovered)).toEqual({
      accessToken: "recovered-token",
    });
    expect(mockClientCredentialsGrant).toHaveBeenCalledTimes(2);
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
