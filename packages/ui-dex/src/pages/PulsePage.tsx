import { clsx } from "clsx";
import { Pulse, PulseProvider } from "../components";
import {
  useSetBottomNavigationBarActiveKey,
  useShowBottomNavigationBar,
  useShowHeader,
} from "@liberfi/ui-base";

export function PulsePage() {
  // always display header
  useShowHeader();

  // display bottom navigation bar on tablet & mobile
  useShowBottomNavigationBar("tablet");

  // set bottom navigation bar active tab
  useSetBottomNavigationBarActiveKey("pulse");

  return (
    <div
      className={clsx(
        "max-w-[1920px] mx-auto px-1 lg:px-6",
        // tablet & desktop: full height
        "h-[calc(100vh-var(--header-height)-0.625rem)]",
        "lg:h-[calc(100vh-var(--header-height)-2.875rem)]",
        // mobile: reserved space for footer actions
        "max-sm:h-[calc(100vh-var(--header-height)-0.625rem-var(--footer-height))]",
      )}
    >
      <PulseProvider>
        <Pulse />
      </PulseProvider>
    </div>
  );
}
