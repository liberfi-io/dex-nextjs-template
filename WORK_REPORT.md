# 工作事项记录

本文件用于汇总 `dex-nextjs-template` 及同级 `react-sdk` 仓库的修改事项，按实际完成时间顺序追加，作为工作汇报依据。

## 2026-08-31：修复交易预设状态引发的 Hydration 错误

- 仓库与分支：`react-sdk/main`
- 提交：`68a6847df` — `fix(ui-trade): avoid persisted-state hydration mismatch [skip ci]`
- 问题背景：交易金额和预设索引在客户端首次渲染时同步读取浏览器持久化数据，与服务端渲染使用的默认值不一致，导致 NumberInput、Tabs 和底部工具栏出现 React hydration mismatch。
- 完成事项：
  - 调整 instant-trade 持久化状态的初始化时机，首次客户端渲染与 SSR 保持一致。
  - 保留原有持久化能力，在组件挂载后恢复用户保存的金额和预设选择。
  - 新增覆盖服务端渲染、客户端 hydration 和持久化状态恢复的回归测试。
- 影响范围：`@liberfi.io/ui-trade` 的即时交易金额与预设状态；调用方 API 和现有业务抽象保持不变。
- 验证结果：
  - 在保留历史金额和“预设2”的 Chrome 页面刷新验证，hydration 错误由 1 条降为 0。
  - `@liberfi.io/ui-trade` 完整测试通过，共 23 项。
  - TypeScript 类型检查和 ESLint 检查通过。
  - pre-push 全仓构建通过，共 24 个任务。
- 推送状态：已推送至 `react-sdk` 远端 `main`，本地与远端提交一致。
- Workflow 状态：提交包含 `[skip ci]`，GitHub Actions 未产生 workflow run。

## 2026-08-31：统一 React SDK 与消费者主题契约（提交前）

- 仓库与分支：`dex-nextjs-template/main`，并同步修改同级 `react-sdk/main`。
- 目标：统一暗色主题的品牌、文字、表面、边界、操作、行情涨跌与状态语义，消费者在 SDK 新版本发布前通过本地前向兼容 token 保持一致。
- 提交范围：消费者全局主题映射、主题契约测试、测试入口，以及即时交易按钮的通用色迁移；不包含并行进行的 i18n 与业务逻辑修改。
- 已完成验证：消费者主题契约测试 4 项通过；本地 `http://localhost:3000/` 已确认 `dark` / `liberfi` 根主题及品牌、涨跌、状态变量生效。
- 预期提交：`refactor(theme): align consumer semantic colors`。

## 2026-08-31：统一 React SDK 与消费者主题契约（提交后）

- React SDK 提交：`ce247d232` — `refactor(ui): establish semantic dark theme contract`。
- 消费者提交：`8036339` — `refactor(theme): align consumer semantic colors`。
- 提交边界：仅提交主题基础设施、文档、契约测试与可独立确认的消费者主题文件；与并行 i18n 工作重叠的组件迁移保留在工作区，未夹带进上述提交。
- 验证结果：`@liberfi.io/ui` 类型检查通过；主题契约测试 10 项通过；Storybook 单元测试 4 项通过；消费者主题契约测试 4 项通过；两个仓库的 `git diff --check` 均通过。
- 已知阻塞：部分 UI 包的全量类型检查仍被并行 i18n 改动中的重复 locale 字段和动态翻译 key 类型错误阻塞，与主题契约修改无关。
- 推送状态：本轮未推送，两个仓库的本地 `main` 均领先各自远端 1 个提交。

## 2026-08-31：恢复已确认的品牌与行情色（提交前）

- 用户确认色值：品牌主色与行情上涨均为 `#C7FF2E`，品牌辅助色与行情下跌均为 `#F76816`。
- 架构约束：品牌与行情继续使用独立语义 token，当前仅保持相同视觉色值；状态色映射不变。
- 修改范围：`react-sdk` 主题 palette 与精确色值契约测试；消费者全局前向兼容 token 与对应契约测试。
- 验证结果：SDK 主题契约 11 项通过，`@liberfi.io/ui` 类型检查通过，消费者主题契约 4 项通过；本地调试页计算色值与确认结果一致。
- 预期提交：SDK `fix(ui): restore approved market colors`；消费者 `fix(theme): restore approved market colors`。
- SDK 提交结果：`5f5666f02` — `fix(ui): restore approved market colors`，仅包含 palette 与精确色值契约测试。

## 2026-08-31：恢复已确认的品牌与行情色（提交后）

- React SDK 提交：`5f5666f02` — `fix(ui): restore approved market colors`。
- 消费者提交：`37646c4` — `fix(theme): restore approved market colors`。
- 最终色值：品牌主色与行情上涨为 `#C7FF2E`；品牌辅助色与行情下跌为 `#F76816`。
- 语义结构：brand 与 market token 保持独立；status token 未修改。
- 推送状态：本轮未推送。

## 2026-08-31：弱化页面 Header 色带与分隔线（提交前）

- 仓库与分支：`react-sdk/main`；由 `dex-nextjs-template` 现有本地调试页面验证。
- 修改范围：`ScaffoldHeader` 的 children 与默认 slots 两条渲染路径统一使用 `bg-surface-base` 和 `border-border-subtle/60`；Header 内部控件样式不变。
- 测试覆盖：新增 Header 主题契约测试，锁定两条渲染路径的背景与边线语义。
- 验证结果：`@liberfi.io/ui-scaffold` 类型检查通过；全量测试 14 个 suite、35 项通过；本地页面计算背景为 `rgb(5, 8, 7)`，边线以 60% 透明度渲染。
- 预期提交：`fix(ui-scaffold): soften header chrome`。

## 2026-08-31：弱化页面 Header 色带与分隔线（提交后）

- React SDK 提交：`445fc6cce` — `fix(ui-scaffold): soften header chrome`。
- 提交内容：仅包含 `ScaffoldHeader` 主题类调整及其两条渲染路径的回归测试。
- 最终验证：`@liberfi.io/ui-scaffold` 类型检查通过；全量测试 14 个 suite、35 项通过；提交钩子的 ESLint 与 Prettier 检查通过；消费者本地页面视觉和计算样式符合预期。
- 推送状态：本轮未推送。

## 2026-08-31：全面收敛国际化资源并补齐中文覆盖（提交前）

- 仓库与分支：`dex-nextjs-template/main`，并同步修改同级 `react-sdk/main`。
- 问题背景：消费者项目与 React SDK 同时维护国际化资源，首页及多个业务模块在选择中文后仍因 key 缺失、旧命名空间和组件硬编码回退为英文。
- 资源收敛：将应用外壳与业务翻译统一收敛到 `react-sdk/packages/i18n`；消费者删除本地 `en.json`、`zh.json`、legacy alias 和 root 映射，仅创建并消费 SDK locale runtime。
- key 治理：将消费者残留的 `extend.account`、`extend.redpacket`、`extend.launchpad`、`extend.pulse`、`extend.predict`、`extend.hlDeposit`、`extend.perpetuals`、`extend.portfolio`、`extend.token_list`、`extend.trade` 等旧 key 迁移到 SDK 规范命名空间，并确认上述旧业务 key 无残留。
- 覆盖范围：补齐应用外壳、账户、交易、代币列表与详情、Pulse、永续合约、资产组合、预测市场、频道、媒体追踪、红包、链选择器与 TradingView 等界面的英文/繁体中文资源；同时处理可访问性标签、输入提示、空状态、按钮、表格列名、状态标签和示例展示文本。
- 代码防线：新增英文/中文 key 精确对称测试；SDK ESLint 启用 JSX 可见文本硬编码检查；消费者将同类检查提升为 error；为 locale 生成脚本增加 catalog 边界，避免运行时专用 key 被错误扩散到历史多语言 JSON 目录。
- 本地联调：消费者继续通过 `USE_LOCAL_SDK=true` 与 `LOCAL_SDK_ROOT=../../../react-sdk` 直接引用同级 SDK 源码；Jest 同步映射 `@liberfi.io/i18n` 与 `@liberfi.io/i18n/server`，无需发布 npm 包即可验证。
- 验证结果：
  - SDK i18n 完整构建通过；locale、生成脚本与 runtime 共 12 个测试套件、60 项测试通过。
  - 涉及的 13 个 SDK 包 TypeScript 类型检查与 ESLint 检查全部通过。
  - 消费者 TypeScript 类型检查与 ESLint 检查通过；23 个 Jest 测试套件、117 项测试及 12 项 Node 配置测试全部通过。
  - 本地中文首页确认 `html.lang=zh-Hant`，可见首页文案无英文 fallback，浏览器控制台无 error；后续核心页自动抽查受现有 dev server 长时间数据请求影响，静态检查、类型检查与测试结果不受影响。
- 提交与推送状态：当前改动尚未提交、尚未推送，未触发远端 workflow 或部署。
- 拟用提交：React SDK `fix(i18n): complete locale consolidation [skip ci]`；消费者 `refactor(i18n): consume centralized SDK locales [skip ci]`。

## 2026-08-31：修复 Header Launchpad 弹窗翻译失效（提交前）

- 问题现象：中文环境点击 Header 小火箭后，Launchpad 弹窗内容显示旧翻译 key 或英文回退。
- 根因：`@liberfi.io/ui-launchpad` 的 30 个翻译调用仍使用已移除的 `extend.launchpad.*` 命名空间，而统一后的 SDK 资源位于 `launchpad.*`。
- 修复内容：将创建表单、AI 生成区、曲线预览、校验提示和交易结果提示的 30 个调用全部迁移到 `launchpad.*`；未增加重复资源或兼容 alias。
- 回归防线：调整 Launchpad 组件测试，直接加载 SDK 繁体中文资源并断言“代幣名稱”“代幣符號”“生成”“創建代幣”等真实界面文案，避免仅返回 key 的 mock 再次掩盖资源断链。
- 验证结果：Launchpad 30 个调用全部能解析中文资源；`@liberfi.io/ui-launchpad` 3 项测试、TypeScript 类型检查与 ESLint 检查通过；消费者本地 SDK 模式下 117 项 Jest 测试、12 项配置测试、类型检查与 ESLint 检查通过。
- 本地调试说明：沿用现有 `apps/web` dev server，未重启、未切换端口；页面自动化连接受当前服务持续编译/数据请求超时影响，组件级真实中文资源回归测试已覆盖本次故障路径。
- 提交与推送状态：当前改动尚未提交、尚未推送，未触发远端 workflow 或部署。
- 拟用提交：随 React SDK 的 `fix(i18n): complete locale consolidation [skip ci]` 一并交付。

## 2026-08-31：国际化收敛与 Launchpad 修复（提交后）

- 仓库与分支：`react-sdk/main`、`dex-nextjs-template/main`。
- React SDK 提交：`13a75558c` — `fix(i18n): complete locale consolidation [skip ci]`，包含集中式 locale 资源、业务组件 key 迁移、Launchpad 命名空间修复及回归防线。
- 消费者提交：`510dca8` — `refactor(i18n): consume centralized SDK locales [skip ci]`，包含 SDK locale runtime 接入、本地重复资源移除、消费者 key 迁移、测试配置及项目工作记录规则。
- 影响范围：中英文资源由 React SDK 单点维护；消费者与 SDK 业务组件统一使用规范命名空间；Header Launchpad 弹窗恢复繁体中文界面文案。
- 最终验证：SDK i18n 12 个测试套件、60 项测试通过，Launchpad 3 项测试通过，相关 13 个包的类型检查与 ESLint 通过；消费者 23 个 Jest 测试套件、117 项测试、12 项配置测试、类型检查与 ESLint 全部通过；两个仓库 `git diff --check` 通过。
- 推送状态：上述提交已推送至各自的 `origin/main`；随本轮一并推送此前已完成但尚未上远端的主题契约、行情色和 Header 视觉提交。
- Workflow 状态：两个推送头均包含 `[skip ci]`，要求跳过 GitHub Actions push workflow，未执行远端部署。

## 2026-08-31：建立跨仓库统一工作汇报机制

- 仓库与分支：`react-sdk/main`、`dex-nextjs-template/main`。
- React SDK 提交：`58c484d7e` — `docs: require unified work reporting [skip ci]`。
- 消费者拟用提交：`docs: establish unified work report [skip ci]`；该提交仅维护统一工作汇报文件，按规则无需为自身重复追加记录。
- 问题背景：React SDK 与消费者模板的工作涉及多个仓库，需要一份连续、可追溯且适合向管理者汇报的统一记录，避免事项分散或提交后遗漏成果说明。
- 完成事项：沿用 `dex-nextjs-template/WORK_REPORT.md` 作为两个仓库唯一的汇报文件；在 React SDK 项目规则中补充强制记录要求，规定每次代码、配置或文档提交前后都追加事项，并统一记录字段和中文汇报口径。
- 影响范围：后续 `react-sdk` 与 `dex-nextjs-template` 的所有提交；不影响产品代码、运行时行为或公开 API。
- 验证结果：已确认消费者项目规则原本具备工作记录约束；新增 React SDK 规则后，两个仓库均指向同一份汇报文件，路径使用项目相对路径；两个文件的 whitespace 检查通过，SDK Markdown Prettier 提交钩子通过。
- 推送状态：计划分别快进推送至两个仓库的 `origin/main`，禁止 force push。
- Workflow 策略：提交标题包含 `[skip ci]`，跳过 SDK Release 与消费者 Vercel Deploy workflow。
