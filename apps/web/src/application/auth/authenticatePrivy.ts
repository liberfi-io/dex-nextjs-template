export interface PrivyAuthenticateInput {
  accessToken: string;
  identityToken: string;
}

export interface AuthenticationResult {
  success: boolean;
  token?: string;
}

/** Exchange a Privy session for the application JWT via the Next auth route. */
export async function authenticatePrivy(
  input: PrivyAuthenticateInput,
): Promise<AuthenticationResult> {
  const res = await fetch("/api/auth/privy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accessToken: input.accessToken,
      identityToken: input.identityToken,
    }),
  });
  const data = (await res.json()) as { accessToken?: string };
  return { success: true, token: data.accessToken };
}
