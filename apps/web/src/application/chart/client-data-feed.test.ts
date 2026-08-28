import { floorToResolution } from "./tick-floor";

describe("SDK candle tick floor used by the token chart", () => {
  const minuteOpen = 60_000 * 28_333_334;

  it("maps millisecond timestamps onto the 1m open", () => {
    expect(floorToResolution(minuteOpen + 7_287, "1m")).toBe(minuteOpen);
  });

  it("maps unix-second values after the caller converts to ms", () => {
    expect(floorToResolution((minuteOpen / 1000 + 7) * 1000, "1m")).toBe(minuteOpen);
  });
});
