import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import {
  APP_RUNTIME_PROVIDER_ORDER,
  validateRuntimeProviderOrder,
} from "../runtime-lifecycle-policy";

function providerChain(sourceFile: string, rootName: string) {
  const sourceText = fs.readFileSync(sourceFile, "utf8");
  const source = ts.createSourceFile(
    sourceFile,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let root: ts.JsxElement | undefined;
  const visit = (node: ts.Node) => {
    if (
      ts.isJsxElement(node) &&
      node.openingElement.tagName.getText(source) === rootName
    ) {
      root = node;
      return;
    }
    node.forEachChild(visit);
  };
  source.forEachChild(visit);
  if (!root) throw new Error(`Missing provider root: ${rootName}`);

  const chain: string[] = [];
  let current: ts.JsxElement | undefined = root;
  while (current) {
    chain.push(current.openingElement.tagName.getText(source));
    current = current.children.find(ts.isJsxElement);
  }
  return chain;
}

describe("application provider order policy", () => {
  it("places data runtime outside data consumers", () => {
    expect(APP_RUNTIME_PROVIDER_ORDER).toEqual([
      "modal-coordinator",
      "query-client",
      "auth",
      "locale",
      "app-runtime",
      "pinata",
      "application-adapters",
      "chainstream-client",
      "api-client",
      "media-track",
      "channels",
      "predict",
      "polymarket",
      "portfolio-client",
      "portfolio-account",
      "perpetuals",
      "dex-data-runtime",
      "dex-data",
      "application-shell",
    ]);
    expect(validateRuntimeProviderOrder(APP_RUNTIME_PROVIDER_ORDER)).toBe(true);
  });

  it("rejects data consumers outside their runtime provider", () => {
    const invalidOrder = [...APP_RUNTIME_PROVIDER_ORDER];
    const runtimeIndex = invalidOrder.indexOf("dex-data-runtime");
    const dataIndex = invalidOrder.indexOf("dex-data");
    [invalidOrder[runtimeIndex], invalidOrder[dataIndex]] = [
      invalidOrder[dataIndex],
      invalidOrder[runtimeIndex],
    ];

    expect(validateRuntimeProviderOrder(invalidOrder)).toBe(false);
  });

  it("keeps the legacy layout source tree in the frozen root provider order", () => {
    expect(
      providerChain(
        path.resolve(process.cwd(), "src/components/AppLayout.tsx"),
        "ModalCoordinatorProvider",
      ),
    ).toEqual([
      "ModalCoordinatorProvider",
      "QueryClientProvider",
      "GraphQLClientProvider",
      "AuthProviders",
      "RuntimeLocaleProvider",
      "ServiceClientProviders",
      "UIProviders",
    ]);
  });
});
