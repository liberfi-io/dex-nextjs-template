import { isMediaTrackRuntimeActive } from "./media-track-activity";

describe("isMediaTrackRuntimeActive", () => {
  it.each([
    ["/", false, false],
    ["/discover", false, false],
    ["/", true, true],
    ["/media-track", false, true],
    ["/media-track/detail", false, true],
    ["/media-tracker", false, false],
  ])("resolves pathname %s and panel state %s to %s", (pathname, isPanelOpen, expected) => {
    expect(isMediaTrackRuntimeActive(pathname, isPanelOpen)).toBe(expected);
  });
});
