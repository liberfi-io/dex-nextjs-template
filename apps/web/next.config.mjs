import { withSentryConfig } from "@sentry/nextjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    ];
  },
  webpack(config) {
    config.optimization.minimize = process.env.NODE_ENV === "production";

    // In a pnpm monorepo, the same npm package can be resolved to different
    // paths in the .pnpm virtual store by different workspace packages,
    // resulting in multiple module instances at runtime.
    // For packages containing globally shared state (e.g. jotai atoms),
    // this causes state desync (e.g. ChainSelectWidget updates the chain
    // but useCurrentChain in other components still returns the old value).
    // Aliases below force all imports to resolve to a single copy under
    // apps/web/node_modules, guaranteeing one module instance globally.
    // NOTE: Do NOT alias packages that use subpath imports (e.g.
    // "@liberfi.io/i18n/locales/en.json"), as it bypasses package.json
    // "exports" mapping and causes module-not-found errors.
    config.resolve.alias = {
      ...config.resolve.alias,
      jotai: path.resolve(__dirname, "node_modules/jotai"),
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
