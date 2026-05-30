# AGENTS.md instructions

## 计划输出

- 当用户要求生成计划或输出计划时，计划文件必须输出到项目根目录下的 `.plans` 目录。

## SDK 升级规则

- 当用户说“升级 sdk”或“更新 sdk”时，默认同时升级 `@chainstream-io/sdk` 和本仓库实际依赖的 `@liberfi.io/*` 相关包到最新版本。
- 升级前必须确认最新版本及版本对应关系；用户提到的 react-sdk 明确指 `@liberfi.io/*` 组织下相关 SDK / React / UI 包，不要误判为本仓库的 `@liberfi/react-*` workspace 包。
- 必须检查所有 workspace `package.json` 的 `dependencies`、`devDependencies`、`peerDependencies` 三类字段，统一 bump 相关包版本，不得遗漏。
- 更新后必须刷新 `pnpm-lock.yaml`，并用 `rg` 或等效方式复查旧版本号、相关包名和锁文件，确认没有残留或漏改。
- 必须运行类型构建或完整 `pnpm build`；发现新版 SDK API 或类型破坏时，只做最小兼容适配，保持现有业务抽象和调用方 API 不变。
- 提交前必须检查 diff 范围，确保只包含依赖升级、lockfile 和必要兼容代码，不混入无关变更。

## 本地开发调试

- 修改完代码后，必须通过本地开发调试进行验证，不要直接进行 production build。
- 如果本地开发调试服务已经启动，必须直接利用现有服务验证，不要自行额外重启。
- production build 只在发布时进行。

## 本地 App 与 SDK 联调步骤

当用户提到“调试”、“联调”、“本地调试”、“本地测试”等与本地运行验证相关的需求时，默认遵循本节步骤处理。

1. 确保 `react-sdk` 与当前仓库位于同级目录。
2. 在 `react-sdk` 中执行：
   ```bash
   pnpm install
   ```
3. 仅当涉及生成产物、dist-only subpath、SDK package exports 变化，或 dev server 报缺失产物时，才在 `react-sdk` 中执行：
   ```bash
   pnpm build
   ```
4. 在 `apps/web/.env.local` 中配置：
   ```env
   USE_LOCAL_SDK=true
   LOCAL_SDK_ROOT=../../../react-sdk
   ```
5. 在当前仓库中执行：
   ```bash
   pnpm install
   pnpm --filter @liberfi/web dev
   ```
6. 修改 `react-sdk/packages/*/src` 下的 TS/TSX/CSS 文件后，通过 `apps/web` dev server 热更新调试。
7. 修改 `.env.local`、SDK package exports、`package.json`、生成文件、Tailwind/CSS 入口、alias 相关配置或 provider/context 结构后，重启 `apps/web` dev server。
8. 如果涉及生成产物、dist-only subpath 或热更新异常，在 `react-sdk` 中额外执行：
   ```bash
   pnpm dev:watch
   ```
9. 如果启动 dev server 时出现端口被占用，不得直接改用新端口，也不得擅自 kill 占用端口的进程；必须先询问用户，是启动新端口，还是 kill 占用端口的进程来释放端口。
10. 通过 dev server 日志确认本地 SDK 模式生效，应能看到 local SDK alias / PostCSS rewrite 相关输出。
