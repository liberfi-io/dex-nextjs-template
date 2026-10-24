import { render, screen } from "@testing-library/react";
import { LaunchPadModal } from "./LaunchPadModal";

jest.mock("@liberfi.io/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@liberfi.io/ui", () => ({
  StyledModal: ({ children }: { children: React.ReactNode }) => (
    <div role="dialog">{children}</div>
  ),
  ModalContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ModalBody: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="launchpad-modal-scroll-area" className={className}>
      {children}
    </div>
  ),
  useScreen: () => ({ isMobile: false }),
  XCloseIcon: () => null,
}));

jest.mock("@liberfi.io/ui-scaffold", () => ({
  AsyncModal: ({
    children,
  }: {
    children: (props: {
      params: Record<string, never>;
      isOpen: boolean;
      onOpenChange: jest.Mock;
    }) => React.ReactNode;
  }) => children({ params: {}, isOpen: true, onOpenChange: jest.fn() }),
}));

jest.mock("@liberfi.io/ui-launchpad", () => ({
  LaunchPadHome: () => <div data-testid="launchpad-content" />,
}));

jest.mock("../../runtime/Stage55UiBridge", () => ({
  LaunchpadUiBridge: ({ children }: { children: React.ReactNode }) => children,
}));

describe("LaunchPadModal", () => {
  it("keeps overflowing launchpad content inside a vertical scroll area", () => {
    render(<LaunchPadModal />);

    const scrollArea = screen.getByTestId("launchpad-modal-scroll-area");
    expect(scrollArea.className.split(" ")).toEqual(
      expect.arrayContaining(["min-h-0", "overflow-y-auto"]),
    );
    expect(screen.queryByTestId("launchpad-content")).not.toBeNull();
  });
});
