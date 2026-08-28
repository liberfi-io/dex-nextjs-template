import type { WidgetConstructor } from "@liberfi.io/ui-tradingview";

const SCRIPT_ID = "liberfi-tradingview-standalone";

type TradingViewHost = Window & {
  TradingView?: { widget?: WidgetConstructor };
};

export function getTradingViewWidgetConstructor(): WidgetConstructor | null {
  if (typeof window === "undefined") return null;
  return (window as TradingViewHost).TradingView?.widget ?? null;
}

export function loadTradingViewWidgetConstructor(): Promise<WidgetConstructor> {
  const existing = getTradingViewWidgetConstructor();
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    const host = window as TradingViewHost;
    const finish = () => {
      const ctor = host.TradingView?.widget;
      if (ctor) resolve(ctor);
      else reject(new Error("TradingView widget missing"));
    };

    const pending = document.getElementById(SCRIPT_ID);
    if (pending) {
      pending.addEventListener("load", finish, { once: true });
      pending.addEventListener("error", () => reject(new Error("failed to load charting library")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `${window.location.origin}/static/charting_library/charting_library.standalone.js`;
    script.async = true;
    script.onload = finish;
    script.onerror = () => reject(new Error("failed to load charting library"));
    document.head.appendChild(script);
  });
}
