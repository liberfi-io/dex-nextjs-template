// import { ChainSelect } from "../../ChainSelect";
import { HeaderAccountInfo } from "./HeaderAccountInfo";
import { HeaderBrand } from "./HeaderBrand";
import { HeaderLinks } from "./HeaderLinks";
import { HeaderSearchInput } from "./HeaderSearchInput";
import { HeaderSettingsMenu } from "./HeaderSettingsMenu";
import { HeaderLaunchPadAction, HeaderLanguageAction } from "./actions";
import { ChainSelectWidget } from "@liberfi.io/ui-chain-select";
import { useSwitchChain } from "@liberfi.io/wallet-connector";

export function Header() {
  const switchChain = useSwitchChain();

  return (
    <header className="w-full h-full px-4 lg:px-6 pb-2 flex justify-between items-center gap-10 bg-background">
      {/* left */}
      <div className="shrink-0 flex items-center gap-10">
        <HeaderBrand />
        <HeaderLinks />
      </div>

      {/* center */}
      <div className="grow max-w-sm md:max-w-md lg:max-w-lg">
        <HeaderSearchInput />
      </div>

      {/* right */}
      <div className="shrink-0 flex justify-end items-center gap-4">
        <ChainSelectWidget size="sm" onSwitchChain={switchChain} />
        <HeaderLaunchPadAction />
        <HeaderLanguageAction />
        <HeaderAccountInfo />
        <HeaderSettingsMenu />
      </div>
    </header>
  );
}
