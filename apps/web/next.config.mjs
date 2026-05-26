import { withSentryConfig } from "@sentry/nextjs";
import path from "path";
import { fileURLToPath } from "url";
import {
  getLocalSdkAliases,
  getLocalSdkWatchOptions,
} from "./build-config/local-sdk-aliases.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Default LOCAL_SDK_ROOT relative to apps/web/. Lives in build-config so
// next.config.mjs and postcss.config.mjs resolve the same path.
const LOCAL_SDK_FALLBACK = "../../../react-sdk";

const localSdkAliases = getLocalSdkAliases({
  baseDir: __dirname,
  fallback: LOCAL_SDK_FALLBACK,
});
const useLocalSdk = Object.keys(localSdkAliases).length > 0;

/* eslint-disable no-undef */
const nextConfig = {
  // TODO tv chart need to disable reactStrictMode
  reactStrictMode: false,
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/graphql",
        destination: process.env.GRAPHQL_SERVER_ENDPOINT,
      },
      {
        source: "/dex-api/:path*",
        destination: process.env.DEX_AGGREGATOR_URL + "/:path*",
      },
      {
        source: "/media-track-api/:path*",
        destination: process.env.MEDIA_TRACK_URL + "/:path*",
      },
      {
        source: "/channel-api/:path*",
        destination: process.env.CHANNELS_URL + "/:path*",
      },
      {
        source: "/predict-api/:path*",
        destination: process.env.PREDICT_URL + "/:path*",
      },
      {
        source: "/perpetuals-api/:path*",
        destination: (process.env.PERPETUALS_API_URL || "") + "/:path*",
      },
      // dex-server REST endpoints (transfer build/send and other native
      // backend features). Kept under its own prefix so the Next.js API
      // routes can stay separate from the Go service surface.
      {
        source: "/dex-tx-api/:path*",
        destination: (process.env.DEX_SERVER_URL || "") + "/api/:path*",
      },
    ];
  },
  webpack(config) {
    config.optimization.minimize = process.env.NODE_ENV === "production";

    // Singleton aliases — these MUST resolve from apps/web/node_modules
    // regardless of local-sdk mode, to avoid duplicate instances of
    // packages that hold React Context or module-level global state.
    const singletonAliases = {
      jotai: path.resolve(__dirname, "node_modules/jotai"),
      "react-hook-form": path.resolve(
        __dirname,
        "node_modules/react-hook-form",
      ),
      "@tanstack/react-query": path.resolve(
        __dirname,
        "node_modules/@tanstack/react-query",
      ),
      // react-hot-toast keeps its toast queue in module-level state, so the
      // <Toaster> renderer (imported by @liberfi.io/ui via StyledToaster)
      // and toast emitters (e.g. @liberfi/ui-base's useTimerToast) MUST
      // resolve to the same module instance. Without this pin, USE_LOCAL_SDK
      // causes react-sdk to load its own React-19-pinned copy while the
      // consumer uses the React-18 copy — emitted toasts never render.
      "react-hot-toast": path.resolve(
        __dirname,
        "node_modules/react-hot-toast",
      ),
      // @liberfi.io/wallet-connector{,-privy} export AuthContext and the
      // Privy auth/wallet contexts. If apps/web's wallet-connector and a
      // sibling workspace package's wallet-connector resolve to different
      // versions in pnpm's store (e.g. apps/web on 0.2.7 while
      // packages/ui-base is still pinned to 0.2.6), each resolved path
      // runs its own `createContext()`. The `<PrivyAuthProvider>` set up
      // from apps/web populates one instance; `useAuth()` inside the
      // sibling package's src then reads the other instance, finds null,
      // and throws `useAuth must be used within an AuthProvider`. Pin
      // both to apps/web/node_modules so workspace alias / src loading
      // can't reintroduce the duplicate even if version drift slips
      // back in.
      "@liberfi.io/wallet-connector": path.resolve(
        __dirname,
        "node_modules/@liberfi.io/wallet-connector",
      ),
      "@liberfi.io/wallet-connector-privy": path.resolve(
        __dirname,
        "node_modules/@liberfi.io/wallet-connector-privy",
      ),
    };

    // Workspace package aliases — force every `@liberfi/*` import to
    // resolve to the package's `src/` directory (matching the tsconfig
    // path aliases used by apps/web). Without this, imports from sibling
    // workspace packages (e.g. `packages/ui-dex` importing
    // `@liberfi/ui-base`) fall through to the `node_modules` symlink and
    // pick up `dist/index.js`, while imports from `apps/web` go through
    // the tsconfig path alias to `src/index.tsx`. The two physical files
    // each run their own `createContext()` calls, so React sees them as
    // separate contexts: a `<RouterProvider>` set up via the src copy
    // never matches a `useRouter()` reading from the dist copy, and the
    // hook silently returns the empty `{} as IRouter` default —
    // surfacing later as `TypeError: navigate is not a function` inside
    // TvChartWrapper's chart-ready subscription.
    //
    // Webpack treats these as directory aliases, so subpath imports
    // (`@liberfi/ui-base/providers`, JSON paths under `@liberfi/locales`,
    // etc.) keep working — they resolve to the same relative path under
    // `src/` rather than under `dist/`.
    const WORKSPACE_PKGS = [
      "core",
      "react-backend",
      "react-dex",
      "react-launchpad",
      "react-redpacket",
      "ui-base",
      "ui-dex",
      "ui-launchpad",
      "ui-redpacket",
    ];
    const workspaceAliases = Object.fromEntries(
      WORKSPACE_PKGS.map((name) => [
        `@liberfi/${name}`,
        path.resolve(__dirname, `../../packages/${name}/src`),
      ]),
    );

    // @liberfi.io/* aliases: use local react-sdk dist when available,
    // otherwise pin to apps/web/node_modules for singleton safety.
    const libAliases = useLocalSdk
      ? localSdkAliases
      : {
          "@liberfi.io/ui-chain-select": path.resolve(
            __dirname,
            "node_modules/@liberfi.io/ui-chain-select",
          ),
          "@liberfi.io/ui-portfolio/client": path.resolve(
            __dirname,
            "node_modules/@liberfi.io/ui-portfolio/dist/client/index.js",
          ),
          "@liberfi.io/ui-portfolio": path.resolve(
            __dirname,
            "node_modules/@liberfi.io/ui-portfolio",
          ),
        };

    config.resolve.alias = {
      ...config.resolve.alias,
      ...libAliases,
      ...singletonAliases,
      ...workspaceAliases,
    };

    if (useLocalSdk) {
      const localWatch = getLocalSdkWatchOptions({
        baseDir: __dirname,
        fallback: LOCAL_SDK_FALLBACK,
      });
      if (localWatch) {
        config.watchOptions = {
          ...config.watchOptions,
          ...localWatch,
        };
      }
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@farcaster/mini-app-solana": false,
    };

    config.module.rules.push({
      test: /\.svg$/i,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: "prefixIds",
                  active: false,
                },
              ],
            },
          },
        },
        "url-loader",
      ],
    });
    return config;
  },
};

export default process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, {
      org: "singularitylab",
      project: "dex",
      // Only print logs for uploading source maps in CI
      // Set to `true` to suppress logs
      silent: !process.env.CI,
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,

      // Pass the auth token
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,
    })
  : nextConfig;
