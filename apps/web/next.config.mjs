import { withSentryConfig } from "@sentry/nextjs";

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
