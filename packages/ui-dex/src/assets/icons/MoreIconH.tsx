import { SVGProps } from "react";

export function MoreIconH(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="6" cy="6" r="6" fill="#282828"></circle>
      <circle cx="3" cy="6" r="1" fill="#A1A1AA"></circle>
      <circle cx="6" cy="6" r="1" fill="#A1A1AA"></circle>
      <circle cx="9" cy="6" r="1" fill="#A1A1AA"></circle>
    </svg>
  );
}
