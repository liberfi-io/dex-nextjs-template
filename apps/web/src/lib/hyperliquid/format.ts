/**
 * Hyperliquid price/size formatting helpers.
 *
 * The exchange endpoint enforces strict precision rules on every order
 * action. Sending a number that violates them is rejected upstream
 * with a `price/size has too many decimals/significant figures` error
 * — usually only after the user signed, which is a bad UX. So the
 * client formats price + size strings on the way in, *before* signing,
 * with the same algorithm Hyperliquid's official Python SDK and
 * axiom's frontend use.
 *
 * Rules (from Hyperliquid docs, perps endpoint):
 *
 *   • price: ≤ 5 significant figures, AND ≤ (6 − szDecimals) decimals.
 *           Integer prices are always allowed regardless of sig figs
 *           (e.g. "123456" is valid even though it has 6 sig figs).
 *   • size:  exactly `szDecimals` decimals, truncated (never rounded
 *           up — would breach the user's posted margin).
 *
 * For market orders we also need a worst-case slippage price. We
 * leave the slippage math to the caller and just expose `formatHlPx`
 * with a directional rounding mode:
 *
 *   • "ceil"  — used for buys; rounding up moves the cap further from
 *              the mark, ensuring the order can fill.
 *   • "floor" — used for sells; rounding down likewise pushes the cap
 *              further from the mark for a sell.
 *
 * ── Test anchors (from three real axiom POSTs to /exchange) ────────
 *
 *   1. BTC market buy  (szDecimals = 5)
 *      payload: { p: "88789",   s: "0.00015" }
 *      decoded: markPx ≈ 82_212 → markPx × 1.08 ≈ 88_788.96
 *               formatHlPx(88_788.96, 5, "ceil") → "88789"
 *               formatHlSz(0.00015,   5)         → "0.00015"
 *
 *   2. ETH market buy  (szDecimals = 4)
 *      payload: { p: "2510.5",  s: "0.0052" }
 *      decoded: markPx ≈ 2_324.5 → markPx × 1.08 ≈ 2_510.46
 *               formatHlPx(2_510.46, 4, "ceil") → "2510.5"
 *               formatHlSz(0.0052,   4)         → "0.0052"
 *
 *   3. BTC market buy  (szDecimals = 5)
 *      payload: { p: "87323",   s: "0.00015" }
 *      decoded: markPx ≈ 80_854 → markPx × 1.08 ≈ 87_322.32
 *               formatHlPx(87_322.32, 5, "ceil") → "87323"
 *               formatHlSz(0.00015,   5)         → "0.00015"
 *
 * If you change either function, walk through the three samples
 * mentally first — they're a free regression suite.
 */

/** Maximum significant figures any price string may carry. */
const HL_MAX_SIG_FIGS = 5;

/**
 * Maximum decimal places allowed for prices on the **perps** endpoint.
 * Spot would use 8 here. We're perps-only for now.
 */
const HL_PRICE_MAX_DECIMALS_BASE = 6;

/**
 * Round-to-floor tolerance for FP noise when scaling a coin-unit size
 * up by `10^szDecimals`. Without this, IEEE 754 representation of
 * common decimals (e.g. 0.00015 × 1e5 = 14.999999999999998) silently
 * loses one tick of precision after `Math.floor`.
 *
 * 1e-9 is well below any user-meaningful precision (the order panel
 * caps at four-digit USDC margin, two-digit leverage, mark price ~ 5
 * sig figs — combined precision ≪ 1e-9) and well above the typical
 * compounded FP error of <1e-12.
 */
const SIZE_FP_TOLERANCE = 1e-9;

/**
 * Same idea as {@link SIZE_FP_TOLERANCE}, but for the price-side
 * `price / step` division. Sub-integer `step` values amplify FP
 * error — e.g. `0.054 / 1e-6` produces `53999.999999999985` in IEEE
 * 754 — and naïve `Math.ceil` would push the result up an extra
 * grid tick. The guard accepts a ratio as integer when it's within
 * 1e-9 of one, which is far smaller than any user-meaningful price
 * delta.
 */
const RATIO_FP_TOLERANCE = 1e-9;

/**
 * Format a price for Hyperliquid's `/exchange` endpoint.
 *
 * The output respects BOTH constraints simultaneously: ≤ 5 sig figs
 * and ≤ (6 − szDecimals) decimals. The more restrictive of the two
 * defines the snap grid; ties are broken by the `mode` argument so
 * the caller can produce slippage-safe market prices.
 *
 * @param price       Unrounded numeric price (e.g. `markPx × 1.08`).
 * @param szDecimals  Per-asset size precision from `meta.universe[i]`.
 * @param mode        `"ceil"` for buys, `"floor"` for sells.
 * @returns A canonical decimal string (no scientific notation, no
 *          trailing zeros), ready to copy into the action payload.
 *
 * @throws when `price` is not a finite positive number.
 */
export function formatHlPx(
  price: number,
  szDecimals: number,
  mode: "ceil" | "floor",
): string {
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(
      `formatHlPx: price must be a positive finite number (got ${price})`,
    );
  }
  if (!Number.isFinite(szDecimals) || szDecimals < 0) {
    throw new Error(
      `formatHlPx: szDecimals must be a non-negative integer (got ${szDecimals})`,
    );
  }

  // Decimals limit comes from the venue's `MAX_DECIMALS - szDecimals`
  // formula. Negative values are nonsensical and clamped to 0.
  const maxDecimals = Math.max(0, HL_PRICE_MAX_DECIMALS_BASE - szDecimals);

  // Sig-fig grid: the smallest "step" that keeps the number at most
  // HL_MAX_SIG_FIGS digits long. For 5 sig figs and a number in the
  // 10^k range, the grid is 10^(k-4).
  const exponent = Math.floor(Math.log10(price));
  const sigFigStep = Math.pow(10, exponent - (HL_MAX_SIG_FIGS - 1));

  // Decimal grid: 10^(-maxDecimals).
  const decimalStep = Math.pow(10, -maxDecimals);

  // The effective step is whichever rule is MORE restrictive (i.e.
  // larger step, fewer choices). Hyperliquid waives sig-fig limits
  // for integer outputs — but our `step` is at most 1 in that case,
  // so the integer waiver is automatically respected.
  const step = Math.max(sigFigStep, decimalStep);

  // FP-noise guard: `price / step` for sub-integer steps almost
  // never lands on a whole number exactly (e.g. 0.054 / 1e-6 yields
  // 53999.999999999985 in IEEE 754). Snapping the ratio to the
  // nearest integer when within `RATIO_FP_TOLERANCE` prevents
  // `Math.ceil` from kicking us up an extra grid point unnecessarily
  // (which would otherwise produce e.g. "0.054001" instead of
  // "0.054").
  const ratio = price / step;
  const nearest = Math.round(ratio);
  const adjusted =
    Math.abs(ratio - nearest) < RATIO_FP_TOLERANCE ? nearest : ratio;
  const snapped =
    mode === "ceil" ? Math.ceil(adjusted) * step : Math.floor(adjusted) * step;

  // Step size determines effective output decimals. For step = 0.1
  // we want 1 dp, step = 0.01 → 2 dp, etc. Use rounded log to dodge
  // FP error in the exponent calculation.
  const stepDecimals = step >= 1 ? 0 : Math.round(-Math.log10(step));

  return trimTrailingZeros(snapped.toFixed(stepDecimals));
}

/**
 * Format a coin-unit size for Hyperliquid's `/exchange` endpoint.
 *
 * Always truncates to `szDecimals` decimal places — Hyperliquid
 * interprets the size as the user's commitment, and any rounding-up
 * would imply margin the user did not actually post.
 *
 * The FP-noise tolerance handles the IEEE 754 representation gotcha
 * where e.g. `0.00015 * 1e5 = 14.999999999999998` instead of `15`.
 * Without it the truncation would drop a full tick of precision on
 * common user inputs.
 *
 * @param size        Coin-unit position size (e.g. `0.00015`).
 * @param szDecimals  Per-asset size precision from `meta.universe[i]`.
 * @returns A fixed-decimal string with exactly `szDecimals` decimals.
 *
 * @throws when `size` is not a finite non-negative number.
 */
export function formatHlSz(size: number, szDecimals: number): string {
  if (!Number.isFinite(size) || size < 0) {
    throw new Error(
      `formatHlSz: size must be a non-negative finite number (got ${size})`,
    );
  }
  if (!Number.isFinite(szDecimals) || szDecimals < 0) {
    throw new Error(
      `formatHlSz: szDecimals must be a non-negative integer (got ${szDecimals})`,
    );
  }

  const factor = Math.pow(10, szDecimals);
  const scaled = size * factor;
  const nearest = Math.round(scaled);
  const snapped =
    Math.abs(scaled - nearest) < SIZE_FP_TOLERANCE
      ? nearest
      : Math.floor(scaled);
  return (snapped / factor).toFixed(szDecimals);
}

function trimTrailingZeros(s: string): string {
  if (!s.includes(".")) return s;
  return s.replace(/\.?0+$/, "");
}
