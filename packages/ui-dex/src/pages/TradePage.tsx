import { useHideBottomNavigationBar, useHideHeader } from "@liberfi/ui-base";
import {
  TradeHeader,
  // TradeHeaderToolbar,
  TradeTokenBasic,
  TradingChart,
  TradeMainSplitRight,
  TradeWrapper,
  TradeTokenRichInfo,
  AccountSection,
  TradeMainSplitLeft,
  TradeHeaderTokenInfo,
  TradeFooter,
  InstantTrade,
} from "@/components/trade";

export function TradePage() {
  // hide header on tablet & mobile
  useHideHeader("tablet");

  // always hide bottom navigation bar
  useHideBottomNavigationBar();

  return (
    <TradeWrapper>
      <TradeHeader />
      {/* <TradeHeaderToolbar /> */}
      <TradeHeaderTokenInfo />
      <TradeMainSplitRight
        sideContent={
          <>
            <InstantTrade />
            <AccountSection />
          </>
        }
      >
        <TradeTokenBasic />
        <TradeMainSplitLeft
          sideContent={
            <>
              <InstantTrade className="max-md:hidden xl:hidden" />
              <TradeTokenRichInfo />
            </>
          }
        >
          <TradingChart />
        </TradeMainSplitLeft>
      </TradeMainSplitRight>
      <TradeFooter />
    </TradeWrapper>
  );
}
