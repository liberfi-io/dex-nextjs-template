import { SVGProps } from "react";

export function OpenSidePanelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="19"
      height="26"
      viewBox="0 0 19 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M19 4C19 1.79086 17.2091 0 15 0H0V26H15C17.2091 26 19 24.2091 19 22V4Z"
        fill="#1F2023"
      ></path>
      <path
        d="M9.5 9L12.35 13L9.5 17"
        stroke="#A1A1AA"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M4.75 9L7.6 13L4.75 17"
        stroke="#A1A1AA"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}
