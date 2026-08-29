const nextJest = require("next/jest");
const path = require("path");

const createJestConfig = nextJest({ dir: __dirname });
const localSdkRoot = path.resolve(
  __dirname,
  process.env.LOCAL_SDK_ROOT || "../../../react-sdk",
);
const fs = require("fs");
const useLocalSdk = process.env.USE_LOCAL_SDK === "true";
const unpublishedSdkMapper = useLocalSdk
  ? {
      "^@liberfi.io/react-launchpad$": path.join(
        localSdkRoot,
        "packages/react-launchpad/src/index.ts",
      ),
      "^@liberfi.io/react-redpacket$": path.join(
        localSdkRoot,
        "packages/react-redpacket/src/index.ts",
      ),
      "^@liberfi.io/ui-launchpad$": path.join(
        localSdkRoot,
        "packages/ui-launchpad/src/index.ts",
      ),
      "^@liberfi.io/ui-redpacket$": path.join(
        localSdkRoot,
        "packages/ui-redpacket/src/index.ts",
      ),
      "^@liberfi.io/ui-tradingview$": path.join(
        localSdkRoot,
        "packages/ui-tradingview/src/index.ts",
      ),
    }
  : {};
const localI18nSrc = path.join(localSdkRoot, "packages/i18n/src/index.ts");
const localI18nMapper =
  useLocalSdk && fs.existsSync(localI18nSrc)
    ? {
        "^@liberfi.io/i18n$": localI18nSrc,
      }
    : {};

module.exports = createJestConfig({
  displayName: "@liberfi/web",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}", "<rootDir>/src/**/*.spec.{ts,tsx}"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    ...unpublishedSdkMapper,
    ...localI18nMapper,
    "^@/(.*)$": "<rootDir>/src/$1",
    "^lodash-es$": "lodash",
    "\\.(css|less|sass|scss)$": "<rootDir>/test/style-mock.cjs",
    "\\.(gif|ico|jpe?g|png|svg|webp)$": "<rootDir>/test/file-mock.cjs",
  },
});
