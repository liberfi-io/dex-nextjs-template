export * from "./tradeSettings";

/**
 * App options
 */
export interface IAppContext {
  // ui layout type
  layout: "desktop" | "tablet" | "mobile";
  // display primary tokens in asset list (e.g. SOL, USDC, USDT, etc.)
  displayPrimaryTokens: boolean;
}

/**
 * Translation adapter types
 */
export type TranslateFunction = (
  text: string,
  variables?: Record<string, string | number>,
) => string;

export interface ITranslationClient {
  enable: boolean;
  reloadResources: (langs: string[]) => Promise<void>;
  changeLanguage: (lang: string) => Promise<void>;
  language: string;
  languages: string[];
}

export interface ITranslation {
  t: TranslateFunction;
  i18n: ITranslationClient;
}

/**
 * router adapter types
 */
export interface PathnameFunction {
  (): string;
}

export interface SearchParamsFunction {
  (): URLSearchParams;
}

export interface NavigateOptions {
  replace?: boolean;
}

export interface NavigateFunction {
  (to: string, options?: NavigateOptions): void;
  (delta: number): void;
}

export interface IRouter {
  usePathname: PathnameFunction;
  useSearchParams: SearchParamsFunction;
  navigate: NavigateFunction;
}

/**
 * Authentication types
 */
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
