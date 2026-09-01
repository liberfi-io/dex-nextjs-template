import fs from "node:fs";
import path from "node:path";

describe("Token detail TradingView configuration", () => {
  it("disables the unused TradingView account manager panel", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/TradingChart.tsx"),
      "utf8",
    );

    expect(source).toContain(
      'disabledFeatures: ["trading_account_manager" as TvChartFeature]',
    );
  });
});
