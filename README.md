# dex-nextjs-template

Next.js application shell for Liberfi (`@liberfi/web`). After the
deep refactor this workspace no longer contains local `@liberfi/*`
domain packages. Reusable UI comes from `@liberfi.io/*`.

## Local SDK

Sibling of `react-sdk`. In `apps/web/.env.local`:

```env
USE_LOCAL_SDK=true
LOCAL_SDK_ROOT=../../../react-sdk
```

```bash
pnpm install
pnpm --filter @liberfi/web dev   # :3000 — do not restart a healthy server
```

Unpublished packages (`@liberfi.io/ui-launchpad`, `ui-redpacket`,
`react-launchpad`, `react-redpacket`) are wired through webpack aliases
and `tsconfig` paths. Do not add them to `package.json` until they are
on npm (Vercel would fail the install).

Predict WebSocket stays disabled unless
`NEXT_PUBLIC_ENABLE_PREDICT_WS=true`.

## Application Adapter

Routing, Privy, Pinata, transfer REST, SOL quote, layout chrome, and
chart datafeeds live under `apps/web/src/application`. See
`react-sdk/docs/application-adapters.md`.

Ten leftover `@liberfi/*` packages were deleted in `c73ed3f` after
`apps/web` import count hit 0.

## Legacy URLs

`/legacy/*` and `/legacy-home` 308 to the current `(new)` routes
(`apps/web/build-config/legacy-redirects.mjs`).

## Known Stage 7 residuals

- Bare `/tokens` (no chain/address) currently 500s:
  `chainIdBySlug(undefined)` before the default-token redirect.
- `/launchpad` is not a route; LaunchPad is a modal.
- Do not production-`next build` during this refactor.
