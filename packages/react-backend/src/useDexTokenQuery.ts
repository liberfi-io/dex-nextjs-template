import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { QueryKeys } from "./queryKeys";

export async function fetchDexToken() {
  const res = await fetch("/api/auth/dex", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return data.accessToken as string;
}

export const useDexTokenQuery = (
  options: Omit<UseQueryOptions<string, Error, string, string[]>, "queryKey" | "queryFn"> = {},
) => {
  return useQuery({
    ...options,
    queryKey: QueryKeys.dexToken(),
    queryFn: async () => {
      return await fetchDexToken();
    },
  });
};
