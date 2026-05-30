# Pulse 列表筛选支持计划

## 目标

为 Pulse 页面三类列表（`new`、`final_stretch`、`migrated`）增加与发现页一致的筛选入口和筛选面板，并把筛选条件传给同级 `../react-sdk` 的 Pulse list widget，在 SDK 内对实时列表数据做前端筛选。

## 范围

- 当前仓库：`dex-nextjs-template`
  - `apps/web/src/components/pulse/PulsePage.tsx`
  - `apps/web/src/states/pulse.ts`
- 同级 SDK：`../react-sdk`
  - `packages/ui-tokens/src/components/pulse/pulse-new-list.widget.tsx`
  - `packages/ui-tokens/src/components/pulse/pulse-final-stretch-list.widget.tsx`
  - `packages/ui-tokens/src/components/pulse/pulse-migrated-list.widget.tsx`
  - `packages/ui-tokens/src/components/pulse/pulse-new-list.script.ts`
  - `packages/ui-tokens/src/components/pulse/pulse-final-stretch-list.script.ts`
  - `packages/ui-tokens/src/components/pulse/pulse-migrated-list.script.ts`
  - 可能补充 `packages/ui-tokens/src/components/pulse/index.tsx`

## 已确认现状

- 发现页筛选入口当前使用 `@liberfi.io/ui-tokens` 的 `TokenListFilterWidget`。
- `TokenListFilterWidget` 内部已按屏幕宽度自动选择：
  - 桌面端：`TokenListFilterPopover`
  - 移动端：`TokenListFilterModal`
- 筛选面板内容来自 `TokenListFilter`，包含协议、关键词、排除关键词、统计字段等，与发现页一致。
- 发现页热门、美股列表在 SDK script 层通过 `filterTokens(tokens, filters)` 做本地筛选。
- Pulse 页面桌面端当前通过 `renderHeaderExtra` 注入快捷金额输入。
- Pulse 页面移动端当前在列表上方单独渲染快捷金额输入，移动列表本身使用 `hideHeader`。
- Pulse 配置当前存在 `pulseSettingsAtom`，按列表类型保存 `instant_buy` 设置。

## 设计方案

### 1. 扩展 Pulse 设置结构

修改 `apps/web/src/states/pulse.ts`：

- 引入 `TokenListFiltersType` 类型：
  - `import type { TokenListFiltersType } from "@liberfi.io/ui-tokens";`
- 扩展 `PulseListSettings`：
  - 保留现有 `instant_buy?: { preset?: number; amount?: number }`
  - 新增 `filters?: TokenListFiltersType`
- 继续按 `new`、`final_stretch`、`migrated` 三个 key 分别保存筛选条件。

预期结构：

```ts
export type PulseListSettings = {
  instant_buy?: {
    preset?: number;
    amount?: number;
  };
  filters?: TokenListFiltersType;
};
```

### 2. 在 Pulse 页面接入筛选状态

修改 `apps/web/src/components/pulse/PulsePage.tsx`：

- 从 `jotai` 引入 `useAtom`。
- 引入 `cloneDeep` 或沿用当前项目中已使用的不可变更新方式。
- 从 `@liberfi.io/ui-tokens` 引入：
  - `TokenListFilterWidget`
  - `TokenListFiltersType`
- 从 `@liberfi.io/types` 引入 `SOLANA_TOKEN_PROTOCOLS`，用于 Solana 协议筛选选项。
- 读取并更新 `pulseSettingsAtom`。
- 增加工具函数或 callback：
  - `getPulseFilters(type: PulseListType): TokenListFiltersType | undefined`
  - `setPulseFilters(type: PulseListType, filters?: TokenListFiltersType): void`

筛选条件更新逻辑：

```ts
setPulseSettings((prev) => {
  const next = cloneDeep(prev);
  const settings = next[type] ?? {};
  settings.filters = filters;
  next[type] = settings;
  return next;
});
```

### 3. 桌面端表头注入筛选按钮

在 `PulsePage.tsx` 中替换三个 `renderHeaderExtra`：

- 当前只渲染：
  - `<PulseInstantBuyAmountInput type="new" size="sm" className="max-w-55" />`
- 调整为同一个容器内先渲染快捷金额输入，再渲染筛选按钮：
  - `<PulseInstantBuyAmountInput ... />`
  - `<TokenListFilterWidget ... />`

每个列表使用独立 type：

- `new` 列表传 `filters={pulseSettings.new?.filters}`
- `final_stretch` 列表传 `filters={pulseSettings.final_stretch?.filters}`
- `migrated` 列表传 `filters={pulseSettings.migrated?.filters}`

`TokenListFilterWidget` 参数建议：

- `resolution="24h"`：Pulse 没有独立 timeframe，使用发现页默认 24h 统计字段。
- `protocols={chainId === Chain.SOLANA ? SOLANA_TOKEN_PROTOCOLS : undefined}`：保持与发现页当前链逻辑一致。
- `filters={...}`
- `onFiltersChange={(filters) => handlePulseFiltersChange(type, filters)}`
- `popoverPlacement="bottom-end"`

### 4. 移动端列表上方增加筛选按钮

修改 `PulsePage.tsx` 中移动端快捷金额输入区域：

- 当前区域包含暂停图标和 `<PulseInstantBuyAmountInput type={type} ... />`
- 在快捷金额输入右侧增加：
  - `<TokenListFilterWidget ... />`

排列要求：

- 保持 `flex justify-end items-center gap-2`
- 顺序为：
  1. 暂停图标
  2. 快捷金额输入
  3. 筛选按钮

移动端 `TokenListFilterWidget` 会自动渲染 `TokenListFilterModal`，交互与发现页一致。

### 5. 把筛选条件传给桌面 Pulse widgets

修改 `PulsePage.tsx` 的三个桌面 widget 调用：

- `PulseNewListWidget` 增加：
  - `filters={pulseSettings.new?.filters}`
- `PulseFinalStretchListWidget` 增加：
  - `filters={pulseSettings.final_stretch?.filters}`
- `PulseMigratedListWidget` 增加：
  - `filters={pulseSettings.migrated?.filters}`

### 6. 把筛选条件传给移动 Pulse list scripts

修改 `MobilePulseListProps`：

- 增加：
  - `filters?: TokenListFiltersType`

在 `MobilePulseList` 调用处：

- 传当前 tab 的筛选条件：
  - `filters={pulseSettings[type]?.filters}`

在三个移动列表组件中：

- `usePulseNewListScript({ chain, isPaused, filters })`
- `usePulseFinalStretchListScript({ chain, isPaused, filters })`
- `usePulseMigratedListScript({ chain, isPaused, filters })`

### 7. SDK Pulse widget 支持 filters 参数

在 `../react-sdk/packages/ui-tokens/src/components/pulse/*.widget.tsx` 中：

- 引入：
  - `import type { TokenListFiltersType } from "../token-list/token-list-filter.ui";`
- 三个 props 接口分别新增：
  - `filters?: TokenListFiltersType;`
- 调用对应 script 时传入：
  - `usePulseNewListScript({ chain, isPaused, filters })`
  - `usePulseFinalStretchListScript({ chain, isPaused, filters })`
  - `usePulseMigratedListScript({ chain, isPaused, filters })`

### 8. SDK Pulse scripts 实现前端筛选

在 `../react-sdk/packages/ui-tokens/src/components/pulse/*.script.ts` 中：

- 引入：
  - `import { filterTokens } from "../token-list/filter-tokens";`
  - `import type { TokenListFiltersType } from "../token-list/token-list-filter.ui";`
- 三个 params 类型新增：
  - `filters?: TokenListFiltersType;`
- 返回前增加 memo：

```ts
const filteredTokens = useMemo(
  () => filterTokens(tokens, filters),
  [tokens, filters],
);

return { tokens: filteredTokens, isLoading };
```

注意：

- `new` 列表仍先按 `createdAt` 排序和 `MAX_ITEMS` 限制，再筛选；行为与当前实时列表容量保持一致。
- `final_stretch` 列表仍先按 `migrateProgress` 排序，再筛选。
- `migrated` 列表保持当前插入顺序，再筛选。
- 不改变 API 请求参数，不做服务端筛选。

### 9. 导出检查

检查 `../react-sdk/packages/ui-tokens/src/components/pulse/index.tsx` 和包总出口：

- 确认三个 Pulse widget、script 已正常导出。
- `TokenListFiltersType` 已从 token-list 相关出口对外可用；如果当前 `@liberfi.io/ui-tokens` 顶层已导出，则无需新增。
- 如果 Pulse 页面无法从 `@liberfi.io/ui-tokens` 引入 `TokenListFiltersType` 或 `TokenListFilterWidget`，补充相应 barrel export。

### 10. 本地联调配置

按项目规则使用本地 SDK：

1. 确认当前仓库与 `react-sdk` 同级。
2. 在 `../react-sdk` 执行：
   ```bash
   pnpm install
   ```
3. 仅当 dev server 报 dist-only subpath 或产物缺失时，在 `../react-sdk` 执行：
   ```bash
   pnpm build
   ```
4. 确认当前仓库 `apps/web/.env.local` 存在：
   ```env
   USE_LOCAL_SDK=true
   LOCAL_SDK_ROOT=../../../react-sdk
   ```
5. 在当前仓库执行：
   ```bash
   pnpm install
   pnpm --filter @liberfi/web dev
   ```
6. 如果端口被占用，先询问用户选择：
   - 启动新端口
   - kill 占用端口释放原端口
7. 如 SDK 热更新异常或涉及生成产物，再在 `../react-sdk` 执行：
   ```bash
   pnpm dev:watch
   ```

### 11. 验证步骤

#### 静态检查

在 `../react-sdk`：

```bash
pnpm --filter @liberfi.io/ui-tokens build
```

在当前仓库：

```bash
pnpm --filter @liberfi/web lint
```

如果当前仓库没有可用 lint filter 或 lint 依赖不完整，记录失败原因，继续用 dev server 验证。

#### 本地页面验证

通过 `pnpm --filter @liberfi/web dev` 启动或复用现有 dev server 后验证：

1. 打开 Pulse 页面。
2. 桌面端宽度：
   - 三个列表表头都显示快捷金额输入。
   - 每个快捷金额输入右侧显示筛选按钮。
   - 点击筛选按钮后以 popover 展示筛选面板。
   - 面板内容与发现页一致。
   - 设置关键词、排除关键词、统计字段后点击 Apply，当前列表数据即时筛选。
   - New / Final Stretch / Migrated 三列筛选条件互不串扰。
   - 切换链后筛选按钮仍可打开，列表仍可渲染。
3. 移动端宽度：
   - Pulse tab 下方快捷金额输入右侧显示筛选按钮。
   - 点击筛选按钮后以移动端 modal/action 面板展示。
   - 面板内容与发现页一致。
   - 切换 `new`、`final_stretch`、`migrated` tab 后显示对应 tab 的筛选状态。
   - 设置筛选后当前 tab 列表即时筛选。
4. 持久化验证：
   - 刷新页面后，`pulse.settings` 中各 tab 的 `filters` 仍保留。
   - 清空筛选后，对应 tab 的筛选激活态消失。

### 12. 风险与注意点

- `TokenListFilterWidget` 的字段面板可能包含部分 Pulse token 数据不稳定或缺失的字段；`filterTokens` 当前对缺失字段会判定为不匹配，这是热门、美股列表已有行为。
- `new` 列表先限制 `MAX_ITEMS = 80` 再筛选，筛选后结果可能少于 80 条；本计划不改变实时列表容量策略。
- 筛选状态存入现有 `pulse.settings`，会改变 localStorage schema，但为向后兼容新增字段，旧数据可继续读取。
- 由于当前需求要求与发现页筛选交互和内容一致，优先复用 SDK 现有 `TokenListFilterWidget`，不在当前仓库重复实现筛选面板。
