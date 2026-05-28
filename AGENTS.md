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
