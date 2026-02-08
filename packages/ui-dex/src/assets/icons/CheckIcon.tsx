import { SVGProps } from "react";

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 17 18" {...props}>
      <polyline
        fill="none"
        points="1 9 7 14 15 4"
        stroke="currentColor"
        strokeDasharray="22"
        strokeDashoffset="44"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        style={{ transition: "stroke-dashoffset 200ms" }}
      ></polyline>
    </svg>
  );
}
