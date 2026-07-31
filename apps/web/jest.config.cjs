const nextJest = require("next/jest");
const path = require("path");

const createJestConfig = nextJest({ dir: __dirname });
const localI18nMapper = process.env.USE_LOCAL_SDK === "true"
  ? {
      "^@liberfi.io/i18n$": path.resolve(
        __dirname,
        process.env.LOCAL_SDK_ROOT || "../../../react-sdk",
        "packages/i18n/src/index.ts",
      ),
    }
  : {};

module.exports = createJestConfig({
  displayName: "@liberfi/web",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}", "<rootDir>/src/**/*.spec.{ts,tsx}"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    ...localI18nMapper,
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|sass|scss)$": "<rootDir>/test/style-mock.cjs",
    "\\.(gif|ico|jpe?g|png|svg|webp)$": "<rootDir>/test/file-mock.cjs",
  },
});
