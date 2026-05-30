# Pulse 列表独立为“战壕”一级导航计划

## 目标

将当前首页内的 Pulse 列表独立成一级导航页面，中文名称为“战壕”，桌面端和移动端导航都放在“发现”后面。当前仅 Solana 支持 Pulse；当用户切换到 BSC 或 ETH 时，桌面端和移动端都不展示“战壕”导航入口。

## 影响范围

- 新布局页面与导航：
  - `apps/web/src/app/(new)/pulse/page.tsx`
  - `apps/web/src/components/NewAppLayout.tsx`
- 首页列表：
  - `apps/web/src/components/home/CombinedTokenList.tsx`
  - `apps/web/src/components/home/CombinedPulseList.tsx`
- Pulse 页面：
  - `apps/web/src/components/pulse/PulsePage.tsx`
- 文案：
  - `packages/locales/src/zh.ts`
  - `packages/locales/src/en.ts`
  - `packages/locales/locales/zh/translation.json`
  - `packages/locales/locales/en/translation.json`
- 可能的遗留导航：
  - `packages/core/src/libs/router.ts`
  - `packages/ui-dex/src/components/layout/header/HeaderLinks.tsx`
  - `packages/ui-dex/src/components/layout/BottomNavigationBar.tsx`

## 实施步骤

### 1. 明确 Pulse 支持链判断

1. 在 `apps/web/src/components/NewAppLayout.tsx` 内新增或局部定义支持判断：
   - `const PULSE_SUPPORTED_CHAINS = [Chain.SOLANA] as const`
   - `const isPulseSupported = chain === Chain.SOLANA`
2. 如果该判断会被 `PulsePage` 和 `CombinedTokenList` 复用，优先抽到一个小文件，例如：
   - `apps/web/src/lib/pulse.ts`
   - 导出：
     - `export const PULSE_SUPPORTED_CHAINS = [Chain.SOLANA] as const;`
     - `export function isPulseSupportedChain(chain: Chain): boolean`
3. 判断逻辑必须显式排除 `Chain.ETHEREUM` 和 `Chain.BINANCE`，避免后续误把所有 EVM 链默认打开。

### 2. 新增新布局一级页面

1. 新建 `apps/web/src/app/(new)/pulse/page.tsx`。
2. 内容保持最小包装：
   ```tsx
   import { PulsePage } from "../../../components/pulse/PulsePage";

   export default function Page() {
     return <PulsePage />;
   }
   ```
3. 保留现有 `apps/web/src/app/(legacy)/pulse/page.tsx`，不要删除，避免旧入口或旧布局引用被破坏。

### 3. 从首页移除 Pulse tab

1. 修改 `apps/web/src/components/home/CombinedTokenList.tsx`。
2. 将类型从：
   - `type ListTab = "trending" | "pulse" | "stocks" | "new"`
   改为：
   - `type ListTab = "trending" | "stocks" | "new"`
3. 将 `SOLANA_TABS` 从：
   - `["trending", "pulse", "stocks"]`
   改为：
   - `["trending", "stocks"]`
4. 删除或不再使用：
   - `CombinedPulseList` import
   - `pulse: "tokens.listType.pulse"` 映射项
   - `showTokenListControls = activeTab !== "pulse"` 分支，改为始终展示首页列表控制区
   - `case "pulse": return <CombinedPulseList ... />`
5. 保留 `CombinedPulseList.tsx`，由独立页面或后续复用决定是否继续使用；本次不做无关删除。

### 4. 桌面与移动导航新增“战壕”

1. 修改 `apps/web/src/components/NewAppLayout.tsx` 的 `navItemsConfig`。
2. 在 `discover` 后面插入 Pulse 导航项：
   - `key: "pulse"`
   - `href: "/pulse"`
   - `icon: <PulseIcon width={20} height={20} />`
3. `PulseIcon` 必须从 `@liberfi.io/ui` 引入，该包在本地联调时会通过 `../react-sdk/packages/ui/src/icons/PulseIcon.tsx` 提供图标。
4. 生成 `navItems` 时根据当前链过滤：
   - 当 `chain === Chain.SOLANA` 时保留 `pulse`
   - 当 `chain === Chain.ETHEREUM` 或 `chain === Chain.BINANCE` 时过滤掉 `pulse`
5. 由于 `Scaffold` 的 `footer={<ScaffoldFooter navItems={navItems} />}` 同时使用 `navItems`，该过滤需要同时影响桌面 header nav 和移动 footer nav。
6. 确认顺序为：
   - 发现
   - 战壕
   - 永续合约
   - 预测
   - 资产

### 5. Pulse 页面直接访问与链切换兜底

1. 修改 `apps/web/src/components/pulse/PulsePage.tsx`。
2. 使用 `useCurrentChain()` 获取当前链后判断是否支持 Pulse。
3. 当当前链为 `Chain.ETHEREUM` 或 `Chain.BINANCE` 时，不渲染 Pulse 列表，并执行跳转：
   - 推荐跳到发现页 `/`
   - 保留当前 `?chain=<slug>` 查询参数由现有 `useChainAwareRouter` 或链同步逻辑处理
4. 若实现跳转需要避免首屏闪烁，可以在不支持链时先返回 `null`。
5. 保持 `useSetBottomNavigationBarActiveKey("pulse")` 仅在支持链场景生效，避免隐藏导航时仍出现错误 active 状态。

### 6. 文案更新

1. 修改 `packages/locales/src/zh.ts`：
   - `extend.nav.pulse`: `"战壕"`
   - 如继续保留旧 header/footer 文案，也同步：
     - `extend.header.pulse`: `"战壕"`
     - `extend.footer.pulse`: `"战壕"`
     - `extend.pulse.title`: `"战壕"`
2. 修改 `packages/locales/locales/zh/translation.json`，保持与 `packages/locales/src/zh.ts` 一致。
3. 修改英文文件：
   - `packages/locales/src/en.ts`
   - `packages/locales/locales/en/translation.json`
4. 英文建议保留 `"Pulse"`，除非产品要求英文也叫 `"Trenches"`。

### 7. 检查旧布局导航是否仍需兼容

1. 检查 `packages/ui-dex/src/components/layout/header/HeaderLinks.tsx`。
2. 如果旧布局仍可能被访问，更新旧桌面导航：
   - 将 Pulse 放到发现/首页后面
   - 使用相同的支持链判断隐藏 ETH/BSC 的 Pulse
3. 检查 `packages/ui-dex/src/components/layout/BottomNavigationBar.tsx`。
4. 如果旧移动底部导航仍可能被访问，更新旧移动导航：
   - 将 Pulse 放到发现/首页后面
   - 继续使用 `PulseIcon`
   - ETH/BSC 时过滤掉 Pulse
5. 如果确认旧布局不会参与当前入口，本步骤只做最小兼容，不重构旧导航结构。

### 8. 本地验证

1. 优先使用已启动的 dev server 验证；不要额外启动新 dev server。
2. 如果没有已启动服务，执行：
   ```bash
   pnpm --filter @liberfi/web dev
   ```
3. 如端口被占用，先询问用户是启新端口还是释放原端口，不擅自改端口或 kill 进程。
4. 浏览器验证：
   - Solana 链，桌面 header 中“发现”后出现“战壕”
   - Solana 链，移动 footer 中“发现”后出现“战壕”，图标为 `PulseIcon`
   - 点击“战壕”进入 `/pulse`
   - `/pulse` 页面展示三列或移动 tab：`new`、`final_stretch`、`migrated`
   - 从 `/pulse` 点击 token 可进入对应 token detail
   - 切换到 ETH 后，“战壕”从桌面 header 和移动 footer 消失
   - 切换到 BSC 后，“战壕”从桌面 header 和移动 footer 消失
   - 在 ETH/BSC 直接访问 `/pulse` 时跳回发现页或不展示 Pulse 内容
   - 首页不再出现 Pulse tab
5. 代码检查：
   ```bash
   rg -n "pulse|Pulse|战壕" apps/web packages/locales packages/ui-dex packages/core
   ```
6. 类型或 lint 验证按项目现有脚本选择：
   ```bash
   pnpm --filter @liberfi/web lint
   ```
   如果项目没有可用 lint 脚本，再运行对应 TypeScript 检查脚本。

## 风险与注意事项

- `ScaffoldFooter` 使用同一份 `navItems`，所以只要在 `NewAppLayout` 统一过滤，桌面和移动新导航会一起生效。
- 当前首页的 `CombinedTokenList` 只在 Solana tabs 中包含 Pulse；移除后要确认 `activeTab` 在链切换时不会残留为已删除的 `"pulse"`。
- `PulsePage` 使用的列表组件来自 `@liberfi.io/ui-tokens`，ETH/BSC 没有数据时必须通过页面级保护阻止进入，避免空接口或异常状态暴露给用户。
- 本次只调整导航和页面拆分，不修改 Pulse 列表内部业务逻辑、不改交易按钮行为、不改 SDK API。
