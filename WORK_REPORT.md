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
- 消费者提交：`a903465` — `docs: establish unified work report [skip ci]`；该提交仅维护统一工作汇报文件，按规则无需为自身重复追加记录。
- 问题背景：React SDK 与消费者模板的工作涉及多个仓库，需要一份连续、可追溯且适合向管理者汇报的统一记录，避免事项分散或提交后遗漏成果说明。
- 完成事项：沿用 `dex-nextjs-template/WORK_REPORT.md` 作为两个仓库唯一的汇报文件；在 React SDK 项目规则中补充强制记录要求，规定每次代码、配置或文档提交前后都追加事项，并统一记录字段和中文汇报口径。
- 影响范围：后续 `react-sdk` 与 `dex-nextjs-template` 的所有提交；不影响产品代码、运行时行为或公开 API。
- 验证结果：已确认消费者项目规则原本具备工作记录约束；新增 React SDK 规则后，两个仓库均指向同一份汇报文件，路径使用项目相对路径；两个文件的 whitespace 检查通过，SDK Markdown Prettier 提交钩子通过。
- 推送状态：两个提交均已快进推送至各自的 `origin/main`，本地与远端 SHA 一致，未使用 force push。
- Workflow 状态：两个提交标题均包含 `[skip ci]`；按提交 SHA 查询 GitHub Actions 均未生成 run，SDK Release 与消费者 Vercel Deploy workflow 均未触发。

## 2026-08-31：修复 Header Launchpad 弹窗内容溢出（提交前）

- 仓库与分支：`dex-nextjs-template/main`。
- 拟用提交：`fix(launchpad): keep modal content scrollable [skip ci]`。
- 问题背景：点击 Header 火箭按钮打开 Launchpad 后，创建表单高度超过弹窗可视范围，底部内容穿出弹窗边界且弹窗内部无法滚动。
- 计划与完成事项：将固定标题区和表单内容区拆分，把 Launchpad 表单放入受 Modal 高度约束的 `ModalBody`；为内容区补充 `min-h-0`、纵向滚动和滚动边界约束，使超长内容在弹窗内部滚动；新增组件级回归测试锁定滚动容器结构。
- 影响范围：仅影响消费者 Header Launchpad 弹窗布局，不修改 React SDK、Launchpad 表单业务逻辑、数据请求或公开 API。
- 验证计划与结果：新增测试在修复前稳定失败、修复后通过；消费者全量 24 个 Jest 测试套件、118 项测试及 12 项配置测试通过，TypeScript 类型检查、ESLint 和 `git diff --check` 通过；现有 3000 端口 dev server 保持运行但页面请求持续超时，按规则未重启或切换端口。
- 推送状态：当前改动尚未提交、尚未推送。
- Workflow 策略：后续提交与推送时使用 `[skip ci]`，避免触发 GitHub Actions workflow 和远端部署。

## 2026-08-31：修复 Launchpad 表单主题层次（提交前）

- 仓库与分支：`react-sdk/main`；通过 `dex-nextjs-template/main` 的本地 SDK 链接验证。
- 拟用提交：`fix(ui-launchpad): align form controls with semantic theme [skip ci]`。
- 问题背景：Launchpad 使用 HeroUI 原始 flat 表单控件，hover 状态会切换到与 Modal 相同的 `content2` 背景且没有可见边框；图片上传区也硬编码为 `bg-content2`，导致交互后控件边界消失、视觉层次异常。
- 计划与完成事项：为输入框、文本域、数字输入和上传区建立统一的 Launchpad 语义主题契约；经两轮视觉复核后将默认态调整为叠加于 Modal 的 `surface-strong/30 + border-control/50`，hover/focus 提升到 `surface-strong/60` 并强化边界，避免默认态形成大块深色、交互态又与 Modal 融合；上传按钮补充可访问名称；新增真实组件回归测试覆盖所有控件类型及交互状态 class。
- 影响范围：仅影响 `@liberfi.io/ui-launchpad` 表单视觉与图片上传按钮的可访问性，不修改表单值、校验、提交逻辑或公开 API。
- 验证计划与结果：主题契约测试在修复前稳定失败、修复后通过；SDK Launchpad 2 个测试套件、4 项测试、TypeScript 类型检查与 ESLint 通过；消费者本地 SDK 模式下 24 个 Jest 测试套件、118 项测试、12 项配置测试和 TypeScript 类型检查通过。
- 二次校准验证：将契约期望切换到低反差层级后，旧配色测试再次稳定失败；实现切换后 2 个测试套件、4 项测试、TypeScript 类型检查、ESLint 与 `git diff --check` 再次通过。
- Tab 配色同步：Pump / Raydium 切换区复用表单的低反差层级，Tab 容器使用 `surface-strong/30 + border-control/50`，未选中 hover 提升到 `surface-strong/45`，选中态使用 `surface-strong/60 + border-control/80`，并统一未选中与选中文字颜色；回归测试先失败后通过，SDK Launchpad 2 个测试套件、4 项测试、TypeScript 类型检查与 ESLint 均通过。
- 运行产物核验：确认 Next.js client chunk 已编译本地 SDK 的最新主题模块，旧 `surface-base` 默认类已从对应 client 模块移除；开发 CSS 已生成 `surface-strong/30`、`surface-strong/60` 和边框状态 selector，排除本地链接或 Tailwind 漏编译。
- 推送状态：当前改动尚未提交、尚未推送。
- Workflow 策略：后续提交与推送时使用 `[skip ci]`，避免触发 GitHub Actions workflow 和远端部署。

## 2026-08-31：统一 Header 操作控件主题样式（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`3daa8e2` — `fix(header): unify semantic action controls [skip ci]`。
- 问题背景：Header 的搜索、链切换、Launchpad、语言切换和登录入口分别使用兼容色、透明边框或品牌色容器，导致边框可见度、背景层级和交互反馈不一致。
- 完成事项：建立共享的 Header control 外观与交互契约，统一 32px 高度、圆角、`surface-interactive/60` 背景、`border-control/50` 边框及 hover、active、focus、disabled 状态；Launchpad 与登录仅保留品牌色前景；认证加载态复用相同容器材质但不继承按钮 cursor、hover 或 active 反馈；增加回归测试防止重新使用兼容色或透明边框。
- 影响范围：仅影响消费者桌面与响应式 Header 操作区，不修改各入口的业务逻辑、弹窗内容、钱包连接、链切换或语言切换行为，不修改 React SDK 公开 API。
- 验证结果：Header 样式契约 2 项测试、消费者 TypeScript 类型检查和目标文件 ESLint 均通过；现有 `localhost:3000` dev server 热更新后，搜索、链切换、Launchpad、语言和登录入口的计算样式均为 32px 高、1px `border-control/50` 边框及 `surface-interactive/60` 背景，视觉检查一致；消费者全量测试 25 个套件中 24 个通过，唯一失败为既有 locale runtime 的 4 项翻译断言，与本次 Header 文件无重叠；两轴代码审查的规格轴无发现，规范轴发现的静态加载态交互耦合已修复。
- 推送状态：提交已生成但尚未推送，本地 `main` 领先远端；未使用 force push。
- Workflow 状态：提交标题包含 `[skip ci]`，但本轮未推送，因此未触发 GitHub Actions workflow。

## 2026-08-31：交付 Launchpad 弹窗滚动与主题修复（提交后）

- 仓库与分支：`react-sdk/main`、`dex-nextjs-template/main`。
- React SDK 提交：`6f3a9da0e` — `fix(ui-launchpad): align form controls with semantic theme [skip ci]`；统一输入框、文本域、数字输入、图片上传以及 Pump / Raydium Tabs 的默认、hover、focus 和选中态主题层次。
- 消费者提交：`a8d5ad1` — `fix(launchpad): keep modal content scrollable [skip ci]`；将 Launchpad 内容放入受弹窗高度约束的纵向滚动区域，并增加组件回归测试。
- 验证结果：SDK Launchpad 2 个测试套件、4 项测试、TypeScript 类型检查和 ESLint 通过；消费者 Launchpad Modal 目标测试、TypeScript 类型检查、目标文件 ESLint 及两个仓库 `git diff --check` 通过；本地 SDK 客户端产物与 Tailwind CSS 已确认包含最新主题 selector。
- 已知非本次问题：消费者全量测试的 25 个套件中 24 个通过，唯一失败套件为既有 `application-locale-runtime.test.tsx` 的 4 项旧 key / 中文资源断言，与本次 Launchpad 修改文件无重叠，未在本次提交中扩大修复范围。
- 推送状态：上述提交与消费者此前待推送的 Header 主题提交均已快进推送到对应 `origin/main`，本地与远端保持一致，未使用 force push。
- Workflow 状态：所有待推送提交标题均包含 `[skip ci]`，要求跳过 GitHub Actions push workflow，不触发远端部署。

### 可直接汇报的完成事项

- 修复 Header Launchpad Modal 内容超出可视范围的问题，使长表单在弹窗内部滚动，标题与关闭入口保持可见，避免内容穿出弹窗边界。
- 统一 Launchpad 输入框、文本域、数字输入和图片上传区域的语义主题样式，降低默认态与 Modal 的突兀反差，并补齐 hover、focus 和边框反馈。
- 调整 Pump / Raydium 平台 Tabs 的容器、未选中 hover、选中态及文字颜色，使切换区与表单控件采用一致的视觉层次。
- 为 Modal 滚动结构和 Launchpad 控件主题增加回归测试，并完成 SDK 类型检查、ESLint、客户端编译产物及 Tailwind selector 核验。
- 将相关功能提交快进推送至两个仓库的 `main`；全部提交使用 `[skip ci]`，经 GitHub Actions 查询确认未生成远端 Workflow run、未触发部署。

## 2026-08-31：过滤资产页缺失 Token Symbol 的数据（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`c8c29a9` — `fix(portfolio): polish whitelisted token lists [skip ci]`。
- 问题背景：Token 当前采用白名单机制，资产页的 net-worth 与 activities 接口可能返回未被白名单元数据覆盖、且自身也缺少 `symbol` 的条目；这些条目会以占位符或残缺信息出现在资产列表和活动列表中，影响演示效果。
- 计划与完成事项：作为白名单元数据尚不完整期间用于演示的临时措施，建立统一的最终 symbol 解析规则，优先使用白名单 token 查询补全的 `symbol`，缺失时回退接口内嵌 `symbol`，并将空字符串或纯空白视为无效；资产列表和活动列表均在渲染前过滤无法解析 symbol 的条目；活动数量列同步使用最终解析结果；全部条目无效时按过滤后的集合展示空状态；代码注释已明确该过滤并非长期业务规则。
- 影响范围：仅影响资产页资产列表与活动列表的展示数据，不修改接口请求、白名单配置、分页数据、钱包资产计算或后端返回值。
- 回归防线：新增组件级测试覆盖白名单补全成功、内嵌 symbol 兜底、缺失/纯空白 symbol 过滤以及全部过滤后的空状态；测试在修复前稳定复现两张表仍渲染无效条目，修复后 3 项测试全部通过。
- 视觉一致性：将资产列表和活动列表条目的黑色 `default-50` 分割线改为低透明度语义弱边框 `border-subtle/30`；首次尝试全强度 `divider` 后根据视觉复核继续降低对比度，使分隔结构保留但更贴近表格背景；组件测试同步约束两类行不得回退到旧边框色或全强度分割线。
- 验证结果：消费者 TypeScript 类型检查、目标文件 ESLint 与 `git diff --check` 通过；复用现有 3000 端口 dev server 验证 `/portfolio` 返回 HTTP 200，未重启服务、未切换端口、未执行 production build。
- 推送状态：功能提交与本次工作记录提交均已快进推送至 `origin/main`，本地与远端保持一致，未使用 force push。
- Workflow 状态：相关提交标题均包含 `[skip ci]`；推送后经 GitHub Actions 查询确认未生成 run，未触发远端部署。

## 2026-08-31：修复 Header 当前语言未高亮（提交前）

- 仓库与分支：`dex-nextjs-template/main`。
- 拟用提交：`fix(header): highlight active language option [skip ci]`。
- 问题背景：应用运行语言为 `zh-Hant` 或 `zh-Hans` 时，Header 可选语言仍使用兼容代码 `zh`；原实现直接比较两个字符串，导致 English 与中文都被判定为未选中，当前语言没有链选择器同款高亮。
- 计划完成事项：依据 Header 实际支持的语言代码调用 SDK `parseI18nLang` 规范化运行时 locale，再进行选中判定；兼容 `zh-Hant`、`zh-Hans`、`zh-TW`、`zh-CN` 与 `en-US`，同时在未来显式提供繁体/简体选项时保持脚本差异；不改变语言切换行为或视觉 token。
- 影响范围：仅影响 Header 语言下拉的当前项判定与高亮，不修改 locale 资源、Provider、cookie、链切换或其他 Header 控件。
- 验证计划：先用纯函数回归测试复现直接比较失败，再验证规范化映射；重跑 Header 契约测试、消费者类型检查、ESLint 和全量测试；使用现有 `localhost:3000` 页面确认中文当前项的 class 与计算背景和链下拉选中项一致。
- 推送状态：当前改动尚未提交、尚未推送。
- Workflow 策略：提交标题使用 `[skip ci]`；本轮未授权推送，因此不会触发 GitHub Actions workflow。

## 2026-08-31：修复 Header 当前语言未高亮（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`239713f` — `fix(header): highlight active language option [skip ci]`。
- 问题背景：应用运行语言可能被 i18n 规范化为 `zh-Hant`、`zh-Hans` 或区域语言代码，而 Header 选项仍使用兼容代码 `zh`；原先直接比较字符串，导致当前中文选项无法进入与链选择器一致的选中高亮状态。
- 完成事项：根据 Header 实际支持的语言集合调用 SDK `parseI18nLang` 规范化运行时 locale，再进行当前项判定；兼容繁体、简体、区域中文与区域英文，同时在未来显式提供繁简选项时保留脚本差异；沿用现有品牌色背景、品牌色文字和勾选标记，不新增或修改视觉 token。
- 影响范围：仅影响 Header 语言下拉列表的当前项判定与视觉高亮；不修改翻译资源、语言切换流程、Provider、cookie、链切换或 React SDK 公开 API。
- 验证结果：新增 6 项 locale 映射回归测试并完成失败到通过的验证，Header 目标测试共 2 个套件、8 项测试通过；消费者 TypeScript 类型检查、目标文件 ESLint、12 项配置契约测试和 `git diff --check` 通过；现有 `localhost:3000` 热更新页面确认当前“中文”与当前链 SOL 使用相同的选中态 class 和计算色彩。消费者全量测试 26 个套件中 25 个通过，唯一失败仍为既有 `application-locale-runtime.test.tsx` 的 4 项翻译资源断言，与本次变更文件无重叠。规格与规范两轴代码复核完成，功能实现无发现，规范项已通过本记录闭环。
- 推送状态：功能提交及本记录当前仅存在于本地 `main`，尚未推送；未使用 force push。
- Workflow 状态：功能提交标题包含 `[skip ci]`；本轮未授权推送，因此未触发 GitHub Actions workflow 或 Vercel 部署。

## 2026-08-31：修复 Portfolio 取消登录后的永久加载（提交后）

- 仓库与分支：`dex-nextjs-template/main`；复用同级 `react-sdk` 本地链接与现有 3000 端口开发服务验证。
- 提交：`fb183e4` — `fix(portfolio): recover from cancelled sign-in [skip ci]`。
- 问题背景：未登录用户进入 Portfolio 时会自动打开 Privy；用户关闭登录框后，页面鉴权守卫仍将 `unauthenticated` 当作加载状态，导致内容区永久显示已过时的骨架屏且没有登录引导。Header 曾存在取消后持续 loading 的风险。
- 完成事项：将 Portfolio 鉴权界面拆分为认证中、取消后未登录和认证成功三种明确状态；认证中显示与当前资产页一致的“账户卡 + 分配图 + 资产表格面板”完整骨架；自动登录被取消后显示国际化说明文案和可重试的登录按钮；保留首次进入时自动发起 Privy 登录的行为。
- Header 回归：当前本地 SDK 已通过 Privy `exited_auth_flow` 回调清理登录中状态；关闭 Privy 后 Header 登录按钮可立即恢复，内容区登录按钮可再次打开 Privy，连续取消后仍能正常恢复，未额外修改 SDK 代码。
- 回归防线：新增 Portfolio 鉴权组件测试，覆盖自动登录取消后的引导与重试、认证中的新版骨架结构以及认证成功后的内容渲染；SDK 既有取消登录测试继续覆盖 Header 所依赖的状态恢复契约。
- 骨架视觉校准：移除资产表格骨架列标题占位符下方突兀的横向分割线，保留面板外框和数据行之间的低对比分隔，并增加样式断言防止该强分割线回归。
- 验证结果：新增 3 项测试先稳定复现旧问题、修复后全部通过；本轮文件完成后消费者 TypeScript 类型检查、目标 ESLint 和 `git diff --check` 通过；SDK Privy Adapter 2 项回归测试通过；现有开发服务中完成首次骨架、关闭弹窗、Header 恢复、内容区引导、再次登录与二次取消的真实交互验证。消费者全量 Jest 共 28 个套件中 27 个通过，唯一失败仍为既有 `application-locale-runtime.test.tsx` 的 4 项旧 locale 断言，与本次修改无重叠。验证后工作区并行出现的交易错误提示改动在 4 个非本轮文件中产生 `TradeErrorTranslator` 类型错误，导致最新一次全仓 typecheck 不通过；本轮未覆盖或混改这些文件。
- 推送状态：功能提交与本记录提交已快进推送至 `origin/main`，本地与远端保持一致，未使用 force push。
- Workflow 状态：提交标题均包含 `[skip ci]`，要求跳过 GitHub Actions push workflow，不触发远端部署。

## 2026-08-31：适配交易接口错误并优化 Toast 展示（提交前）

- 仓库与分支：`dex-nextjs-template/main`；复用现有 3000 端口开发服务验证。
- 拟用提交：`fix(trade): localize api error toasts [skip ci]`。
- 问题背景：ChainStream SDK 将后端 `{ code, message, details }` 错误体包装进普通 `Error.message`，四个 Swap 入口又把该字符串拼入阶段失败文案，导致用户直接看到 `Route failed`、HTTP 状态、SDK 包装句和整段 JSON；余额不足等正常业务失败没有转换成国际化提示。
- 计划与完成事项：建立应用级交易错误适配器，剥离阶段与 SDK 包装、解析 HTTP 状态和后端错误体、兼容字符串及对象形态的 `details`；按业务码与余额、流动性、滑点、路由等关键词分类；已知业务错误映射 en/zh 国际化文案，未知错误优先显示压平和限长后的 `details`，无 details 时使用通用交易失败提示；将首页、Pulse 和列表中的四个 Swap 错误入口统一接入该适配器。
- 影响范围：仅影响消费者交易错误解析、Toast 文案和应用级 en/zh 错误资源；不修改后端、ChainStream SDK、交易请求参数、签名、发送、余额判断或 React SDK 公开 API。
- 验证计划：使用后端真实余额不足字符串建立失败到通过的快速回归测试；覆盖 50017、50006/50011/50012/50026 details 兜底、40006、滑点、路由、金额、同币种、拒绝、过期、网络、鉴权、限流、未知 details 与结构化 Error；运行目标测试、类型检查、ESLint、全量测试、`git diff --check` 和现有开发服务烟测。
- 推送状态：当前改动尚未提交、尚未推送。
- Workflow 策略：提交标题使用 `[skip ci]`；本轮未授权推送，因此不会触发 GitHub Actions workflow 或远端部署。

## 2026-08-31：适配交易接口错误并优化 Toast 展示（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`b6b3107` — `fix(trade): localize api error toasts [skip ci]`。
- 问题背景：Swap route、sign、send 等失败会把 ChainStream SDK 包装句、HTTP 状态及后端 JSON 原样拼入 Toast，用户无法从技术错误结构中识别余额不足、流动性不足、滑点或路由失败等可操作原因。
- 完成事项：新增统一交易错误解析与 Toast 适配器，安全剥离阶段前缀和 SDK 包装，解析 `{ code, message, details }` 及未来结构化 Error，兼容 details 字符串、对象、嵌套与循环异常；按业务码和裸错误关键词识别余额不足、流动性、滑点、价格影响、路由、金额、同币种、拒绝、过期、网络、鉴权和限流；已知错误显示应用级 en/zh 国际化文案，未知后端错误仅显示压平且限长的 details，无 details 时显示通用交易失败；首页两个即时买入入口、Token 列表和 Pulse 共四个 Swap 错误入口统一接入。
- 影响范围：仅影响消费者交易错误解析、Toast 展示和应用级错误资源；不修改后端、ChainStream SDK、React SDK、交易执行流程、请求参数、钱包签名或发送逻辑。
- 验证结果：真实 `50006 + insufficient funds for intrinsic transaction cost` 回归测试修复前稳定得到含 JSON 的整段阶段错误，修复后只得到余额不足国际化文案；交易解析、Toast 映射及 en/zh 资源共 3 个测试套件、33 项测试通过，TypeScript 类型检查、目标 ESLint、12 项配置契约测试和 `git diff --check` 通过；现有 3000 端口开发服务热更新后首页 HTTP 200，未重启服务、未执行 production build。消费者全量 Jest 31 个套件中 30 个通过、165 项中 161 项通过，唯一失败仍为既有 `application-locale-runtime.test.tsx` 的 4 项旧资源断言，与本次修改无重叠。两轴审查发现的裸错误关键词漏判和 hostile object 二次抛错均已补测试修复，复审无发现。
- 推送状态：功能提交 `b6b3107` 与工作记录提交 `13e1738` 已快进推送至 `origin/main`，本地与远端提交链一致，未使用 force push。
- Workflow 状态：两个提交标题均包含 `[skip ci]`；按提交 SHA 查询 GitHub Actions 未生成 run，未触发远端部署。

## 2026-09-01：修复发现页首屏骨架缺失（提交前）

- 仓库与分支：`dex-nextjs-template/main`；复用同级 `react-sdk` 本地链接与现有 3000 端口开发服务验证。
- 问题背景：发现页列表依赖 `ResizeObserver` 提供可虚拟化高度；服务端首屏与客户端 hydration 初始阶段的高度为 `0`，SDK 列表因此输出高度为 `0px` 的空表体，必须等进入发现页并完成尺寸测量后才出现数据骨架，形成明显空白期。
- 完成事项：新增发现页列表尺寸门禁，在高度尚未测得时直接渲染公开的 SDK `TokenList` 加载态，并使用 SDK 默认非零高度；高度有效后切换回原有 Trending、Stock 或 New Token widget。首屏与实际列表现在复用同一个 SDK 组件及 actions 列契约，行高、列宽、sticky 列、响应式和主题会随 SDK 自动保持一致，不复制布局常量，也不影响 Portfolio、Predict 等其他路由。
- 回归防线：新增组件行为测试，覆盖未测量时只显示 SDK 骨架、测得 `640px` 后只显示真实列表，以及首屏骨架确实输出 `Tokens` grid；测试先稳定复现无门禁分支，修复后 2 项全部通过。
- 验证结果：消费者 TypeScript 类型检查、目标 ESLint、12 项配置契约测试和 `git diff --check` 通过；真实首屏 HTTP 200 响应在执行 JavaScript 前已包含骨架标记、10 行 `88px` SDK skeleton 和 shimmer，浏览器确认 hydration 后无缝进入相同列表骨架。消费者全量 Jest 32 个套件中 31 个通过、167 项中 163 项通过，唯一失败仍为既有 `application-locale-runtime.test.tsx` 的 4 项旧资源断言，与本次文件无重叠。规格与规范两轴复审最终均无发现。未重启现有开发服务、未执行 production build。
- 推送状态：当前改动尚未提交、尚未推送。
- Workflow 状态：本轮未授权推送，因此未触发 GitHub Actions workflow 或 Vercel 部署。

## 2026-09-01：修复发现页首屏骨架缺失（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`5e16e63` — `fix(discover): render initial token skeleton [skip ci]`。
- 完成事项：在发现页 token 列表尺寸尚未测得时直接显示 SDK `TokenList` 原生加载态，尺寸有效后切换回实际 Trending、Stock 或 New Token widget；首屏骨架不再等待 hydration 和 `ResizeObserver`，并与真实列表共享完整视觉及响应式契约。
- 验证结果：聚焦测试 2 项、TypeScript 类型检查、目标 ESLint、12 项配置契约测试、`git diff --check` 及真实首屏 HTML/浏览器验证通过；全量测试仅保留既有 locale 资源断言 4 项失败。规格与规范最终复审均无发现。
- 推送状态：功能提交与本记录提交仅存在于本地 `main`，尚未推送；未使用 force push。
- Workflow 状态：功能提交标题包含 `[skip ci]`；本轮未推送，因此未触发 GitHub Actions workflow 或 Vercel 部署。

## 2026-09-01：校准发现页列表骨架行高与分割线（提交后）

- 仓库与分支：`react-sdk/main`；通过 `dex-nextjs-template/main` 的本地 SDK 链接和现有 3000 端口开发服务验证。
- React SDK 提交：`27fbc1836` — `fix(ui-tokens): align token list skeleton rows [skip ci]`。
- 问题背景：发现页 SDK 骨架一次渲染 10 行，每行虽然接收与真实列表相同的桌面行高 `88px`，但作为 loading wrapper 内的 flex 子项仍允许收缩；页面剩余高度不足时，浏览器会将骨架行压缩到约 64px。骨架分割线同时使用全强度 `border-subtle`，在深色背景中对比过强。
- 完成事项：为骨架行设置 `flex-shrink: 0`，确保桌面 `88px` 与移动端传入行高稳定，由列表容器承载溢出；将非末行分割线调整为 `border-border-subtle/30`。消费者提交 `5e16e63` 提供首屏尺寸测量前的 SDK 骨架，本次 SDK 提交进一步统一该骨架与真实列表的行高和主题分隔，两项改动互补。
- 回归防线：新增 `TokenListSkeleton` 组件测试，覆盖 10 行数量、桌面 88px 行高、禁止 flex 收缩、非末行弱分割线以及末行不显示分割线；测试在修复前稳定复现缺少防收缩约束，修复后通过。
- 验证结果：`@liberfi.io/ui-tokens` 全量 11 个测试套件、62 项测试通过，TypeScript 类型检查、目标 ESLint 和 `git diff --check` 通过；现有本地发现页确认真实列表行与骨架行均为 88px，弱分割线与页面背景协调；未重启开发服务、未执行 production build。
- 推送状态：SDK 功能提交、消费者首屏骨架提交及对应工作记录已快进推送至各自 `origin/main`，未使用 force push。
- Workflow 状态：所有提交标题均包含 `[skip ci]`；按提交 SHA 查询 GitHub Actions 未生成 run，未触发远端部署。

## 2026-09-01：保持 Token 详情页的来源导航高亮

- 仓库与分支：`dex-nextjs-template/main`；复用同级 `react-sdk` 本地链接与现有 3000 端口开发服务验证。
- 提交标题：`fix(navigation): preserve token detail source`。
- 问题背景：发现页和 Pulse 都进入相同的 `/tokens/{chain}/{address}` 详情路由，Header 之前只根据 pathname 判断当前导航；详情路由不匹配 `/pulse` 时会回退到“发现”，导致从 Pulse 新币、即将完成或已迁移列表进入详情后错误高亮“发现”。
- 完成事项：为 Token 详情路由增加可选且类型受限的来源参数；Pulse 的三个列表通过共用点击处理器进入详情时携带 `source=pulse`，发现页和其他未显式标记来源的入口仍默认归属“发现”；Header 统一通过来源感知的导航解析器计算高亮，在 Pulse 来源的详情页继续使用 Header 搜索进入其他 Token 时也保留 Pulse 上下文。
- 回归防线：先新增失败测试稳定复现 `/tokens/...` 携带 Pulse 来源仍被解析为 Discover，再完成实现；新增路由生成、Header 来源解析、Pulse 点击入口接线测试，聚焦 2 个测试套件共 16 项通过。
- 验证结果：聚焦 2 个测试套件共 16 项通过；升级正式 npm SDK 后消费者全量 Jest 32/32 个套件、169/169 项通过；TypeScript 类型检查、目标 ESLint、12 项配置契约测试、`git diff --check` 和 production build 通过。现有开发服务此前实测 `/tokens/sol/mint` 的 Header 将 Discover 标记为当前页，`/tokens/sol/mint?source=pulse` 则将 Pulse 标记为当前页；本轮安装新依赖后该既有服务请求无响应，未擅自停止或重启占用 3000 端口的进程。
- 推送计划：与后续 SDK 依赖升级和部署修复提交一起快进推送到 `origin/main`，不使用 force push。
- Workflow 策略：提交标题不包含 `[skip ci]`；按用户确认，本轮推送允许触发 Vercel 生产部署。

## 2026-09-01：发布最新 React SDK 主题与国际化改动（提交前）

- 仓库与分支：`react-sdk/main`；本地与 `origin/main` 一致，业务修改已通过此前多个 `[skip ci]` 提交进入主分支，当前 SDK 工作区干净。
- 拟用提交标题：`chore(release): publish latest sdk packages`；该提交仅用于触发仓库既定 Release workflow，不重复修改已经提交的业务源码。
- 问题背景：语义暗色主题、国际化资源集中化、Launchpad Modal 与表单主题、Portfolio 列表视觉以及 TokenList 骨架行高等改动此前为避免部署均跳过 CI，尚未形成可供生产消费者安装的新 npm 版本。
- 计划完成事项：执行 SDK production build 与相关测试；创建 release 触发提交并推送 `main`；等待 Release workflow 统一 patch bump、构建和发布全部 `@liberfi.io/*` 公共包；拉取 workflow 生成的 release commit，并从官方 npm registry 复核实际版本及 `@liberfi.io/client` 依赖。
- 影响范围：发布当前 `react-sdk/main` 已有变更；按用户明确要求，`@chainstream-io/sdk` 在 SDK manifest、lockfile 和消费者中均保持 `2.1.14`，本轮不升级 ChainStream、不接入其新版 Prediction API。
- 验证计划：运行 `pnpm build`、相关 UI/i18n/Launchpad/Token skeleton 测试及 `git diff --check`；Release 成功后复核 25 个公共包版本、release commit 和官方 npm 元数据。
- 预期推送状态：release 触发提交将快进推送到 `react-sdk/origin/main`，禁止 force push；workflow 生成的 release commit 随后拉取到本地。
- Workflow 策略：本次提交不包含 `[skip ci]`，明确允许并要求触发 `Release` workflow；消费者 Vercel 部署在 npm 发布并完成依赖升级后单独执行。

## 2026-09-01：发布最新 React SDK 主题与国际化改动（提交后）

- 仓库与分支：`react-sdk/main`；release 触发提交 `1189dc186` — `chore(release): publish latest sdk packages`，workflow 生成的 release commit 为 `ecdbeda34` — `chore: release packages`，本地已按规则 `pull --ff-only` 同步并与 `origin/main` 一致。
- 最终完成事项：通过既定 Release workflow 对全部 25 个 `@liberfi.io/*` 公共包统一执行 patch bump、构建并发布；主题、国际化、Launchpad、Portfolio 与 TokenList 骨架等此前跳过 CI 的修改现已具备正式 npm 版本。
- 版本结果：关键包包括 `@liberfi.io/client@0.3.90`、`@liberfi.io/i18n@0.1.273`、`@liberfi.io/ui@0.3.76`、`@liberfi.io/ui-launchpad@1.0.3`、`@liberfi.io/ui-perpetuals@1.1.73`、`@liberfi.io/ui-portfolio@3.0.75`、`@liberfi.io/ui-predict@4.0.74`、`@liberfi.io/ui-scaffold@2.0.75`、`@liberfi.io/ui-tokens@3.0.76`、`@liberfi.io/ui-trade@3.0.76`；其余公共包也均按计划增加一个 patch。
- ChainStream 约束：按用户要求未升级 `@chainstream-io/sdk`；新发布的 `@liberfi.io/client@0.3.90` 经官方 npm 元数据确认仍精确依赖 `2.1.14`，SDK manifest 和 lockfile 未引入其他 ChainStream 版本。
- 验证结果：SDK `pnpm build` 24/24 个任务通过；i18n 60 项、UI 143 项、Launchpad 4 项、Token 62 项、Portfolio 18 项、Scaffold 35 项测试全部通过；`git diff --check` 通过。官方 npm registry 已逐包确认目标版本，其中 `ui-predict` 的 `latest` 元数据曾短暂滞后，但指定版本 `4.0.74` 已可从官方 registry 正常解析。
- Workflow 结果：GitHub Actions Release run `33415039510` 成功，job `99563546939` 用时 5 分 52 秒；仅有 Node.js 20 deprecation 提示，不影响发布结果。
- 推送状态：触发提交和 release commit 均已位于 `react-sdk/origin/main`，未使用 force push；SDK 工作区干净。

## 2026-09-01：升级模板使用的 React SDK 正式版本

- 仓库与分支：`dex-nextjs-template/main`。
- 提交标题：`chore(deps): upgrade liberfi sdk packages`。
- 完成事项：将 `apps/web/package.json` 中实际使用的 24 个 `@liberfi.io/*` 依赖统一升级到本轮 React SDK Release 发布的正式版本，并通过 `pnpm install --no-frozen-lockfile` 刷新 `pnpm-lock.yaml`；关键版本包括 `client@0.3.90`、`i18n@0.1.273`、`react@0.3.90`、`ui@0.3.76`、`ui-launchpad@1.0.3`、`ui-portfolio@3.0.75`、`ui-predict@4.0.74`、`ui-tokens@3.0.76` 和 `ui-trade@3.0.76`。
- ChainStream 约束：按用户明确要求，消费者 `@chainstream-io/sdk` 继续保持 `^2.1.14`，锁文件实际解析仍为 `2.1.14`；扫描确认未引入 `2.1.27` 或其他 ChainStream 版本。
- 验证结果：`pnpm list --depth 0` 确认全部直接依赖解析到目标 npm 版本；消费者全量 Jest 32/32 个套件、169/169 项测试通过，12 项构建配置契约测试、TypeScript 类型检查、目标 ESLint、旧 SDK 版本残留扫描、`git diff --check` 和 `pnpm build:web` 均通过。production build 完成 20/20 个静态页面生成，仅保留既有 PostCSS 与 Sentry/OpenTelemetry 警告。
- 推送计划：与导航修复及部署修复提交一起快进推送到 `origin/main`，不使用 force push。
- Workflow 策略：提交标题不包含 `[skip ci]`；本轮明确允许消费者的 push workflow 继续执行 Vercel 生产部署。

## 2026-09-01：修复 Vercel 预构建产物上传缺少环境示例文件

- 仓库与分支：`dex-nextjs-template/main`。
- 提交标题：`fix(deploy): include env example in vercel upload`。
- 问题背景：此前 Deploy workflow run `33266855138` 已完成 Vercel production build，但在 `vercel deploy --prebuilt --prod` 阶段因 `.vercelignore` 的 `.env.*` 规则排除了构建追踪引用的 `apps/web/.env.example`，最终以 `ENOENT` 失败。
- 完成事项：在 `.vercelignore` 中为根目录及任意子目录的 `.env.example` 增加精确反忽略规则；真实环境文件仍继续被 `.env` / `.env.*` 排除，只允许无密钥的示例配置进入 Vercel 上传上下文。
- 验证结果：确认 `apps/web/.env.example` 为仓库已跟踪文件，反忽略规则位于通配排除规则之后；消费者 production build、全量测试和 `git diff --check` 通过。最终部署结果将在 GitHub Actions 完成后追加记录。
- 推送计划：与前两个已验证提交一起快进推送到 `origin/main`，由 push 触发 Vercel production workflow；不使用 force push。

## 2026-09-01：完成 SDK 升级与 Vercel 生产部署（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 代码提交：`e994daa` — `fix(navigation): preserve token detail source`；`cd30062` — `chore(deps): upgrade liberfi sdk packages`；`4f28ca8` — `fix(deploy): include env example in vercel upload`。三个提交已一次性快进推送到 `origin/main`，未使用 force push。
- 发布链路：React SDK Release run `33415039510` 先成功发布 25 个 `@liberfi.io/*` npm 包；消费者随后升级正式版本并由提交 `4f28ca8d0967042a81889b3bd4dafe04941a1bcb` 触发 Vercel production workflow。
- 部署结果：GitHub Actions Deploy run `33416471983`、job `99568200470` 成功，总用时 6 分 19 秒；Vercel `Build`、此前失败的 `Deploy` 以及成功通知步骤全部通过，生产地址为 `https://liberfi-kig2hwoaz-sgt-lab.vercel.app`。
- 验证汇总：React SDK build 24/24 个任务及相关 322 项测试通过；消费者全量 Jest 169/169 项、12 项配置契约、TypeScript、目标 ESLint、依赖版本扫描、`git diff --check` 和 production build 均通过；`@chainstream-io/sdk` 全链路保持 `2.1.14`。
- Workflow 说明：部署仅有 GitHub Actions 对 Node.js 20 action runtime 的弃用提示，不影响结果；本条最终记录提交使用 `[skip ci]`，避免仅文档更新再次重复部署。

## 2026-09-01：修复 Token 详情页 TradingView 未填满图表分区（提交前）

- 仓库与分支：`react-sdk/main`；通过同级 `dex-nextjs-template/main` 的本地 SDK alias 和重启后的 3000 端口开发服务验证。
- 拟用提交标题：`fix(ui-tradingview): fill resizable chart area`。
- 问题背景：Token 详情页桌面端图表分区高度为 `418px`，但 `TradingViewWidgetProvider` 的中间 wrapper 仅声明 `flex-1`；其直接父元素不是 flex 容器，该规则不参与高度分配，TradingView iframe 因此回退到固有 `150px` 高度，在分割区域下方留下 `268px` 空白。
- 完成事项：为 SDK `ui-tradingview` 的 widget wrapper 增加 `h-full min-h-0`，恢复从详情页图表分区到 widget container、iframe 的完整高度链；不修改详情页默认高度、最小高度、分割拖动范围、TradingView 初始化配置或数据源。
- 影响范围：影响所有复用 `@liberfi.io/ui-tradingview` widget 的已定高容器，使 iframe 跟随可用区域；不修改公开 Props、类型、exports、HTTP/WebSocket adapter、Domain DTO、K 线数据语义或 ChainStream 版本。
- 回归防线：新增 `TradingViewWidgetProvider` 组件测试，要求 wrapper 明确填满可用高度并允许 flex 子项正确收缩；测试在修复前稳定失败，修复后通过。
- 验证计划与结果：计划运行 `ui-tradingview` 全量测试、类型检查、全包 ESLint、`git diff --check`、React SDK `pnpm build`、消费者类型检查与 TradingView 入口测试，并在真实页面测量初始及拖动后的高度。实际结果为 SDK 5 个测试套件、23 项测试、类型检查、ESLint、24/24 个 build 任务和 `git diff --check` 全部通过；消费者类型检查及 Token/TradingView 入口 11 项测试通过。2048×1126 页面从“分区 418px / iframe 150px / 空白 268px”修复为“分区 418px / iframe 418px / 空白 0px”，拖动后分区与 iframe 同步为 416px。
- 预期推送状态：功能提交将 fast-forward 推送到 `react-sdk/origin/main`，禁止 force push；Release workflow 完成后拉取自动生成的 release commit。
- Workflow 策略：提交标题不包含 `[skip ci]`，由 push 触发 React SDK `Release` workflow；发布成功后使用官方 npm registry 核验全部公共包，并在消费者升级正式版本后触发 Vercel production 部署。

## 2026-09-01：修复 Token 详情页 TradingView 未填满图表分区（提交后）

- 仓库与分支：`react-sdk/main`。
- 提交：`b2295642b` — `fix(ui-tradingview): fill resizable chart area`。
- 最终完成事项：修复 `TradingViewWidgetProvider` 的中间高度链，使 widget container 与 iframe 填满调用方分配的可拖动图表区域；新增组件回归测试锁定 `h-full min-h-0` 契约。
- 验证结果：SDK 全量 build 24/24 个任务通过；`ui-tradingview` 全量 5 个套件、23 项测试、类型检查和 ESLint 通过；消费者类型检查、TradingView 入口 11 项测试和真实页面初始/拖动高度测量通过；两轴代码复审均无发现。
- 推送状态：功能提交已 fast-forward 推送到 `react-sdk/origin/main`，未使用 force push；随后已拉取 workflow 自动生成的 release commit `f2f78c708` — `chore: release packages`，本地与远端一致。
- Workflow 状态：GitHub Actions Release run `33420289335`、job `99580715431` 成功，用时 5 分 35 秒；25 个公共包均已通过官方 npm registry 验证，关键修复包为 `@liberfi.io/ui-tradingview@0.1.230`。workflow 仅有 Node.js 20 action runtime 弃用提示，不影响发布。
- ChainStream 约束：`@liberfi.io/client@0.3.91` 的官方 npm 元数据确认仍精确依赖 `@chainstream-io/sdk@2.1.14`，本轮未升级 ChainStream。

## 2026-09-01：升级模板使用的 React SDK TradingView 修复版本（提交前）

- 仓库与分支：`dex-nextjs-template/main`；React SDK Release 已完成，计划通过现有 3000 端口开发服务、测试与 production build 验证正式 npm 依赖。
- 拟用提交标题：`chore(deps): upgrade liberfi sdk packages`。
- 问题背景：TradingView 高度修复已随 React SDK Release 发布，但模板仍引用上一轮 npm 版本，生产构建无法获得 `ui-tradingview` 的完整高度链修复。
- 计划完成事项：将 `apps/web/package.json` 中实际使用的 24 个 `@liberfi.io/*` 包统一升级到 Release 生成的新 patch 版本，刷新 `pnpm-lock.yaml`；重点将 `@liberfi.io/ui-tradingview` 从 `0.1.229` 升级到 `0.1.230`。
- 影响范围：仅变更模板的 React SDK npm 依赖与锁文件；不修改业务调用接口、路由、图表数据源或 ChainStream SDK。
- ChainStream 约束：按用户明确要求，`@chainstream-io/sdk` 保持 `^2.1.14`，锁文件必须继续仅解析 `2.1.14`。
- 验证计划：刷新依赖后检查所有 workspace manifest 的 dependencies、devDependencies、peerDependencies 与锁文件残留；运行消费者类型检查、TradingView 聚焦测试、配置契约测试、全量测试、目标 ESLint、`git diff --check` 和发布所需的 `pnpm build:web`。
- 预期推送状态：验证通过后 fast-forward 推送到 `dex-nextjs-template/origin/main`，禁止 force push。
- Workflow 策略：提交标题不包含 `[skip ci]`，按用户确认触发 Vercel production Deploy workflow；部署完成后使用 `[skip ci]` 的报告提交补记最终结果，避免重复部署。

## 2026-09-01：升级模板使用的 React SDK TradingView 修复版本（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`9a5d681` — `chore(deps): upgrade liberfi sdk packages`。
- 最终完成事项：将模板实际依赖的 24 个 `@liberfi.io/*` npm 包统一升级到 React SDK Release `f2f78c708` 生成的新 patch 版本并刷新锁文件；关键包 `@liberfi.io/ui-tradingview` 从 `0.1.229` 升级至 `0.1.230`，生产构建已包含图表高度自适应修复。
- 版本与约束：直接依赖解析结果逐项符合目标版本；`@chainstream-io/sdk` 的 manifest 继续保持 `^2.1.14`，lockfile 仍仅解析 `2.1.14`，未引入其他 ChainStream 版本。
- 验证结果：消费者 TypeScript 类型检查、全量 ESLint、32/32 个 Jest 套件共 169/169 项、12 项构建配置契约和 `git diff --check` 全部通过；`pnpm build:web` 成功完成 20/20 个静态页面生成，仅保留既有 PostCSS、Sentry/OpenTelemetry、Browserslist 及依赖 peer warning。
- 推送状态：依赖提交已 fast-forward 推送至 `dex-nextjs-template/origin/main`，未使用 force push。
- 部署结果：GitHub Actions Deploy to Vercel run `33421324893`、job `99584138386` 成功，用时 6 分 6 秒；Build、Deploy 与成功通知步骤全部通过，生产地址为 `https://liberfi-coy7vq94a-sgt-lab.vercel.app`。
- 线上检查：生产地址可达并返回 Vercel SSO 的 `302` 跳转，说明部署入口已生效但受项目访问保护，未在未授权会话中继续页面级验证。
- Workflow 说明：仅有 GitHub Actions Node.js 20 action runtime 弃用提示，不影响部署；本条最终记录提交使用 `[skip ci]`，避免仅文档更新再次触发生产部署。

## 2026-09-01：恢复 Launchpad 创建代币曲线预览完整视觉（提交前）

- 仓库与分支：`react-sdk/main`；通过同级 `dex-nextjs-template/main` 的本地 SDK source alias 和 3000 端口开发服务验证。
- 拟用提交标题：`fix(ui-launchpad): restore complete curve preview`。
- 问题背景：Launchpad 从模板迁移到 React SDK 时，原有带坐标轴、网格、渐变面积、点状曲线、端点与市值图例的完整预览被简化为一条基础 SVG 实线，导致当前创建新币弹窗与历史设计明显不一致；初版恢复后曲线采样点全部可见，又造成点过密、接近连成实线。
- 完成事项：使用原生 SVG 恢复横纵坐标轴、刻度标签、弱网格、主题色渐变面积、稀疏圆点虚线、起止端点及动态 Starting MC / Migration MC 图例；保留 40 个计算采样点保证曲线平滑，但只显示两个端点，并将曲线调整为 `2 8` 的圆点间隔，避免密集点遮蔽曲线。
- 影响范围：仅影响 `@liberfi.io/ui-launchpad` 的曲线预览展示；不修改 Launchpad 表单、曲线计算接口、公开 Props、交易创建流程、钱包交互或 ChainStream SDK。
- 回归防线：新增组件测试，锁定网格、双轴、渐变面积、稀疏虚线、两个端点、Token supply 标签及双图例契约。
- 验证结果：`@liberfi.io/ui-launchpad` 3 个测试套件、5 项测试、类型检查、ESLint 与 `git diff --check` 已通过；消费者 TypeScript 类型检查和全量 32 个 Jest 套件、169 项测试通过。真实 Pump 与 Raydium 弹窗确认图表包含 11 条网格线、双轴、13 个刻度标签、渐变区域、40 个平滑计算采样和仅 2 个可见端点，切换平台后图例数据同步变化，浏览器控制台无错误；发布前将继续执行 SDK 全量 production build。
- 预期推送状态：功能提交将 fast-forward 推送到 `react-sdk/origin/main`，禁止 force push；Release workflow 成功后拉取自动生成的 release commit。
- Workflow 策略：提交标题不包含 `[skip ci]`，按用户确认触发 React SDK `Release` workflow；npm 发布成功后在模板统一升级正式 `@liberfi.io/*` 版本并触发 Vercel production 部署。
- ChainStream 约束：`@chainstream-io/sdk` 保持当前 `2.1.14` 版本，本轮不做任何版本升级。

## 2026-09-01：恢复 Launchpad 创建代币曲线预览完整视觉（提交后）

- 仓库与分支：`react-sdk/main`。
- 提交：`f10a0a23b` — `fix(ui-launchpad): restore complete curve preview`；workflow 生成的 release commit 为 `9a8a99e8b` — `chore: release packages`。
- 最终完成事项：恢复 Launchpad 曲线预览的坐标轴、刻度、弱网格、主题渐变面积、稀疏圆点曲线、双端点和动态市值图例；40 个曲线计算采样点只保留起止两点可见，避免密集点连成实线。
- 验证结果：SDK 全量 build 24/24 个任务、`@liberfi.io/ui-launchpad` 3 个测试套件共 5 项、类型检查、ESLint、`git diff --check`、消费者 169 项全量测试及 Pump/Raydium 真实弹窗检查通过；浏览器控制台无错误。
- 发布结果：GitHub Actions Release run `33429979997`、job `99612718375` 成功，用时 4 分 27 秒；25 个公共包均已通过官方 npm registry 的指定版本查询，关键修复包为 `@liberfi.io/ui-launchpad@1.0.5`，release commit 已通过 `pull --ff-only` 同步，本地与远端一致。
- ChainStream 约束：官方 npm 元数据确认 `@liberfi.io/client@0.3.92` 仍精确依赖 `@chainstream-io/sdk@2.1.14`，本轮未升级 ChainStream。
- Workflow 说明：仅有 GitHub Actions Node.js 20 action runtime 弃用提示，不影响 npm 发布结果。

## 2026-09-01：升级模板使用的 React SDK 曲线预览修复版本（提交前）

- 仓库与分支：`dex-nextjs-template/main`；本地与 `origin/main` 无分叉。
- 拟用提交标题：`chore(deps): upgrade liberfi sdk packages`。
- 计划完成事项：将 `apps/web/package.json` 实际使用的 24 个 `@liberfi.io/*` 依赖统一升级到 Release `9a8a99e8b` 发布的正式 patch 版本并刷新 `pnpm-lock.yaml`；重点将 `@liberfi.io/ui-launchpad` 从 `1.0.4` 升级到 `1.0.5`。
- 影响范围：仅更新模板的 React SDK npm 依赖、锁文件与本工作记录；不修改业务调用接口、Launchpad 数据、创建代币流程或钱包交互。
- ChainStream 约束：按用户明确要求，`@chainstream-io/sdk` manifest 保持 `^2.1.14`，锁文件实际解析必须继续保持 `2.1.14`。
- 验证计划：检查全部 workspace manifest 的 dependencies、devDependencies、peerDependencies 和锁文件旧版本残留；运行 TypeScript、全量 Jest、配置契约测试、ESLint、`git diff --check` 与发布所需的 `pnpm build:web`。
- 预期推送状态：验证通过后 fast-forward 推送到 `dex-nextjs-template/origin/main`，禁止 force push。
- Workflow 策略：依赖提交不包含 `[skip ci]`，按用户确认触发 Vercel production Deploy workflow；部署完成后使用 `[skip ci]` 的报告提交补记最终结果，避免重复部署。

## 2026-09-01：升级模板使用的 React SDK 曲线预览修复版本（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`f92cf4f` — `chore(deps): upgrade liberfi sdk packages`。
- 最终完成事项：将模板实际依赖的 24 个 `@liberfi.io/*` npm 包统一升级到 React SDK Release `9a8a99e8b` 生成的新 patch 版本并刷新锁文件；关键包 `@liberfi.io/ui-launchpad` 从 `1.0.4` 升级至 `1.0.5`，生产构建已包含完整曲线预览及稀疏点样式修复。
- 版本与约束：全部 workspace manifest 的 dependencies、devDependencies、peerDependencies 已扫描，24 个直接依赖逐项匹配 SDK 正式 manifest；`@chainstream-io/sdk` 继续保持 manifest `^2.1.14`，lockfile 仅解析 `2.1.14`。
- 验证结果：现有 3000 端口开发服务在依赖安装后继续正常热更新且首页 HTTP 200；消费者 TypeScript、lint 0 warning、32/32 个 Jest 套件共 169/169 项、12 项配置契约、workspace gates、依赖与旧版本扫描、`git diff --check` 和 `pnpm build:web` 全部通过。production build 成功生成 20/20 个页面，仅保留既有 PostCSS、Sentry/OpenTelemetry、Browserslist 与 peer dependency 警告。
- 推送状态：依赖提交已 fast-forward 推送至 `dex-nextjs-template/origin/main`，未使用 force push；为避免与 production build 同时写入 `.next`，本轮由 agent 启动的本地 3000 端口开发服务已正常停止。
- 部署结果：GitHub Actions Deploy to Vercel run `33430928162`、job `99615810340` 成功，用时 6 分 47 秒；Build、Deploy 与成功通知步骤全部通过，生产地址为 `https://liberfi-i3z091del-sgt-lab.vercel.app`。
- Workflow 说明：仅有 GitHub Actions Node.js 20 action runtime 弃用提示，不影响部署；本条最终记录提交使用 `[skip ci]`，避免纯文档更新再次触发生产部署。

## 2026-09-01：迁移新版预测六个可见模块（提交前）

- 仓库与分支：`dex-nextjs-template/main` 与同级 `react-sdk/main`；复用现有 3000 端口开发服务和本地 SDK source alias 联调。
- 拟用提交标题：React SDK 使用 `feat(i18n): centralize prediction module translations`；模板使用 `feat(predict): migrate updated prediction modules`。
- 迁移范围：将 `prediction-nextjs-template` 当前可见的体育、电竞、市场、排行榜、预测持仓和返佣六个模块迁入主站 `/predict` 二级导航；不暴露 Matches、World Cup、Profile、Recovery 或 Mini App 独立菜单与路由。
- 架构处理：六个入口统一使用 `/predict/*` 路由，旧预测详情入口保留重定向兼容；接入新版 sports、leaderboard、referral、portfolio、market-data 组件和更新后的 prediction-server API 客户端，同时复用主站认证、钱包、主题与运行时 Provider。
- 国际化处理：预测模板本地维护的六模块及其共享 World Cup 组件翻译将收敛到 `react-sdk/packages/i18n/locales`，主站不新增第二套本地文案源。
- 依赖与约束：模板仅新增新版页面实际需要的 `@number-flow/react` 与 `centrifuge`；`@chainstream-io/sdk` 保持 `2.1.14`，不升级版本；本轮不发布 npm、不推送远端、不触发 GitHub workflow 或 Vercel 部署。
- 验证计划：运行 React SDK i18n 类型检查与测试、模板预测聚焦测试、TypeScript、ESLint、全量测试、`git diff --check`，并通过现有本地开发服务逐页检查六个模块、二级导航、详情跳转、登录态和浏览器控制台。

## 2026-09-01：迁移新版预测六个可见模块（提交后）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`。
- 提交：React SDK `7c2aa5c55` — `feat(i18n): centralize prediction module translations`；模板 `efc2393` — `feat(predict): migrate updated prediction modules`。
- 最终完成事项：将新版体育、电竞、市场、排行榜、预测持仓、返佣六个模块迁入主站 `/predict` 二级导航；补齐统一详情页、排行榜钱包详情、体育/电竞实时数据、预测持仓交易活动和返佣流程，并将旧 `/predict` 与 `/predict/matches` 收敛到 `/predict/sports`，不暴露 Matches、World Cup、Profile、Recovery 或 Mini App 独立入口。
- 架构与主题：接入 prediction-server 新版 HTTP、WebSocket 与可选 Centrifugo 行情能力，复用主站认证、钱包及运行时 Provider；新增页面已从源模板固定灰阶与涨跌色转换为主站语义化 theme token，六模块内部跳转保持在 `/predict/*` 命名空间。
- 国际化：六模块及其共享详情组件文案已集中到 `react-sdk/packages/i18n/locales` 的 13 份 locale；模板仅保留语言解析与后端语言透传逻辑，不维护第二套业务翻译。
- 验证结果：React SDK i18n 类型检查及 12/12 个套件共 61/61 项测试通过；模板 TypeScript、ESLint、34/34 个 Jest 套件共 175/175 项、13 项构建配置契约、主题扫描与两仓库 `git diff --check` 通过。现有 3000 端口开发服务确认本地 SDK alias 生效，浏览器逐页验证六个入口、六项二级菜单、激活态与 `/predict` 重定向正常，未发现失效主题类名。
- 审查结果：提交前按规范与需求两轴复审，修正旧 Matches 路由边界及一处无关 QueryClient 配置覆盖后，两轴均无剩余发现。
- 版本与发布状态：`@chainstream-io/sdk` manifest 继续保持 `^2.1.14`，lockfile 仅解析 `2.1.14`；本轮仅本地提交，未推送远端、未发布 npm、未触发 GitHub workflow 或 Vercel 部署。本地联调继续通过同级 `react-sdk` source alias 运行。

## 2026-09-01：发布新版预测模块并部署模板（提交前）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`。
- 拟用模板提交标题：`chore(deps): upgrade liberfi sdk packages`。
- 发布范围：将预测六模块的集中式国际化随 React SDK 发布，并将模板实际使用的 24 个 `@liberfi.io/*` 依赖统一升级到本次正式 Release 版本；关键包包括 `@liberfi.io/i18n@0.1.276`、`@liberfi.io/react-predict@0.3.77` 与 `@liberfi.io/ui-predict@4.0.77`。
- 发布前修正：React SDK pre-push 全量构建发现非英文 locale 缺少英语基准词条，已补齐 13 份语言目录的 key 覆盖并新增 locale 完整性回归测试，避免缺词条再次阻断 CSV 导出与发布。
- React SDK 状态：功能提交 `7c2aa5c55` 与国际化覆盖修复提交 `c5050ac72` 已推送；GitHub Actions Release run `33468749966` 成功，workflow 生成的 release commit `20f7414e1` 已同步，本地与远端一致；全部目标版本已通过官方 npm registry 指定版本查询。
- ChainStream 约束：按用户明确要求，`@chainstream-io/sdk` 保持 `^2.1.14`，本轮不升级该依赖。
- 验证计划：刷新 `pnpm-lock.yaml`，扫描全部 workspace manifest 的 dependencies、devDependencies、peerDependencies 与锁文件残留；执行类型检查、全量测试、ESLint、配置契约、`git diff --check` 与使用正式 npm 依赖的 production build。
- 部署计划：验证通过后 fast-forward 推送到 `dex-nextjs-template/origin/main`，触发 Vercel production Deploy workflow；部署成功后以 `[skip ci]` 报告提交记录最终 commit、run、job、生产地址与验证结果，避免纯文档更新重复部署。

## 2026-09-01：发布新版预测模块并部署模板（提交后）

- React SDK 提交与发布：预测国际化功能提交 `7c2aa5c55`、locale 覆盖修复提交 `c5050ac72` 已 fast-forward 推送；GitHub Actions Release run `33468749966`、job `99733966795` 成功，用时 5 分 13 秒；workflow release commit `20f7414e1` 已通过 `pull --ff-only` 同步，本地与远端一致。
- npm 发布结果：模板使用的 24 个 `@liberfi.io/*` 包均已发布并通过官方 npm registry 指定版本查询；关键预测包为 `@liberfi.io/i18n@0.1.276`、`@liberfi.io/react-predict@0.3.77` 与 `@liberfi.io/ui-predict@4.0.77`。
- 模板提交：`9093912` — `chore(deps): upgrade liberfi sdk packages`；已将 `apps/web/package.json` 的 24 个 React SDK 直接依赖统一升级到本次 Release 版本并刷新 `pnpm-lock.yaml`，随后 fast-forward 推送到 `dex-nextjs-template/origin/main`。
- ChainStream 约束：`@chainstream-io/sdk` manifest 继续保持 `^2.1.14`，lockfile 仅解析 `2.1.14`，本轮未升级 ChainStream。
- 验证结果：消费者 TypeScript、ESLint、workspace gates、34/34 个 Jest 套件共 175/175 项、13 项构建配置契约、依赖版本扫描和 `git diff --check` 全部通过；使用正式 npm 依赖的 `pnpm build:web` 成功生成 23/23 个页面。本地 SDK source alias 服务重启成功，预测页面运行态返回正常。
- 部署结果：GitHub Actions Deploy to Vercel run `33469556631`、job `99736350005` 成功，用时 6 分 22 秒；Build、Deploy 与成功通知步骤全部通过，生产地址为 `https://liberfi-bvgupfl2l-sgt-lab.vercel.app`。
- 线上检查：生产地址可达并返回 Vercel SSO 的 `302` 跳转，说明部署入口已生效但受项目访问保护，未在未授权会话中继续页面级验证。
- Workflow 说明：Release 与 Deploy 仅有 GitHub Actions Node.js 20 action runtime 弃用提示，不影响发布和部署；本条最终记录提交使用 `[skip ci]`，避免纯文档更新再次触发 workflow。

## 2026-09-01：修复搜索 Modal 的 ESC 键位提示国际化（提交前）

- 仓库与分支：`react-sdk/main`；工作事项统一记录在 `dex-nextjs-template/main` 的 `WORK_REPORT.md`。
- 拟用提交标题：`fix(search): keep escape key label unlocalized [skip ci]`。
- 问题背景：搜索 Modal 无关键词时，输入框右侧展示的是用于提示关闭快捷键的物理键名，但组件错误复用了 `common.escape` 国际化文案；中文界面显示“退出”并在紧凑键帽内换行，造成控件形变且偏离快捷键提示语义。
- 完成事项：将 Token 搜索与预测搜索两个同构入口的键位提示统一固定为大写 `ESC`，不再经过国际化；保留鼠标点击和键盘 Escape 关闭 Modal 的现有行为，并为两个入口新增固定键名回归测试。
- 影响范围：仅影响 `@liberfi.io/ui-tokens` 与 `@liberfi.io/ui-predict` 搜索输入框的空关键词尾部键位提示；不修改搜索请求、搜索历史、结果选择、国际化资源或公开组件接口。
- 验证结果：两组定向测试已完成红灯复现并由红转绿；`ui-tokens` 11/11 个测试套件共 63/63 项、`ui-predict` 10/10 个测试套件共 36/36 项、两包 TypeScript 与 ESLint、消费者 TypeScript 和 `git diff --check` 均通过。中文本地页面实测 `ESC` 单行显示为 `23.39 × 16px`，按 Escape 后 Modal 正常关闭。
- 推送状态：React SDK 与模板在修改前均与各自 `origin/main` 无分叉；计划以 fast-forward 方式推送，禁止 force push。
- Workflow 状态：按用户要求，本轮 React SDK 功能提交与模板报告提交均使用 `[skip ci]`，不触发 npm Release、Vercel 部署或其他 GitHub workflow。

## 2026-09-01：修复搜索历史单字符条目尺寸与对齐（提交后）

- 仓库与分支：`react-sdk/main`；工作事项统一记录在 `dex-nextjs-template/main` 的 `WORK_REPORT.md`。
- 提交：`dee5eaa6f` — `fix(search): align single-character history chips [skip ci]`。
- 问题背景：搜索历史中的单字符英文或数字触发 HeroUI Chip 的紧凑尺寸分支，使数字 `1` 等条目比普通关键词低 4px、垂直中心偏移 2px，造成同一行内容明显不对齐。
- 完成事项：Token 搜索与预测搜索均通过稳定内容节点绕开不适用于搜索词的单字符紧凑样式，统一所有历史词条为 24px；新增两项使用真实 HeroUI Chip 的回归测试，锁定单字符与多字符尺寸一致性。
- 影响范围：仅调整 `@liberfi.io/ui-tokens` 与 `@liberfi.io/ui-predict` 搜索历史的视觉对齐和对应测试，不改变搜索历史存储、搜索接口、点击行为或对外组件 API。
- 验证结果：本地 SDK source alias 页面实测四个历史词条高度差和中心偏差均为 0；`ui-tokens` 12/12 个测试套件共 64/64 项、`ui-predict` 11/11 个测试套件共 37/37 项、两包 TypeScript 与 ESLint、消费者 TypeScript、`git diff --check` 以及推送前 SDK 全量 build 24/24 个任务全部通过。
- 推送状态：提交已 fast-forward 推送至 `react-sdk/origin/main`，本地与远端无分叉，未使用 force push。
- Workflow 状态：提交包含 `[skip ci]`；指定 commit 查询无任何 GitHub Actions run，本轮未发布 npm、未触发 Vercel 部署。最终 `WORK_REPORT.md` 提交同样使用 `[skip ci]`。

## 2026-09-01：修复搜索 Modal 的 ESC 键位提示国际化（提交后）

- 仓库与分支：`react-sdk/main`；工作事项统一记录在 `dex-nextjs-template/main` 的 `WORK_REPORT.md`。
- 提交：`4d633e250` — `fix(search): keep escape key label unlocalized [skip ci]`。
- 问题背景：Token 搜索 Modal 的快捷键提示被中文国际化为“退出”，在有限键帽空间内换行并产生视觉形变，同时误把物理按键名称表达成了操作文案；同构的预测搜索入口存在相同隐患。
- 完成事项：Token 搜索与预测搜索均固定显示大写 `ESC`，不再调用 `common.escape` 翻译；鼠标点击键帽和键盘 Escape 关闭行为保持不变，并新增两项组件回归测试锁定键位标签契约。
- 影响范围：仅调整 `@liberfi.io/ui-tokens` 与 `@liberfi.io/ui-predict` 搜索输入框的空关键词尾部提示和对应测试，不修改国际化资源、搜索数据流、历史记录、结果选择或公开接口。
- 验证结果：`ui-tokens` 11/11 个测试套件共 63/63 项、`ui-predict` 10/10 个测试套件共 36/36 项、两包 TypeScript 与 ESLint、消费者 TypeScript、`git diff --check` 及推送前 SDK 全量 build 24/24 个任务全部通过；中文本地页面确认 `ESC` 单行显示且 Escape 关闭功能正常。
- 推送状态：提交已 fast-forward 推送到 `react-sdk/origin/main`，本地与远端无分叉，未使用 force push。
- Workflow 状态：提交包含 `[skip ci]`；指定 commit 查询无任何 GitHub Actions run，Release workflow 最新记录仍为此前的 `33468749966`，本轮未发布 npm、未触发部署。最终 `WORK_REPORT.md` 提交同样使用 `[skip ci]`。

## 2026-09-01：修复搜索历史单字符条目尺寸与对齐（提交前）

- 仓库与分支：`react-sdk/main`；工作事项统一记录在 `dex-nextjs-template/main` 的 `WORK_REPORT.md`。
- 拟用提交标题：`fix(search): align single-character history chips [skip ci]`。
- 问题背景：搜索历史中的单字符英文或数字会触发 HeroUI Chip 的单字符紧凑样式，实际高度由普通关键词的 24px 缩小为 20px，导致同一行历史词条的高度和垂直中心不一致。
- 完成事项：Token 搜索与预测搜索的历史词条均改为使用稳定的内容节点，避免单字符被错误识别为紧凑头像式 Chip；为两个同构入口新增真实 HeroUI Chip 回归测试，确保单字符与多字符历史词条统一使用 24px 高度。
- 影响范围：仅影响 `@liberfi.io/ui-tokens` 与 `@liberfi.io/ui-predict` 的搜索历史词条展示和对应测试；不修改历史数据、搜索请求、点击选择、清空逻辑或公开组件接口。
- 验证结果：本地 SDK source alias 页面实测 `trump`、`tr`、`1`、`fff` 均为 24px，最大高度差由 4px 降为 0、垂直中心偏差由 2px 降为 0；`ui-tokens` 12/12 个测试套件共 64/64 项、`ui-predict` 11/11 个测试套件共 37/37 项、两包 TypeScript 与 ESLint、消费者 TypeScript 和 `git diff --check` 均通过。
- 推送状态：React SDK 与模板在修改前均与各自 `origin/main` 无分叉；计划以 fast-forward 方式推送，禁止 force push。
- Workflow 状态：按用户要求，本轮 React SDK 功能提交与模板报告提交均使用 `[skip ci]`，不触发 npm Release、Vercel 部署或其他 GitHub workflow。

## 2026-09-01：修复资产汇总数据源并优化汇总卡片布局（提交前）

- 仓库与分支：`dex-nextjs-template/main`；修改前本地与 `origin/main` 无分叉，继续复用现有 3000 端口开发服务及同级 `react-sdk` source alias。
- 拟用提交标题：`fix(portfolio): restore net worth summary layout [skip ci]`。
- 问题背景：Portfolio 客户端配置启用了 `/api/balance` 原始余额兼容分支，该接口不包含市场价格且兼容映射将 USD 字段固定为 0，导致资产列表可显示约 1.832 USDC，但账户汇总金额和资产分布显示为 0；同时汇总卡片的信息和操作按钮集中在上半部，下方存在大面积无效空白，视觉节奏失衡。
- 完成事项：移除 Portfolio 客户端的 `nativeBalanceApiUrl` 配置，使资产汇总、持仓和资产分布恢复使用 ChainStream 净值数据；保留 `/api/balance` 路由及 SOL、ETH、BNB 原生余额 hooks，仅继续服务 Hyperliquid 充值手续费余额场景；重新组织汇总卡片层级，将刷新入口移至地址行、24H 变化拆为辅助信息行、操作区锚定卡片底部并同步骨架屏。
- 影响范围：影响资产页净值数据源、资产汇总卡片及其骨架屏；不修改 `/api/balance` 路由实现、充值流程、钱包地址解析、ChainStream SDK 版本或 React SDK 代码。
- 验证结果：客户端配置回归测试已完成红灯复现并由红转绿；模板 34/34 个 Jest 套件共 175/175 项、TypeScript、相关文件 ESLint 和 `git diff --check` 全部通过。本地 `/portfolio` 返回 HTTP 200，3000 端口开发服务确认启用本地 SDK alias；本地 `/api/balance` 仍可查询目标钱包并返回 USDC 原始余额 `1.831681`，未登录浏览器下骨架屏新布局与相邻资产分布卡片底边对齐。
- 推送状态：计划以 fast-forward 方式推送到 `origin/main`，禁止 force push。
- Workflow 状态：按用户要求，功能提交与最终报告提交均使用 `[skip ci]`，不触发 GitHub workflow、npm 发布或 Vercel 部署。

## 2026-09-01：修复资产汇总数据源并优化汇总卡片布局（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`b2692cc` — `fix(portfolio): restore net worth summary layout [skip ci]`。
- 问题背景：资产列表已通过行情数据计算出 USDC 价值，但 Portfolio 汇总仍被 `/api/balance` 原始余额兼容分支接管并得到固定的零 USD 字段，造成账户总额、资产分布与资产列表不一致；汇总卡片同时存在顶部信息拥挤、下半部留白失衡的问题。
- 最终完成事项：Portfolio 已恢复使用 ChainStream 净值数据，资产汇总、持仓和分布回到同一数据语义；`/api/balance` 继续只承担充值场景的原生代币手续费余额查询。汇总卡片已建立清晰的地址、金额、24H 辅助信息和底部操作区层级，刷新入口与骨架屏同步调整，减少无效留白及加载布局跳动。
- 影响范围：资产页客户端数据源、汇总卡片和对应骨架屏；未升级 `@chainstream-io/sdk`，未修改 React SDK、充值流程或 `/api/balance` 路由。
- 验证结果：34/34 个 Jest 套件共 175/175 项、TypeScript、相关文件 ESLint、`git diff --check` 和本地开发页面检查全部通过；`/portfolio` 返回 HTTP 200，`/api/balance` 仍可返回目标钱包的 USDC 原始余额 `1.831681`。
- 推送状态：功能提交已 fast-forward 推送至 `origin/main`，未使用 force push；最终报告提交将在同一分支继续 fast-forward 推送。
- Workflow 状态：功能提交包含 `[skip ci]`，GitHub 对提交 `b2692cc` 的 Actions 查询结果为空；未触发 GitHub workflow、npm 发布或 Vercel 部署。最终报告提交同样使用 `[skip ci]`。

## 2026-09-01：发布资产页汇总修复并部署生产环境

- 仓库与分支：`dex-nextjs-template/main`；部署基线为 `5d97d33`，包含资产净值数据源修复、汇总卡片与骨架屏优化以及对应工作记录。
- 发布评估：本轮待发布代码全部位于模板仓库，`react-sdk` 无代码、manifest 或构建产物变化，因此无需发布 npm，也无需 bump `@liberfi.io/*` 依赖；`@chainstream-io/sdk` 继续保持 `2.1.14`。
- 发布事项：通过 `Deploy to Vercel` 的 `workflow_dispatch` 对当前 `main` 直接执行 production build 和 production deploy，没有创建无业务价值的空提交，也未触发 SDK 更新 workflow。
- 影响范围：线上资产页的账户汇总、资产分布数据一致性，以及汇总卡片和加载骨架的视觉层级；充值场景使用的 `/api/balance` 原生代币余额能力保持不变。
- 验证结果：部署前模板 34/34 个 Jest 套件共 175/175 项、TypeScript、相关 ESLint、`git diff --check` 和本地页面验证已通过；远端 Vercel Build、Deploy 与成功通知步骤全部通过。
- 部署结果：GitHub Actions run `33513711224`、job `99875370597` 成功，用时 6 分 16 秒；生产部署地址为 `https://liberfi-l09so4uyu-sgt-lab.vercel.app`。
- 线上检查：生产地址返回 Vercel SSO 的 HTTP 302 跳转，确认部署入口已生效但受项目访问保护，未在未授权会话中继续页面级检查。
- 推送状态：部署结果记录将以 `[skip ci]` 的纯文档提交 fast-forward 推送至 `origin/main`，禁止 force push。
- Workflow 状态：本次仅手动触发目标 Vercel 部署 workflow；没有发布 React SDK npm 包、没有 bump 模板 SDK 版本。纯文档结果提交使用 `[skip ci]`，避免再次触发部署。

## 2026-09-01：统一 K 线主题并修复图表高度拖拽边界（提交前）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`；修改前两个仓库均与各自 `origin/main` 无分叉，继续使用模板现有 3000 端口开发服务及本地 SDK source alias 联调。
- 拟用提交标题：React SDK 使用 `fix(tradingview): apply semantic chart palette [skip ci]`；模板使用 `fix(chart): align theme and resize bounds [skip ci]`。
- 问题背景：TradingView 图表仍使用旧的固定背景与红绿色，且加载已保存图表后可能覆盖当前主题；Token 详情页的水平分隔条又强制为活动列表保留 200px，导致 K 线高度在约页面三分之二处提前停止。
- 计划完成事项：为 SDK 增加可配置的背景、涨色与跌色并覆盖蜡烛、柱线、空心 K 线、平均 K 线、折线、面积、基准线和成交量；在图表 ready 及主题变化时重新应用调色板；统一模板 TradingView iframe 的暗色语义色；允许 Token 详情页分隔条拖至外层视口底部，同时保留 200px 的最小图表高度和可滚动访问的底部数据区。
- 排除事项：本次明确不提交“已恢复并跑通 token 详情页 K 线工具栏”及其多图表、图表类型、指标、价格/市值、USD/原生币切换、数据源扩展和功能开关改动；这些修改继续保留在本地工作区。
- 影响范围：React SDK 的 `@liberfi.io/ui-tradingview` 主题配置与 TradingView overrides；模板的图表静态主题、永续图表主题接入、Token 详情页桌面布局及对应回归测试。不修改交易接口、行情请求、移动端布局或 npm 依赖版本。
- 验证计划：运行 `@liberfi.io/ui-tradingview` 全量测试、TypeScript 与 ESLint；运行模板 Web 全量测试、TypeScript、ESLint、主题契约、`git diff --check`，并通过现有本地 Token 详情页核对图表背景和可达拖拽边界。
- 预期推送状态：仅暂存上述主题与布局修复，以 fast-forward 方式分别推送到两个仓库的 `origin/main`，禁止 force push；工具栏相关文件和混合文件中的工具栏 hunks 保持未暂存。
- Workflow 策略：两个功能提交及后续纯报告提交均使用 `[skip ci]`；不触发 GitHub Actions Release、npm 发布、Vercel 部署或其他 workflow。

## 2026-09-01：统一 K 线主题并修复图表高度拖拽边界（提交后）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`。
- 提交：React SDK `f5b3714a5` — `fix(tradingview): apply semantic chart palette [skip ci]`；模板 `6a2d833` — `fix(chart): align theme and resize bounds [skip ci]`。
- 最终完成事项：TradingView 已使用当前语义主题的背景 `#050807`、涨色 `#c7ff2e` 与跌色 `#f76816`，覆盖蜡烛、柱线、空心 K 线、平均 K 线、折线、面积、基准线及成交量；加载已保存图表、初始化完成或主题更新后均会重新应用调色板。模板 iframe 外壳、边框、文字和强调色同步收敛到暗色主题。
- 布局修复：Token 详情页移除了向下拖动时强制保留 200px 活动列表的错误上限，4px 分隔条现在可到达外层视口底部；底部数据区继续位于页面折叠区域并可滚动访问，向上拖动仍保留 200px 最小图表高度。
- 排除结果：“已恢复并跑通 token 详情页 K 线工具栏”及其多图表、图表类型、指标、价格/市值、USD/原生币切换、数据源扩展和 feature override 修改均未进入上述提交，仍完整保留在两个本地工作区等待后续处理。
- 验证结果：React SDK `@liberfi.io/ui-tradingview` 8/8 个测试套件共 26/26 项、TypeScript、ESLint 和 `git diff --check` 通过；模板 Web 37/37 个 Jest 套件共 181/181 项、14 项配置契约、TypeScript、ESLint 和 `git diff --check` 通过。本地页面测得外层高度 827px、Header 72px，修复后的最大图表高度为 751px，分隔条剩余底部距离为 0。
- 构建结果：React SDK 推送前 hook 自动执行全量构建，24/24 个任务成功；本轮未执行模板 production build，也未发布 npm。
- 推送状态：两个功能提交均已 fast-forward 推送到各自 `origin/main`，远端 commit 与本地 HEAD 一致，未使用 force push。
- Workflow 结果：两个提交均包含 `[skip ci]`；按 commit 查询 GitHub Actions run 均为空，未触发 Release、npm 发布、Vercel 部署或其他 workflow。最终 `WORK_REPORT.md` 纯文档提交同样使用 `[skip ci]`。

## 2026-09-01：禁用 K 线 Account Manager 并发布生产环境（提交前）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`；修改前两个仓库均与各自 `origin/main` 无分叉，继续复用模板现有 3000 端口开发服务及同级 `react-sdk` source alias 联调。
- 拟用提交标题：React SDK 使用 `fix(tradingview): support consumer feature overrides`；模板使用 `fix(chart): disable unused account manager`，依赖升级使用 `chore(deps): bump react sdk packages`。
- 问题背景：TradingView 的 Account Manager 不承载 Liberfi 的业务账户与订单数据，在永续合约及 Token 详情 K 线中点击后只会展开空白面板、压缩有效图表区域，造成误导和视觉异常；SDK 虽已有 feature 配置字段，但初始化 Widget 时未将消费者配置透传到底层 TradingView。
- 完成事项：React SDK 将消费者的 `disabledFeatures` 与 `enabledFeatures` 合并到 Widget 初始化配置，完成去重并确保禁用配置优先，同时补充 `TradingAccountManager` feature 枚举和回归测试；模板在 Perpetuals 与 Token 详情两处 K 线显式禁用 `trading_account_manager`，保留页面原有持仓、订单、成交等业务面板。
- 影响范围：仅影响 `@liberfi.io/ui-tradingview` 的 feature 配置透传及模板两处 TradingView 初始化配置；不修改行情、交易、账户、钱包、图表主题、工具栏或页面底部业务数据区。本轮不升级 `@chainstream-io/sdk`。
- 验证结果：React SDK 7/7 个测试套件共 25/25 项、类型检查与 ESLint 通过；模板 37/37 个 Jest 套件共 181/181 项、类型检查、定向 ESLint和 `git diff --check` 通过。本地浏览器确认 Perpetuals 与 Token 详情 TradingView iframe 内 `Account Manager` 数量均为 0，Token 详情行情、工具栏与页面业务底部区正常显示，控制台无错误。
- 推送状态：计划仅暂存本事项相关文件和混合文件中的对应 hunks，以 fast-forward 方式推送到两个仓库的 `origin/main`，禁止 force push；工作区其余未提交开发内容保持原状。
- Workflow 状态：React SDK 功能提交将正常触发 Release workflow 完成 npm patch 发布；发布成功并确认官方 npm registry 版本后，模板仅 bump 本次 React SDK 版本并刷新 lockfile，再触发 Vercel production deploy。最终纯报告提交使用 `[skip ci]`，避免重复发布或部署。

## 2026-09-01：禁用 K 线 Account Manager 并发布生产环境（提交后）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`。
- React SDK 提交与发布：功能提交 `54c06d84f` — `fix(tradingview): support consumer feature overrides` 已 fast-forward 推送；GitHub Actions Release run `33519589575`、job `99895170035` 成功，用时 5 分 50 秒；workflow release commit `edeb9a8a4` 已同步，本地与远端一致。
- npm 发布结果：本次 workspace patch release 的 24 个公共包均发布成功并通过官方 npm registry 查询；`@liberfi.io/ui-tradingview` 由 `0.1.232` 升级到 `0.1.233`，包含消费者 feature 配置透传、禁用优先级处理、`TradingAccountManager` 枚举及回归测试。
- 模板提交：功能提交 `4fee2f8` — `fix(chart): disable unused account manager [skip ci]`，依赖提交 `0363678` — `chore(deps): bump react sdk packages`；Perpetuals 与 Token 详情 K 线均显式禁用 Account Manager，同时保留各自页面底部的持仓、订单、成交和活动等业务区域。
- 依赖结果：模板实际使用的 24 个 `@liberfi.io/*` 直接依赖已统一升级到本次 Release 版本并刷新 `pnpm-lock.yaml`；`@chainstream-io/sdk` manifest 与 lockfile 均继续保持 `2.1.14`，本轮未升级 ChainStream。
- 验证结果：React SDK 7/7 个测试套件共 25/25 项、类型检查、ESLint 和推送前全量构建 24/24 个任务通过；模板 37/37 个 Jest 套件共 181/181 项、14 项构建配置契约、TypeScript、全量 ESLint、依赖版本扫描与 `git diff --check` 全部通过。隔离 worktree 使用正式 npm 依赖的 production build 成功生成 23/23 个页面；本地浏览器确认两处 TradingView iframe 内 Account Manager 数量均为 0，控制台无错误。
- 部署结果：GitHub Actions Deploy to Vercel run `33521349687`、job `99901122434` 成功，用时 5 分 33 秒；Build、Deploy 与成功通知步骤全部通过，生产地址为 `https://liberfi-bzybxbmal-sgt-lab.vercel.app`。
- 线上检查：生产地址返回 Vercel SSO 的 HTTP 302 跳转，确认部署入口已生效但受项目访问保护，未在未授权会话中继续页面级检查。
- 推送状态：React SDK 功能与 release commit、模板功能与依赖提交均已 fast-forward 推送至各自 `origin/main`，未使用 force push；工作区其余未提交的 K 线工具栏与行情切换开发内容保持原状，未进入本次发布。
- Workflow 说明：React SDK Release 与模板 Vercel Deploy 均成功；两个 workflow 仅有 GitHub Actions Node.js 20 runtime 弃用提示，不影响发布与部署。模板功能提交使用 `[skip ci]` 避免依赖升级前重复部署，本条最终纯文档提交同样使用 `[skip ci]`。

## 2026-09-01：统一全站时间国际化并发布生产环境（提交前）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`；两个仓库修改前均与各自 `origin/main` 无分叉，模板继续通过本地源码别名联调同级 `react-sdk`。
- 拟用提交标题：React SDK 使用 `fix(i18n): localize relative and duration times`；模板在 npm 发布完成后使用 `fix(i18n): consume localized time formatting` 与对应 SDK 依赖升级提交。
- 问题背景：多个页面将相对时间和周期直接拼接为 `just now`、`1s`、`1m`、`1h` 等英文缩写，切换中文后活动列表、K 线周期、预测倒计时和统计标签仍显示英文；旧版 `zh` 语言标识传给 `Intl` 时还会默认生成简体文本，与项目繁体中文语义不一致。
- 完成事项：在 `@liberfi.io/i18n` 建立统一的本地化时间格式器，覆盖刚刚、秒、分钟、小时、天、月、年和固定周期；将 Token、Portfolio、Prediction、Perpetuals、Channels、Media Track、TradingView 及模板自有列表、详情、排行榜、世界杯和交易反馈中的可见时间统一迁移；补齐全部语言资源，并将旧版 `zh` 显式归一为 `zh-Hant`。
- 影响范围：时间文案与周期标签的展示层，不改变行情接口所需的 `1m/1h` 协议值、时间筛选语义、排序逻辑或业务请求；本地尚未提交的 K 线工具栏、行情切换和数据源扩展改动继续排除在本轮提交与发布之外。
- 验证结果：React SDK 受影响的 8 个包共 16 项 TypeScript/ESLint 任务通过，i18n 19/19、ui-predict 37/37、ui-tokens 64/64、ui-portfolio 18/18、ui-tradingview 30/30 项测试通过；模板 37/37 个 Jest 套件共 181/181 项、14 项配置契约、TypeScript、ESLint 与 `git diff --check` 全部通过。本地繁体页面确认显示 `1秒 / 1分鐘 / 1小時 / 1天 / 24小時 交易量`，不再出现 `just now`、简体时间单位或裸 `24h` 标签。
- 推送状态：计划先将 React SDK 时间国际化提交 fast-forward 推送，等待 npm patch release 完成，再在模板升级正式 npm 版本并 fast-forward 推送；禁止 force push。
- Workflow 状态：本轮按用户要求正常触发 React SDK Release workflow 和模板 Vercel production deploy；发布与部署结果将在 workflow 完成后追加记录。

## 2026-09-01：统一全站时间国际化并发布 React SDK（提交后）

- 仓库与分支：`react-sdk/main`；功能提交和自动 release commit 均已进入远端主分支。
- 提交：`e54b6f2d4` — `fix(i18n): localize relative and duration times`；release commit 为 `06cdc2cad` — `chore: release packages`。
- 完成事项：统一的本地化时间格式器、14 套语言资源和 Token、Portfolio、Prediction、Perpetuals、Channels、Media Track、TradingView 等模块迁移均已发布；英文环境使用本地化短单位，简体与繁体中文分别显示对应的秒、分钟、小时、天、月、年及“刚刚/剛剛”。
- 影响范围：React SDK 的时间展示公共能力和相关 UI 包；协议参数与内部 resolution 枚举仍保持原始 `1m/1h` 等值。未提交的 K 线工具栏、行情切换和数据源开发内容未进入提交、CI checkout 或 npm 包。
- 验证结果：推送前 React SDK 全量 build 24/24 个任务通过；Release workflow run `33525680094`、job `99915781789` 成功，用时 5 分 43 秒；24 个公共包的新版本端点均已通过官方 npm registry 验证。
- 推送状态：功能提交和 release commit 已 fast-forward 同步到 `react-sdk/origin/main`，本地与远端无分叉，未使用 force push。
- Workflow 状态：React SDK Release 已成功；仅有 GitHub Actions Node.js 20 runtime 弃用提示，不影响构建和发布。

## 2026-09-01：模板接入本地化时间与新版 React SDK（提交前）

- 仓库与分支：`dex-nextjs-template/main`；提交前与 `origin/main` 无分叉。
- 拟用提交标题：功能提交使用 `fix(i18n): consume localized time formatting [skip ci]`；依赖提交使用 `chore(deps): bump react sdk packages`。
- 完成事项：模板自有的资产活动、Token 详情、排行榜、世界杯动态和撤单反馈已统一使用 SDK 时间格式器；24 个 `@liberfi.io/*` 直接依赖已更新到本次 patch release 并刷新 `pnpm-lock.yaml`，`@chainstream-io/sdk` 保持 `2.1.14`。
- 影响范围：模板可见时间文案、React SDK 依赖声明与锁文件；不修改行情接口、排序、业务时间范围或 ChainStream SDK。
- 验证结果：正式 npm 依赖安装完成；模板 37/37 个 Jest 套件共 181/181 项、14 项配置契约、TypeScript、ESLint 与 `git diff --check` 全部通过。本地开发服务已在 3000 端口重启，日志确认全部 `@liberfi.io/*` 继续 source alias 到同级 `react-sdk`；繁体 Token 详情页确认无 `just now`、简体单位或裸 `24h` 标签。
- 推送状态：计划先以 `[skip ci]` 推送模板功能提交，再由依赖提交触发一次 Vercel production deploy；禁止 force push。
- Workflow 状态：功能提交跳过 workflow，依赖提交正常触发目标 Vercel 部署，结果将在部署完成后追加。

## 2026-09-01：模板接入本地化时间格式器（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`0053bdf` — `fix(i18n): consume localized time formatting [skip ci]`。
- 完成事项：模板资产、Token 详情、排行榜、世界杯和交易反馈中的相对时间、周期及倒计时均已切换到 React SDK 统一格式器，Token 详情的 24 小时成交量标签也不再直接拼接英文缩写。
- 影响范围：仅模板展示层和测试 mock；未包含依赖版本、锁文件以及本地保留的 K 线数据源开发改动。
- 验证结果：模板全量测试、TypeScript、ESLint、格式检查和本地繁体页面验证均通过。
- 推送状态：提交将在依赖升级提交完成后一起 fast-forward 推送至 `origin/main`，禁止 force push。
- Workflow 状态：提交包含 `[skip ci]`，不会在正式 npm 依赖就位前提前触发 Vercel 部署。

## 2026-09-01：升级 React SDK 正式 npm 依赖并部署（提交前）

- 仓库与分支：`dex-nextjs-template/main`。
- 拟用提交标题：`chore(deps): bump react sdk packages`。
- 问题背景：模板功能代码依赖新发布的 `useLocalizedTimeFormatter` 导出，需要将生产构建从上一批 React SDK 版本升级到本次 npm patch release。
- 完成事项：更新 `apps/web/package.json` 中全部 24 个 `@liberfi.io/*` 依赖并刷新 `pnpm-lock.yaml`；核心版本包括 `@liberfi.io/i18n@0.1.278`、`@liberfi.io/ui-predict@4.0.79`、`@liberfi.io/ui-tokens@3.0.81`、`@liberfi.io/ui-tradingview@0.1.234`，`@chainstream-io/sdk` 继续保持 `2.1.14`。
- 影响范围：生产环境依赖解析与 Vercel 构建输入；不增加业务代码改动。
- 验证结果：官方 npm registry 已确认 24 个目标版本全部可下载；正式依赖安装完成，模板 37/37 个 Jest 套件共 181/181 项、14 项配置契约、TypeScript、ESLint 和 `git diff --check` 全部通过。
- 推送状态：计划 fast-forward 推送到 `origin/main` 并等待目标部署完成，禁止 force push。
- Workflow 状态：本提交不带 `[skip ci]`，将正常触发 `Deploy to Vercel` production workflow。

## 2026-09-01：统一全站时间国际化并发布生产环境（提交后）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`。
- React SDK 提交与发布：功能提交 `e54b6f2d4` — `fix(i18n): localize relative and duration times` 已 fast-forward 推送；Release run `33525680094`、job `99915781789` 成功，用时 5 分 43 秒；release commit `06cdc2cad` 已同步，本地与远端无分叉。
- npm 发布结果：24 个公共包均完成 patch 发布并通过官方 npm registry 端点验证；核心版本为 `@liberfi.io/i18n@0.1.278`、`@liberfi.io/react@0.3.95`、`@liberfi.io/ui-perpetuals@1.1.78`、`@liberfi.io/ui-portfolio@3.0.80`、`@liberfi.io/ui-predict@4.0.79`、`@liberfi.io/ui-tokens@3.0.81` 和 `@liberfi.io/ui-tradingview@0.1.234`。
- 模板提交：功能提交 `0053bdf` — `fix(i18n): consume localized time formatting [skip ci]`；依赖提交 `6161ef2` — `chore(deps): bump react sdk packages`。24 个 `@liberfi.io/*` 直接依赖及锁文件已统一更新，`@chainstream-io/sdk` 保持 `2.1.14`。
- 完成事项：全站相对时间、周期、倒计时和统计窗口统一按当前语言渲染；中文环境的 `just now`、`1s`、`1m`、`1h` 等遗留已替换为“刚刚/剛剛”、秒、分钟/分鐘、小时/小時等对应文本，繁体兼容语言标识不会再被 `Intl` 误判为简体。
- 验证结果：React SDK 相关测试、类型检查、ESLint及全量 build 24/24 个任务通过；模板 37/37 个 Jest 套件共 181/181 项、14 项配置契约、TypeScript、ESLint 与格式检查通过。本地源码联调页面确认 `1秒 / 1分鐘 / 1小時 / 1天 / 24小時 交易量` 正确显示。
- 部署结果：Vercel production run `33527012766`、job `99920322114` 成功，用时 6 分 32 秒；Build、Deploy 与成功通知步骤全部通过，生产地址为 `https://liberfi-bwemz4ma4-sgt-lab.vercel.app`。
- 线上检查：生产地址返回 Vercel SSO 的 HTTP 302 跳转，确认部署入口已生效但受项目访问保护，未在未授权会话中继续页面级检查。
- 推送状态：两个仓库的本轮功能、release 与依赖提交均已 fast-forward 推送，未使用 force push；本地 K 线工具栏、行情切换和数据源开发改动继续保留，未混入本轮提交或发布。
- Workflow 说明：React SDK Release 与模板 Vercel Deploy 均成功；两个 workflow 仅有 GitHub Actions Node.js 20 runtime 弃用提示，不影响发布与部署。最终纯文档提交使用 `[skip ci]`，避免再次触发部署。

## 2026-09-02：修复 Token 详情页偶发蓝色焦点边框（提交前）

- 仓库与分支：`dex-nextjs-template/main`；提交前本地分支与 `origin/main` 无分叉，本地开发服务继续通过源码别名联调同级 `react-sdk`。
- 拟用提交标题：`fix(token): suppress page scroll focus outline [skip ci]`。
- 问题背景：从发现或 Pulse 列表进入 Token 详情页时，Chrome 偶尔会将焦点恢复到页面级滚动容器，并绘制覆盖详情内容边界的蓝色原生 outline；点击空白区域后焦点转移，边框才会消失，造成页面存在异常选中框的视觉误解。
- 完成事项：为 Token 详情页的非交互式页面滚动容器增加仅在获得焦点时生效的 outline 抑制样式，并补充回归测试；按钮、链接、输入框等真实交互控件的主题键盘焦点提示保持不变。
- 影响范围：仅影响桌面及平板 Token 详情页最外层滚动容器的浏览器原生焦点外观，不改变页面滚动、分栏拖拽、TradingView、交易表单、路由焦点恢复或键盘导航行为；不涉及 `react-sdk`。
- 验证结果：本地浏览器通过“发现列表 → Token 详情”路径稳定复现并验证修复，焦点仍落在相同滚动容器但计算样式由 `outline-style: auto` 变为 `none`；键盘导航链接仍显示主题色 2px 焦点环。Web 38/38 个测试套件共 185/185 项、TypeScript 类型检查和定向 ESLint 全部通过。
- 推送状态：计划仅暂存本事项的两个代码/测试文件及本条工作记录，fast-forward 推送至 `origin/main`；本地其余 K 线数据源、价格格式化与工具栏相关开发改动保持未暂存，不进入本次提交。
- Workflow 状态：功能提交与后续纯报告提交均使用 `[skip ci]`，跳过 GitHub Actions，不触发 Vercel 部署或其他 workflow。

## 2026-09-02：修复 Token 详情页偶发蓝色焦点边框（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`87902bc` — `fix(token): suppress page scroll focus outline [skip ci]`。
- 完成事项：Token 详情页页面级滚动容器在客户端路由进入后即使被 Chrome 自动聚焦，也不再显示覆盖整个内容区的蓝色原生 outline；真实交互控件继续保留主题键盘焦点提示，并已增加防止样式回退的回归测试。
- 影响范围：桌面及平板 Token 详情页的滚动容器焦点外观；页面布局、滚动、K 线、交易、数据请求和 React SDK 均未改变。本地其余 K 线数据源及价格格式化开发内容未进入提交。
- 验证结果：本地浏览器原路径复测确认容器仍为实际焦点目标且 `outline-style: none`，导航链接键盘焦点环仍为主题色 2px；Web 38/38 个测试套件共 185/185 项、TypeScript 类型检查和定向 ESLint 全部通过。
- 推送状态：提交已 fast-forward 推送至 `origin/main`，远端主分支指向 `87902bc80defca94dc833031db6f19e7acb1bb29`，未使用 force push。
- Workflow 状态：提交包含 `[skip ci]`；按该 commit 查询 GitHub Actions run 为空，未触发 Vercel 部署或其他 workflow。

## 2026-09-02：精简底部 Twitter 追踪面板顶部控件（提交前）

- 仓库与分支：`dex-nextjs-template/main`；本地分支与 `origin/main` 一致，本地开发服务继续联调同级 `react-sdk` 源码。
- 拟用提交标题：`fix(media-track): simplify bottom Twitter panel controls [skip ci]`。
- 问题背景：从底部工具栏打开 Twitter 追踪抽屉后，面板顶部重复展示钱包胶囊和 Preset 切换，占用有限的抽屉空间并分散用户对推文内容的注意力。
- 完成事项：仅从可拖拽的底部 Twitter 抽屉中移除钱包胶囊与 Preset 切换及其无用依赖；保留原有固定高度顶部区域、悬停暂停状态与暂停图标反馈，避免内容位移或既有交互退化；新增组件渲染回归测试。
- 影响范围：只影响 `BottomTweets` 抽屉；独立 `/media-track` 页面、常驻底部工具栏的钱包和 Preset 入口、推文列表、Launchpad 操作及 React SDK 均不改变。
- 验证结果：本地浏览器确认抽屉内没有钱包或 Preset 文案，悬停后暂停图标正常出现且首条推文纵向位置保持不变；Web 39/39 个测试套件共 186/186 项、14 项构建配置契约、TypeScript 类型检查、定向 ESLint 与代码审查全部通过。
- 推送状态：计划仅暂存本事项的组件、测试和工作记录并形成本地提交；本地其余 K 线数据源与价格格式化改动保持未暂存。本轮未获推送授权，不推送远端。
- Workflow 状态：本地提交使用 `[skip ci]`；由于不推送，不会触发 GitHub Actions、Vercel 部署或其他远端 workflow。

## 2026-09-02：精简底部 Twitter 追踪面板顶部控件（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`8f440bd` — `fix(media-track): simplify bottom Twitter panel controls [skip ci]`。
- 完成事项：底部 Twitter 追踪抽屉已隐藏钱包胶囊和 Preset 切换，释放顶部信息区域；固定高度顶部容器与悬停暂停提示继续保留，推文内容不会因暂停状态变化发生跳动。
- 影响范围：仅底部可拖拽 Twitter 面板；独立追踪页面和底部工具栏原有入口不受影响，未涉及 React SDK。
- 验证结果：组件渲染测试覆盖推文内容、目标控件隐藏及暂停反馈；Web 39/39 个测试套件共 186/186 项、14 项配置契约、TypeScript、ESLint、本地浏览器交互验证和双轴代码审查均通过，审查无剩余发现。
- 推送状态：功能提交已在本地 `main` 创建，尚未推送；其余本地 K 线开发内容未混入提交。
- Workflow 状态：提交包含 `[skip ci]` 且未推送，因此未触发 GitHub Actions 或部署。

## 2026-09-02：精简底部 Twitter 追踪面板顶部控件（推送后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：功能提交 `8f440bd` — `fix(media-track): simplify bottom Twitter panel controls [skip ci]`；提交后工作记录 `ab47204` — `docs: record bottom Twitter panel cleanup [skip ci]`。
- 完成事项：底部 Twitter 追踪抽屉已隐藏钱包胶囊和 Preset 切换，同时保留固定高度顶部区域、悬停暂停状态及暂停图标反馈；独立追踪页面与常驻底部工具栏保持原状。
- 影响范围：仅底部可拖拽 Twitter 面板及其回归测试和工作记录，不涉及 React SDK、行情数据、钱包逻辑或部署配置。
- 验证结果：Web 39/39 个测试套件共 186/186 项、14 项配置契约、TypeScript、ESLint、本地浏览器验证和双轴代码审查全部通过；悬停前后首条推文位置保持一致。
- 推送状态：功能与工作记录提交均已 fast-forward 推送至 `origin/main`，远端主分支指向 `ab472048fbbd1d005c6060417d4b063464548441`，未使用 force push；本地其余 K 线开发内容未进入提交。
- Workflow 状态：两个已推送提交均包含 `[skip ci]`，按 commit 查询 GitHub Actions run 均为空，未触发 Vercel 部署或其他 workflow；本条纯报告提交同样使用 `[skip ci]`。

## 2026-09-02：消除 Twitter 追踪面板顶部留白并优化暂停提示（提交前）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`；提交前两个本地分支均与各自 `origin/main` 无分叉。
- 拟用提交标题：React SDK 使用 `fix(scaffold): support accessible custom panel titles [skip ci]`；模板使用 `fix(media-track): move pause state into panel title [skip ci]`。
- 问题背景：底部 Twitter 追踪面板隐藏钱包胶囊与 Preset 后仍保留固定高度的顶部容器，形成明显空白；暂停提示继续占据内容区，导致面板空间利用和视觉层级不合理。
- 完成事项：移除内容区固定顶部占位，将推文悬停暂停状态提升到面板容器并在标题旁显示暂停图标；关闭面板时重置暂停状态；为 React SDK 可拖拽面板内容补充自定义标题对应的 `ariaLabel` 类型能力，避免标题改为 React 节点后丢失对话框无障碍名称；新增布局与状态回归测试。
- 影响范围：底部 Twitter 追踪面板、可拖拽面板标题类型及相关测试；钱包胶囊与 Preset 继续保持隐藏，独立追踪页面、行情数据、交易逻辑和部署配置不受影响。
- 验证结果：本地浏览器确认首条推文纵向位置由 `y=115` 上移至 `y=57`，悬停后暂停图标仅出现在标题且列表不位移；模板 Web 39/39 个测试套件共 186/186 项、14 项配置契约、TypeScript、ESLint 与格式检查通过；React SDK `ui-scaffold` 14/14 个测试套件共 35/35 项、TypeScript、Lint 与格式检查通过。
- 推送状态：计划仅精确暂存本事项涉及的 React SDK 类型文件、模板组件、布局、回归测试及本条工作记录，分别 fast-forward 推送至对应 `origin/main`；两仓库其余本地 K 线开发改动保持未暂存。
- Workflow 状态：所有提交均使用 `[skip ci]`，跳过 GitHub Actions，不触发 Vercel 部署、npm 发布或其他远端 workflow。

## 2026-09-02：消除 Twitter 追踪面板顶部留白并优化暂停提示（提交后）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`。
- 提交：React SDK `4b010e915` — `fix(scaffold): support accessible custom panel titles [skip ci]`；模板 `01fbf24` — `fix(media-track): move pause state into panel title [skip ci]`。
- 完成事项：删除 Twitter 追踪面板内容区顶部的固定占位，将暂停反馈移动到面板标题旁，并在面板关闭时清理暂停状态；可拖拽面板在使用 React 节点标题时可显式传入无障碍名称，避免对话框标题语义退化。
- 影响范围：底部 Twitter 追踪面板、React SDK `ui-scaffold` 的可拖拽内容类型、回归测试及工作记录；两仓库其他本地 K 线开发改动未进入提交。
- 验证结果：浏览器验证确认内容顶部空白消失、暂停图标仅在标题中显示且不引起列表位移；模板 39/39 个测试套件共 186/186 项、配置契约、TypeScript 与 ESLint 通过；React SDK `ui-scaffold` 14/14 个测试套件共 35/35 项、TypeScript 与 Lint 通过，推送钩子执行的全仓 build 24/24 个任务成功。
- 推送状态：两个功能提交均已 fast-forward 推送到各自 `origin/main`，本地与远端对应提交一致，未使用 force push；未发布 npm，未更新模板依赖版本，未部署 Vercel。
- Workflow 状态：两个功能提交均包含 `[skip ci]`，按提交查询 GitHub Actions run 均为空，未触发部署、npm 发布或其他 GitHub workflow；本条纯文档提交同样使用 `[skip ci]`。

## 2026-09-02：修复 Twitter 实时订阅遇到未知链时持续报错（提交前）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`；提交前两个本地分支均与各自 `origin/main` 无分叉。
- 拟用提交标题：React SDK 使用 `fix(media-track): tolerate unsupported token chains [skip ci]`；模板使用 `docs: record media track chain fallback [skip ci]`。
- 问题背景：Twitter 实时订阅数据可能在可选 token 元数据的链字段中返回 `robinhood` 等非链来源标识；旧转换逻辑将其视为致命异常，导致整条推文被丢弃，并由每次订阅回调持续输出 `Unsupported chain` 错误。
- 完成事项：在订阅消息转换边界对未知链进行容错，只忽略无法识别的 token 增强信息并继续保留推文内容；公开的严格 token 转换函数继续抛出未知链错误，保持既有 API 类型和调用语义；新增 `robinhood` 回归用例及严格转换行为测试。
- 影响范围：React SDK `ui-media-track` 的实时推文 DTO 转换与测试，以及当前项目工作记录；不改变已支持链映射、推文正文、翻译、Launchpad、行情数据或部署配置。
- 验证结果：故障测试先稳定复现 `Unsupported chain: robinhood`，修复后 `ui-media-track` 2/2 个测试套件共 7/7 项、TypeScript 与 ESLint 全部通过；本地源码联调打开 Twitter 面板并持续观察 20 秒，面板正常显示且控制台 error 为 0。
- 推送状态：计划仅精确暂存本事项涉及的两个 React SDK 文件及本条工作记录，分别 fast-forward 推送至对应 `origin/main`；两仓库其余本地 K 线开发内容保持未暂存。
- Workflow 状态：所有提交均使用 `[skip ci]`，跳过 GitHub Actions，不触发 Vercel 部署、npm 发布或其他远端 workflow。

## 2026-09-02：修复 Twitter 实时订阅遇到未知链时持续报错（提交后）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`。
- 提交：React SDK `28be552f7` — `fix(media-track): tolerate unsupported token chains [skip ci]`；模板工作记录提交使用 `docs: record media track chain fallback [skip ci]`。
- 完成事项：Twitter 实时订阅在收到 `robinhood` 等未知链标识时不再丢弃整条推文或持续输出异常，只忽略不可用的 token 卡片数据；直接调用严格 token 转换 API 时仍会明确抛错，兼顾页面可用性与底层数据校验能力。
- 影响范围：React SDK `ui-media-track` 的订阅消息转换、回归测试及当前项目工作记录；其他本地 K 线、行情和工具栏开发改动未进入提交。
- 验证结果：`ui-media-track` 2/2 个测试套件共 7/7 项、TypeScript、ESLint 和格式检查通过；本地 Twitter 面板持续观察 20 秒无控制台 error；React SDK 推送钩子执行的全仓 build 24/24 个任务成功。
- 推送状态：React SDK 功能提交已 fast-forward 推送至 `origin/main`，本地与远端均指向 `28be552f74868caade2c69746da4dfd1a1a521d6`，未使用 force push；未发布 npm、未更新模板 SDK 版本、未部署 Vercel。
- Workflow 状态：React SDK 功能提交包含 `[skip ci]`，按提交查询 GitHub Actions run 为空；工作记录提交同样使用 `[skip ci]`，不触发 GitHub workflow 或部署。

## 2026-09-02：发布最新 React SDK 并部署模板生产环境（发布前）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`；发布前两个本地分支均与各自 `origin/main` 无分叉，相关功能基线包含 Twitter 未知链容错、可拖拽面板无障碍标题支持及最新 K 线多图表标题修复。
- 拟用提交标题：React SDK 使用空提交 `chore(release): publish latest sdk packages` 触发 Release；模板使用 `chore(deps): bump react sdk packages` 触发生产部署；发布完成后另以 `[skip ci]` 文档提交记录结果。
- 问题背景：已推送的 React SDK 功能提交均使用 `[skip ci]`，尚未发布到 npm；模板生产依赖仍指向上一批 `@liberfi.io/*` 版本，线上无法获得本轮 Twitter 容错、面板标题与 K 线修复。
- 完成事项：计划通过 React SDK `Release` workflow 对全部公共包执行统一 patch 发布；使用官方 npm registry 核验版本；扫描模板全部 workspace 的 dependencies、devDependencies 与 peerDependencies，将实际引用的 `@liberfi.io/*` 包统一升级并刷新 `pnpm-lock.yaml`；`@chainstream-io/sdk` 保持 `2.1.14` 不变；完成 production build 后推送并等待 `Deploy to Vercel` workflow。
- 影响范围：React SDK 公共 npm 包版本、模板生产依赖解析、锁文件和 Vercel 生产部署；不将两仓库当前未提交的 K 线开发内容混入发布提交。
- 验证结果：发布前已确认 React SDK 25 个公共包的本地版本与官方 npm registry 一致，其中 `@liberfi.io/ui-media-track@0.1.276`、`@liberfi.io/ui-scaffold@2.0.80`、`@liberfi.io/ui-tradingview@0.1.234`；Twitter 修复相关测试、类型检查、ESLint、本地订阅联调以及 React SDK 全仓 build 均已通过。
- 推送状态：计划仅推送发布触发提交、SDK 自动 release commit、模板依赖升级提交与最终工作记录；禁止 force push。
- Workflow 状态：React SDK 发布触发提交与模板依赖升级提交不使用 `[skip ci]`，分别用于触发 npm Release 与 Vercel production deployment；最终纯文档提交使用 `[skip ci]`，避免重复部署。

## 2026-09-02：恢复 K 线多窗口标题信息与主题层级（提交前）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`；提交前两个本地分支均与各自 `origin/main` 无分叉，本地其他 K 线工具栏、数据源及价格格式化开发改动继续保留且不纳入本次暂存。
- 拟用提交标题：React SDK 使用 `fix(tradingview): restore multi-chart pane headers [skip ci]`；模板使用 `docs: record multi-chart pane header fix [skip ci]`。
- 问题背景：K 线开启多窗口后，各窗口标题栏实际渲染了 token 信息，但错误地使用 TradingView 背景色变量作为文字前景色，形成黑底黑字，只剩 interval 可见并被不可见文本挤到近似居中位置；同时单个 symbol 解析结果没有写入同步缓存，标题只能退化为合约地址。
- 计划完成事项：在 TradingView iframe 内恢复每个图表区域的 token/报价币与 interval 标题；使用主题主文字色和次文字色建立信息层级；缓存单个 symbol 解析结果并复用并发请求；保留首个当前 token 图表不可关闭、其他图表可关闭的约束；补充标题渲染、关闭策略和 symbol 缓存回归测试。
- 影响范围：`@liberfi.io/ui-tradingview` 的多窗口标题注入、窗口关闭交互、symbol 解析缓存及相关测试；单窗口页面、K 线数据、交易逻辑、模板依赖版本与 Vercel 配置不受影响。
- 验证计划：运行 `@liberfi.io/ui-tradingview` 全量 Jest、TypeScript 类型检查、Prettier 与 `git diff --check`；在模板本地 Token 详情页实际创建双窗口，校验两个标题可见且左对齐、主次文字色不同、首窗口无关闭按钮、次窗口可关闭。
- 预期推送状态：只精确暂存本事项涉及的 React SDK 组件、resolver 与测试，以及本工作记录；分别 fast-forward 推送至对应 `origin/main`，禁止 force push。
- Workflow 策略：所有提交标题包含 `[skip ci]`，跳过 GitHub Actions，不触发 npm Release、Vercel 部署或其他 workflow。

## 2026-09-02：恢复 K 线多窗口标题信息与主题层级（提交后）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`。
- React SDK 提交：`a110b79b1` — `fix(tradingview): restore multi-chart pane headers [skip ci]`。
- 最终完成事项：多窗口标题栏恢复显示每个图表的 token/报价币及 interval，并统一为左对齐；token 标题使用主题主文字色，interval 与关闭按钮使用主题次文字色；单个 symbol 解析结果会写入缓存并复用并发请求，避免标题退化为合约地址；首个当前 token 图表继续禁止关闭，次级图表保留关闭入口。
- 影响范围：`@liberfi.io/ui-tradingview` 的多窗口区域标题、关闭交互、symbol resolver 缓存与回归测试；其他未提交的 K 线工具栏、行情数据源、价格格式化和模板业务代码未进入本次功能提交。
- 验证结果：`@liberfi.io/ui-tradingview` 14/14 个测试套件共 50/50 项通过，TypeScript、Prettier 与 `git diff --check` 通过；真实 Token 详情页双窗口验证显示 `BRAINFART / USD  1m` 与 `USDC / USD  1m` 均可见且位于左侧，标题为白色、interval 为灰色，首窗口无关闭按钮、次窗口有关闭按钮；推送钩子执行的全仓 build 24/24 个任务成功。
- 推送状态：React SDK 提交已 fast-forward 推送至 `origin/main`，本地与远端均指向 `a110b79b1961868b6a427333756b1dfb2bdbdf1b`，未使用 force push；工作记录将通过独立 `[skip ci]` 文档提交同步至模板仓库。
- Workflow 结果：React SDK 提交包含 `[skip ci]`，按该 commit 查询 GitHub Actions run 为空，未触发 npm Release、Vercel 部署或其他 GitHub workflow；工作记录提交同样使用 `[skip ci]`。

## 2026-09-02：发布最新 React SDK 并部署模板生产环境（发布后）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`。
- 提交：React SDK 发布触发提交 `da8299f15` — `chore(release): publish latest sdk packages`，Release 自动版本提交 `c5face5e2` — `chore: release packages`；模板依赖升级提交 `cbbd490` — `chore(deps): bump react sdk packages`；本条记录拟使用 `docs: record sdk release and production deploy [skip ci]` 单独提交。
- 问题背景：Twitter 未知链容错、底部面板标题能力及 K 线多窗口标题修复已进入 React SDK 主分支，但此前提交均跳过 workflow，npm 与模板线上依赖尚未包含这些改动。
- 完成事项：React SDK 25 个公共包统一完成 patch 发布，其中 `@liberfi.io/client@0.3.96`、`@liberfi.io/react@0.3.96`、`@liberfi.io/ui@0.3.82`、`@liberfi.io/ui-media-track@0.1.277`、`@liberfi.io/ui-scaffold@2.0.81`、`@liberfi.io/ui-tradingview@0.1.235`、`@liberfi.io/ui-perpetuals@1.1.79`、`@liberfi.io/ui-predict@4.0.80`；模板全部 24 个直接引用的 `@liberfi.io/*` 依赖已同步到对应新版本并刷新锁文件，`@chainstream-io/sdk` 明确保留 `2.1.14` 不变；模板已完成 Vercel 生产部署并将 `https://app.liberfi.io` 更新到本次产物。
- 影响范围：React SDK npm 公共包、模板生产依赖与锁文件、Vercel 线上版本；两仓库中尚未提交的 K 线数据源、工具栏及价格格式化开发内容均保持原状，未进入发布提交。
- 验证结果：React SDK 推送钩子全仓构建 24/24 个任务通过，Release workflow 成功且 25 个精确版本及关键 tarball 均经官方 npm registry 验证可用；模板依赖比对 24/24 匹配，Web 38/38 个测试套件共 181/181 项、14 项配置契约、TypeScript 类型检查与生产构建全部通过；Vercel workflow 构建和部署成功，生产域名 `https://app.liberfi.io` 实测返回 HTTP 200，独立部署域名 `https://liberfi-93x5j153n-sgt-lab.vercel.app` 已就绪且受 Vercel SSO 保护。
- 推送状态：React SDK 发布提交与模板依赖提交均已 fast-forward 推送到各自 `origin/main`，未使用 force push；React SDK 本地与远端指向 `c5face5e2`，模板依赖发布时本地与远端指向 `cbbd490`；本条纯工作记录将独立推送。
- Workflow 状态：React SDK `Release` run `33547156063` 成功完成并发布 npm；模板 `Deploy to Vercel` run `33548918173`、job `99993232190` 于 6 分 12 秒内成功完成，生产别名已切换；本条报告提交包含 `[skip ci]`，避免再次触发发布或部署。

## 2026-09-02：发布 K 线工具栏完整恢复并部署生产环境（发布前）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`；两仓库均基于最新远端发布基线，当前版本包括 `@liberfi.io/client@0.3.96`、`@liberfi.io/react@0.3.96`、`@liberfi.io/types@0.4.82`、`@liberfi.io/i18n@0.1.279` 与 `@liberfi.io/ui-tradingview@0.1.235`。
- 拟用提交标题：React SDK 使用 `feat(tradingview): restore token chart toolbar` 并通过推送 `main` 触发 npm Release；模板使用 `feat(tradingview): enable restored token chart toolbar`，同时升级本次发布的全部 `@liberfi.io/*` 依赖并触发 Vercel production deployment；发布完成后以 `[skip ci]` 文档提交记录结果。
- 问题背景：Token 详情页重构后原 K 线工具栏交互缺失或不完整，多图表、图表类型、指标、价格/市值、USD/原生币、快照、设置与全屏功能未形成完整闭环；多窗口 interval、图表类型和计价模式需要统一同步，市值与原生币模式还依赖 REST/WebSocket 蜡烛计价参数与 OHLC 格式化支持。
- 计划完成事项：恢复工具栏全部入口及主题化图标/下拉交互；统一可点击光标、选中态、快照菜单和全屏布局；实现多图表选币并同步 interval、图表类型、价格/市值和 USD/原生币到所有窗口；首窗口保持不可关闭；补齐 native candle REST/WebSocket contract、按供应量计算市值 K 线、OHLC 数值格式化与模板数据适配；补充相应单元、交互和布局测试。
- 影响范围：React SDK 的 types、client、react hooks、i18n 与 ui-tradingview；模板 Token 详情页 TradingChart、客户端数据源、价格格式化器、依赖版本与锁文件；不修改品牌色、涨跌色、交易表单、Auth0、`@chainstream-io/sdk` 或其他页面业务。
- 验证计划：React SDK 受影响包测试、类型检查、ESLint、Prettier、`git diff --check` 与全仓 build；模板 Web 全量 Jest/配置契约、TypeScript、ESLint、生产 build；本地 Token 详情页验证工具栏、双窗口同步、标题/关闭策略、快照、全屏及主题色；发布后通过 GitHub workflow、npm 官方 registry 和 Vercel 生产地址确认结果。
- 预期推送状态：React SDK 功能提交 fast-forward 推送 `origin/main` 并等待自动 release commit；同步本地后将模板 K 线代码、全部新 npm 版本和锁文件一次性 fast-forward 推送 `origin/main`；禁止 force push。
- Workflow 策略：React SDK 功能提交与模板部署提交不带 `[skip ci]`，分别用于触发 `Release` 和 `Deploy to Vercel`；最终纯工作记录提交使用 `[skip ci]`，避免重复发布或部署。

## 2026-09-02：优化资产页代币分布图布局（本地完成，未提交）

- 仓库与分支：`dex-nextjs-template/main`，修改基于本地提交 `ca51c19`；工作区原有 K 线数据源、价格格式化和钱包链状态等未提交开发内容保持不变。
- 拟用提交标题：`fix(portfolio): compact and center token allocation legend [skip ci]`。
- 问题背景：资产页 Token allocation 卡片中的图例列表与单条按钮同时横向拉满，导致代币信息和金额被分隔到卡片两端，视觉关联较弱；环形图与图例也未作为统一组合在卡片内容区居中。
- 完成事项：将环形图与图例改为整体水平、垂直居中的响应式组合，小屏自动上下排列；图例宽度收敛到最大 `260px`，条目改为紧凑的两列网格，在保留名称截断、百分比与金额对齐的同时消除过度留白；同步调整 loading 骨架布局，并新增正式态与 loading 态布局契约测试。
- 影响范围：仅资产页 `PortfolioAllocationChart` 的展示布局、loading 骨架和对应回归测试；不改变持仓查询、分片计算、颜色、金额格式、点击/悬停交互、钱包逻辑或 React SDK。
- 验证结果：定向布局测试 2/2 通过，相关文件 ESLint、Web TypeScript 类型检查与 `git diff --check` 通过；Web 全量 Jest 中本事项测试通过，共 39 个测试套件、188 项测试通过，另有 3 个测试因工作区原有且不属于本事项的钱包链状态/原生币报价开发改动失败。已复用现有 `apps/web` dev server 检查热更新，但服务随后进入 Next.js `webpack-runtime` 模块缓存错误并对请求无响应；遵循本仓库规则未擅自重启现有服务，因此真实持仓页面的最终视觉验收仍需在该服务恢复后补充。
- 推送状态：本事项仅保留为本地未提交修改，未暂存、未提交、未推送；未混入或覆盖工作区其他开发内容。
- Workflow 状态：未推送，未触发 GitHub Actions、Vercel 部署、npm 发布或其他远端 workflow。

## 2026-09-02：发布 K 线工具栏完整恢复并部署生产环境（发布完成）

- 实际提交：React SDK 功能提交 `67e50cb9fb839506c4d068f27ff7648f4f863d1b feat(tradingview): restore token chart toolbar`，自动 release commit `cab7c24a4e8327f0f0af71112563e212f28baa99 chore: release packages`；模板提交 `866143b8ac22a46451c9315b09c523c4cabc49b9 feat(tradingview): enable restored token chart toolbar`。
- 最终完成事项：恢复并跑通 Token 详情页 K 线工具栏、多图表与选币、图表类型、指标、价格/市值、USD/原生币、快照、设置和全屏；统一多窗口 interval、图表类型与计价模式，首窗口保持不可关闭；补齐 native candle REST/WebSocket 参数、市值换算、OHLC 格式化与模板数据适配；模板 24 个 `@liberfi.io/*` 直接依赖全部升级到本次官方 npm latest 并刷新锁文件。
- npm 发布结果：`Release` run `33550633034`、job `99998914003` 成功；官方 registry 已确认 `@liberfi.io/client@0.3.97`、`@liberfi.io/react@0.3.97`、`@liberfi.io/types@0.4.83`、`@liberfi.io/i18n@0.1.280`、`@liberfi.io/ui-tradingview@0.1.236`，模板引用的 24 个 SDK 包均与 `latest` 一致；发布后的 release commit 已 fast-forward 拉取到本地。
- 验证结果：React SDK client 216/216、react 228/228、i18n 77/77、ui-tradingview 50/50 测试通过，types contract、受影响包类型检查、lint、Prettier、whitespace 与全仓 build 24/24 通过；模板 K 线定向测试 8/8、TypeScript、ESLint、Prettier 与 whitespace 通过。模板全量 Jest 的 2 个失败来自未纳入本次提交的钱包链状态/原生币报价并行改动；本地 production build 因既有 `next dev` 与 `next build` 共用 `.next` 缓存发生 chunk 竞争，未重启现有服务，最终以 Vercel 干净环境 Build 成功作为生产构建验收。
- 部署结果：`Deploy to Vercel` run `33552333888`、job `100004552658` 在 6 分 56 秒内成功完成，Build、Deploy 与成功通知全部通过；独立部署地址为 `https://liberfi-lsjz9ersl-sgt-lab.vercel.app`，生产域名 `https://app.liberfi.io` 实测返回 HTTP 200。
- 推送状态：React SDK 功能提交、release commit 与模板功能/依赖提交均已 fast-forward 推送到各自 `origin/main`，未使用 force push；模板工作区的资产页、钱包链和原生币报价等并行修改保持未提交，未混入本次 K 线发布。
- Workflow 说明：React SDK Release 与模板 Vercel Deploy 均成功；仅有 GitHub Actions Node.js 20 runtime 弃用提示，不影响发布与部署。本条最终纯工作记录提交使用 `[skip ci]`，不重复触发 Vercel。

## 2026-09-02：修复多链钱包地址、原生币余额与报价串链（提交前）

- 仓库与分支：`dex-nextjs-template/main`，基于已与 `origin/main` 同步的 `3934f2e`。
- 拟用提交标题：`fix(wallet): scope native balances to current chain [skip ci]`。
- 问题背景：钱包地址解析仅支持 Solana，切换至 EVM 链后可能继续缺少正确地址；原生币余额依赖持仓列表中的原生币行，接口仅返回汇总余额时工具栏和提现弹窗会显示空值；全局 Query placeholder 还会在链切换期间短暂暴露上一条链的数据。
- 完成事项：钱包地址统一通过当前链的 `useConnectedWallet` 获取；原生币余额改用钱包汇总的 `balanceInNative`；SOL 专用报价与底部组件升级为按当前链查询 wrapped native token 的通用实现；提现金额、Half/Max、余额校验和 USD 估值统一复用链级汇总余额与报价；移除全局上一页数据占位并补充链切换数据隔离、钱包地址、余额与报价回归测试。
- 影响范围：底部原生币报价、钱包地址解析、资产汇总原生币余额、提现弹窗及 React Query 默认缓存展示；不改变转账协议、交易提交、资产分布计算、K 线功能或 React SDK。
- 验证结果：Web 42/42 个 Jest 测试套件共 192/192 项、14 项构建配置契约、TypeScript、相关 ESLint 与 whitespace 检查全部通过；本地源码联调已在 Chrome 登录态验证 Solana 资产页能显示正确钱包、原生币余额与 USDC 持仓，冷加载无 hydration 错误。
- 推送状态：计划与资产页分布图修改拆分为独立提交，精确暂存本事项文件后 fast-forward 推送 `origin/main`，禁止 force push。
- Workflow 状态：提交标题包含 `[skip ci]`，用于跳过 GitHub Actions、Vercel 部署及其他由 push 触发的 GitHub workflow。

## 2026-09-02：修复多链钱包地址、原生币余额与报价串链（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`9af75dd` — `fix(wallet): scope native balances to current chain [skip ci]`。
- 问题背景：钱包地址与底部报价仍带有 Solana 专用假设，原生币余额又依赖持仓明细中的原生币行，导致切链后地址、余额、报价和提现 USD 估值可能为空或短暂沿用上一条链的数据。
- 完成事项：钱包地址、原生币余额、底部报价和提现估值均已切换为当前链语义；报价组件与 hook 从 SOL 专用名称升级为通用 primary token 实现；QueryClient 不再全局保留上一 query 数据，链切换期间不会展示旧链钱包结果；对应地址、余额、报价与数据隔离测试已补齐。
- 影响范围：底部工具栏、钱包地址、资产汇总原生币余额、提现弹窗和 Query 默认展示行为；不改变转账提交协议、持仓接口、资产分布计算、K 线或 React SDK。
- 验证结果：Web 42/42 个 Jest 测试套件共 192/192 项、14 项配置契约、TypeScript、相关 ESLint 与 whitespace 全部通过；Chrome 登录态 Solana 资产页显示正确钱包、余额和持仓，冷加载无 hydration 错误。
- 推送状态：功能提交已在本地 `main` 创建，待与资产页布局提交及本工作记录一并 fast-forward 推送，禁止 force push。
- Workflow 状态：提交包含 `[skip ci]`；推送后应跳过 GitHub Actions、Vercel 部署及其他 push workflow。

## 2026-09-02：优化资产页代币分布图布局（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`fb7b656` — `fix(portfolio): compact and center token allocation legend [skip ci]`。
- 问题背景：Token allocation 图例与条目横向拉满，代币信息和金额分隔过远；环形图与图例没有作为统一组合在卡片内容区居中。
- 完成事项：环形图与图例已整体居中，小屏自动上下排列；图例收敛至最大 `260px` 并改用紧凑两列网格对齐金额；loading 骨架同步采用相同布局；新增正式态和 loading 态布局契约测试。
- 影响范围：仅资产页代币分布图展示、loading 骨架和回归测试；持仓查询、分片计算、颜色、金额格式及图表交互保持不变。
- 验证结果：布局测试 2/2 通过，并包含在 Web 42/42 个测试套件、192/192 项全量通过结果中；TypeScript、ESLint、whitespace 通过；清理 `.next` 缓存并重启 dev server 后，Chrome 登录态资产页真实显示 USDC 分布图、钱包卡片和持仓表，刷新及冷加载均无 hydration 错误。
- 推送状态：功能提交已在本地 `main` 创建，待与钱包修复及本工作记录一并 fast-forward 推送，禁止 force push。
- Workflow 状态：提交包含 `[skip ci]`；推送后应跳过 GitHub Actions、Vercel 部署及其他 push workflow。

## 2026-09-02：钱包链状态与资产分布图修复（推送完成）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：钱包修复 `9af75dd` — `fix(wallet): scope native balances to current chain [skip ci]`；资产布局 `fb7b656` — `fix(portfolio): compact and center token allocation legend [skip ci]`；提交后工作记录 `6a1404d` — `docs: record wallet and portfolio fixes [skip ci]`。
- 问题背景：多链切换时钱包地址、原生币余额和报价存在 Solana 专用假设与旧链数据残留风险；资产页代币分布图图例被横向拉满，代币信息与金额间距过大且组合未居中。
- 完成事项：钱包地址、原生币汇总余额、底部报价、提现估值及 Query 数据隔离已统一按当前链处理；资产页环形图与最大 `260px` 的紧凑图例已整体居中，并补齐正式态、loading、链切换、余额和报价回归测试。
- 影响范围：底部工具栏、钱包地址、资产原生币余额、提现弹窗、Query 默认展示及资产分布图布局；不涉及 React SDK 发布、K 线、转账协议或生产部署。
- 验证结果：Web 42/42 个 Jest 测试套件共 192/192 项、14 项构建配置契约、TypeScript、相关 ESLint 与 whitespace 全部通过；Chrome 登录态 Solana 资产页显示正确钱包、余额、USDC 分布图与持仓表，刷新及冷加载均无 hydration 错误。
- 推送状态：三个提交已从 `3934f2e` fast-forward 推送至 `origin/main`，远端主分支指向 `6a1404d21e0972c142a8e8b381b01ce5f00219d2`，未使用 force push。
- Workflow 状态：三个已推送提交均包含 `[skip ci]`；按各提交查询 GitHub Actions run 均为空，未触发 Vercel 部署、npm 发布或其他 GitHub workflow。本条纯工作记录提交同样使用 `[skip ci]`。

## 2026-09-02：统一资产页跨链加载骨架（本地完成，未提交）

- 仓库与分支：`dex-nextjs-template/main`，修改基于与 `origin/main` 一致的 `55234e4`。
- 拟用提交标题：`fix(portfolio): unify cross-chain loading skeleton [skip ci]`。
- 问题背景：资产页认证等待、钱包汇总、代币分布和资产表分别维护加载状态与重复骨架；不同链的缓存和接口响应速度不同，会拼出“部分内容已显示、部分区域仍为骨架”的不一致页面，旧的认证骨架还与正式分布图和资产表结构发生偏离。
- 完成事项：将首次主数据加载边界提升到资产页级别，钱包汇总或当前链持仓主数据未就绪时整页统一显示同一套骨架；认证等待、分布图 loading 和底部资产表复用正式组件的卡片、图例与列定义，删除重复的分布图骨架实现；接口明确失败后允许退出页级骨架，避免异常链永久被 loading 遮罩；补充页级切换、认证等待、图表布局及错误退场回归测试。
- 影响范围：资产页首次进入、切链和认证等待时的 loading 展示，以及分布图和资产表骨架组件；不改变钱包地址解析、持仓计算、代币分布算法、交易交互、React SDK 或后端接口。
- 验证结果：Web 43/43 个 Jest 测试套件共 199/199 项、14 项构建配置契约、TypeScript、相关 ESLint 与 `git diff --check` 全部通过；复用现有 dev server 在 Chrome 登录态验证，切到未缓存链时页头、分布图和底部面板三部分骨架同时出现，切回 SOL 后整页正常退场并显示资产内容，页面未出现可见 hydration 错误。联调日志同时确认 SOL `net-worth` 返回 200，而当前 BSC/ETH `net-worth` 返回 500，该接口异常不属于本次前端骨架修改。
- 推送状态：本事项仅保留为本地未提交修改，未暂存、未提交、未推送；工作区其他钱包和多链开发改动保持原状。
- Workflow 状态：未推送，未触发 GitHub Actions、Vercel 部署、npm 发布或其他远端 workflow；后续如提交将使用 `[skip ci]`。

## 2026-09-02：按 SOL 视觉基准恢复代币分布圆环骨架（本地修正，未提交）

- 仓库与分支：`dex-nextjs-template/main`，修改基于与 `origin/main` 一致的 `55234e4`。
- 拟用提交标题：`fix(portfolio): unify cross-chain loading skeleton [skip ci]`。
- 问题背景：首次统一跨链骨架时复用了 `border-default-100` 绘制圆环，该颜色在暗色卡片上几乎不可见，导致 ETH/BSC 的代币分布 loading 视觉上只剩右侧图例列表，没有达到以 SOL 原骨架为基准的要求。
- 完成事项：恢复 SOL 原有的实心 shimmer 圆盘加中心挖空方案，形成清晰可见的环形图骨架；保留右侧最大 `260px` 的紧凑图例与整体居中布局；新增圆环容器、中心孔和禁止退化为低对比度边框的回归断言。
- 影响范围：仅资产页代币分布 loading 的圆环视觉和对应测试；页级 loading 边界、资产表骨架、持仓查询及业务数据不变。
- 验证结果：代币分布、页级 loading 与认证骨架定向测试 11/11 通过，Web 全量 43/43 个测试套件共 198/198 项、14 项配置契约、TypeScript、相关 ESLint 与 `git diff --check` 全部通过；Chrome 登录态 BSC 页面实测同时显示清晰圆环与右侧列表，DOM 同时存在圆环、中心孔及图例结构。
- 推送状态：修正保留为本地未提交修改，未暂存、未提交、未推送；未覆盖工作区其他并行开发内容。
- Workflow 状态：未推送，未触发 GitHub Actions、Vercel 部署、npm 发布或其他远端 workflow；后续提交继续使用 `[skip ci]`。

## 2026-09-02：统一跨链骨架与原生币余额异常回退（提交前）

- 仓库与分支：`dex-nextjs-template/main`，提交前本地与 `origin/main` 均指向 `55234e464ff880620a920e4748b6a7dcbb779fb2`，无分叉。
- 拟用提交标题：`fix(portfolio): unify loading and balance fallbacks [skip ci]`。
- 问题背景：资产页不同链因缓存与请求时序产生分区骨架，认证态又维护重复实现；代币分布圆环在暗色主题下对比度不足；同时 Chainstream 持仓接口失败时，顶部和提现入口可能继续展示缓存原生币余额，且原有真值判断会把合法的零余额误显示为不可用。
- 完成事项：资产页首次数据加载统一使用整页 SOL 风格骨架，分布区固定呈现清晰圆环与紧凑图例，底部面板复用正式标签与资产表列定义；失败后允许退出骨架；原生币余额统一通过共享格式化函数区分零值与不可用状态，并在持仓查询报错时隐藏缓存余额，顶部工具栏、钱包切换和提现弹窗复用同一语义；补充跨链 loading、错误退场、认证骨架、圆环结构、零余额与查询失败回归测试。
- 影响范围：资产页首次进入、认证等待与切链 loading，代币分布及资产表骨架，顶部/底部钱包余额和提现余额展示；不改变转账提交协议、持仓计算、React SDK、K 线或后端接口。
- 验证结果：Web 全量 43/43 个 Jest 测试套件共 198/198 项、14 项构建配置契约、TypeScript、全部相关 ESLint 与 `git diff --check` 通过；复用现有 dev server 在 Chrome 登录态验证 BSC 分布骨架同时显示圆环与图例，SOL 内容可正常退场，未出现可见 hydration 错误。
- 推送状态：计划将当前全部修改精确提交至本地 `main`，随后在确认远端无新增提交后 fast-forward 推送至 `origin/main`，禁止 force push。
- Workflow 状态：功能提交与后续纯工作记录提交均使用 `[skip ci]`，跳过 GitHub Actions、Vercel 部署及其他由 push 触发的 workflow。

## 2026-09-02：统一跨链骨架与原生币余额异常回退（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`7929b9d` — `fix(portfolio): unify loading and balance fallbacks [skip ci]`；本条记录拟使用 `docs: record portfolio loading fix [skip ci]` 独立提交。
- 问题背景：不同链的数据缓存与响应时序使资产页呈现不一致的分区骨架，暗色主题下分布圆环几乎不可见；持仓接口报错或切链时还可能短暂暴露缓存原生币余额，并将合法零余额误判为不可用。
- 完成事项：资产页认证等待和首次主数据加载统一为整页 SOL 风格骨架，代币分布固定显示清晰圆环与紧凑图例，底部资产表复用正式列定义，接口失败后可退出骨架；顶部、底部与提现弹窗统一余额格式化和错误回退，查询失败或旧链数据不再展示，零余额正确显示为 `0`；相关 loading、错误、切链和余额测试已补齐。
- 影响范围：资产页 loading、代币分布和资产表骨架、钱包原生币余额及提现余额展示；不涉及 React SDK、转账提交、K 线、npm 发布或生产部署。
- 验证结果：Web 43/43 个 Jest 测试套件共 198/198 项、14 项配置契约、TypeScript、相关 ESLint 与 `git diff --check` 全部通过；Chrome 登录态 BSC 页面验证圆环与图例同时可见，SOL 页面可正常退场，未出现可见 hydration 错误。
- 推送状态：功能提交已创建于本地 `main`；待提交本条纯工作记录后，将两笔提交 fast-forward 推送至 `origin/main`，禁止 force push。
- Workflow 状态：功能提交及本条工作记录提交均包含 `[skip ci]`，预期跳过 GitHub Actions、Vercel 部署和其他 push workflow。

## 2026-09-02：补齐切链缓存余额身份校验（提交前）

- 仓库与分支：`dex-nextjs-template/main`，基于本地未推送提交 `fcc02ae`，远端 `origin/main` 仍为 `55234e4`。
- 拟用提交标题：`fix(wallet): hide stale chain balance [skip ci]`。
- 问题背景：提交过程中工作区补充了余额响应的链与钱包地址校验；若遗漏该修改，切链回归测试只会在脏工作区通过，而已提交代码仍可能短暂展示上一条链的缓存余额。
- 完成事项：原生币余额 hook 同时校验当前链、当前钱包地址与持仓响应中的 `chain/address`，只有完全匹配且查询未报错时才返回余额。
- 影响范围：顶部、底部钱包余额与提现弹窗复用的原生币余额来源；不改变余额格式、查询参数或转账逻辑。
- 验证结果：钱包链状态定向测试 6/6、TypeScript、相关 ESLint 与 `git diff --check` 通过。
- 推送状态：计划将该防护与本条提交前记录一并提交，随后追加提交后记录，再将全部本地提交 fast-forward 推送至 `origin/main`。
- Workflow 状态：提交标题包含 `[skip ci]`，跳过 GitHub Actions、Vercel 部署和其他 push workflow。

## 2026-09-02：补齐切链缓存余额身份校验（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`abac29f` — `fix(wallet): hide stale chain balance [skip ci]`；本条记录拟使用 `docs: record stale balance guard [skip ci]` 独立提交。
- 问题背景：切链期间 React Query 可能仍持有上一条链的成功响应，只检查请求错误不足以阻止旧链原生币余额短暂显示。
- 完成事项：余额结果现会同时匹配当前链和当前钱包地址，查询失败、链不匹配或地址不匹配均返回不可用状态；已提交的切链测试与最终代码一致。
- 影响范围：钱包切换入口、底部钱包状态和提现弹窗的原生币余额显示；其他资产查询和交易流程不变。
- 验证结果：钱包链状态定向测试 6/6、TypeScript、相关 ESLint 与 whitespace 检查通过；此前 Web 全量 43/43 个套件共 198/198 项通过。
- 推送状态：功能提交已创建于本地 `main`；本条记录提交后将全部本地提交 fast-forward 推送至 `origin/main`，禁止 force push。
- Workflow 状态：功能提交及本条纯工作记录提交均包含 `[skip ci]`，预期不触发 GitHub Actions、Vercel 部署或其他 workflow。

## 2026-09-02：资产页跨链骨架与余额回退修复（推送完成）

- 仓库与分支：`dex-nextjs-template/main`，本地与远端通过普通 fast-forward 同步。
- 提交：`7929b9d` — `fix(portfolio): unify loading and balance fallbacks [skip ci]`；`fcc02ae` — `docs: record portfolio loading fix [skip ci]`；`abac29f` — `fix(wallet): hide stale chain balance [skip ci]`；`47dc2d9` — `docs: record stale balance guard [skip ci]`；本条最终记录使用 `docs: record portfolio loading push [skip ci]`。
- 问题背景：资产页跨链 loading 结构与圆环可见性不一致，持仓请求失败或切链时还存在缓存原生币余额误显示风险。
- 完成事项：所有链统一使用 SOL 风格整页骨架，分布区同时显示高对比度圆环与紧凑图例，认证与底部表格复用正式结构；原生币余额在错误、链不匹配或地址不匹配时隐藏，并正确区分零余额与不可用状态。
- 影响范围：资产页 loading、代币分布与资产表骨架、顶部/底部钱包余额及提现余额展示；不涉及 React SDK 发布、交易提交、K 线或生产部署。
- 验证结果：Web 43/43 个 Jest 测试套件共 198/198 项、14 项配置契约、TypeScript、相关 ESLint 与 whitespace 通过；钱包链状态定向测试无缓存运行 6/6 通过；Chrome 登录态 BSC 骨架显示圆环与列表，未出现可见 hydration 错误。
- 推送状态：四笔提交已从 `55234e4` fast-forward 推送至 `origin/main`，远端指向 `47dc2d9e0002fe0d0ababc67de42d60c6f635edd`，未使用 force push；本条最终记录将继续以 fast-forward 推送。
- Workflow 状态：四笔已推送提交均包含 `[skip ci]`，逐 commit 查询 GitHub Actions run 均为空；本条最终记录同样包含 `[skip ci]`，不触发 GitHub Actions、Vercel 部署或其他 workflow。

## 2026-09-02：预热并轮询多链主代币价格（提交前）

- 仓库与分支：`dex-nextjs-template/main`，基于与 `origin/main` 一致的 `574f580`。
- 拟用提交标题：`perf(market): prefetch primary token prices [skip ci]`。
- 问题背景：底部主代币价格仅按当前链发起查询，首次切换到 SOL、ETH 或 BSC 的其他链时需要等待对应 wrapped native token 的 Chainstream Token 请求完成，容易让用户误认为链切换没有生效。
- 完成事项：在应用运行时 Provider 内新增无界面的主代币价格预热器，页面加载后并行查询 WSOL、WETH、WBNB，并以 60 秒周期持续刷新；预热查询与底部价格组件复用同一 React Query key，切链时可立即读取已缓存的对应链价格；补充三链地址、轮询参数和运行时挂载回归测试。
- 影响范围：仅底部主代币美元价格的预加载、缓存与轮询时序；不改变 Chainstream 接口、价格字段、钱包余额、链选择、交易流程或 React SDK。
- 验证结果：定向价格测试 5/5 通过；Web 全量 44/44 个 Jest 测试套件共 203/203 项、14 项构建配置契约、TypeScript、ESLint 与 `git diff --check` 全部通过；复用现有 3000 端口本地 SDK 联调服务验证页面返回 HTTP 200。
- 推送状态：计划仅提交本事项的预热器、运行时挂载、回归测试和本条工作记录；不暂存 React SDK 或其他工作区内容，暂不推送远端。
- Workflow 状态：提交标题包含 `[skip ci]`；本地提交不会触发 GitHub Actions、Vercel 部署、npm 发布或其他远端 workflow。

## 2026-09-02：预热并轮询多链主代币价格（提交后）

- 仓库与分支：`dex-nextjs-template/main`。
- 提交：`5307a61` — `perf(market): prefetch primary token prices [skip ci]`；本条记录使用 `docs: record primary token price polling [skip ci]` 独立提交。
- 问题背景：底部主代币价格原先仅查询当前链，首次切换到其他链时必须等待 Chainstream 返回 WSOL、WETH 或 WBNB 价格，链状态已经切换但价格仍处于等待态。
- 完成事项：应用加载时并行预取 SOL、ETH、BSC 三条链的 wrapped native token，并每 60 秒轮询刷新；预热器与底部价格展示复用相同 React Query key，切链后直接显示对应缓存价格；三链地址、轮询配置及 Provider 挂载均有自动化测试覆盖。
- 影响范围：底部主代币价格的预加载、缓存和刷新时序；不改变价格接口与字段、钱包余额、链选择、交易流程或 React SDK。
- 验证结果：代码审查 Standards 轴除缺少本提交后记录外无代码问题，Spec 轴无缺失、错误或范围扩大；补齐记录后，定向测试 5/5、Web 全量 44/44 个 Jest 套件共 203/203 项、14 项构建契约、TypeScript、ESLint 与 whitespace 均通过；现有本地 SDK 联调服务返回 HTTP 200。
- 推送状态：功能提交与本条纯工作记录提交均仅保留在本地 `main`，未推送；没有混入 React SDK 工作区的其他未提交修改。
- Workflow 状态：两笔提交均包含 `[skip ci]`；尚未推送，因此未触发 GitHub Actions、Vercel 部署、npm 发布或其他远端 workflow。

## 2026-09-02：多链主代币价格预热与轮询（推送完成）

- 仓库与分支：`dex-nextjs-template/main`，通过普通 fast-forward 与 `origin/main` 同步。
- 提交：功能提交 `5307a61` — `perf(market): prefetch primary token prices [skip ci]`；提交后记录 `c6966a1` — `docs: record primary token price polling [skip ci]`；本条最终记录使用 `docs: record primary token price polling push [skip ci]`。
- 问题背景：底部价格原先只查询当前链，首次切换 SOL、ETH、BSC 时需要等待对应 wrapped native token 的 Chainstream 请求，造成链已变化但价格仍未更新的困惑。
- 完成事项：页面加载后并行预取 WSOL、WETH、WBNB，并以 60 秒周期刷新；底部展示复用同一 React Query 缓存，切链时直接获得对应链价格；相关运行时挂载、三链地址和轮询参数均已覆盖测试。
- 影响范围：底部主代币价格的预加载、缓存和轮询时序；不涉及钱包余额、Chainstream 接口变更、React SDK 发布、交易流程或生产部署。
- 验证结果：Web 全量 44/44 个 Jest 套件共 203/203 项、14 项构建契约、TypeScript、ESLint、whitespace 和两轴代码审查通过；本地 SDK 联调服务返回 HTTP 200；GitHub 按 `5307a61` 与 `c6966a1` 查询均无 Actions run。
- 推送状态：功能提交与提交后记录已从 `574f580` fast-forward 推送到 `origin/main`，未使用 force push；本条最终工作记录将继续以普通 fast-forward 推送。
- Workflow 状态：所有提交均包含 `[skip ci]`，未触发 GitHub Actions、Vercel 部署、npm 发布或其他 GitHub workflow。

## 2026-09-02：同步快捷交易预设并防止关闭时丢失输入（提交前）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`，均在当前本地 `main` 上实施；React SDK 中现存的 i18n、portfolio 并行修改不属于本事项，将保持未暂存。
- 拟用提交标题：React SDK 使用 `fix(ui-trade): preserve and sync preset selection [skip ci]`；模板使用 `fix(toolbar): sync quick trade preset [skip ci]`；提交后工作记录使用 `docs: record quick trade preset fix [skip ci]`。
- 问题背景：快捷交易设置 Modal 切换当前页面链的预设 Tab 后，底部工具栏仍显示旧预设；表单输入框未失焦时直接点击背景关闭 Modal，最新输入尚未触发失焦提交，重新打开后会丢失。
- 计划完成事项：为预设表单补充受控默认值同步与预设切换回调；Modal 关闭前主动提交当前焦点字段；通过公开的 `useInstantTradeAmount` 写入能力同步底部预设，仅响应当前页面链，避免编辑其他链时污染底部状态；补充 SDK hook、表单、Modal 与模板集成回归测试。
- 影响范围：快捷交易预设 Modal、底部 Preset 按钮、即时交易金额状态 hook 及其公开类型；不改变交易提交、预设具体参数结构、K 线、钱包或行情接口。
- 验证计划：执行 `@liberfi.io/ui-trade` 全量测试、类型检查与 lint，执行模板定向 Jest、Web 类型检查与 lint，并检查 Prettier、whitespace 和调试残留。
- 预期推送状态：仅精确暂存本事项文件和唯一工作汇报文件，分别在两个仓库创建普通提交；获取远端状态并确认可 fast-forward 后推送 `main`，禁止 force push。
- Workflow 策略：所有提交标题均包含 `[skip ci]`，跳过 GitHub Actions、Vercel 部署、npm 发布及其他由 push 触发的 workflow。

## 2026-09-02：同步快捷交易预设并防止关闭时丢失输入（提交后）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`。
- 提交：React SDK `4f8b26473` — `fix(ui-trade): preserve and sync preset selection [skip ci]`；模板 `68c9b47` — `fix(toolbar): sync quick trade preset [skip ci]`；本条记录使用 `docs: record quick trade preset fix [skip ci]` 独立提交。
- 问题背景：快捷交易 Modal 的预设选择与底部工具栏状态互相脱节；输入框尚未失焦时点击背景关闭会在提交输入前卸载表单，造成最新修改丢失。
- 最终完成事项：Modal 预设 Tab 可响应外部默认值并上报当前链与预设索引；底部工具栏通过 SDK 公开 hook 同步当前页面链的 Preset，编辑其他链不会污染当前显示；关闭 Modal 时先让活动字段失焦并完成保存；相关 SDK 与模板回归测试已补齐。
- 影响范围：快捷交易预设 Modal、底部 Preset 按钮、即时交易金额状态 hook 和公开类型；没有改动交易提交、钱包、行情或 K 线逻辑，React SDK 中 i18n、portfolio 并行修改未纳入提交。
- 验证结果：`@liberfi.io/ui-trade` 6/6 个 Jest 套件共 26/26 项通过，SDK 类型检查、lint 与 Prettier 通过；模板定向测试 1/1、Web 类型检查、lint、Prettier、whitespace 与调试残留检查通过；本地页面已验证预设同步及未失焦输入在背景关闭后仍保留。
- 推送状态：两笔功能提交已创建于本地 `main`；待提交本条工作记录并确认远端无新增提交后，分别以普通 fast-forward 推送至 `origin/main`，禁止 force push。
- Workflow 状态：两笔功能提交与本条工作记录均包含 `[skip ci]`，预期跳过 GitHub Actions、Vercel 部署、npm 发布及其他 push workflow。

## 2026-09-02：快捷交易预设同步与输入保留修复（推送完成）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`，均通过普通 fast-forward 与各自 `origin/main` 同步。
- 提交：React SDK `4f8b26473` — `fix(ui-trade): preserve and sync preset selection [skip ci]`；模板功能 `68c9b47` — `fix(toolbar): sync quick trade preset [skip ci]`；提交后记录 `c10e8a6` — `docs: record quick trade preset fix [skip ci]`；本条最终记录使用 `docs: record quick trade preset push [skip ci]`。
- 完成事项：Modal 切换当前页面链的预设后，底部 Preset 立即同步；编辑其他链不会改变底部当前链状态；点击背景关闭前会先提交尚未失焦的输入；SDK 通过公开 hook 提供预设写入能力，避免模板依赖内部 atom。
- 影响范围：快捷交易预设 Modal、底部 Preset 按钮、即时交易金额状态 hook 及公开类型；React SDK 中未提交的 i18n、portfolio 并行修改仍原样保留。
- 验证结果：SDK 6/6 个测试套件共 26/26 项、模板定向测试 1/1、两边类型检查、lint、格式与 whitespace 均通过；React SDK push hook 额外完成全仓 24/24 个构建任务。
- 推送状态：React SDK 远端 `main` 已指向 `4f8b264737b31c04c839fa3b31b9c11f8d47b726`；模板远端 `main` 已指向 `c10e8a6e0eda738d3e9606e58f2cd58cc940499a`；均未使用 force push，本条最终记录将继续普通 fast-forward 推送。
- Workflow 状态：按 React SDK 功能提交、模板功能提交和工作记录提交逐一查询 GitHub Actions，结果均为空；`[skip ci]` 已生效，未触发 GitHub Actions、Vercel 部署或 npm 发布。本条最终记录同样包含 `[skip ci]`。

## 2026-09-02：发布多链余额状态修复并升级生产依赖（提交前）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`，执行前均与各自 `origin/main` 无分叉；模板仅新增本工作记录，React SDK 待提交 5 个 i18n/portfolio 文件。
- 拟用提交标题：React SDK 使用 `fix(portfolio): isolate balances across chain switches`；模板依赖升级使用 `chore(deps): bump react sdk for wallet fixes`；工作记录另行使用 `[skip ci]` 提交。
- 问题背景：Chainstream ETH/BSC 余额接口失败或切链请求尚未完成时，Header 可能继续消费缓存中的旧链余额；底部主代币通用价格提示还依赖尚未发布的国际化 key。本地源码联调已生效，但 npm 与 Vercel 生产环境尚未获得这些修复。
- 计划完成事项：React SDK 在 Portfolio 查询失败时清空 summary，仅发布链与钱包地址完全匹配的数据，并让 Header 同步拒绝旧链 summary；补齐通用主代币价格提示及回归测试；通过 Release workflow 发布 npm；模板随后将实际使用的全部 `@liberfi.io/*` 依赖统一升级到官方 npm latest，刷新 lockfile并部署 Vercel。
- 影响范围：Header 账户余额、Portfolio summary 状态、主代币价格 tooltip、React SDK npm 包版本、模板依赖与生产部署；`@chainstream-io/sdk` 保持当前版本不变，不改余额后端接口或 `/api/balance`。
- 验证计划：React SDK 执行 i18n/ui-portfolio 测试、类型检查、lint、whitespace 和全仓 `pnpm build`；发布后从 npm 官方 registry 确认关键包版本并拉取 release commit；模板复查所有 workspace 三类依赖、刷新 lockfile、执行定向/全量测试、类型检查、lint、whitespace 和发布所需 production build；最终等待 Vercel workflow 成功并验证生产域名 HTTP 200。
- 预期推送状态：React SDK 功能提交普通 fast-forward 推送 `main` 触发 Release，workflow 生成的 release commit 拉回本地；模板依赖提交普通 fast-forward 推送 `main` 触发 Vercel，禁止 force push。
- Workflow 策略：React SDK 功能提交与模板依赖提交不使用 `[skip ci]`，分别允许 Release 与 Vercel workflow；纯 WORK_REPORT 提交使用 `[skip ci]`，避免重复发布或部署。

## 2026-09-02：提交 React SDK 多链余额状态修复（提交后）

- 仓库与分支：`react-sdk/main`。
- 提交：`6a7dfd037` — `fix(portfolio): isolate balances across chain switches`。
- 问题背景：切换链或 Chainstream 余额请求失败时，Header 可能读取 React Query/context 中的旧链余额；底部通用主代币价格 tooltip 所需国际化 key 也尚未进入 npm 包。
- 最终完成事项：Portfolio 状态管理器在查询错误时清空 summary，只发布链与钱包地址匹配的数据，并允许余额先于 PnL 返回；账户信息 hook 在消费端再次同步校验 summary 作用域；补齐通用主代币价格中英文文案和旧链、错误缓存回归测试。
- 影响范围：`@liberfi.io/i18n`、`@liberfi.io/ui-portfolio` 及其依赖发布链；不修改 `@chainstream-io/sdk`、余额后端、`/api/balance` 或交易协议。
- 验证结果：i18n 13/13 个套件共 77/77 项、ui-portfolio 6/6 个套件共 21/21 项测试通过；两包类型检查、lint、Prettier、whitespace 通过；React SDK 全仓 build 24/24 成功。
- 推送状态：功能提交已创建于本地 `react-sdk/main`，工作区干净且领先 `origin/main` 1 个提交；下一步普通 fast-forward 推送并等待 Release workflow，禁止 force push。
- Workflow 状态：功能提交未使用 `[skip ci]`，推送后应触发 `Release` 并发布 npm；模板尚未更新依赖或部署。

## 2026-09-02：发布多链余额状态修复并升级模板 SDK 依赖（提交后）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`。
- 提交：React SDK 功能提交 `6a7dfd037` — `fix(portfolio): isolate balances across chain switches`，Release workflow 生成版本提交 `fdae9612f` — `chore: release packages`；模板依赖提交 `9094821` — `chore(deps): bump react sdk for wallet fixes`；本条记录使用 `docs: record wallet sdk release and bump [skip ci]` 独立提交。
- 问题背景：多链余额隔离和通用主代币价格提示仅在本地 SDK 源码联调中生效，生产模板仍引用上一批 npm 包，切链时可能继续显示旧链余额或缺少最新国际化文案。
- 完成事项：React SDK Release workflow 已将本轮固定版本组发布到 npm 官方源，其中 `@liberfi.io/react@0.3.98`、`@liberfi.io/i18n@0.1.281`、`@liberfi.io/ui-portfolio@3.0.83` 等版本均已确认可安装；模板所有直接使用的 `@liberfi.io/*` dependencies 已统一升级到同轮版本并刷新 lockfile，`@chainstream-io/sdk` 按要求保持 `^2.1.14` 不变。
- 影响范围：Header 与 Portfolio 的跨链余额状态、底部主代币价格提示、模板 npm 依赖解析及后续 Vercel 生产部署；不修改 Chainstream 余额接口、`/api/balance`、交易协议或钱包地址规则。
- 验证结果：React SDK 发布前 i18n 13/13 个套件共 77/77 项、ui-portfolio 6/6 个套件共 21/21 项及全仓 24/24 个构建任务通过；模板升级后 Web 45/45 个 Jest 套件共 204/204 项、14 项构建配置契约、TypeScript、ESLint 与 whitespace 全部通过；隔离临时目录使用 npm 包完成 production build，23/23 个静态页面生成成功，只有既有 postcss-calc 与 Sentry/OpenTelemetry webpack warning。
- 推送状态：React SDK 功能提交与 release commit 已在 `origin/main`；模板依赖提交已创建于本地 `main`，待本条工作记录提交后普通 fast-forward 推送，禁止 force push。
- Workflow 状态：React SDK `Release` run `33564254356` 成功，npm 发布完成；模板依赖提交未使用 `[skip ci]`，推送后将触发 Vercel 部署；本条纯工作记录使用 `[skip ci]`，避免重复部署。

## 2026-09-02：多链余额状态修复发布与生产部署完成

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`，两仓库均通过普通 fast-forward 推送并同步远端。
- 提交：React SDK `6a7dfd037` — `fix(portfolio): isolate balances across chain switches`、release commit `fdae9612f`；模板 `9094821` — `chore(deps): bump react sdk for wallet fixes`、提交后记录 `e762400` — `docs: record wallet sdk release and bump [skip ci]`；本条最终记录使用 `docs: record wallet sdk production deploy [skip ci]`。
- 问题背景：需要将已验证的多链余额隔离、错误回退与通用主代币价格提示从本地 SDK 联调链路完整发布到 npm，并让生产模板消费对应版本。
- 完成事项：React SDK npm 固定版本组发布成功，模板全部直接使用的 `@liberfi.io/*` 包同步升级并锁定新解析结果，`@chainstream-io/sdk` 维持 `2.1.14`；模板依赖提交单独作为 push HEAD 触发 production Vercel workflow，部署产物已上线。
- 影响范围：Header、资产页及其共享状态中的跨链余额显示，底部主代币价格提示，React SDK npm 包、模板依赖与 Vercel 生产环境；不变更后端余额接口和交易流程。
- 验证结果：SDK 定向测试、类型检查、lint 与 24/24 全仓构建通过；模板 45/45 个 Jest 套件共 204/204 项、14 项配置契约、TypeScript、ESLint、whitespace 和隔离 production build 通过；Vercel 生产部署地址 `https://liberfi-qo87m18wm-sgt-lab.vercel.app` 创建成功，`https://app.liberfi.io` 返回 HTTP 200。
- 推送状态：React SDK `origin/main` 已包含功能与 release commit；模板依赖提交已推送至 `origin/main`，本条及前一条纯工作记录将以普通 fast-forward 补充推送，未使用 force push。
- Workflow 状态：React SDK `Release` run `33564254356` 成功；模板 `Deploy to Vercel` run `33565711987`、job `100048276622` 在 6 分 40 秒内成功；最终纯工作记录包含 `[skip ci]`，不重复触发 npm 发布或 Vercel 部署。

## 2026-09-02：修复 TradingView 卸载阶段偶发空指针（提交前）

- 仓库与分支：`react-sdk/main`，基于与 `origin/main` 一致的 `fdae9612f`；工作汇报记录维护于 `dex-nextjs-template/main`。
- 拟用提交标题：React SDK 使用 `fix(tradingview): guard detached widget cleanup [skip ci]`；工作记录使用 `[skip ci]` 独立提交。
- 问题背景：打开首页或发生页面切换时，旧 K 线组件进入卸载流程；React 先解除 widget ref，随后 `TradingViewLayout` 的 effect cleanup 仍通过闭包中的旧 widget 调用 `unsubscribe`。若 TradingView iframe 已销毁，其内部 window/API 为 `null`，会间歇抛出 `Cannot read properties of null (reading 'doWhenApiIsReady')`。
- 完成事项：layout 事件清理前校验闭包 widget 是否仍由当前 `chartManager` 持有；有效 widget 继续正常退订，已脱离并进入销毁阶段的旧 widget 不再调用 iframe API；补充与生产异常相同的卸载竞态回归测试，同时断言正常实例仍会执行退订。
- 影响范围：`@liberfi.io/ui-tradingview` 的 `layout_changed` 监听器卸载流程，以及使用该组件的代币详情和永续合约 K 线；不改变行情数据源、K 线配置、图表交互或业务接口。
- 验证结果：回归用例修复前稳定复现相同 TypeError，修复后连续 5/5 次通过；`ui-tradingview` 全量 14/14 个 Jest 套件共 51/51 项、package build、lint、Prettier 与 whitespace 通过。本包完整 typecheck 仍被未修改的 `TradingViewToolbarInteractions.test.tsx` 三处既有 mock 类型错误阻断，本次变更文件不在错误列表且 DTS build 成功。
- 推送状态：计划精确提交两个 `ui-tradingview` 文件及工作记录，确认远端无新增提交后普通 fast-forward 推送，禁止 force push。
- Workflow 状态：所有提交标题均包含 `[skip ci]`，按用户要求跳过 GitHub Actions、npm 发布、Vercel 部署及其他由 push 触发的 workflow。

## 2026-09-02：修复 TradingView 卸载阶段偶发空指针（提交后）

- 仓库与分支：`react-sdk/main`。
- 提交：`25da8d020` — `fix(tradingview): guard detached widget cleanup [skip ci]`；本条记录使用 `docs: record tradingview cleanup fix [skip ci]` 独立提交。
- 问题背景：TradingView iframe 与 React passive effect 的销毁顺序存在竞态，旧 widget 在 iframe 已解除后继续执行 `unsubscribe`，间歇触发 `doWhenApiIsReady` 空指针并污染首页打开或路由切换体验。
- 完成事项：清理 `layout_changed` 监听器前校验当前 widget 所有权，避免已销毁实例再次进入 iframe API；保留有效实例的正常退订；新增卸载竞态及正常清理双向断言，防止通过吞异常或完全取消退订掩盖问题。
- 影响范围：`@liberfi.io/ui-tradingview` 的布局监听器生命周期，以及代币详情、永续合约等 TradingView 使用场景；不影响图表行情、保存、配置和交互功能。
- 验证结果：精确回归测试由修复前红灯转为绿灯并连续 5/5 次通过；全包 14/14 个测试套件共 51/51 项、build、lint、Prettier 和 whitespace 通过；本地联调首页返回 HTTP 200。
- 推送状态：React SDK 功能提交已创建，模板提交前记录为 `efe3fc3`；待提交本条记录后分别普通 fast-forward 推送至各自 `origin/main`，禁止 force push。
- Workflow 状态：功能提交、提交前记录和本条记录均包含 `[skip ci]`，预期不触发 GitHub Actions、npm 发布、Vercel 部署或其他 workflow。

## 2026-09-02：TradingView 卸载竞态修复推送完成

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`，均以普通 fast-forward 推送。
- 提交：React SDK `25da8d020` — `fix(tradingview): guard detached widget cleanup [skip ci]`；模板记录 `efe3fc3` 与 `6bcbd09`；本条最终记录使用 `docs: record tradingview cleanup push [skip ci]`。
- 问题背景：页面切换时已解除的 TradingView iframe 仍可能收到旧 layout listener 的退订调用，造成间歇性 `doWhenApiIsReady` 空指针。
- 完成事项：已上线远端代码基线的修复通过 widget 所有权判断阻止失效实例调用 iframe API，同时保留有效实例正常退订，并用双向回归测试锁定销毁时序。
- 影响范围：React SDK TradingView 布局监听器的卸载稳定性；模板依赖版本、npm 发布版本和 Vercel 生产环境均未变化。
- 验证结果：全包 14/14 个测试套件共 51/51 项、5 轮竞态回归、package build、push hook 全仓 24/24 构建、lint、Prettier 与 whitespace 均通过；两个仓库提交推送后无分叉。
- 推送状态：React SDK 远端 `main` 指向 `25da8d020`；模板远端 `main` 已包含 `efe3fc3` 与 `6bcbd09`；均未使用 force push，本条记录将继续普通 fast-forward 推送。
- Workflow 状态：按三个已推送 commit 查询 GitHub Actions run 均为空，`[skip ci]` 已生效；本条最终记录同样使用 `[skip ci]`，不触发 npm 发布、Vercel 部署或其他 workflow。

## 2026-09-02：发布 TradingView 卸载竞态修复并升级生产依赖（提交前）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`，执行前分别与各自 `origin/main` 一致，React SDK 指向 `25da8d020`，模板指向 `a391b51`。
- 拟用提交标题：模板发布前记录使用 `docs: record tradingview sdk release plan [skip ci]`；React SDK 使用 `chore(release): publish tradingview cleanup` 触发 Release；模板依赖升级使用 `chore(deps): bump react sdk for tradingview cleanup`。
- 问题背景：TradingView iframe 卸载竞态修复已经合并并推送到 React SDK，但上一笔功能提交包含 `[skip ci]`，npm 仍停留在 `@liberfi.io/ui-tradingview@0.1.237`，生产模板尚未获得该修复。
- 计划完成事项：先完成 React SDK 全仓发布构建、TradingView 回归测试与静态检查，再通过明确的 release 触发提交执行 GitHub Release workflow；发布成功后从 npm 官方 registry 核验整组 patch 版本并同步 release commit；模板统一升级实际依赖的 `@liberfi.io/*` 包、刷新 lockfile、完成本地与隔离 production build 验证，最后触发并等待 Vercel 生产部署。
- 影响范围：`@liberfi.io/ui-tradingview` 的布局监听器卸载稳定性、React SDK npm 固定版本组、模板依赖解析以及代币详情和永续合约图表的生产运行；不改变 HTTP/WebSocket contract、domain type、图表行情和交易逻辑，`@chainstream-io/sdk` 保持 `^2.1.14` 不变。
- 验证计划：React SDK 执行全仓 `pnpm build`、ui-tradingview 测试/typecheck/lint 和 whitespace；发布后逐包查询 npm 官方 registry；模板执行 Web 全量测试、typecheck、lint、依赖残留扫描、whitespace、本地页面验证与禁用本地 SDK alias 的隔离 production build；部署后等待 GitHub workflow 成功并验证生产域名 HTTP 200。
- 预期推送状态：两个仓库均只允许普通 fast-forward push，禁止 force push；React SDK 发布后执行 `git pull --ff-only` 同步自动生成的 release commit。
- Workflow 状态：本条发布前记录使用 `[skip ci]`，不触发部署；React SDK release 触发提交和模板依赖提交不使用 `[skip ci]`，分别允许 npm Release 与 Vercel workflow；最终纯工作记录使用 `[skip ci]`，避免重复发布或部署。

## 2026-09-02：React SDK TradingView 修复发布完成并准备模板部署

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`；React SDK 已同步远端 release commit，模板在 `origin/main` 的发布前记录基线上准备依赖提交。
- 提交：React SDK release 触发提交 `8641044cb` — `chore(release): publish tradingview cleanup`，自动版本提交 `f0785a06e` — `chore: release packages`；模板拟使用 `chore(deps): bump react sdk for tradingview cleanup`。
- 问题背景：`@liberfi.io/ui-tradingview` 的 detached widget 清理保护尚未进入 npm 和 Vercel 生产环境，需要完成从 SDK 源码、npm 固定版本组到模板生产依赖的完整发布链路。
- 完成事项：React SDK Release workflow 已将 25 个公开包统一 patch 发布，其中 `@liberfi.io/ui-tradingview` 从 `0.1.237` 升至 `0.1.238`；模板全部直接使用的 `@liberfi.io/*` dependencies 已同步到同轮版本并刷新 lockfile，旧直接版本均已清除，`@chainstream-io/sdk` 保持 `2.1.14`。
- 影响范围：代币详情和永续合约 TradingView 的卸载稳定性、React SDK npm 包版本、模板依赖解析及下一步 Vercel 部署；不涉及 HTTP/WebSocket contract、domain type、行情数据和交易流程。React SDK 同步后出现的 4 个 `ui-launchpad` 并行本地改动未进入本次 release，也未被修改或暂存。
- 验证结果：React SDK 全仓 build 24/24、ui-tradingview 14/14 套件共 51/51 项及 lint 通过，typecheck 仅保留计划内 3 处既有 mock 缺少 `chartIndex`；Release run `33634150910` 成功，25 个版本均由 npm 官方 registry 验证。模板 Web 45/45 个测试套件共 204/204 项、14 项配置契约、TypeScript、ESLint、whitespace 与本地首页/永续页 HTTP 200 均通过；禁用本地 SDK alias 的隔离 production build 成功生成 23/23 个静态页面，仅有既有 Browserslist、postcss-calc 和 Sentry/OpenTelemetry warning。
- 推送状态：React SDK release 触发提交与自动版本提交均已在 `origin/main`；模板依赖与本条工作记录待精确提交并单独 fast-forward 推送，禁止 force push。
- Workflow 状态：React SDK `Release` run `33634150910` 成功；模板依赖提交不带 `[skip ci]`，推送后将触发 `Deploy to Vercel`；最终部署记录使用 `[skip ci]`，避免重复部署。

## 2026-09-02：TradingView 修复 npm 发布与 Vercel 生产部署完成

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`；React SDK 远端已包含发布提交，模板依赖提交已通过普通 fast-forward 推送并完成生产部署。
- 提交：React SDK `8641044cb` — `chore(release): publish tradingview cleanup`、自动版本提交 `f0785a06e` — `chore: release packages`；模板发布前记录 `2c15c79`、依赖升级 `8790cce` — `chore(deps): bump react sdk for tradingview cleanup`；本条记录使用 `docs: record tradingview sdk release and deploy [skip ci]`。
- 问题背景：TradingView iframe 已销毁后仍可能收到旧 layout listener 的退订调用，造成首页打开或路由切换时偶发 `doWhenApiIsReady` 空指针；修复此前只存在于 React SDK 源码，npm 与生产模板尚未获得。
- 完成事项：React SDK 25 个公开包已统一 patch 发布，`@liberfi.io/ui-tradingview@0.1.238` 包含 detached widget 所有权保护；模板整组 `@liberfi.io/*` 依赖已升级并清除旧直接版本，`@chainstream-io/sdk` 保持 `2.1.14`；Vercel production 已部署至 `https://liberfi-5wfc7eot7-sgt-lab.vercel.app`，两个生产域名已更新并可访问。
- 影响范围：代币详情和永续合约 TradingView 卸载生命周期、React SDK npm 固定版本组、模板依赖解析与 Vercel 生产环境；不改变 HTTP/WebSocket contract、domain type、K 线行情和交易业务。React SDK 工作区中并行出现的 `ui-launchpad` 4 个未提交文件保持原样，未纳入本次发布或提交。
- 验证结果：React SDK build 24/24、TradingView 14/14 套件共 51/51 项、lint 和 whitespace 通过；Release run `33634150910` 用时 5 分 26 秒成功，25 个包均通过 npm 官方 registry 逐包核验。模板 Web 45/45 个测试套件共 204/204 项、14 项配置契约、TypeScript、ESLint、whitespace、本地首页/永续页 HTTP 200 与隔离 npm production build 23/23 个静态页面全部通过；Vercel run `33635709748` 用时 6 分 38 秒成功，`app.liberfi.io` 与 `dex.liberfi.io` 均返回 HTTP 200。
- 推送状态：React SDK `origin/main` 指向 `f0785a06e`，模板依赖提交已推送且当前 `origin/main` 指向 `8790cce`；均未使用 force push，本条最终记录将继续以普通 fast-forward 推送。React SDK 本地 HEAD 与远端一致，但保留上述用户/并行 Launchpad 未提交改动。
- Workflow 状态：React SDK `Release` run `33634150910` 和模板 `Deploy to Vercel` run `33635709748` 均成功；本条纯工作记录包含 `[skip ci]`，不会重复发布 npm 或部署 Vercel。

## 2026-09-02：发布 Launchpad 创建与图片上传体验修复（提交前）

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`；执行前分别与各自 `origin/main` 一致，React SDK 基线为 `f0785a06e`，模板基线为 `6f24b4d`。
- 拟用提交标题：React SDK 使用 `fix(launchpad): improve authenticated creation and image uploads`；模板依赖升级使用 `chore(deps): bump react sdk for launchpad fixes`；纯工作记录提交使用 `[skip ci]`。
- 问题背景：创建新币 Modal 中，未登录用户点击魔法创建时缺少明确登录门禁，生成失败时界面无反馈；图片/GIF 选择后虽能短暂预览，但上传完成会清空本地预览，且缺少上传中、成功、失败状态和明确的替换图片入口，弱操作按钮的视觉权重也与 Modal 不匹配。
- 计划完成事项：魔法创建统一经过登录授权并显示失败 toast；图片上传将本地预览与最终提交 URL 分离，支持 GIF/PNG/JPEG/WebP，持续保留预览，呈现国际化上传状态并提供弱化样式的替换入口；补充登录阻断、生成失败、上传状态、预览保留和替换入口回归测试。
- 影响范围：`@liberfi.io/i18n`、`@liberfi.io/ui-launchpad` 及模板创建新币 Modal；不改变 Launchpad 链上创建协议、交易签名、Pinata 上传接口或后端 meme 生成 contract。当前 `POST /api/x-monitor/v1/meme/generate` 实测仍返回后端 `404 Route Not Found`，本轮前端修复确保该失败可见但不伪造生成结果。
- 验证计划：React SDK 执行 `ui-launchpad` 与 i18n 全量测试、两包 typecheck/lint、Prettier、whitespace 和全仓 `pnpm build`；npm Release 成功后从官方 registry 核验实际版本并同步 release commit；模板升级全部直接使用的 `@liberfi.io/*` 版本、刷新 lockfile，执行 Web 测试、typecheck、lint、whitespace 与 production build，最后等待 Vercel production workflow 并验证生产域名 HTTP 200。
- 预期推送状态：两个仓库均通过普通 fast-forward 推送到 `main`，禁止 force push；React SDK 发布完成后执行 `git pull --ff-only` 同步 workflow 自动生成的 release commit。
- Workflow 策略：React SDK 功能提交与模板依赖提交不使用 `[skip ci]`，分别触发 npm `Release` 与 `Deploy to Vercel`；纯 `WORK_REPORT.md` 记录提交使用 `[skip ci]`，避免重复发布或部署。

## 2026-09-02：完成 Launchpad 创建与图片上传修复提交（提交后）

- 仓库与分支：`react-sdk/main`。
- 提交：`1c62b4458` — `fix(launchpad): improve authenticated creation and image uploads`。
- 问题背景：创建新币 Modal 的魔法创建缺少可靠登录门禁和失败反馈；图片上传完成后本地预览消失，用户无法确认上传状态或替换图片，且替换按钮视觉权重过高。
- 最终完成事项：魔法创建通过统一认证端口执行并显示异常 toast；图片上传新增即时本地预览、GIF 支持、上传中遮罩与加载状态、成功/失败国际化提示、失败保留预览、旧提交 URL 隔离和替换入口；替换入口使用 Modal 弱操作主题样式；新增覆盖认证阻断、生成失败、上传成功/失败、预览保留和替换操作的回归测试。
- 影响范围：`@liberfi.io/i18n` 与 `@liberfi.io/ui-launchpad`，以及模板创建新币 Modal；不修改后端接口、Pinata contract、链上创建参数与签名流程。
- 验证结果：`ui-launchpad` 4/4 个测试套件共 10/10 项、i18n 13/13 个套件共 77/77 项通过；两包 typecheck、lint、Prettier、whitespace 通过；React SDK 全仓 `pnpm build` 24/24 个任务成功。
- 推送状态：功能提交已创建于本地 `react-sdk/main`，工作区干净且领先 `origin/main` 1 个提交；下一步普通 fast-forward 推送，禁止 force push。
- Workflow 状态：提交未包含 `[skip ci]`，推送后将触发 npm `Release`；发布结果、release commit 与 npm 实际版本将在后续追加记录。

## 2026-09-02：Launchpad 修复完成 npm 发布并准备模板部署

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`；React SDK 已同步远端 release commit，模板在已推送的提交前记录基线上准备依赖提交。
- 提交：React SDK 功能提交 `1c62b4458` — `fix(launchpad): improve authenticated creation and image uploads`，自动版本提交 `bee129361` — `chore: release packages`；模板拟使用 `chore(deps): bump react sdk for launchpad fixes`。
- 问题背景：创建新币 Modal 的认证、生成失败反馈与图片上传交互修复仅在本地 SDK 源码联调中生效，需要发布 npm 固定版本组并让生产模板消费对应版本。
- 完成事项：React SDK Release workflow 已统一发布新一轮 patch，核心版本为 `@liberfi.io/i18n@0.1.283`、`@liberfi.io/react-launchpad@0.1.13`、`@liberfi.io/ui-launchpad@1.0.13`；模板 24 个直接使用的 `@liberfi.io/*` dependencies 已同步到同轮版本并刷新 lockfile，`@chainstream-io/sdk` 继续保持 `^2.1.14`。
- 影响范围：Launchpad 创建新币 Modal、React SDK npm 固定版本组、模板依赖解析及下一步 Vercel production 部署；不修改后端 meme 生成路由、Pinata contract、链上交易与签名逻辑。
- 验证结果：Release run `33643209724` 用时 5 分 34 秒成功，release commit 已通过 `git pull --ff-only` 同步，全部模板直接依赖版本均由 npm 官方 registry 确认；模板 Web 45/45 个 Jest 套件共 204/204 项、14 项构建配置契约、TypeScript、ESLint、whitespace 和 npm production build 全部通过，成功生成 23/23 个静态页面，仅有既有 Browserslist、postcss-calc 与 Sentry/OpenTelemetry warning。
- 推送状态：React SDK 功能与 release commit 均已在 `origin/main`；模板依赖与本条工作记录待精确提交后普通 fast-forward 推送，禁止 force push。
- Workflow 状态：React SDK `Release` run `33643209724` 成功；模板依赖提交不使用 `[skip ci]`，推送后将触发 `Deploy to Vercel`；最终部署记录将使用 `[skip ci]`，避免重复部署。

## 2026-09-02：Launchpad 创建与图片上传修复发布部署完成

- 仓库与分支：`react-sdk/main` 与 `dex-nextjs-template/main`；两个仓库均已通过普通 fast-forward 推送并与远端同步。
- 提交：React SDK `1c62b4458` — `fix(launchpad): improve authenticated creation and image uploads`、release commit `bee129361`；模板 `2b9a008` — `chore(deps): bump react sdk for launchpad fixes`；本条记录使用 `docs: record launchpad sdk release and deploy [skip ci]`。
- 问题背景：创建新币 Modal 的魔法创建认证与异常反馈不完整，图片/GIF 上传后预览会消失，上传状态与替换入口缺失，弱操作样式不符合 Modal 视觉层级；修复需要完整进入 npm 与 Vercel production。
- 完成事项：魔法创建接入登录门禁并显示失败信息；图片上传实现稳定即时预览、上传中/成功/失败国际化反馈、失败保留预览、GIF 支持、旧 URL 隔离和弱化替换入口；React SDK 固定版本组已发布，模板 24 个直接 `@liberfi.io/*` 依赖全部升级到同轮版本并刷新 lockfile，`@chainstream-io/sdk` 保持 `2.1.14`。
- 影响范围：`@liberfi.io/i18n@0.1.283`、`@liberfi.io/react-launchpad@0.1.13`、`@liberfi.io/ui-launchpad@1.0.13`、相关固定版本组、模板创建新币 Modal 和 Vercel 生产环境；不变更后端 meme 路由、Pinata contract、链上创建参数与签名流程。
- 验证结果：React SDK Launchpad 10/10、i18n 77/77 测试，两包 typecheck/lint、Prettier、whitespace 与全仓 build 24/24 通过；模板 Web 45/45 个 Jest 套件共 204/204 项、14 项配置契约、TypeScript、ESLint、whitespace 和 production build 23/23 个静态页面通过；部署地址 `https://liberfi-ciazun12v-sgt-lab.vercel.app` 创建成功，`app.liberfi.io` 与 `dex.liberfi.io` 均返回 HTTP 200。
- 推送状态：React SDK `origin/main` 指向 `bee129361`；模板依赖提交已推送到 `origin/main`，本条最终记录将继续普通 fast-forward 推送；全程未使用 force push。
- Workflow 状态：React SDK `Release` run `33643209724` 用时 5 分 34 秒成功；模板 `Deploy to Vercel` run `33645032176`、job `100297439066` 用时 6 分 02 秒成功；两处 Node 20 弃用 annotation 仅为提示。最终纯工作记录包含 `[skip ci]`，不会重复发布或部署。

## 2026-09-03：迁移体育实时列表首次加载保护（提交前）

- 仓库与分支：`dex-nextjs-template/main`，基于与 `origin/main` 一致的 `e842954`；保留 Stage55 与 `media-track-api` 相关既有未提交改动，不纳入本次提交。
- 拟用提交标题：`fix(prediction): recover sports list after SSR timeout`。
- 问题背景：本仓预测模块由 `prediction-nextjs-template` 迁移而来，仍保留 3 秒 SSR 共享 deadline；体育比赛请求超时会被当作权威空列表，首次进入页面无数据，刷新后才恢复。React Strict Mode 还可能取消并阻断一次性客户端补偿请求。
- 完成事项：体育预测页 SSR deadline 提升到 5 秒；比赛预取失败时携带降级标记和原始请求时间范围；若 market-data hydration 已返回权威比赛页则清除降级状态，否则客户端按原 section、view、taxonomy、时间范围、limit 与语言自动恢复；补齐 Strict Mode、真实卸载及用户切换日期时的取消和过期请求保护。无价格赛事继续由共享 prediction-server 的 canonical summary discoverability 修复统一过滤，本仓不复制服务端规则。
- 影响范围：`/predict/sports` 的首次 SSR 数据获取、体育比赛客户端恢复请求及 market-data hydration 合并；不改变电竞列表、预测 API contract、交易流程、Stage55 或媒体跟踪功能。
- 验证结果：新增 3 个回归套件完成红绿验证；全仓测试 gate 与 Web 49/49 个 Jest 套件共 209/209 项、14 项构建配置契约通过；Web TypeScript、全量 ESLint、定向 ESLint 与 whitespace 检查通过；复用现有 3000 端口开发服务验证 `/predict/sports?view=live` 返回 HTTP 200。
- 推送状态：计划仅精确提交本次 8 个预测模块代码/测试文件及本条工作记录，随后普通 fast-forward 推送到 `origin/main`，不包含现有 Stage55、ESLint 配置与 `media-track-api` 未提交改动，禁止 force push。
- Workflow 状态：功能提交不包含 `[skip ci]`，推送后允许触发仓库既有 workflow；结果将在提交后记录中更新。

## 2026-09-03：体育实时列表首次加载保护迁移完成（提交后）

- 仓库与分支：`dex-nextjs-template/main`，功能提交基于 `e842954`，提交过程中保留 Stage55、ESLint 配置与 `media-track-api` 既有未提交改动。
- 提交：`76991da` — `fix(prediction): recover sports list after SSR timeout`；本条记录使用 `docs: record sports list recovery migration [skip ci]` 独立提交。
- 问题背景：预测模块仍将体育比赛 SSR 超时当作空数据，导致首次进入直播列表没有赛事；客户端一次性恢复还需要兼容 React Strict Mode 的 effect 重放与用户主动切换日期的请求竞态。
- 完成事项：SSR deadline 已从 3 秒提高至 5 秒；比赛预取失败被标记为 degraded 并携带原时间范围；权威 market-data hydration 优先并清除降级状态；客户端仅对需要展示的体育比赛按原请求上下文恢复，并阻止卸载后、用户新请求后或旧响应覆盖当前状态。共享服务端的 canonical summary discoverability 修复继续统一处理无有效价格摘要赛事。
- 影响范围：`/predict/sports` 的比赛 SSR、客户端恢复与 hydration 合并；电竞、交易、Stage55、媒体跟踪以及 prediction API contract 不变。
- 验证结果：3 个新增回归套件完成红绿循环；全仓测试 gate、Web 49/49 个 Jest 套件共 209/209 项与 14 项构建配置契约通过；Web TypeScript、全量及定向 ESLint、whitespace 通过；现有开发服务上的 `/predict/sports?view=live` 返回 HTTP 200。Standards 与 Spec 双轴复审除本条记录外均无实质问题，本条已关闭最后一项 Standards finding。
- 推送状态：功能提交与本条记录待重新核对 `origin/main` 后普通 fast-forward 推送；用户的并行未提交文件未暂存、未提交，禁止 force push。
- Workflow 状态：功能提交不含 `[skip ci]`，推送后预计触发仓库既有 workflow；本条纯工作记录包含 `[skip ci]`，不会额外重复触发。

## 2026-09-03：体育实时列表首次加载保护已推送

- 仓库与分支：`dex-nextjs-template/main`，本地与 `origin/main` 已通过普通 fast-forward 推送同步；工作区继续保留 Stage55、ESLint 配置与 `media-track-api` 的用户并行改动。
- 提交：功能提交 `76991da` — `fix(prediction): recover sports list after SSR timeout`，提交后记录 `5a641a9`；本条最终记录使用 `docs: record sports list recovery push [skip ci]`。
- 问题背景：dex 模板的体育预测页沿用了旧的 3 秒 SSR deadline 和“超时等于空列表”行为，导致首次打开直播列表为空，并缺少可靠的客户端补偿。
- 完成事项：5 秒 SSR deadline、degraded 状态与原时间范围传递、权威 hydration 覆盖、客户端恢复及 Strict Mode/卸载/日期切换竞态保护均已进入远端 `main`；无有效价格摘要赛事继续由共享 prediction-server 统一过滤。
- 影响范围：`/predict/sports` 的首次加载与比赛数据恢复；不涉及电竞、交易、Stage55、媒体跟踪、React SDK 或服务端规则复制。
- 验证结果：全仓测试 gate、Web 49/49 个 Jest 套件共 209/209 项、14 项构建配置契约、Web TypeScript、ESLint、whitespace 和现有开发服务 HTTP 200 验证全部通过；双轴复审无剩余实质问题。
- 推送状态：`origin/main` 已包含 `76991da` 与 `5a641a9`，无分叉、未使用 force push；本条记录将继续普通 fast-forward 推送，用户并行改动未进入任何提交。
- Workflow 状态：截至本条记录生成时，GitHub 未为功能提交创建 workflow run；本条包含 `[skip ci]`，不会触发部署或其他 workflow。
