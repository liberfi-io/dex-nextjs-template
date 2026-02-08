import { SVGProps } from "react";

export function BubbleMapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="12px"
      height="12px"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      {...props}
    >
      <circle cx="11.5" cy="4.5" r="4.5"></circle>
      <circle cx="4" cy="9" r="3"></circle>
      <circle cx="11" cy="13" r="2"></circle>
    </svg>
  );
}
