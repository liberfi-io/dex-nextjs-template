import fs from "node:fs";
import path from "node:path";
import {
  HEADER_CONTROL_CLASS,
  HEADER_CONTROL_SURFACE_CLASS,
  HEADER_ICON_CONTROL_CLASS,
} from "./header-control-theme";

const layoutSource = fs.readFileSync(path.join(__dirname, "NewAppLayout.tsx"), "utf8");
const utilityTriggerSource = layoutSource.slice(
  layoutSource.indexOf("function HeaderSearchButton"),
  layoutSource.indexOf("function GradientAvatar"),
);
const accountTriggerSource = layoutSource.slice(
  layoutSource.indexOf("function DexAccountButton"),
  layoutSource.indexOf("function HyperliquidBalanceButton"),
);
const headerTriggerSource = `${utilityTriggerSource}\n${accountTriggerSource}`;

describe("Header control theme contract", () => {
  it("uses semantic control roles for the shared container", () => {
    expect(HEADER_CONTROL_CLASS.split(" ")).toEqual(
      expect.arrayContaining([
        "h-8",
        "rounded-full",
        "border",
        "border-border-control/50",
        "bg-surface-interactive/60",
        "text-text-secondary",
        "hover:border-border-control",
        "hover:bg-surface-interactive",
        "hover:text-text-primary",
        "active:bg-surface-strong/80",
        "focus-visible:outline-focus",
      ]),
    );
    expect(HEADER_ICON_CONTROL_CLASS.split(" ")).toEqual(
      expect.arrayContaining(["w-8", "min-w-8", "px-0"]),
    );
    expect(HEADER_CONTROL_SURFACE_CLASS).not.toContain("cursor-pointer");
    expect(HEADER_CONTROL_SURFACE_CLASS).not.toContain("hover:");
  });

  it("keeps Header actions on the shared semantic container", () => {
    expect(headerTriggerSource).not.toContain("border-transparent");
    expect(headerTriggerSource).not.toContain("bg-action-primary/10");
    expect(headerTriggerSource).not.toContain("bg-content2");
    expect(headerTriggerSource.match(/cn\(\s*HEADER_CONTROL_CLASS/g)).toHaveLength(8);
    expect(accountTriggerSource.match(/cn\(HEADER_CONTROL_SURFACE_CLASS/g)).toHaveLength(1);
    expect(headerTriggerSource.match(/HEADER_ICON_CONTROL_CLASS/g)).toHaveLength(5);
  });
});
