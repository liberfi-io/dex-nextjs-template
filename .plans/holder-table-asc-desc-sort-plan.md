# 持有者表格 asc/desc 排序修改计划

## 目标

- `apps/web/src/components/page/token-detail/bottom-tables/BottomHoldersTable.tsx` 中以下列支持升序 / 降序切换：
  - 最后活跃
  - 钱包创建时间
  - 总买入
  - 总卖出
  - 未实现利润
  - 总利润
  - 持仓占比
- 总买入 / 均价列的排序图标显示在“总买入”旁边。
- 总卖出 / 均价列的排序图标显示在“总卖出”旁边。
- 资金来源 / 转入金额列隐藏。
- 如 `../react-sdk` 当前 hook / client 未透传排序方向或缺少排序字段，修改 `../react-sdk` 的相关实现。

## 当前确认

- 当前 `BottomHoldersTable.tsx` 只维护单字段 `sortBy`，点击同一列不会切换方向。
- 当前页面接入的是 `@liberfi.io/ui-tokens` 的 `useTokenHoldersListScript`，该 hook 只传 `{ chain, address, cursor, limit, sortBy }`。
- `../react-sdk/packages/react/src/hooks/useTokenHoldersQuery.ts` 的 query key 已包含 `direction`，但该字段来自 cursor 分页方向，语义是 `next | prev`，不能直接当作排序方向使用。
- `@chainstream-io/sdk@2.1.12` 的 holder params 类型中看到 `direction?: PageDirection`，`PageDirection` 是 `next | prev`；暂未在类型文件中看到 holder 专属 `sortDirection?: asc | desc`。
- 因此必须先用真实请求或 SDK 调用验证后端 holder 接口的排序方向参数名，再落地改动。候选参数名按优先级验证：
  - `sortDirection=asc|desc`
  - `sort=asc|desc`
  - `direction=asc|desc`

## 修改步骤

### 1. 验证 Chainstream holder 排序方向参数

1. 在 `../react-sdk` 内定位 `ChainStreamClient` 初始化所需环境变量，确认是否能直接调用 token holders 接口。
2. 对同一个 Solana token 调用 holder 列表接口，分别测试：
   - `sortBy=holdingUsd` + `sortDirection=asc`
   - `sortBy=holdingUsd` + `sortDirection=desc`
   - 如果无效，再测试 `sort=asc|desc` 和 `direction=asc|desc`
3. 判断有效标准：
   - 返回 200。
   - 同一 `sortBy` 下 asc 和 desc 的第一页数据顺序明显相反，至少首 5 行排序值方向一致。
4. 记录最终可用参数名。
5. 如果 SDK 类型暂未声明该参数，但后端可用，后续在 client wrapper 中用最小类型扩展或局部类型断言透传，不改无关模块。

### 2. 扩展 `../react-sdk` 类型

文件：`../react-sdk/packages/types/src/api/token-options.ts`

1. 新增或复用排序方向类型：
   - `export type SortDirection = "asc" | "desc"` 如果已有公共类型则复用。
2. 在 `GetTokenHoldersOptions` 增加：
   - `sortDirection?: "asc" | "desc"`
3. 扩展 `TokenHoldersSortBy`：
   - 保留现有 `holdingUsd`
   - 保留现有 `lastActiveAt`
   - 保留现有 `realizedPnl`
   - 保留现有 `buyVolume`
   - 保留现有 `sellVolume`
   - 新增 `createdAt`
   - 新增 `unrealizedPnl`
4. 如果 Chainstream SDK 的 holder sort enum 使用不同字段名，则在 types 中继续使用业务语义字段，映射放在 client 层。

### 3. 扩展 `../react-sdk` client 透传

文件：`../react-sdk/packages/client/src/client.ts`

1. 在 `getTokenHolders()` 中把 `options.sortDirection` 透传给底层 SDK。
2. 根据步骤 1 的验证结果选择参数名：
   - 如果 SDK / 后端接受 `sortDirection`，传 `sortDirection: options?.sortDirection`
   - 如果后端只接受其他参数名，用局部对象类型断言构造 params，不污染公共类型。
3. 扩展 `sortBy` 映射：
   - `lastActiveAt` -> `HolderSortBy.lastActiveAt`
   - `holdingUsd` -> `HolderSortBy.holdingUsd`
   - `realizedPnl` -> SDK 对应字段，优先 `HolderSortBy.realizedPnl`，若 SDK 实际为 `profit` 则映射为 `HolderSortBy.profit`
   - `buyVolume` -> `HolderSortBy.buyVolume`
   - `sellVolume` -> `HolderSortBy.sellVolume`
   - `createdAt` -> SDK 对应字段，验证后填写
   - `unrealizedPnl` -> SDK 对应字段，验证后填写
4. 如果 SDK 类型没有 `createdAt` / `unrealizedPnl` enum，但后端支持字符串，使用局部映射字符串并用类型断言传入。

### 4. 扩展 `../react-sdk` React hook query key

文件：`../react-sdk/packages/react/src/hooks/useTokenHoldersQuery.ts`

1. 在 query key 中加入 `sortDirection`：
   - `toKeySegment(p.sortDirection)`
2. 保留原有 `direction` 作为 cursor 分页方向，不改名、不复用。
3. fetch 入参继续透传给 `client.getTokenHolders(chain, address, options)`。

### 5. 扩展 `../react-sdk` holders script hook 状态

文件：`../react-sdk/packages/ui-tokens/src/components/token-detail/token-holders-list/token-holders-list.script.ts`

1. 新增类型：
   - `type TokenHoldersListSortDirection = "asc" | "desc"`
2. 在 `UseTokenHoldersListScriptParams` 增加：
   - `initialSortDirection?: TokenHoldersListSortDirection`
3. 在 `UseTokenHoldersListScriptResult` 增加：
   - `sortDirection: TokenHoldersListSortDirection`
   - `setSort: (sortBy: TokenHoldersListSortBy) => void`
   - 可保留 `setSortBy` 兼容旧调用，但新表格使用 `setSort`
4. 状态逻辑：
   - 初始 `sortBy = "holdingUsd"`
   - 初始 `sortDirection = "desc"`
   - 点击当前 `sortBy` 时，`desc -> asc`，`asc -> desc`
   - 点击新的 `sortBy` 时，设置为该字段并默认 `desc`
   - 每次 `sortBy` 或 `sortDirection` 变化都清空 `cursor` 和 `pages`
5. `queryParams` 增加 `sortDirection`：
   - `{ chain, address, cursor, limit, sortBy, sortDirection }`

### 6. 修改本仓库持有者表格列定义

文件：`apps/web/src/components/page/token-detail/bottom-tables/BottomHoldersTable.tsx`

1. 扩展本地 `HolderSortBy`：
   - `lastActiveAt`
   - `createdAt`
   - `buyVolume`
   - `sellVolume`
   - `unrealizedPnl`
   - `realizedPnl`
   - `holdingUsd`
2. 新增本地排序方向类型：
   - `type HolderSortDirection = "asc" | "desc"`
3. 修改 `HOLDER_SORT_BY_COLUMN`：
   - `last_active: "lastActiveAt"`
   - `first_held: "createdAt"`
   - `total_buy: "buyVolume"`
   - `total_sell: "sellVolume"`
   - `unrealized_pnl: "unrealizedPnl"`
   - `total_profit: "realizedPnl"`
   - `holdings: "holdingUsd"`
4. 从 `useTokenHoldersListScript()` 读取：
   - `sortBy`
   - `sortDirection`
   - `setSort`
5. 若 `../react-sdk` 为兼容旧 API 暂只暴露 `setSortBy` / `setSortDirection`，则在本组件内包装成 `handleSortChange(sortBy)`。

### 7. 隐藏资金来源 / 转入金额列

文件：`apps/web/src/components/page/token-detail/bottom-tables/BottomHoldersTable.tsx`

1. 从 `HOLDER_COLUMNS` 删除或条件隐藏：
   - `key: "funding"`
2. 从 `GRID_TEMPLATE_COLUMNS` 删除最后一个 `minmax(150px, 150fr)`。
3. 从 `HolderRow` 删除最后一个 `<FundingCell holder={holder} />`。
4. `FundingCell` 组件如果无其他引用，删除整个函数。
5. 检查 `TABLE_WIDTH`：
   - 当前 1360。
   - 删除资金来源列后建议调整为 1210 或按列宽总和重算，避免空白横向宽度。

### 8. 修复复合表头排序图标位置

文件：`apps/web/src/components/page/token-detail/bottom-tables/BottomHoldersTable.tsx`

1. 当前只有 `holdings` 使用 `sortBeforeSlash`。
2. 将 `total_buy`、`total_sell` 也配置为在 slash 前显示图标。
3. 目标显示：
   - `总买入 ▼ / 均价`
   - `总卖出 ▼ / 均价`
4. 保持 `holdings` 现有行为：
   - `持仓占比 ▼ / USD`
5. `SortLabelWithIconBeforeSlash` 需要接收方向并显示 asc / desc 状态。

### 9. 修改排序图标状态

文件：`apps/web/src/components/page/token-detail/bottom-tables/BottomHoldersTable.tsx`

1. `HolderSortHeader` props 增加：
   - `activeSortDirection?: HolderSortDirection`
2. `SortArrow` props 增加：
   - `direction?: HolderSortDirection`
3. 图标表现建议：
   - active + `desc`：保留当前向下三角
   - active + `asc`：三角旋转 180 度
   - inactive：灰色向下三角
4. `aria-pressed` 保留；补充 `aria-sort` 如结构允许：
   - active desc -> `descending`
   - active asc -> `ascending`

### 10. 测试与验证

1. 在 `../react-sdk` 运行类型检查或相关测试：
   - `pnpm --filter @liberfi.io/types build`
   - `pnpm --filter @liberfi.io/client test`
   - `pnpm --filter @liberfi.io/react test`
   - `pnpm --filter @liberfi.io/ui-tokens build`
2. 在当前仓库运行本地开发验证，不做 production build：
   - 如果 dev server 已经运行，直接复用。
   - 如果没运行，执行 `pnpm --filter @liberfi/web dev`。
   - 如果端口被占用，先询问用户，不自行换端口或 kill 进程。
3. 浏览器验证：
   - 打开 token detail 页面。
   - 点击“最后活跃”两次，确认请求参数 asc / desc 切换，列表重置并重新加载。
   - 点击“钱包创建时间”两次，确认请求参数 asc / desc 切换。
   - 点击“总买入”两次，确认图标在“总买入”旁边，参数 asc / desc 切换。
   - 点击“总卖出”两次，确认图标在“总卖出”旁边，参数 asc / desc 切换。
   - 点击“未实现利润”两次，确认参数 asc / desc 切换。
   - 点击“总利润”两次，确认参数 asc / desc 切换。
   - 点击“持仓占比”两次，确认参数 asc / desc 切换。
   - 检查资金来源 / 转入金额列不再显示，表头和每行单元格数量对齐。
4. 使用 `rg` 复查：
   - `rg "FundingCell|funding|historyTransferIn" apps/web/src/components/page/token-detail/bottom-tables/BottomHoldersTable.tsx`
   - 确认没有残留无用列渲染。
5. 检查 diff：
   - 只包含 holder 排序、排序方向透传、表格列隐藏和必要测试改动。

## 风险点

- `direction` 当前在项目类型里是 cursor 翻页方向，不能直接复用为排序方向，除非真实后端验证确认 holder 接口就是用 `direction=asc|desc`。
- `createdAt` 和 `unrealizedPnl` 的底层 `sortBy` 字段名需要真实验证；如果 Chainstream SDK 类型未暴露但后端支持，需要最小类型断言。
- 当前 `react-sdk` workspace 可能通过本仓库 local SDK alias 使用，修改 `../react-sdk` 后需要确认 dev server 热更新是否覆盖相关 package；如不覆盖，需要按本地联调规则启动 `../react-sdk` 的 watch。
