import { Divider } from "@heroui/react";
import clsx from "clsx";

export type TradingChartHeaderProps = {
  className?: string;
};

export function TradingChartHeader({ className }: TradingChartHeaderProps) {
  return (
    <div
      className={clsx(
        "flex h-[38px] w-full items-center gap-5 px-[14px] text-neutral max-sm:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-0 text-[12px]">
        <div className="mr-2 font-[500] sm:mr-4">Timeframe</div>
        <div className="flex h-[22px] cursor-pointer items-center justify-center rounded-full px-[10px] hover:opacity-80 bg-content3 font-bold text-white">
          1s
        </div>
        <div className="flex h-[22px] cursor-pointer items-center justify-center rounded-full px-[10px] hover:opacity-80">
          1m
        </div>
        <div className="flex h-[22px] cursor-pointer items-center justify-center rounded-full px-[10px] hover:opacity-80">
          5m
        </div>
        <div className="flex h-[22px] cursor-pointer items-center justify-center rounded-full px-[10px] hover:opacity-80">
          15m
        </div>
        <div className="flex h-[22px] cursor-pointer items-center justify-center rounded-full px-[10px] hover:opacity-80">
          1h
        </div>
        <div className="flex h-[22px] cursor-pointer items-center justify-center rounded-full px-[10px] hover:opacity-80">
          4h
        </div>
        <div className="flex h-[22px] cursor-pointer items-center justify-center rounded-full px-[10px] hover:opacity-80">
          1D
        </div>
        <div className="flex h-[22px] cursor-pointer items-center justify-center rounded-full px-[10px] hover:opacity-80">
          1W
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-6 w-6 cursor-pointer items-center justify-center hover:opacity-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
            data-sentry-element="svg"
            data-sentry-source-file="iconsV1.tsx"
            data-sentry-component="TradeTechnicalIndicatorIcon"
          >
            <path
              d="M21.752 19.5a.75.75 0 01-.75.75h-18a.75.75 0 01-.75-.75v-15a.75.75 0 011.5 0v10.19l4.72-4.72a.75.75 0 011.06 0l2.47 2.47 4.94-4.94h-1.94a.75.75 0 110-1.5h3.75a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V8.56l-5.47 5.471a.75.75 0 01-1.06 0l-2.47-2.47-5.25 5.25v1.94h17.25a.75.75 0 01.75.75z"
              data-sentry-element="path"
              data-sentry-source-file="iconsV1.tsx"
            ></path>
          </svg>
        </div>
        <div
          className="z-10 aria-expanded:scale-[0.97] aria-expanded:opacity-70 subpixel-antialiased flex h-6 w-6 cursor-pointer items-center justify-center hover:opacity-80"
          data-slot="trigger"
          aria-expanded="false"
          data-sentry-element="PopoverTrigger"
          data-sentry-source-file="TradingChartHeader.tsx"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            data-sentry-element="svg"
            data-sentry-component="TradeCandlesIcon"
            data-sentry-source-file="iconsV1.tsx"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.2367 1.34705C10.0042 1.34705 9.83327 1.51801 9.83327 1.75043V3.07293H9.15798C8.42217 3.07293 7.81974 3.67537 7.81974 4.41117V8.29442C7.81974 9.03023 8.42217 9.63266 9.15798 9.63266H9.83327V11.9619C9.83327 12.1944 10.0042 12.3653 10.2367 12.3653C10.4691 12.3653 10.64 12.1944 10.64 11.9619V9.63266H11.3153C12.0511 9.63266 12.6536 9.03023 12.6536 8.29442V4.33926C12.6536 3.60346 12.0511 3.00102 11.3153 3.00102H10.64V1.75043C10.64 1.51801 10.4691 1.34705 10.2367 1.34705ZM3.76458 1.63469C3.53216 1.63469 3.36119 1.80566 3.36119 2.03808V4.64328L2.6859 4.72769C1.95009 4.72769 1.34766 5.32935 1.34766 6.06515V9.9484C1.34766 10.6842 1.95009 11.2866 2.6859 11.2866H3.36119V12.2496C3.36119 12.482 3.53216 12.653 3.76458 12.653C3.997 12.653 4.16796 12.482 4.16796 12.2496V11.2866H4.84326C5.57906 11.2866 6.1815 10.6842 6.1815 9.9484V6.05606C6.24759 5.32899 5.65296 4.72691 4.91517 4.72691H4.23987V2.12011C4.17211 1.79597 3.98643 1.63469 3.76458 1.63469ZM8.6265 4.26735C8.6265 4.05439 8.83012 3.8797 9.08607 3.8797H11.3872C11.6002 3.8797 11.7749 4.08331 11.7749 4.33926V8.23874L11.7698 8.25413C11.7298 8.37392 11.6686 8.47808 11.5928 8.5539C11.5174 8.62925 11.4215 8.68207 11.3153 8.68207H9.01415C8.80119 8.68207 8.6265 8.47846 8.6265 8.22251V4.26735ZM2.22634 5.99324C2.22634 5.78028 2.42995 5.60559 2.6859 5.60559H4.98708C5.20004 5.60559 5.37473 5.8092 5.37473 6.06515V9.96463L5.3696 9.98002C5.32967 10.0998 5.26845 10.204 5.19263 10.2798C5.11728 10.3551 5.02138 10.408 4.91517 10.408H2.61398C2.40103 10.408 2.22634 10.2043 2.22634 9.9484V5.99324Z"
              fill="white"
              data-sentry-element="path"
              data-sentry-source-file="iconsV1.tsx"
            ></path>
          </svg>
        </div>
        <div className="flex h-6 w-6 cursor-pointer items-center justify-center hover:opacity-80">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            data-sentry-element="svg"
            data-sentry-source-file="iconsV1.tsx"
            data-sentry-component="TradeCameraIcon"
          >
            <path
              d="M3.6831 3.5L4.0016 2.4694C4.066 2.26103 4.19544 2.07876 4.37096 1.9493C4.54647 1.81984 4.75884 1.75 4.97693 1.75H9.02177C9.23986 1.75 9.45222 1.81984 9.62774 1.9493C9.80326 2.07876 9.9327 2.26103 9.9971 2.4694L10.3156 3.5H11.2285C12.1145 3.5 12.8327 4.21823 12.8327 5.10417V10.9375C12.8327 11.8234 12.1145 12.5417 11.2285 12.5417H2.77018C1.88424 12.5417 1.16602 11.8234 1.16602 10.9375V5.10417C1.16602 4.21823 1.88424 3.5 2.77018 3.5H3.6831ZM4.00583 4.375H2.77018C2.67443 4.375 2.57961 4.39386 2.49114 4.4305C2.40268 4.46715 2.32229 4.52086 2.25458 4.58857C2.18687 4.65628 2.13316 4.73666 2.09652 4.82513C2.05988 4.91359 2.04102 5.00841 2.04102 5.10417V10.9375C2.04102 11.0333 2.05988 11.1281 2.09652 11.2165C2.13316 11.305 2.18687 11.3854 2.25458 11.4531C2.32229 11.5208 2.40268 11.5745 2.49114 11.6112C2.57961 11.6478 2.67443 11.6667 2.77018 11.6667H11.2285C11.3243 11.6667 11.4191 11.6478 11.5076 11.6112C11.596 11.5745 11.6764 11.5208 11.7441 11.4531C11.8118 11.3854 11.8655 11.305 11.9022 11.2165C11.9388 11.1281 11.9577 11.0333 11.9577 10.9375V5.10417C11.9577 5.00841 11.9388 4.91359 11.9022 4.82513C11.8655 4.73666 11.8118 4.65628 11.7441 4.58857C11.6764 4.52086 11.596 4.46715 11.5076 4.4305C11.4191 4.39386 11.3243 4.375 11.2285 4.375H9.99287C9.89941 4.37499 9.80841 4.34506 9.7332 4.28958C9.65798 4.2341 9.60251 4.156 9.57491 4.06671L9.16104 2.72781C9.15185 2.69805 9.13337 2.67201 9.10831 2.65351C9.08324 2.63501 9.05292 2.62502 9.02177 2.625H4.97693C4.94578 2.62502 4.91545 2.63501 4.89039 2.65351C4.86533 2.67201 4.84685 2.69805 4.83766 2.72781L4.42379 4.06656C4.39621 4.15588 4.34075 4.23402 4.26554 4.28952C4.19032 4.34503 4.09931 4.37498 4.00583 4.375ZM6.99935 9.91667C5.79127 9.91667 4.81185 8.93725 4.81185 7.72917C4.81185 6.52108 5.79127 5.54167 6.99935 5.54167C8.20743 5.54167 9.18685 6.52108 9.18685 7.72917C9.18685 8.93725 8.20743 9.91667 6.99935 9.91667ZM6.99935 9.04167C7.34745 9.04167 7.68128 8.90338 7.92743 8.65724C8.17357 8.4111 8.31185 8.07726 8.31185 7.72917C8.31185 7.38107 8.17357 7.04723 7.92743 6.80109C7.68128 6.55495 7.34745 6.41667 6.99935 6.41667C6.65125 6.41667 6.31741 6.55495 6.07127 6.80109C5.82513 7.04723 5.68685 7.38107 5.68685 7.72917C5.68685 8.07726 5.82513 8.4111 6.07127 8.65724C6.31741 8.90338 6.65125 9.04167 6.99935 9.04167Z"
              fill="#A1A1AA"
              data-sentry-element="path"
              data-sentry-source-file="iconsV1.tsx"
            ></path>
          </svg>
        </div>
        <Divider orientation="vertical" className="h-4 border-content3" />
        <div
          className="flex h-6 w-6 cursor-pointer items-center justify-center hover:opacity-80"
          data-sentry-component="ThirdPartyBrowserButton"
          data-sentry-source-file="ThirdPartyBrowserButton.tsx"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            data-sentry-element="svg"
            data-sentry-source-file="iconsV1.tsx"
            data-sentry-component="ThirdPartyBrowserIcon"
          >
            <g data-sentry-element="g" data-sentry-source-file="iconsV1.tsx">
              <path
                d="M12.4587 1.94977C12.1006 1.80149 11.7161 1.72785 11.3286 1.73334C10.5288 1.73447 9.82913 2.02469 9.26254 2.58894C8.98462 2.85911 8.76476 3.18319 8.61644 3.54132C8.46816 3.89937 8.39451 4.28391 8.4 4.67138C8.40114 5.47124 8.69136 6.17087 9.2556 6.73745C9.52578 7.01538 9.84985 7.23524 10.208 7.38356C10.566 7.53184 10.9506 7.60548 11.338 7.6C12.1379 7.59886 12.8375 7.30865 13.4041 6.74442C13.682 6.47424 13.9019 6.15016 14.0502 5.79201C14.1985 5.43396 14.2722 5.04943 14.2667 4.66196C14.2655 3.8621 13.9753 3.16247 13.4111 2.59588C13.1409 2.31796 12.8168 2.09809 12.4587 1.94977ZM4.86939 6.23425C4.59241 6.11958 4.29499 6.06256 3.99528 6.06667C3.37985 6.06781 2.83667 6.29238 2.40032 6.72715C2.18553 6.93625 2.0156 7.18695 1.90092 7.46394C1.78624 7.74091 1.72923 8.03833 1.73334 8.33804C1.73448 8.95347 1.95905 9.49665 2.39381 9.933C2.60292 10.1478 2.85362 10.3177 3.13061 10.4324C3.40757 10.5471 3.70497 10.6041 4.00466 10.6C4.62012 10.5989 5.16332 10.3743 5.59968 9.93951C5.81447 9.73041 5.9844 9.47971 6.09908 9.20272C6.21375 8.92575 6.27077 8.62834 6.26666 8.32863C6.26552 7.7132 6.04095 7.17001 5.60618 6.73366C5.39708 6.51887 5.14638 6.34893 4.86939 6.23425ZM10.2804 10.8527C10.0846 10.7714 9.87425 10.7308 9.66225 10.7333C9.23021 10.7344 8.84274 10.894 8.53579 11.2023C8.22636 11.5104 8.06667 11.8995 8.06667 12.3333C8.06667 12.7672 8.22636 13.1563 8.53579 13.4643C8.84378 13.7737 9.23285 13.9333 9.66667 13.9333C10.1005 13.9333 10.4896 13.7737 10.7976 13.4643C11.107 13.1563 11.2667 12.7672 11.2667 12.3333C11.2667 11.9008 11.1079 11.5127 10.8003 11.2051C10.6526 11.0537 10.4758 10.9338 10.2804 10.8527Z"
                fill="#A1A1AA"
                stroke="#A1A1AA"
                strokeWidth="1.2"
                data-sentry-element="path"
                data-sentry-source-file="iconsV1.tsx"
              ></path>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
