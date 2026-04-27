import { withSentryConfig } from "@sentry/nextjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolve a package.json "exports" condition value to a concrete file path
 * string. Handles both simple strings and nested condition objects like
 * `{ import: { types: "...", default: "./dist/foo.mjs" }, require: { ... } }`.
 */
function resolveExportTarget(value) {
  if (typeof value === "string") return value;
  if (value == null || typeof value !== "object") return undefined;
  const entry = value.import ?? value.require ?? value.default;
  if (typeof entry === "string") return entry;
  if (entry != null && typeof entry === "object") {
    return entry.default ?? entry.types;
  }
  return undefined;
}

/**
 * When USE_LOCAL_SDK=true, scans LOCAL_SDK_ROOT/packages and returns webpack
 * resolve.alias entries that redirect every @liberfi.io/* import to the local
 * react-sdk dist output. Combined with `pnpm dev:watch` in react-sdk (which
 * runs tsup --watch for all packages), this gives live reload on SDK changes.
 */
function getLocalSdkAliases() {
  if (process.env.USE_LOCAL_SDK !== "true") return {};

  const sdkRoot = path.resolve(
    __dirname,
    process.env.LOCAL_SDK_ROOT || "../../../react-sdk",
  );
  const packagesDir = path.join(sdkRoot, "packages");

  if (!fs.existsSync(packagesDir)) {
    console.warn(`[local-sdk] packages dir not found: ${packagesDir}`);
    return {};
  }

  const aliases = {};

  for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pkgJsonPath = path.join(packagesDir, entry.name, "package.json");
    if (!fs.existsSync(pkgJsonPath)) continue;

    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    const name = pkgJson.name;
    if (!name?.startsWith("@liberfi.io/")) continue;

    const pkgDir = path.join(packagesDir, entry.name);

    const subpathKeys =
      pkgJson.exports
        ? Object.keys(pkgJson.exports).filter(
            (k) => k !== "." && !k.includes("*"),
          )
        : [];

    // Use exact-match (`name$`) when the package declares subpath exports,
    // so that `@pkg/foo/bar` is not caught by the `@pkg/foo` prefix alias.
    aliases[subpathKeys.length > 0 ? `${name}$` : name] = pkgDir;

    for (const key of subpathKeys) {
      const subpath = key.replace(/^\.\//, "");
      const target = resolveExportTarget(pkgJson.exports[key]);
      if (target) {
        aliases[`${name}/${subpath}`] = path.join(
          pkgDir,
          target.replace(/^\.\//, ""),
        );
      }
    }
  }

  console.log(
    `[local-sdk] Linked ${Object.keys(aliases).length} aliases from ${sdkRoot}`,
  );
  return aliases;
}

const localSdkAliases = getLocalSdkAliases();
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
    };

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
    };

    if (useLocalSdk) {
      const sdkRoot = path.resolve(
        __dirname,
        process.env.LOCAL_SDK_ROOT || "../../../react-sdk",
      );
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          `!${path.join(sdkRoot, "packages")}/**`,
        ],
      };
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
