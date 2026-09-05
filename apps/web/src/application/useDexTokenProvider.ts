"use client";

import { useCallback, useEffect, useMemo } from "react";
import { fetchDexToken } from "./auth/fetchDexToken";
import { markHomepageCriticalPath } from "./performance/homepageCriticalPath";

interface DexTokenLoader {
  set(token: string, expiresAt: Date): Promise<void>;
  get(): Promise<string | null>;
  remove(): Promise<void>;
}

const TOKEN_REQUEST_TIMEOUT_MS = 3_000;
const TOKEN_EXPIRY_SAFETY_MS = 300_000;

interface InFlightTokenRequest {
  controller: AbortController;
  promise: Promise<string>;
}

let inFlightTokenRequest: InFlightTokenRequest | null = null;
let mountedProviderCount = 0;

function clearInFlightRequest(controller: AbortController) {
  if (inFlightTokenRequest?.controller === controller) {
    inFlightTokenRequest = null;
  }
}

function readJwtExpiryMs(token: string): number | null {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;
    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof payload.exp === "number" && Number.isFinite(payload.exp)
      ? payload.exp * 1000
      : null;
  } catch {
    return null;
  }
}

async function readStoredToken(loader: DexTokenLoader): Promise<string | null> {
  const token = await loader.get();
  if (!token) return null;

  const expiresAtMs = readJwtExpiryMs(token);
  if (
    expiresAtMs === null ||
    expiresAtMs - TOKEN_EXPIRY_SAFETY_MS <= Date.now()
  ) {
    await loader.remove();
    return null;
  }

  return token;
}

export function useDexTokenProvider(loader: DexTokenLoader) {
  const renewDexToken = useCallback(() => {
    if (inFlightTokenRequest) return inFlightTokenRequest.promise;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(
        new DOMException("Dex token request timed out", "AbortError"),
      );
    }, TOKEN_REQUEST_TIMEOUT_MS);
    const aborted = new Promise<never>((_resolve, reject) => {
      controller.signal.addEventListener(
        "abort",
        () => reject(controller.signal.reason),
        { once: true },
      );
    });
    const request = (async () => {
      try {
        const token = await Promise.race([
          fetchDexToken(controller.signal),
          aborted,
        ]);
        const expiresAt =
          (readJwtExpiryMs(token) ?? Date.now() + 3_600_000) -
          TOKEN_EXPIRY_SAFETY_MS;
        if (expiresAt <= Date.now()) {
          throw new Error("DEX_TOKEN_EXPIRES_TOO_SOON");
        }
        await loader.set(token, new Date(expiresAt));
        return token;
      } finally {
        clearTimeout(timeoutId);
        clearInFlightRequest(controller);
      }
    })();

    inFlightTokenRequest = { controller, promise: request };
    return request;
  }, [loader]);

  useEffect(() => {
    mountedProviderCount += 1;
    void readStoredToken(loader)
      .then((token) => (token ? undefined : renewDexToken()))
      .catch((error) => {
        console.error("useDexTokenProvider renew error", error);
      });

    return () => {
      mountedProviderCount = Math.max(0, mountedProviderCount - 1);
      if (mountedProviderCount === 0 && inFlightTokenRequest) {
        inFlightTokenRequest.controller.abort(
          new DOMException("Dex token provider unmounted", "AbortError"),
        );
      }
    };
  }, [loader, renewDexToken]);

  return useMemo(
    () => ({
      getToken: async () => {
        if (typeof window === "undefined") return "";

        const startedAt = Date.now();
        try {
          const dexToken = await readStoredToken(loader);
          if (dexToken) {
            markHomepageCriticalPath("get_token_resolve", {
              source: "cookie",
              durationMs: Date.now() - startedAt,
            });
            return dexToken;
          }
          const renewedToken = await renewDexToken();
          markHomepageCriticalPath("get_token_resolve", {
            source: "unknown",
            durationMs: Date.now() - startedAt,
          });
          return renewedToken;
        } catch (error: unknown) {
          markHomepageCriticalPath("get_token_reject", {
            source: "unknown",
            durationMs: Date.now() - startedAt,
          });
          throw error;
        }
      },
    }),
    [loader, renewDexToken],
  );
}
