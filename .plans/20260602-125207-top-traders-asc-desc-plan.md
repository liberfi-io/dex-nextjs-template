# 交易者列表 asc / desc 排序修改计划

## 目标

让 `apps/web/src/components/page/token-detail/bottom-tables/BottomTopTradersTable.tsx` 底部交易者列表中的以下列都支持双向排序：

- 最后活跃：`lastActiveAt`
- 总买入：`buyVolume`
- 总卖出：`sellVolume`
- 已实现盈亏：需要从 Chainstream SDK 确认对应 sort enum
- 总盈亏：需要从 Chainstream SDK 确认对应 sort enum

同时保持分页 cursor 方向和排序方向互不混淆。

## 当前已知链路

数据链路如下：

1. `apps/web/src/components/page/token-detail/bottom-tables/BottomTopTradersTable.tsx`
2. `../react-sdk/packages/ui-tokens/src/components/token-detail/token-top-traders-list/token-top-traders-list.script.ts`
3. `../react-sdk/packages/react/src/hooks/useTokenTopTradersQuery.ts`
4. `../react-sdk/packages/client/src/client.ts`
5. `@chainstream-io/sdk` 的 token top traders 查询接口

当前本地表格 UI 是当前仓库实现，数据 hook 和 API 查询能力来自 `../react-sdk`。

## 第一步：核验 Chainstream SDK 支持的参数

在 `../react-sdk` 中执行以下检查：

```bash
rg "GetTokenTopTradersParams|TraderSortBy|SortDirection|sortDirection|sortOrder|direction" node_modules/.pnpm -g '*.d.ts' -g '*.js'
rg "\"profit\"|\"buyVolume\"|\"sellVolume\"|\"lastActiveAt\"|\"netflowUsd\"" node_modules/.pnpm/@chainstream-io+sdk* -g '*.d.ts' -g '*.js'
```

重点确认：

- asc / desc 参数的真实字段名：
  - 可能是 `sortDirection`
  - 可能是 `sortOrder`
  - 也可能是新版 SDK 复用了 `direction`
- asc / desc 参数的类型：
  - 是否是 `"asc" | "desc"`
  - 是否是 enum 或常量对象
- `TraderSortBy` 的完整枚举：
  - `profit`
  - `buyVolume`
  - `sellVolume`
  - `lastActiveAt`
  - `netflowUsd`
  - 是否新增了区分“已实现盈亏”和“总盈亏”的字段
- `direction` 是否仍表示分页方向：
  - 旧类型里 `direction?: "next" | "prev"` 更像 cursor 翻页方向
  - 排序方向不要直接复用当前 public API 的 `direction`，避免和分页语义冲突

如果当前安装的 `@chainstream-io/sdk` 没有 asc / desc 类型支持：

1. 到官方 npm registry 核验最新版本：
   ```bash
   npm view @chainstream-io/sdk version --registry=https://registry.npmjs.org/
   npm view @chainstream-io/sdk versions --json --registry=https://registry.npmjs.org/
   ```
2. 更新 `../react-sdk` 中实际依赖该包的 `package.json`。
3. 在 `../react-sdk` 执行：
   ```bash
   pnpm install
   ```
4. 重新执行本步骤的 `rg` 检查，确认新类型。

## 第二步：扩展 react-sdk 类型

修改：

```text
../react-sdk/packages/types/src/api/token-options.ts
```

建议新增排序方向类型：

```ts
export type TokenTopTradersSortDirection = "asc" | "desc";
```

扩展 `GetTokenTopTradersOptions`：

```ts
export interface GetTokenTopTradersOptions extends CursorListOptions {
  sortBy?: TokenTopTradersSortBy;
  sortDirection?: TokenTopTradersSortDirection;
  tag?: string;
}
```

注意事项：

- 保留 `CursorListOptions.direction?: "next" | "prev"` 的分页语义。
- 不要把 `direction` 改成 asc / desc，避免破坏已有分页调用方。
- `sortDirection` 必须是 optional，避免破坏旧调用方。

如果 Chainstream SDK 的真实字段名不是 `sortDirection`，仍建议 react-sdk public API 使用 `sortDirection`，在 client 层再映射到 Chainstream SDK 的真实字段名。

## 第三步：更新 react hook query key

修改：

```text
../react-sdk/packages/react/src/hooks/useTokenTopTradersQuery.ts
```

把 `sortDirection` 放进 query key，避免同一排序字段下 asc / desc 复用旧缓存：

```ts
toKeySegment(p.sortDirection),
```

确认 fetch 逻辑把 `sortDirection` 透传到：

```ts
client.getTokenTopTraders(tokenAddress, options)
```

校验点：

- 切换 `sortBy` 会重新请求。
- 切换 `sortDirection` 也会重新请求。
- `cursor` 变化仍只影响分页请求。

## 第四步：更新 ui-tokens 脚本状态

修改：

```text
../react-sdk/packages/ui-tokens/src/components/token-detail/token-top-traders-list/token-top-traders-list.script.ts
```

新增状态：

```ts
const [sortDirection, setSortDirection] =
  useState<TokenTopTradersSortDirection>("desc");
```

查询参数加入：

```ts
sortDirection,
```

对外返回值增加：

```ts
sortDirection,
setSortDirection,
```

建议增加一个组合方法，便于 UI 一次性切换字段和方向：

```ts
setSort: (sortBy: TokenTopTradersSortBy, direction?: TokenTopTradersSortDirection) => void
```

行为要求：

- 点击新字段：默认使用 `desc`。
- 点击当前字段：在 `desc` 和 `asc` 之间切换。
- 改变 `sortBy` 或 `sortDirection` 时清空分页游标和历史页，避免排序后混入旧页数据。
- 保留原有 `setSortBy`，保证现有调用方不报错；可以让它内部调用 `setSort(sortBy)`。

## 第五步：更新 react-sdk client 参数映射

修改：

```text
../react-sdk/packages/client/src/client.ts
```

在 `getTokenTopTraders` 中把 react-sdk 的 `sortDirection` 映射到 Chainstream SDK 的真实参数。

示例结构：

```ts
const params = {
  cursor: options?.cursor,
  limit: options?.limit,
  direction: options?.direction,
  sortBy: options?.sortBy ? mapTraderSortBy(options.sortBy) : undefined,
  tag: options?.tag,
};
```

需要根据第一步核验结果调整为以下其中一种：

```ts
sortDirection: options?.sortDirection
```

或：

```ts
sortOrder: options?.sortDirection
```

或 SDK 如果确实使用 `direction` 表示排序方向，则必须先确认分页方向的新字段名，再做拆分映射，不能直接把 `options.direction` 覆盖为 asc / desc。

映射函数要求：

- 保留现有字段：
  - `profit`
  - `buyVolume`
  - `sellVolume`
  - `lastActiveAt`
  - `netflowUsd`
- 如果新版 SDK 新增“已实现盈亏”和“总盈亏”的独立 sort enum，需要同步扩展 `TokenTopTradersSortBy` 和 mapper。

## 第六步：更新本地 BottomTopTradersTable 交互

修改：

```text
apps/web/src/components/page/token-detail/bottom-tables/BottomTopTradersTable.tsx
```

需要调整的点：

1. 从 `useTokenTopTradersListScript` 读取：
   ```ts
   sortBy
   sortDirection
   setSort
   ```
2. 更新 `TOP_TRADER_SORT_BY_COLUMN`：
   ```ts
   const TOP_TRADER_SORT_BY_COLUMN = {
     activity: "lastActiveAt",
     total_buy: "buyVolume",
     total_sell: "sellVolume",
     realized_pnl: "<SDK 确认后的已实现盈亏 sortBy>",
     total_pnl: "<SDK 确认后的总盈亏 sortBy>",
   } satisfies Partial<Record<BottomTableColumnId, TokenTopTradersSortBy>>;
   ```
3. 如果 Chainstream SDK 仍只有一个 `profit` 字段，则必须先确认它代表“已实现盈亏”还是“总盈亏”：
   - 若 `profit` 是总盈亏，则 `total_pnl -> "profit"`。
   - 若 `profit` 是已实现盈亏，则 `realized_pnl -> "profit"`。
   - 另一列如果没有独立 enum，不能伪造 sortBy，需要记录为 SDK 不支持并反馈。
4. 更新 `TopTraderSortHeader` props：
   ```ts
   activeSortBy
   activeSortDirection
   onSortChange
   ```
5. 点击逻辑：
   ```ts
   const nextDirection =
     activeSortBy === sortBy && activeSortDirection === "desc" ? "asc" : "desc";
   onSortChange(sortBy, nextDirection);
   ```
6. 图标展示：
   - 当前排序字段展示激活态。
   - `desc` 展示向下排序态。
   - `asc` 展示向上排序态。
   - 非当前排序字段保持弱提示态。
7. 确认以下五个表头都可点击：
   - `activity`
   - `total_buy`
   - `total_sell`
   - `realized_pnl`
   - `total_pnl`

## 第七步：兼容性检查

需要确认以下调用方没有被破坏：

```bash
rg "useTokenTopTradersListScript|setSortBy|sortBy|GetTokenTopTradersOptions|TokenTopTradersSortBy" ../react-sdk apps/web
```

检查重点：

- 旧代码只使用 `setSortBy(sortBy)` 时仍可运行。
- 新增 `sortDirection` 不要求旧调用方传值。
- query key 加入 `sortDirection` 后不会影响其它 token detail query。
- cursor 分页 `direction` 仍保留 `"next" | "prev"`。

## 第八步：本地验证步骤

如果只改当前仓库代码，不执行 production build。按项目规则使用本地 dev 调试。

如果涉及 `../react-sdk` 类型或源码修改，先在 `../react-sdk` 做最小验证：

```bash
pnpm --filter @liberfi.io/types build
pnpm --filter @liberfi.io/client build
pnpm --filter @liberfi.io/react build
pnpm --filter @liberfi.io/ui-tokens build
```

如果这些 package 没有 build 脚本，则改用对应仓库已有的 typecheck 或测试脚本。

当前仓库验证：

1. 检查是否已有 web dev server 在运行。
2. 若已有，直接使用现有服务。
3. 若没有，启动：
   ```bash
   pnpm --filter @liberfi/web dev
   ```
4. 如果端口被占用，先询问用户选择：
   - 释放当前端口
   - 使用新端口
5. 打开 token detail 页面。
6. 对交易者列表执行以下操作：
   - 点击“最后活跃”一次，确认请求 `sortBy=lastActiveAt` 且方向为 `desc`。
   - 再点“最后活跃”，确认方向变为 `asc`。
   - 对“总买入”“总卖出”“已实现盈亏”“总盈亏”重复上述检查。
   - 切换排序字段后确认 cursor 清空，列表从第一页重新加载。
   - 滚动加载下一页，确认分页方向没有被 asc / desc 覆盖。

## 第九步：最终验收标准

完成后应满足：

- 五个目标列都支持 asc / desc。
- UI 表头能明确显示当前排序字段和方向。
- 请求参数同时包含正确的 sort field 和 sort direction。
- 切换排序方向会重新请求，不复用旧缓存。
- 分页 cursor 方向仍正常。
- 没有把 `direction?: "next" | "prev"` 错误改成排序方向。
- 当前仓库和 `../react-sdk` 的相关类型检查通过。

## 风险与待确认点

最大风险是 Chainstream SDK 对“已实现盈亏”和“总盈亏”的 sort enum 命名，以及 asc / desc 参数命名尚未确认。实施前必须先完成第一步核验。

如果新版 Chainstream SDK 仍没有独立支持“已实现盈亏”和“总盈亏”两个排序字段，则不能在前端伪造该能力；需要只接入 SDK 真实支持的字段，并把不支持项反馈出来。
