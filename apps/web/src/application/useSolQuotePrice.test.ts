import fs from "node:fs";
import path from "node:path";
import { solQuotePriceFromToken } from "./useSolQuotePrice";

const WEB_SRC = path.resolve(__dirname, "..");

describe("solQuotePriceFromToken", () => {
  it("parses a positive USD price", () => {
    expect(solQuotePriceFromToken({ marketData: { priceInUsd: "142.5" } })).toBe(142.5);
  });

  it("returns null when the price is missing or not a positive number", () => {
    expect(solQuotePriceFromToken(undefined)).toBeNull();
    expect(solQuotePriceFromToken({})).toBeNull();
    expect(solQuotePriceFromToken({ marketData: {} })).toBeNull();
    expect(solQuotePriceFromToken({ marketData: { priceInUsd: "0" } })).toBeNull();
    expect(solQuotePriceFromToken({ marketData: { priceInUsd: "abc" } })).toBeNull();
  });
});

describe("BottomSolPrice application quote", () => {
  it("reads SOL USD from the SDK token query instead of ui-dex", () => {
    const source = fs.readFileSync(path.join(WEB_SRC, "components/BottomSolPrice.tsx"), "utf8");
    expect(source).toContain('from "../application/useSolQuotePrice"');
    expect(source).not.toContain("@liberfi/ui-dex");
  });
});
