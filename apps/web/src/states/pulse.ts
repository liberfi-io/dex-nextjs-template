import { atomWithStorage } from "jotai/utils";
import type { TokenListFiltersType } from "@liberfi.io/ui-tokens";

export type PulseListSettings = {
  instant_buy?: {
    preset?: number;
    amount?: number;
  };
  filters?: TokenListFiltersType;
};

export type PulseSettings = {
  new?: PulseListSettings;
  final_stretch?: PulseListSettings;
  migrated?: PulseListSettings;
};

export const pulseSettingsAtom = atomWithStorage<PulseSettings>("pulse.settings", {}, undefined, {
  getOnInit: true,
});
