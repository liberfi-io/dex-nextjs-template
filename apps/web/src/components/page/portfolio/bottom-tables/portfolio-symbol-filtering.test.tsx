import { render, screen } from "@testing-library/react";
import { useTokensQuery, useWalletPortfolioPnlsQuery } from "@liberfi.io/react";
import {
  usePortfolioActivitiesScript,
  usePortfolioNetWorthTokensScript,
} from "@liberfi.io/ui-portfolio";
import { PortfolioActivitiesTable } from "./PortfolioActivitiesTable";
import { PortfolioAssetsTable } from "./PortfolioAssetsTable";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@liberfi.io/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@liberfi.io/react", () => ({
  useTokensQuery: jest.fn(),
  useWalletPortfolioPnlsQuery: jest.fn(),
}));

jest.mock("@liberfi.io/ui-portfolio", () => ({
  usePortfolioActivitiesScript: jest.fn(),
  usePortfolioNetWorthTokensScript: jest.fn(),
}));

jest.mock("@liberfi.io/ui", () => ({
  cn: (...values: Array<string | undefined | false>) => values.filter(Boolean).join(" "),
}));

jest.mock("@liberfi.io/utils", () => ({
  formatAmount: (value?: string) => value ?? "--",
  formatAmountInUsd: (value?: string) => value ?? "--",
  formatPercent: (value?: string) => value ?? "--",
  formatPriceInUsd: (value?: string) => value ?? "--",
  truncateAddress: (value: string) => value,
  txExplorerUrl: () => null,
}));

jest.mock("../../token-detail/bottom-tables/table-shell", () => ({
  alignClass: () => "",
  EmptyBody: ({ messageKey }: { messageKey: string }) => (
    <tbody data-testid="empty-body">
      <tr>
        <td>{messageKey}</td>
      </tr>
    </tbody>
  ),
  TableShell: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
}));

jest.mock("../skeletons/PortfolioActivitiesTableSkeleton", () => ({
  PortfolioActivitiesTableSkeleton: () => <div data-testid="activities-skeleton" />,
}));

jest.mock("../skeletons/PortfolioAssetsTableSkeleton", () => ({
  PortfolioAssetsTableSkeleton: () => <div data-testid="assets-skeleton" />,
}));

const mockUseTokensQuery = useTokensQuery as jest.Mock;
const mockUseWalletPortfolioPnlsQuery = useWalletPortfolioPnlsQuery as jest.Mock;
const mockUsePortfolioActivitiesScript = usePortfolioActivitiesScript as jest.Mock;
const mockUsePortfolioNetWorthTokensScript = usePortfolioNetWorthTokensScript as jest.Mock;

describe("portfolio token symbol filtering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWalletPortfolioPnlsQuery.mockReturnValue({
      data: { portfolios: [] },
    });
  });

  it("omits asset rows whose symbol cannot be resolved", () => {
    mockUsePortfolioNetWorthTokensScript.mockReturnValue({
      data: {
        portfolios: [
          {
            address: "known-token",
            name: "Embedded Known Asset",
            amount: "10",
          },
          {
            address: "embedded-token",
            symbol: "BONK",
            name: "Embedded Token",
            amount: "15",
          },
          {
            address: "unknown-token",
            symbol: "   ",
            name: "Unknown Asset",
            amount: "20",
          },
        ],
      },
      isLoading: false,
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUseTokensQuery.mockReturnValue({
      data: [{ address: "known-token", symbol: "SOL", name: "Solana" }],
      isLoading: false,
    });

    render(<PortfolioAssetsTable chain={"solana" as never} address="wallet" />);

    const assetRow = screen.getByText("SOL").closest("tr");
    expect(assetRow?.className.split(" ")).toContain("border-border-subtle/30");
    expect(assetRow?.className.split(" ")).not.toContain("border-divider");
    expect(assetRow?.className.split(" ")).not.toContain("border-default-50");
    expect(screen.getAllByText("BONK").length).toBeGreaterThan(0);
    expect(screen.queryByText("Unknown Asset")).toBeNull();
  });

  it("omits activity rows whose primary token symbol cannot be resolved", () => {
    mockUsePortfolioActivitiesScript.mockReturnValue({
      activities: [
        {
          type: "buy",
          chain: "solana",
          txHash: "known-tx",
          time: new Date(),
          from: { address: "quote-token", symbol: "USDC", amount: "1" },
          to: { address: "known-token", name: "Embedded Known Token", amount: "2" },
        },
        {
          type: "buy",
          chain: "solana",
          txHash: "embedded-tx",
          time: new Date(),
          from: { address: "quote-token", symbol: "USDC", amount: "1" },
          to: {
            address: "embedded-token",
            symbol: "BONK",
            name: "Embedded Token",
            amount: "2",
          },
        },
        {
          type: "buy",
          chain: "solana",
          txHash: "unknown-tx",
          time: new Date(),
          from: { address: "quote-token", symbol: "USDC", amount: "1" },
          to: {
            address: "unknown-token",
            symbol: "   ",
            name: "Unknown Activity Token",
            amount: "3",
          },
        },
      ],
      isLoading: false,
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUseTokensQuery.mockReturnValue({
      data: [{ address: "known-token", symbol: "SOL", name: "Solana" }],
      isLoading: false,
    });

    render(<PortfolioActivitiesTable chain={"solana" as never} address="wallet" />);

    const activitySymbols = screen.getAllByText("SOL");
    expect(activitySymbols).toHaveLength(2);
    const activityRow = activitySymbols[0]?.closest("tr");
    expect(activityRow?.className.split(" ")).toContain("border-border-subtle/30");
    expect(activityRow?.className.split(" ")).not.toContain("border-divider");
    expect(activityRow?.className.split(" ")).not.toContain("border-default-50");
    expect(screen.getAllByText("BONK").length).toBeGreaterThan(0);
    expect(screen.queryByText("Unknown Activity Token")).toBeNull();
  });

  it("shows empty states when all returned entries lack symbols", () => {
    mockUsePortfolioNetWorthTokensScript.mockReturnValue({
      data: {
        portfolios: [
          {
            address: "unknown-asset",
            name: "Unknown Asset",
            amount: "20",
          },
        ],
      },
      isLoading: false,
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUsePortfolioActivitiesScript.mockReturnValue({
      activities: [
        {
          type: "buy",
          chain: "solana",
          txHash: "unknown-tx",
          time: new Date(),
          from: { address: "quote-token", symbol: "USDC", amount: "1" },
          to: { address: "unknown-token", name: "Unknown Activity Token", amount: "3" },
        },
      ],
      isLoading: false,
      hasMore: false,
      loadMore: jest.fn(),
    });
    mockUseTokensQuery.mockReturnValue({ data: [], isLoading: false });

    render(
      <>
        <PortfolioAssetsTable chain={"solana" as never} address="wallet" />
        <PortfolioActivitiesTable chain={"solana" as never} address="wallet" />
      </>,
    );

    expect(screen.getAllByTestId("empty-body")).toHaveLength(2);
    expect(screen.queryByText("Unknown Asset")).toBeNull();
    expect(screen.queryByText("Unknown Activity Token")).toBeNull();
  });
});
