import path from "node:path";

/**
 * PostCSS plugin that mirrors next.config.mjs's getLocalSdkAliases() at the
 * CSS layer. When USE_LOCAL_SDK=true, webpack aliases redirect every
 * @liberfi.io/* JS import to the local react-sdk monorepo; but CSS @import
 * and Tailwind 4 @source directives are processed by PostCSS / Tailwind and
 * never see those aliases. Without this plugin, globals.css keeps pulling
 * the stale npm-published tailwind.css (missing newly added @theme
 * variables) and Tailwind only scans node_modules (missing className strings
 * that exist only in the local source).
 *
 * Rewrites:
 *
 *   @import "@liberfi.io/<pkg>/tailwind/tailwind.css"
 *     → @import "<sdkRoot>/packages/<pkg>/src/tailwind/tailwind.css"
 *
 *   @source ".../node_modules/@liberfi.io/<pkg>/dist/**\/*.{js,ts,jsx,tsx}"
 *     → @source "<sdkRoot>/packages/<pkg>/src/**\/*.{js,ts,jsx,tsx}"
 *
 * When sdkRoot is null/undefined the plugin is a noop, so it is safe to
 * leave wired up unconditionally — only the env flag turns the rewrite on.
 *
 * @param {{ sdkRoot: string | null | undefined }} options
 */
export default function localSdkRewrite({ sdkRoot } = {}) {
  if (!sdkRoot) {
    return { postcssPlugin: "local-sdk-rewrite-noop", Once() {} };
  }

  const importRe = /^["']@liberfi\.io\/([^/"']+)\/tailwind\/tailwind\.css["']$/;
  const sourceRe = /node_modules\/@liberfi\.io\/([^/"']+)\/dist\//;

  return {
    postcssPlugin: "local-sdk-rewrite",
    AtRule: {
      import(atRule) {
        const m = atRule.params.match(importRe);
        if (!m) return;
        const localPath = path.join(
          sdkRoot,
          "packages",
          m[1],
          "src/tailwind/tailwind.css",
        );
        atRule.params = JSON.stringify(localPath);
      },
      source(atRule) {
        const m = atRule.params.match(sourceRe);
        if (!m) return;
        const pkgSrcDir = path.join(sdkRoot, "packages", m[1], "src");
        atRule.params = JSON.stringify(`${pkgSrcDir}/**/*.{js,ts,jsx,tsx}`);
      },
    },
  };
}

localSdkRewrite.postcss = true;
