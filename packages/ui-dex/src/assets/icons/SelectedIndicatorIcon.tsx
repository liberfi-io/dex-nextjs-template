import { SVGProps } from "react";

export function SelectedIndicatorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 12 12"
      fill="none"
      {...props}
    >
      <path
        d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11Z"
        stroke="currentColor"
        strokeWidth="0.857143"
      ></path>
      <path
        d="M5.99777 8.85686C7.57572 8.85686 8.85491 7.57768 8.85491 5.99972C8.85491 4.42176 7.57572 3.14258 5.99777 3.14258C4.41981 3.14258 3.14062 4.42176 3.14062 5.99972C3.14062 7.57768 4.41981 8.85686 5.99777 8.85686Z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
