import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { BottomTweets, BottomTweetsTitle } from "./BottomTweets";

jest.mock("@liberfi.io/ui", () => ({
  PauseIcon: () => <div data-testid="twitter-panel-paused" />,
}));

jest.mock("@liberfi.io/ui-media-track", () => ({
  TweetsWidget: ({
    onPauseChange,
  }: {
    onPauseChange?: (isPaused: boolean) => void;
  }) => (
    <button
      data-testid="tweets-widget"
      onClick={() => onPauseChange?.(true)}
    />
  ),
}));

jest.mock("../application/SwitchWallet", () => ({
  SwitchWallet: () => <div data-testid="twitter-panel-wallet" />,
}));

jest.mock("./QuickAmountPresetInput", () => ({
  QuickAmountPresetInputWidget: () => (
    <div data-testid="twitter-panel-preset" />
  ),
}));

jest.mock("./TweetsLaunchButton", () => ({
  TweetsLaunchButton: () => null,
}));

describe("bottom Twitter panel controls", () => {
  it("renders tweets without wallet or preset controls", () => {
    function Harness() {
      const [isPaused, setIsPaused] = useState(false);

      return (
        <>
          <BottomTweetsTitle isPaused={isPaused} />
          <BottomTweets onPauseChange={setIsPaused} />
        </>
      );
    }

    render(<Harness />);

    expect(screen.getByTestId("tweets-widget")).toBeTruthy();
    expect(screen.queryByTestId("twitter-panel-wallet")).toBeNull();
    expect(screen.queryByTestId("twitter-panel-preset")).toBeNull();
    expect(
      screen.getByTestId("tweets-widget").parentElement?.childElementCount,
    ).toBe(1);

    fireEvent.click(screen.getByTestId("tweets-widget"));
    expect(screen.getByTestId("twitter-panel-paused")).toBeTruthy();
  });
});
