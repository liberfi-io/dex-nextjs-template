import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const useLocalSdk = process.env.USE_LOCAL_SDK === "true";
const sdkRoot = useLocalSdk
  ? path.resolve(
      __dirname,
      process.env.LOCAL_SDK_ROOT || "../../../react-sdk",
    )
  : null;

if (useLocalSdk) {
  // eslint-disable-next-line no-console
  console.log(`[local-sdk-postcss] CSS rewrites enabled → ${sdkRoot}`);
}

export default {
  plugins: [
    ...(useLocalSdk
      ? [["./postcss-plugins/local-sdk-rewrite.cjs", { sdkRoot }]]
      : []),
    "@tailwindcss/postcss",
    "cssnano",
  ],
};
