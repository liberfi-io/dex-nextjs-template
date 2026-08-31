"use client";

import { useTranslation } from "@liberfi.io/i18n";
import { useEffect, useRef, useState } from "react";
import { cn } from "@liberfi.io/ui";
import { ODDS_FORMATS, type OddsFormat } from "../odds/convert-price";
import { useOddsFormat } from "../odds/OddsFormatProvider";

/** Global odds-format dropdown (8 formats, zero network). */
export function OddsFormatSelect() {
  const { t } = useTranslation();
  const [format, setFormat] = useOddsFormat();
  const oddsLabel = (f: OddsFormat) => t(`extend.worldcup.oddsFormat.${f}`);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-xs font-medium border bg-surface-interactive/60 text-text-secondary border-border-control/50 hover:bg-surface-interactive hover:text-text-primary transition-colors cursor-pointer tabular-nums"
      >
        <span className="text-text-muted">{t("extend.worldcup.odds")}</span>
        <span>{oddsLabel(format)}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("text-text-muted transition-transform", open && "rotate-180")}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-44 overflow-hidden rounded-xl border border-border-control bg-surface-raised p-1 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          {ODDS_FORMATS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFormat(f);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-xs font-medium transition-colors cursor-pointer",
                f === format
                  ? "bg-surface-interactive text-brand-primary"
                  : "text-text-secondary hover:bg-surface-interactive/60 hover:text-text-primary",
              )}
            >
              {oddsLabel(f)}
              {f === format && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
