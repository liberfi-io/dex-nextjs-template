import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function writeFile(filePath, contents = "") {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

function writePackage(root, directory, manifest, files) {
  const packageDir = path.join(root, "packages", directory);
  writeFile(path.join(packageDir, "package.json"), JSON.stringify(manifest, null, 2));
  for (const [relativePath, contents] of Object.entries(files)) {
    writeFile(path.join(packageDir, relativePath), contents);
  }
  return packageDir;
}

export function createLocalSdkFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "liberfi-local-sdk-"));
  const examplePackageDir = writePackage(
    root,
    "example",
    {
      name: "@liberfi.io/example",
      exports: {
        ".": "./dist/index.js",
        "./client": "./dist/client/index.js",
        "./styles.css": "./dist/styles.css",
        "./locales/*": "./dist/locales/*",
      },
    },
    {
      "src/index.ts": "export const source = 'root';\n",
      "src/client/index.ts": "export const source = 'client';\n",
      "src/styles.css": ":root {}\n",
      "dist/locales/en.json": "{}\n",
    },
  );
  const walletPackageDir = writePackage(
    root,
    "wallet-connector",
    {
      name: "@liberfi.io/wallet-connector",
      exports: {
        ".": "./dist/index.js",
        "./auth": "./dist/auth/index.js",
        "./wallets": "./dist/wallets/index.js",
      },
    },
    {
      "src/index.ts": "export const source = 'wallet-root';\n",
      "src/auth/index.ts": "export const source = 'wallet-auth';\n",
      "src/wallets/index.ts": "export const source = 'wallets';\n",
    },
  );

  return {
    root,
    examplePackageDir,
    walletPackageDir,
    cleanup() {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}
