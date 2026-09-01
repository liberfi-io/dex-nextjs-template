import fs from "node:fs";
import path from "node:path";
import {
  TOKEN_TRADE_MIN_CHART_HEIGHT,
  TOKEN_TRADE_SPLIT_HANDLE_HEIGHT,
  clampTokenTradeChartHeight,
} from "./token-trade-layout";

describe("token trade chart resize bounds", () => {
  it("allows the split handle to reach the bottom of the outer viewport", () => {
    const outerHeight = 820;
    const headerHeight = 96;

    expect(
      clampTokenTradeChartHeight({
        currentHeight: 448,
        delta: 1_000,
        outerHeight,
        headerHeight,
      }),
    ).toBe(outerHeight - headerHeight - TOKEN_TRADE_SPLIT_HANDLE_HEIGHT);
  });

  it("keeps the chart usable when the split handle is dragged upward", () => {
    expect(
      clampTokenTradeChartHeight({
        currentHeight: 448,
        delta: -1_000,
        outerHeight: 820,
        headerHeight: 96,
      }),
    ).toBe(TOKEN_TRADE_MIN_CHART_HEIGHT);
  });

  it("suppresses the browser outline on the non-interactive page scroll container", () => {
    const pageSource = fs.readFileSync(
      path.join(__dirname, "TokenTradePage.tsx"),
      "utf8",
    );

    expect(pageSource).toMatch(
      /ref=\{outerRef\}[\s\S]*?className="[^"]*overflow-auto[^"]*outline-none[^"]*"/,
    );
  });
});
