export function isMediaTrackRuntimeActive(pathname: string, isPanelOpen: boolean): boolean {
  return isPanelOpen || pathname === "/media-track" || pathname.startsWith("/media-track/");
}
