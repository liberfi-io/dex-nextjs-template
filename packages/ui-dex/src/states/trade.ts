/**
 * Trade related states
 */
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Token, TokenStat } from "@chainstream-io/sdk";
import { TradeSettingsValuesByChain } from "../types";

// current token address
export const tokenAddressAtom = atom<string | null>(null);

// current token info
export const tokenInfoAtom = atom<Token | null>(null);

// current token stats, used for the stats that are not real-time, such as volume, liquidity, holders, traders etc.
export const tokenStatsAtom = atom<TokenStat | null>(null);

// current token latest price
export const tokenLatestPriceAtom = atom<number | null>(null);

// current token latest market cap
export const tokenLatestMarketCapAtom = atom<number | null>(null);

// price or market cap tv chart
export const isPriceChartAtom = atomWithStorage("trade.is_price_chart", true, undefined, {
  getOnInit: true,
});

// tv chart quote in usd or token
export const isUSDChartAtom = atomWithStorage("trade.is_usd_chart", true, undefined, {
  getOnInit: true,
});

// hide left panel
export const hideTradeLeftPanelAtom = atomWithStorage("trade.hide_left_panel", false, undefined, {
  getOnInit: true,
});

// trade settings
export const tradeSettingsAtom = atomWithStorage<TradeSettingsValuesByChain>(
  "trade.settings",
  {},
  undefined,
  {
    getOnInit: true,
  },
);

// current trade buy preset
export const tradeBuyPresetAtom = atomWithStorage("trade.settings.buy_preset", 0, undefined, {
  getOnInit: true,
});

// current trade sell preset
export const tradeSellPresetAtom = atomWithStorage("trade.settings.sell_preset", 0, undefined, {
  getOnInit: true,
});
