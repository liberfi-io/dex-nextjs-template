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
