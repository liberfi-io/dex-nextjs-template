import { SVGProps } from "react";

export function ExclamationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      {...props}
    >
      <path d="M509.214 1022.927c-47.482 0-85.942-38.455-85.942-85.945 0-47.475 38.46-85.93 85.942-85.93 47.485 0 85.945 38.455 85.945 85.93 0 47.49-38.46 85.945-85.945 85.945z m0-280.859c-31.467 0-57-51.015-57-114.005l-57.005-512.999c0-62.987 51.017-114 114.005-114 62.99 0 114.005 51.012 114.005 114l-57.015 512.999c0 62.99-25.525 114.005-56.99 114.005z"></path>
    </svg>
  );
}
