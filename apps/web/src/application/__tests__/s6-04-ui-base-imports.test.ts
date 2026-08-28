import fs from "node:fs";
import path from "node:path";

const WEB_SRC = path.resolve(__dirname, "../..");

function filesImportingUseTranslationFrom(specifier: string): string[] {
  const matches: string[] = [];
  const visit = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(full);
        continue;
      }
      if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) continue;
      const source = fs.readFileSync(full, "utf8");
      const blocks = source.match(/import\s+\{[\s\S]*?\}\s+from\s+['"][^'"]+['"]/g) ?? [];
      for (const block of blocks) {
        if (block.includes("useTranslation") && block.includes(`from "${specifier}"`)) {
          matches.push(path.relative(WEB_SRC, full));
        }
      }
    }
  };
  visit(WEB_SRC);
  return [...new Set(matches)].sort();
}

function filesImportingSymbolFrom(specifier: string, symbol: string): string[] {
  const matches: string[] = [];
  const visit = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(full);
        continue;
      }
      if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) continue;
      const source = fs.readFileSync(full, "utf8");
      const blocks = source.match(/import\s+\{[\s\S]*?\}\s+from\s+['"][^'"]+['"]/g) ?? [];
      for (const block of blocks) {
        if (block.includes(symbol) && block.includes(`from "${specifier}"`)) {
          matches.push(path.relative(WEB_SRC, full));
        }
      }
    }
  };
  visit(WEB_SRC);
  return [...new Set(matches)].sort();
}

describe("S6-04 ui-base translation imports", () => {
  it("does not import useTranslation from @liberfi/ui-base", () => {
    expect(filesImportingUseTranslationFrom("@liberfi/ui-base")).toEqual([]);
  });

  it("does not import useAuth, useRouter, or useWalletPortfolios from @liberfi/ui-base", () => {
    expect(filesImportingSymbolFrom("@liberfi/ui-base", "useAuth")).toEqual([]);
    expect(filesImportingSymbolFrom("@liberfi/ui-base", "useRouter")).toEqual([]);
    expect(filesImportingSymbolFrom("@liberfi/ui-base", "useWalletPortfolios")).toEqual([]);
    expect(filesImportingSymbolFrom("@liberfi/ui-base", "useTimerToast")).toEqual([]);
    expect(filesImportingSymbolFrom("@liberfi/ui-base", "useAuthenticatedCallback")).toEqual([]);
    expect(filesImportingSymbolFrom("@liberfi/ui-base", "useWalletPrimaryTokenNetWorth")).toEqual([]);
    expect(filesImportingSymbolFrom("@liberfi/ui-base", "useAppSdk")).toEqual([]);
    expect(filesImportingSymbolFrom("@liberfi/ui-base", "useDexTokenProvider")).toEqual([]);
  });
});
