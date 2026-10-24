import { fireEvent, render, screen } from "@testing-library/react";
import { Chain } from "@liberfi.io/types";
import { AppBottomToolbar } from "./AppBottomToolbar";

const openPresetModal = jest.fn();
const setPreset = jest.fn();

jest.mock("@liberfi.io/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@liberfi.io/ui", () => ({
  Button: ({ children, onPress }: { children?: React.ReactNode; onPress?: () => void }) => (
    <button onClick={onPress}>{children}</button>
  ),
  DiscordIcon: () => null,
  Divider: () => null,
  RobotIcon: () => null,
  SettingsIcon: () => null,
  StyledTooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TwitterIcon: () => null,
  UserGuideIcon: () => null,
}));

jest.mock("@liberfi.io/ui-scaffold", () => ({
  ScaffoldToolbar: ({ left }: { left: React.ReactNode }) => <div>{left}</div>,
  useDraggableDisclosure: () => ({ onOpen: jest.fn() }),
}));

jest.mock("./modals/DeferredAsyncModalHost", () => ({
  useDeferredAsyncModal: () => ({ onOpen: openPresetModal }),
}));

jest.mock("@liberfi.io/ui-chain-select", () => ({
  useCurrentChain: () => ({ chain: Chain.SOLANA }),
}));

jest.mock("@liberfi.io/utils", () => ({
  getNativeToken: () => ({ address: "native" }),
}));

jest.mock("@liberfi.io/ui-trade", () => ({
  useInstantTradeAmount: () => ({ preset: 1, setPreset }),
}));

jest.mock("./BottomToolBarWallet", () => ({ BottomToolBarWallet: () => null }));
jest.mock("./BottomNetworkStatus", () => ({ BottomNetworkStatus: () => null }));
jest.mock("./BottomPrimaryTokenPrice", () => ({ BottomPrimaryTokenPrice: () => null }));

describe("AppBottomToolbar preset settings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("synchronizes modal preset tabs for the current chain only", () => {
    render(<AppBottomToolbar />);

    fireEvent.click(screen.getByRole("button", { name: "trade.settings.preset2" }));

    const params = openPresetModal.mock.calls[0][0].params;
    params.onPresetIndexChange(Chain.SOLANA, 2);
    params.onPresetIndexChange(Chain.ETHEREUM, 0);

    expect(setPreset).toHaveBeenCalledTimes(1);
    expect(setPreset).toHaveBeenCalledWith(2);
  });
});
