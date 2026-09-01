import fs from "node:fs";
import path from "node:path";
import { primaryTokenQuotePriceFromToken } from "./usePrimaryTokenQuotePrice";

const WEB_SRC = path.resolve(__dirname, "..");

describe("primaryTokenQuotePriceFromToken", () => {
  it("parses a positive USD price", () => {
    expect(primaryTokenQuotePriceFromToken({ marketData: { priceInUsd: "142.5" } })).toBe(142.5);
  });

  it("returns null when the price is missing or not a positive number", () => {
    expect(primaryTokenQuotePriceFromToken(undefined)).toBeNull();
    expect(primaryTokenQuotePriceFromToken({})).toBeNull();
    expect(primaryTokenQuotePriceFromToken({ marketData: {} })).toBeNull();
    expect(primaryTokenQuotePriceFromToken({ marketData: { priceInUsd: "0" } })).toBeNull();
    expect(primaryTokenQuotePriceFromToken({ marketData: { priceInUsd: "abc" } })).toBeNull();
  });
});

describe("BottomPrimaryTokenPrice application quote", () => {
  it("derives the native token query and avatar from the current chain", () => {
    const source = fs.readFileSync(
      path.join(WEB_SRC, "components/BottomPrimaryTokenPrice.tsx"),
      "utf8",
    );
    expect(source).toContain('from "../application/usePrimaryTokenQuotePrice"');
    expect(source).toContain("useCurrentChain");
    expect(source).toContain("getPrimaryTokenAvatar(chain)");

    const hookSource = fs.readFileSync(
      path.join(WEB_SRC, "application/usePrimaryTokenQuotePrice.ts"),
      "utf8",
    );
    expect(hookSource).toContain("useCurrentChain");
    expect(hookSource).toContain("getWrappedToken(chain)");
  });
});
