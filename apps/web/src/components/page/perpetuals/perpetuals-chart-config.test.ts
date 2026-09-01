import fs from "node:fs";
import path from "node:path";

describe("Perpetuals TradingView configuration", () => {
  it("disables the unused TradingView account manager panel", () => {
    const source = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "src/components/page/perpetuals/PerpetualsChart.tsx",
      ),
      "utf8",
    );

    expect(source).toContain(
      'disabledFeatures: ["trading_account_manager" as TvChartFeature]',
    );
  });
});
