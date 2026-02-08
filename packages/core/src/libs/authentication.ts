export interface AuthenticatedUser {
  // user id
  id: string;
  // ethereum wallet address
  ethereumAddress?: string | null;
  // solana wallet address
  solanaAddress?: string | null;
  // other properties
  [key: string]: unknown;
}

export interface IAuthentication {
  user?: AuthenticatedUser | null;
  status: "unauthenticated" | "authenticating" | "authenticated";
  signIn: () => void | Promise<void>;
  signOut: () => void | Promise<void>;
  refreshAccessToken: () => void | Promise<void>;
}
