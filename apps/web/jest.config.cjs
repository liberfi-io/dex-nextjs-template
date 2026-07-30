const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: __dirname });

module.exports = createJestConfig({
  displayName: "@liberfi/web",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}", "<rootDir>/src/**/*.spec.{ts,tsx}"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|sass|scss)$": "<rootDir>/test/style-mock.cjs",
    "\\.(gif|ico|jpe?g|png|svg|webp)$": "<rootDir>/test/file-mock.cjs",
  },
});
