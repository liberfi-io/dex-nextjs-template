import { atomWithStorage } from "jotai/utils";

export type PulseListSettings = {
  instant_buy?: {
    preset?: number;
    amount?: number;
  };
};

export type PulseSettings = {
  new?: PulseListSettings;
  final_stretch?: PulseListSettings;
  migrated?: PulseListSettings;
};

export const pulseSettingsAtom = atomWithStorage<PulseSettings>("pulse.settings", {}, undefined, {
  getOnInit: true,
});
