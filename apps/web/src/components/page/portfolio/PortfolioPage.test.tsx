import { render, screen } from "@testing-library/react";
import { PortfolioPage } from "./PortfolioPage";

let mockSummaryData: unknown;
let mockSummaryPending = false;
let mockSummaryError = false;
let mockPortfoliosData: unknown;
let mockPortfoliosPending = false;
let mockPortfoliosError = false;

jest.mock("../../../application/layout-chrome", () => ({
  useHideHeader: jest.fn(),
  useShowBottomNavigationBar: jest.fn(),
  useSetBottomNavigationBarActiveKey: jest.fn(),
}));

jest.mock("@liberfi.io/ui-chain-select", () => ({
  useCurrentChain: () => ({ chain: "solana" }),
}));

jest.mock("@liberfi.io/wallet-connector", () => ({
  useConnectedWallet: () => ({ address: "wallet" }),
}));

jest.mock("@liberfi.io/ui-portfolio", () => ({
  useWalletSummary: () => ({
    data: mockSummaryData,
    isPending: mockSummaryPending,
    isError: mockSummaryError,
  }),
}));

jest.mock("@liberfi.io/react", () => ({
  useWalletPortfoliosQuery: () => ({
    data: mockPortfoliosData,
    isPending: mockPortfoliosPending,
    isError: mockPortfoliosError,
  }),
}));

jest.mock("./PortfolioHeader", () => ({
  PortfolioHeader: () => <div data-testid="portfolio-header" />,
}));

jest.mock("./PortfolioAllocationChart", () => ({
  PortfolioAllocationChart: () => <div data-testid="portfolio-allocation-chart" />,
}));

jest.mock("./PortfolioBottomPanel", () => ({
  PortfolioBottomPanel: () => <div data-testid="portfolio-bottom-panel" />,
}));

jest.mock("./skeletons/PortfolioPageSkeleton", () => ({
  PortfolioPageSkeleton: () => <div data-testid="portfolio-page-skeleton" />,
}));

describe("PortfolioPage loading boundary", () => {
  beforeEach(() => {
    mockSummaryData = { balanceInUsd: "1" };
    mockSummaryPending = false;
    mockSummaryError = false;
    mockPortfoliosData = { portfolios: [] };
    mockPortfoliosPending = false;
    mockPortfoliosError = false;
  });

  it.each([
    ["wallet summary", true, undefined, false, { portfolios: [] }],
    ["portfolio holdings", false, { balanceInUsd: "1" }, true, undefined],
  ])(
    "keeps the whole page on one skeleton while %s is loading",
    (_, summaryPending, summaryData, portfoliosPending, portfoliosData) => {
      mockSummaryPending = summaryPending;
      mockSummaryData = summaryData;
      mockPortfoliosPending = portfoliosPending;
      mockPortfoliosData = portfoliosData;

      render(<PortfolioPage />);

      expect(screen.queryByTestId("portfolio-page-skeleton")).not.toBeNull();
      expect(screen.queryByTestId("portfolio-header")).toBeNull();
      expect(screen.queryByTestId("portfolio-allocation-chart")).toBeNull();
      expect(screen.queryByTestId("portfolio-bottom-panel")).toBeNull();
    },
  );

  it("renders all portfolio sections together after the primary data resolves", () => {
    render(<PortfolioPage />);

    expect(screen.queryByTestId("portfolio-page-skeleton")).toBeNull();
    expect(screen.queryByTestId("portfolio-header")).not.toBeNull();
    expect(screen.queryByTestId("portfolio-allocation-chart")).not.toBeNull();
    expect(screen.queryByTestId("portfolio-bottom-panel")).not.toBeNull();
  });

  it.each(["summary", "portfolios"])(
    "does not leave the page trapped behind the skeleton after a %s error",
    (source) => {
      if (source === "summary") {
        mockSummaryData = undefined;
        mockSummaryPending = true;
        mockSummaryError = true;
      } else {
        mockPortfoliosData = undefined;
        mockPortfoliosPending = true;
        mockPortfoliosError = true;
      }

      render(<PortfolioPage />);

      expect(screen.queryByTestId("portfolio-page-skeleton")).toBeNull();
      expect(screen.queryByTestId("portfolio-header")).not.toBeNull();
      expect(screen.queryByTestId("portfolio-allocation-chart")).not.toBeNull();
      expect(screen.queryByTestId("portfolio-bottom-panel")).not.toBeNull();
    },
  );
});
