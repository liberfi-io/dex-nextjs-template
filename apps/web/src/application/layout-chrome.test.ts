import fs from "node:fs";
import path from "node:path";
import { footerVisibleFromShow, headerVisibleFromHide } from "./layout-chrome";

const WEB_SRC = path.resolve(__dirname, "..");

function collectImports(specifier: string, roots: string[]): string[] {
  const matches: string[] = [];
  for (const relative of roots) {
    const full = path.join(WEB_SRC, relative);
    const source = fs.readFileSync(full, "utf8");
    if (source.includes(`from "${specifier}"`) || source.includes(`from '${specifier}'`)) {
      matches.push(relative);
    }
  }
  return matches.sort();
}

describe("application shell chrome mapping", () => {
  it("hides the header from the named breakpoint down", () => {
    expect(headerVisibleFromHide(null)).toEqual(["desktop", "tablet", "mobile"]);
    expect(headerVisibleFromHide("tablet")).toEqual(["desktop"]);
    expect(headerVisibleFromHide("mobile")).toEqual(["desktop", "tablet"]);
    expect(headerVisibleFromHide("desktop")).toEqual([]);
  });

  it("shows the footer from the named breakpoint down", () => {
    expect(footerVisibleFromShow("mobile")).toEqual(["mobile"]);
    expect(footerVisibleFromShow("tablet")).toEqual(["tablet", "mobile"]);
    expect(footerVisibleFromShow(null)).toEqual([]);
  });

  it("keeps page chrome hooks off @liberfi/ui-base", () => {
    expect(
      collectImports("@liberfi/ui-base", [
        "components/page/token-detail/TokenTradePage.tsx",
        "components/page/portfolio/PortfolioPage.tsx",
        "components/pulse/PulsePage.tsx",
        "components/MediaTrackPage.tsx",
        "components/ChannelsUpdatePage.tsx",
        "components/page/PerpetualsPage.tsx",
        "components/page/RedPacketHomePage.tsx",
        "components/Modals.tsx",
        "components/NewAppLayout.tsx",
        "components/modals/WebviewModal.tsx",
      ]),
    ).toEqual([]);
  });
});
