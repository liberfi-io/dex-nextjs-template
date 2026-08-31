import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { AuthStatus } from "@liberfi.io/wallet-connector";
import { PortfolioAuthGuard } from "./PortfolioAuthGuard";

let mockAuthStatus: AuthStatus = "unauthenticated";
const mockSignIn = jest.fn();

jest.mock("@liberfi.io/wallet-connector", () => ({
  useAuth: () => ({ status: mockAuthStatus, signIn: mockSignIn }),
}));

jest.mock("@liberfi.io/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@heroui/react", () => ({
  Skeleton: ({ className }: { className?: string }) => <div className={className} />,
}));

jest.mock("@liberfi.io/ui", () => ({
  Button: ({
    children,
    onPress,
  }: {
    children: React.ReactNode;
    onPress?: () => void;
  }) => <button onClick={onPress}>{children}</button>,
  cn: (...classes: Array<string | undefined | false>) => classes.filter(Boolean).join(" "),
}));

describe("PortfolioAuthGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthStatus = "unauthenticated";
  });

  it("shows a sign-in prompt after the automatic login flow is dismissed", async () => {
    render(
      <PortfolioAuthGuard>
        <div data-testid="portfolio-content" />
      </PortfolioAuthGuard>,
    );

    await waitFor(() => expect(mockSignIn).toHaveBeenCalledTimes(1));

    expect(screen.queryByText("common.unauthenticated")).not.toBeNull();
    expect(screen.queryByText("portfolio.connectWallet.hint")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "common.signIn" }));
    expect(mockSignIn).toHaveBeenCalledTimes(2);
  });

  it("uses the current portfolio page structure while authentication is pending", () => {
    mockAuthStatus = "authenticating";

    render(
      <PortfolioAuthGuard>
        <div data-testid="portfolio-content" />
      </PortfolioAuthGuard>,
    );

    expect(screen.queryByTestId("portfolio-page-skeleton")).not.toBeNull();
    expect(screen.queryByTestId("portfolio-header-skeleton")).not.toBeNull();
    expect(screen.queryByTestId("portfolio-allocation-skeleton")).not.toBeNull();
    expect(screen.queryByTestId("portfolio-bottom-panel-skeleton")).not.toBeNull();

    const tableHeader = screen.getByTestId("portfolio-table-header-skeleton");
    expect(tableHeader.className.split(" ")).not.toContain("border-b");
    expect(tableHeader.className.split(" ")).not.toContain("border-divider");
  });

  it("renders portfolio content after authentication succeeds", () => {
    mockAuthStatus = "authenticated";

    render(
      <PortfolioAuthGuard>
        <div data-testid="portfolio-content" />
      </PortfolioAuthGuard>,
    );

    expect(screen.queryByTestId("portfolio-content")).not.toBeNull();
  });
});
