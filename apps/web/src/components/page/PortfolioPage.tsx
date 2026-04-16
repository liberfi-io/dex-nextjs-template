"use client";

import { AccountPage } from "@liberfi/ui-dex";

export function PortfolioPage() {
  return (
    <div className="relative w-full h-full">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-[0.07]"
        style={{
          background:
            "radial-gradient(ellipse at center, #c7ff2e 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div className="relative z-[1]">
        <AccountPage />
      </div>
    </div>
  );
}
