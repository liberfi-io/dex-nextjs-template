import fs from "node:fs";
import path from "node:path";
import { createElement, type PropsWithChildren } from "react";
import { renderHook } from "@testing-library/react";
import { getExchangeClient, getInfoClient } from "../../lib/hyperliquid/client";
import { createStage53VenuePorts } from "../createStage53Adapters";
import {
  Stage53AdaptersProvider,
  useStage53VenuePorts,
} from "../Stage53AdaptersProvider";

jest.mock("../../lib/hyperliquid/client", () => ({
  getInfoClient: jest.fn(),
  getExchangeClient: jest.fn(),
}));

const WEB_SRC = path.resolve(__dirname, "../..");

function readWebSrc(relativePath: string) {
  return fs.readFileSync(path.join(WEB_SRC, relativePath), "utf8");
}

describe("createStage53VenuePorts", () => {
  it("re-exports the retained Hyperliquid factories without deleting them", () => {
    const ports = createStage53VenuePorts();
    expect(ports.getInfoClient).toBe(getInfoClient);
    expect(ports.getExchangeClient).toBe(getExchangeClient);
  });
});

describe("Stage53AdaptersProvider", () => {
  it("throws when venue ports are read outside the provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useStage53VenuePorts())).toThrow(
      /must be used within Stage53AdaptersProvider/,
    );
    spy.mockRestore();
  });

  it("supplies the same factory identity as createStage53VenuePorts", () => {
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(Stage53AdaptersProvider, null, children);
    const { result } = renderHook(() => useStage53VenuePorts(), { wrapper });
    const ports = createStage53VenuePorts();
    expect(result.current.getInfoClient).toBe(ports.getInfoClient);
    expect(result.current.getExchangeClient).toBe(ports.getExchangeClient);
  });
});

describe("Stage 5.3 production hook imports", () => {
  const hookFiles = [
    "hooks/useHyperliquidPlaceOrder.ts",
    "hooks/useHyperliquidCancelOrder.ts",
    "hooks/useHyperliquidUpdateLeverage.ts",
  ] as const;

  it("keeps production execution hooks off lib/hyperliquid/client.ts", () => {
    for (const relativePath of hookFiles) {
      expect(readWebSrc(relativePath)).not.toMatch(
        /from ["']\.\.\/lib\/hyperliquid\/client["']/,
      );
      expect(readWebSrc(relativePath)).toMatch(/useStage53VenuePorts/);
    }
  });

  it("keeps asset-index off the retained client module", () => {
    expect(readWebSrc("lib/hyperliquid/asset-index.ts")).not.toMatch(
      /from ["']\.\/client["']/,
    );
  });
});
