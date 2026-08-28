"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { fetchDexToken } from "./auth/fetchDexToken";

interface DexTokenLoader {
  set(token: string, expiresAt: Date): Promise<void>;
  get(): Promise<string | null>;
}

type TokenListener = (token: string) => void;

const tokenListeners = new Set<TokenListener>();
let currentDexToken: string | null = null;

function publishDexToken(token: string) {
  currentDexToken = token;
  for (const listener of tokenListeners) {
    listener(token);
  }
}

function jwtExpiryMs(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as { exp?: number };
    return payload.exp ? payload.exp * 1000 : Date.now() + 3_600_000;
  } catch {
    return Date.now() + 3_600_000;
  }
}

export function useDexTokenProvider(loader: DexTokenLoader) {
  const renewRef = useRef(false);

  const renewDexToken = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (renewRef.current) return;
    renewRef.current = true;

    try {
      const token = await fetchDexToken();
      const expiresAt = jwtExpiryMs(token) - 300_000;
      await loader.set(token, new Date(expiresAt));
      publishDexToken(token);
    } catch (error) {
      console.error("useDexTokenProvider renew error", error);
    } finally {
      renewRef.current = false;
    }
  }, [loader]);

  useEffect(() => {
    void loader.get().then((token) => {
      if (token) {
        publishDexToken(token);
      } else {
        void renewDexToken();
      }
    });
  }, [loader, renewDexToken]);

  return useMemo(
    () => ({
      getToken: async () => {
        if (typeof window === "undefined") return "";

        const dexToken = await loader.get();
        if (dexToken) return dexToken;

        const promise = new Promise<string>((resolve) => {
          const listener: TokenListener = (token) => {
            setTimeout(() => {
              resolve(token);
              tokenListeners.delete(listener);
            });
          };
          tokenListeners.add(listener);
          if (currentDexToken) listener(currentDexToken);
        });

        void renewDexToken();
        return promise;
      },
    }),
    [loader, renewDexToken],
  );
}
