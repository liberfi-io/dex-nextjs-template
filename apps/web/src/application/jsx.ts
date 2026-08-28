import type {
  ComponentType,
  ForwardRefExoticComponent,
  RefAttributes,
} from "react";

/**
 * Local-SDK widgets are compiled against React 19 types while the template
 * stays on React 18. Cast at the JSX boundary so tsc can typecheck the app.
 */
export function asJsx<P>(component: unknown): ComponentType<P> {
  return component as ComponentType<P>;
}

export function asJsxWithRef<P, R>(
  component: unknown,
): ForwardRefExoticComponent<P & RefAttributes<R>> {
  return component as ForwardRefExoticComponent<P & RefAttributes<R>>;
}
