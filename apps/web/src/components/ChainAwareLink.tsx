"use client";

import { forwardRef, type ComponentProps } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { withChainQuery } from "../libs/chainQuery";

type NextLinkProps = ComponentProps<typeof Link>;

/**
 * Drop-in replacement for Next.js `<Link>` that carries the current
 * `?chain=<abbr>` query parameter across navigations.
 *
 * If `href` is a string and the current URL has `?chain=<value>`, the same
 * `chain` query is appended to the destination (unless the destination
 * already specifies one). `href` objects and external URLs are passed
 * through unchanged.
 */
export const ChainAwareLink = forwardRef<HTMLAnchorElement, NextLinkProps>(
  function ChainAwareLink({ href, ...rest }, ref) {
    const searchParams = useSearchParams();
    const chainQuery = searchParams.get("chain");

    const finalHref =
      typeof href === "string" && chainQuery
        ? withChainQuery(href, chainQuery)
        : href;

    return <Link ref={ref} href={finalHref} {...rest} />;
  },
);
