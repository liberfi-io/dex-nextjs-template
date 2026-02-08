import { SVGProps } from "react";

export function XStocksFilledIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g
        clipPath="url(#clip0_14178_39531)"
      >
        <mask
          id="mask0_14178_39531"
          maskUnits="userSpaceOnUse"
          x="3"
          y="3"
          width="12"
          height="12"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3 3H15V15H3V3Z"
            fill="white"
          ></path>
        </mask>
        <g mask="url(#mask0_14178_39531)">
          <path
            d="M15 3.08737C15 3.039 14.961 3 14.9126 3H10.9999L9 4.99988L7.00012 3H3.08737C3.039 3 3 3.039 3 3.08737V7.00012L4.99988 9L3 10.9999V14.9126C3 14.961 3.039 15 3.08737 15H7.00012L9 13.0001L10.9999 15H14.9126C14.961 15 15 14.961 15 14.9126V10.9999L13.0001 9L15 7.00012V3.08737Z"
            fill="currentColor"
          ></path>
        </g>
      </g>
      <defs>
        <clipPath id="clip0_14178_39531">
          <rect
            width="13.5"
            height="13.5"
            fill="white"
            transform="translate(2.25 2.25)"
          ></rect>
        </clipPath>
      </defs>
    </svg>
  );
}
