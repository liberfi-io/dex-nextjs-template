import { atom } from "jotai";
import { LaunchPadPlatform } from "@liberfi/react-launchpad";
import { LaunchPadCurveAreaChartPoint } from "./components";

export const launchPadPlatform = atom<LaunchPadPlatform>(LaunchPadPlatform.PUMPFUN);

export const launchPadCurvePoints = atom<LaunchPadCurveAreaChartPoint[]>([]);
