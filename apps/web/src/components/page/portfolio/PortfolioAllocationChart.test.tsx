import { render, screen } from "@testing-library/react";
import { useWalletPortfoliosQuery } from "@liberfi.io/react";
import {
  PortfolioAllocationChart,
  PortfolioAllocationChartLoadingBody,
  PortfolioAllocationChartSkeleton,
} from "./PortfolioAllocationChart";

jest.mock("@liberfi.io/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@liberfi.io/react", () => ({
  useWalletPortfoliosQuery: jest.fn(),
}));

jest.mock("@heroui/react", () => ({
  Skeleton: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

jest.mock("@liberfi.io/ui", () => ({
  cn: (...values: Array<string | undefined | false>) => values.filter(Boolean).join(" "),
  EmptyIcon: () => <span data-testid="empty-icon" />,
}));

jest.mock("@liberfi.io/utils", () => ({
  formatAmountInUsd: (value: number) => `$${value.toFixed(2)}`,
  formatPercent: (value: number) => `${(value * 100).toFixed(2)}%`,
}));

jest.mock("recharts", () => ({
  Cell: () => null,
  Pie: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PieChart: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Sector: () => null,
}));

const mockUseWalletPortfoliosQuery = useWalletPortfoliosQuery as jest.Mock;

describe("PortfolioAllocationChart layout", () => {
  beforeEach(() => {
    mockUseWalletPortfoliosQuery.mockReturnValue({
      data: {
        portfolios: [
          { address: "usdc", symbol: "USDC", amountInUsd: "92.82" },
          { address: "sol", symbol: "SOL", amountInUsd: "45.33" },
        ],
      },
      isPending: false,
    });
  });

  it("centers the chart and keeps legend values in a compact aligned column", () => {
    render(<PortfolioAllocationChart chain={"solana" as never} address="wallet" />);

    const legendButton = screen.getByRole("button", { name: /USDC/ });
    const legend = legendButton.closest("ul");
    const layout = legend?.parentElement;

    expect(layout?.className.split(" ")).toEqual(
      expect.arrayContaining(["items-center", "justify-center"]),
    );
    expect(legend?.className.split(" ")).toEqual(
      expect.arrayContaining(["max-w-[260px]", "flex-none"]),
    );
    expect(legend?.className.split(" ")).not.toContain("flex-1");
    expect(legendButton.className.split(" ")).toEqual(
      expect.arrayContaining(["grid", "grid-cols-[minmax(0,1fr)_auto]"]),
    );
    expect(legendButton.className.split(" ")).not.toContain("justify-between");
  });

  it("uses the same centered compact layout while loading", () => {
    const { container } = render(<PortfolioAllocationChartLoadingBody />);
    const layout = container.firstElementChild;
    const legend = layout?.querySelector("ul");
    const donut = screen.getByTestId("portfolio-allocation-donut-skeleton");

    expect(layout?.className.split(" ")).toEqual(
      expect.arrayContaining(["items-center", "justify-center"]),
    );
    expect(legend?.className.split(" ")).toEqual(
      expect.arrayContaining(["max-w-[260px]", "flex-none"]),
    );
    expect(donut.querySelector("[data-testid='portfolio-allocation-donut-hole']")).not.toBeNull();
    expect(donut.className.split(" ")).not.toContain("border-default-100");
  });

  it("uses the same centered compact layout during authentication", () => {
    const { container } = render(<PortfolioAllocationChartSkeleton />);
    const section = container.querySelector("section");
    const layout = section?.children.item(1)?.firstElementChild;
    const legend = layout?.querySelector("ul");

    expect(layout?.className.split(" ")).toEqual(
      expect.arrayContaining(["items-center", "justify-center"]),
    );
    expect(legend?.className.split(" ")).toEqual(
      expect.arrayContaining(["max-w-[260px]", "flex-none"]),
    );
    expect(legend?.className.split(" ")).not.toContain("flex-1");
  });
});
