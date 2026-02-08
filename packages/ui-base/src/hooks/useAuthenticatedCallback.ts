/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { DependencyList, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";

export function useAuthenticatedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps?: DependencyList,
): T {
  const { status, signIn } = useAuth();

  // statusRef will be updated to the latest on each render
  // avoid callback rebuild on status changes
  const statusRef = useRef<string>(status);
  statusRef.current = status;

  const authenticatedCallback = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      if (statusRef.current !== "authenticated") {
        await signIn();
        if (statusRef.current !== "authenticated") {
          throw new Error("User is not authenticated after signing in");
        }
      }
      return callback(...args);
    },
    [...(deps || []), signIn, callback],
  );

  return authenticatedCallback as T;
}
