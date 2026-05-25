import path from "path";
import { fileURLToPath } from "url";
import { resolveSdkRoot } from "./build-config/local-sdk-shared.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Keep this in sync with LOCAL_SDK_FALLBACK in next.config.mjs.
const LOCAL_SDK_FALLBACK = "../../../react-sdk";

const sdkRoot = resolveSdkRoot(__dirname, LOCAL_SDK_FALLBACK);
const isProd = process.env.NODE_ENV === "production";

// Next.js's PostCSS loader (next/dist/build/webpack/config/blocks/css/plugins.js)
// strictly requires plugin entries to be either:
//   1. a string (plugin module name / path)
//   2. a [string, options] tuple
//   3. an object `{ "<plugin-name>": options }`
// It rejects raw plugin function/instance values with "Malformed PostCSS
// Configuration". Next then calls `require(require.resolve(name, {paths:[dir]}))`
// to load each plugin — which only works for CommonJS modules.
//
// That's why local-sdk-rewrite is a `.cjs` file (not `.mjs`), referenced by
// its relative path string below. Plugin order is preserved by the order of
// the object keys (V8 guarantees insertion order for string keys).
//
// Plugin order:
//   1. local-sdk-rewrite — no-op unless USE_LOCAL_SDK=true, must run BEFORE
//      Tailwind so @import / @source rewrites are visible to it.
//   2. @tailwindcss/postcss — generates utility classes.
//   3. cssnano — minification, PRODUCTION ONLY. Running cssnano during dev
//      makes every CSS HMR cycle pay the minification cost (~1-2s).
export default {
  plugins: {
    "./build-config/local-sdk-rewrite.cjs": { sdkRoot },
    "@tailwindcss/postcss": {},
    ...(isProd ? { cssnano: {} } : {}),
  },
};
