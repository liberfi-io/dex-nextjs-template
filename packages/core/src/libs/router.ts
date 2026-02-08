/**
 * Router interfaces
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

export const ROUTES = {
  tokenList: {
    home: () => "/",
  },
  trade: {
    home: () => "/tokens",
    token: (chain: string, address: string) => `/tokens/${chain}/${address}`,
  },
  pulse: {
    home: () => "/pulse",
  },
  predict: {
    home: () => "/predict",
  },
  account: {
    home: () => "/account",
  },
  redPacket: {
    home: (shareId?: string) =>
      shareId ? `/redpacket?share=${encodeURIComponent(shareId)}` : "/redpacket",
    create: () => "/redpacket/create",
    histories: () => "/redpacket/histories",
  },
  launchpad: {
    home: () => "/launchpad",
  },
};
