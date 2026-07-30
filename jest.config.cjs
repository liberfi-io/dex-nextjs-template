const domPackages = new Set([
  "react-backend",
  "react-dex",
  "react-launchpad",
  "react-redpacket",
  "ui-base",
  "ui-dex",
  "ui-launchpad",
  "ui-redpacket",
]);

const packageProjects = [
  "core",
  "locales",
  "react-backend",
  "react-dex",
  "react-launchpad",
  "react-redpacket",
  "ui-base",
  "ui-dex",
  "ui-launchpad",
  "ui-redpacket",
].map((name) => ({
  displayName: `@liberfi/${name}`,
  rootDir: `<rootDir>/packages/${name}`,
  testEnvironment: domPackages.has(name) ? "jsdom" : "node",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}", "<rootDir>/src/**/*.spec.{ts,tsx}"],
  transform: {
    "^.+\\.[tj]sx?$": [
      "babel-jest",
      {
        presets: [
          ["@babel/preset-react", { runtime: "automatic" }],
          "@babel/preset-typescript",
        ],
      },
    ],
  },
}));

module.exports = {
  projects: ["<rootDir>/apps/web/jest.config.cjs", ...packageProjects],
};
