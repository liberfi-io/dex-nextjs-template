import type { SVGProps } from "react";

/**
 * Simplified Hyperliquid brand mark.  A teal rounded-square background
 * with a white H-shape composed of two vertical bars + a horizontal
 * connector.  Sized via width/height props (defaults to 16×16).
 */
export function HyperliquidIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="24" height="24" rx="6" fill="#97FCE4" />
      <path
        fill="#072723"
        d="M5.6 6.5h2.7v4.4h7.4V6.5h2.7v11h-2.7v-4.5H8.3v4.5H5.6z"
      />
    </svg>
  );
}
