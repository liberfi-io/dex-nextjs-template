"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { BehaviorSubject } from "rxjs";
import { jwtDecode } from "jwt-decode";
import { fetchDexToken } from "@liberfi/react-backend";

interface DexTokenLoader {
  set(token: string, expiresAt: Date): Promise<void>;
  get(): Promise<string | null>;
}

// for renew race condition
const dexTokenSubject = new BehaviorSubject<string | null>(null);

export function useDexTokenProvider(loader: DexTokenLoader) {
  // if renew is ongoing
  const renewRef = useRef(false);

  // renew the dex token
  const renewDexToken = useCallback(async () => {
    if (renewRef.current) return;
    renewRef.current = true;

    try {
      const token = await fetchDexToken();

      // renew 5 minutes in advance
      const { exp } = jwtDecode(token);
      const expiresAt = (exp ? exp * 1000 : Date.now() + 3600_000) - 300_000;

      // save the token
      await loader.set(token, new Date(expiresAt));
      dexTokenSubject.next(token);
    } catch (error) {
      console.error("useDexTokenProvider renew error", error);
    } finally {
      renewRef.current = false;
    }
  }, [loader]);

  // restore the dex token on mount
  useEffect(() => {
    loader.get().then((token) => {
      if (token) {
        dexTokenSubject.next(token);
      } else {
        renewDexToken();
      }
    });
  }, [loader, renewDexToken]);

  const tokenProvider = useMemo(() => {
    return {
      getToken: async () => {
        // if the token is not expired, use it
        const dexToken = await loader.get();
        if (dexToken) {
          return dexToken;
        }

        // if the token is not set or expired, wait for the new token
        const promise = new Promise<string>((resolve) => {
          const subscription = dexTokenSubject.subscribe((dexToken) => {
            if (dexToken) {
              // delay to make sure that `subscription` is assigned
              setTimeout(() => {
                resolve(dexToken);
                subscription.unsubscribe();
              });
            }
          });
        });

        renewDexToken();

        return promise;
      },
    };
  }, [loader, renewDexToken]);

  return tokenProvider;
}
