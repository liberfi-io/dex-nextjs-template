/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/navigation";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | undefined;
      NEXT_PUBLIC_DEFAULT_TOKEN_CHAIN: string;
      NEXT_PUBLIC_DEFAULT_TOKEN_ADDRESS: string;
      NEXT_PUBLIC_SOLANA_RPC_URL: string;
      NEXT_PUBLIC_GA_MEASUREMENT_ID: string | undefined;
      NEXT_PUBLIC_PINATA_GATEWAY: string;
      NEXT_PUBLIC_PRIVY_APPID: string;
      NEXT_PUBLIC_GRAPHQL_ENDPOINT: string;
      NEXT_PUBLIC_DEX_AGGREGATOR_URL: string;
      NEXT_PUBLIC_MEDIA_TRACK_URL: string;
      NEXT_PUBLIC_MEDIA_TRACK_STREAM_URL: string;
      NEXT_PUBLIC_CHANNELS_URL: string;
      NEXT_PUBLIC_AI_COPILOT_URL: string;
      NEXT_PUBLIC_PREDICT_URL: string;
      SENTRY_AUTH_TOKEN: string | undefined;
      GRAPHQL_SERVER_ENDPOINT: string;
      DEX_AGGREGATOR_URL: string;
      MEDIA_TRACK_URL: string;
      CHANNELS_URL: string;
      PREDICT_URL: string;
      DEX_AUTH0_CLIENT_ID: string;
      DEX_AUTH0_CLIENT_SECRET: string;
      DEX_AUTH0_AUDIENCE: string;
      DEX_AUTH0_DOMAIN: string;
      PRIVY_APP_ID: string;
      PRIVY_APP_SECRET: string;
      JWT_ISSUER: string;
      JWT_AUDIENCE: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      JWT_COOKIE_NAME: string;
    }
  }

  interface Window {
    gtag: (
      method: "config" | "event" | "consent" | "get",
      id: string,
      config?: Record<string, any>,
    ) => void;
    dataLayer: Record<string, any>[];
  }
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
  }
}

export {};
