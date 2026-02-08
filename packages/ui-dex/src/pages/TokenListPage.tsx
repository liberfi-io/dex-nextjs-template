import {
  useSetBottomNavigationBarActiveKey,
  useShowBottomNavigationBar,
  useShowHeader,
} from "@liberfi/ui-base";
import { TokenList, TokenListProvider, TokenListTap } from "@/components/tokens";
import clsx from "clsx";

export function TokenListPage() {
  // always display header
  useShowHeader();

  // display bottom navigation bar on tablet & mobile
  useShowBottomNavigationBar("tablet");

  // set bottom navigation bar active tab
  useSetBottomNavigationBarActiveKey("token_list");

  return (
    <div
      className={clsx(
        "px-4 flex flex-col gap-4",
        // tablet & desktop: full height
        "h-[calc(100vh-var(--header-height)-0.625rem)]",
        // mobile: reserved space for footer actions
        "max-sm:h-[calc(100vh-var(--header-height)-0.625rem-var(--footer-height))]",
      )}
    >
      <TokenListProvider>
        <TokenListTap />
        <TokenList />
      </TokenListProvider>
    </div>
  );
}
