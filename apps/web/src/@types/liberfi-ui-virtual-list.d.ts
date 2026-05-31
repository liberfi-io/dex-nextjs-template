import type { CSSProperties, HTMLAttributes, ReactElement } from "react";

declare module "@liberfi.io/ui" {
  export interface VirtualRowComponentBaseProps {
    ariaAttributes: {
      "aria-posinset": number;
      "aria-setsize": number;
      role: "listitem";
    };
    index: number;
    style: CSSProperties;
  }

  export type VirtualRowComponentProps<RowProps extends object = object> =
    VirtualRowComponentBaseProps & RowProps;

  export interface VirtualListRenderRange {
    startIndex: number;
    stopIndex: number;
  }

  export type VirtualListProps<RowProps extends object = object> = Omit<
    HTMLAttributes<HTMLDivElement>,
    "children" | "onResize" | "style"
  > & {
    onRowsRendered?: (
      visibleRows: VirtualListRenderRange,
      allRows: VirtualListRenderRange,
    ) => void;
    overscanCount?: number;
    rowComponent: (
      props: VirtualRowComponentProps<RowProps>,
    ) => ReactElement | null;
    rowCount: number;
    rowHeight: number;
    rowProps: RowProps;
    style?: CSSProperties;
  };

  export function VirtualList<RowProps extends object = object>(
    props: VirtualListProps<RowProps>,
  ): ReactElement;
}
