export async function fetchDexToken() {
  const res = await fetch("/api/auth/dex", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = (await res.json()) as { accessToken?: string };
  return data.accessToken as string;
}
