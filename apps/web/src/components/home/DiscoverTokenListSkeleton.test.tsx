import { render, screen } from "@testing-library/react";
import {
  DiscoverTokenListMeasurementGate,
  DiscoverTokenListSkeleton,
} from "./DiscoverTokenListSkeleton";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe("discover loading skeletons", () => {
  it("keeps the skeleton visible until the token list has a measured height", () => {
    const { rerender } = render(
      <DiscoverTokenListMeasurementGate>
        <div data-testid="measured-token-list" />
      </DiscoverTokenListMeasurementGate>,
    );

    expect(screen.getByTestId("discover-token-list-skeleton")).not.toBeNull();
    expect(screen.queryByTestId("measured-token-list")).toBeNull();

    rerender(
      <DiscoverTokenListMeasurementGate height={640}>
        <div data-testid="measured-token-list" />
      </DiscoverTokenListMeasurementGate>,
    );

    expect(screen.queryByTestId("discover-token-list-skeleton")).toBeNull();
    expect(screen.getByTestId("measured-token-list")).not.toBeNull();
  });

  it("renders a stable initial table body before the measured widget is available", () => {
    render(<DiscoverTokenListSkeleton />);

    expect(screen.getByTestId("discover-token-list-skeleton")).not.toBeNull();
    expect(screen.getByRole("grid", { hidden: true }).getAttribute("aria-label")).toBe("Tokens");
  });
});
