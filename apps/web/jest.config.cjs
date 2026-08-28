const nextJest = require("next/jest");
const path = require("path");

const createJestConfig = nextJest({ dir: __dirname });
const localSdkRoot = path.resolve(
  __dirname,
  process.env.LOCAL_SDK_ROOT || "../../../react-sdk",
);
const unpublishedSdkMapper = {
  "^@liberfi.io/react-launchpad$": path.join(
    localSdkRoot,
    "packages/react-launchpad/src/index.ts",
  ),
  "^@liberfi.io/react-redpacket$": path.join(
    localSdkRoot,
    "packages/react-redpacket/src/index.ts",
  ),
};
const localI18nMapper = process.env.USE_LOCAL_SDK === "true"
  ? {
      "^@liberfi.io/i18n$": path.join(localSdkRoot, "packages/i18n/src/index.ts"),
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
    "\\.(css|less|sass|scss)$": "<rootDir>/test/style-mock.cjs",
    "\\.(gif|ico|jpe?g|png|svg|webp)$": "<rootDir>/test/file-mock.cjs",
  },
});
