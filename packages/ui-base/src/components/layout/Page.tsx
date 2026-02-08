import { PropsWithChildren, ReactNode } from "react";
import { useAtomValue } from "jotai";
import { clsx } from "clsx";
import { hideHeaderOnLayoutAtom, showBottomNavigationBarOnLayoutAtom } from "@/states";

export type PageProps = PropsWithChildren<{
  header?: ReactNode;
  bottomNavigationBar?: ReactNode;
  bottomToolBar?: ReactNode;
  className?: string;
  classNames?: {
    wrapper?: string;
    header?: string;
    content?: string;
    bottomNavigationBar?: string;
    bottomToolBar?: string;
  };
}>;

export function Page({
  children,
  header,
  bottomNavigationBar,
  bottomToolBar,
  className,
  classNames,
}: PageProps) {
  const hideHeaderOnLayout = useAtomValue(hideHeaderOnLayoutAtom);
  const showBottomNavigationBarOnLayout = useAtomValue(showBottomNavigationBarOnLayoutAtom);

  return (
    // wrapper
    <div
      className={clsx(
        "w-full min-h-screen max-sm:min-h-dvh relative",
        classNames?.wrapper,
        className,
      )}
    >
      {/* header */}
      {header && (
        <nav
          className={clsx(
            "w-full h-[var(--header-height)] sticky top-0 z-50",
            {
              // always hide header
              hidden: hideHeaderOnLayout === "desktop",
              // hide header on tablet
              "max-lg:hidden": hideHeaderOnLayout === "tablet",
              // hide header on mobile
              "max-sm:hidden": hideHeaderOnLayout === "mobile",
            },
            classNames?.header,
          )}
        >
          {header}
        </nav>
      )}

      {/* content */}
      <div
        className={clsx(
          "w-full relative",
          {
            // always hide bottom navigation bar
            "pb-[0.625rem]":
              (!bottomNavigationBar || !showBottomNavigationBarOnLayout) && !bottomToolBar,
            "pb-[2.875rem]":
              (!bottomNavigationBar || !showBottomNavigationBarOnLayout) && !!bottomToolBar,
            // always show bottom navigation bar
            "pb-[calc(var(--footer-height)+0.625rem)]":
              bottomNavigationBar && showBottomNavigationBarOnLayout === "desktop",
            // show bottom navigation bar on tablet
            "pb-[0.625rem] max-lg:pb-[calc(var(--footer-height)+0.625rem)]":
              bottomNavigationBar && showBottomNavigationBarOnLayout === "tablet" && !bottomToolBar,
            "pb-[2.875rem] max-lg:pb-[calc(var(--footer-height)+0.625rem)]":
              bottomNavigationBar &&
              showBottomNavigationBarOnLayout === "tablet" &&
              !!bottomToolBar,
            // show bottom navigation bar on mobile
            "pb-[0.625rem] max-sm:pb-[calc(var(--footer-height)+0.625rem)]":
              bottomNavigationBar && showBottomNavigationBarOnLayout === "mobile" && !bottomToolBar,
            "pb-[2.875rem] max-sm:pb-[calc(var(--footer-height)+0.625rem)]":
              bottomNavigationBar &&
              showBottomNavigationBarOnLayout === "mobile" &&
              !!bottomToolBar,
          },
          classNames?.content,
        )}
      >
        {children}
      </div>

      {/* bottom tool bar */}
      {bottomToolBar && (
        <div
          className={clsx(
            "fixed inset-x-0 bottom-0 h-9 z-50",
            {
              // always hide bottom tool bar
              hidden: showBottomNavigationBarOnLayout === "desktop",
              // hide bottom tool bar on tablet
              "max-lg:hidden": showBottomNavigationBarOnLayout === "tablet",
              // hide bottom tool bar on mobile
              "max-sm:hidden": showBottomNavigationBarOnLayout === "mobile",
            },
            classNames?.bottomToolBar,
          )}
        >
          {bottomToolBar}
        </div>
      )}

      {/* bottom navigation bar */}
      {bottomNavigationBar && (
        <div
          className={clsx(
            "fixed inset-x-0 bottom-0 h-[var(--footer-height)] z-50",
            {
              // always hide bottom navigation bar
              hidden: !showBottomNavigationBarOnLayout,
              // show bottom navigation bar on tablet
              "lg:hidden": showBottomNavigationBarOnLayout === "tablet",
              // show bottom navigation bar on mobile
              "sm:hidden": showBottomNavigationBarOnLayout === "mobile",
            },
            classNames?.bottomNavigationBar,
          )}
        >
          {bottomNavigationBar}
        </div>
      )}
    </div>
  );
}
