import { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import { DiscoverTokenListMeasurementGate } from "./DiscoverTokenListSkeleton";

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
  it("mounts the data owner immediately with a stable fallback height", () => {
    const onQuery = jest.fn();
    const onUnmount = jest.fn();

    function DataOwner({ height }: { height: number }) {
      useEffect(() => {
        onQuery();
        return onUnmount;
      }, []);

      return <div data-testid="token-list" data-height={height} />;
    }

    const { rerender } = render(
      <DiscoverTokenListMeasurementGate>
        {(height) => <DataOwner height={height} />}
      </DiscoverTokenListMeasurementGate>,
    );

    expect(screen.getByTestId("token-list").getAttribute("data-height")).toBe(
      "600",
    );
    expect(onQuery).toHaveBeenCalledTimes(1);

    rerender(
      <DiscoverTokenListMeasurementGate height={640}>
        {(height) => <DataOwner height={height} />}
      </DiscoverTokenListMeasurementGate>,
    );

    expect(screen.getByTestId("token-list").getAttribute("data-height")).toBe(
      "640",
    );
    expect(onQuery).toHaveBeenCalledTimes(1);
    expect(onUnmount).not.toHaveBeenCalled();
  });
});
