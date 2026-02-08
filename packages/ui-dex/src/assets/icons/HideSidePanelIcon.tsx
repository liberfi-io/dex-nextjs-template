import { SVGProps } from "react";

export function HideSidePanelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="22"
      height="20"
      viewBox="0 0 22 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0 10C0 4.47715 4.47715 0 10 0H22V20H10C4.47715 20 0 15.5228 0 10Z"
        fill="#1F2023"
      ></path>
      <path
        d="M12 6L9 10L12 14"
        stroke="#A1A1AA"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M17 6L14 10L17 14"
        stroke="#A1A1AA"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}
