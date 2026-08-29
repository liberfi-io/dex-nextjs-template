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

Launchpad / redpacket / TradingView are on npm. Default local debug
still uses `USE_LOCAL_SDK=true`. npm-mode debug: install workspace
deps, start with `USE_LOCAL_SDK=false`, then restart the dev server.

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

- `/launchpad` is not a route; LaunchPad is a modal.
- Do not production-`next build` during this refactor.
