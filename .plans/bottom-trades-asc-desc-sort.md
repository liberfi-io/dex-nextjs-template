# BottomTradesTable 活动列表双向排序计划

## 目标

让 `apps/web/src/components/page/token-detail/bottom-tables/BottomTradesTable.tsx` 底部“活动”列表中的两列支持双向排序：

- `时间`：按活动时间 `timestamp` 支持 `desc` 和 `asc`
- `總額 USD`：按成交总额 `totalUsd` 支持 `desc` 和 `asc`

排序必须走活动列表真实查询链路，避免只对当前前端已加载页做本地排序导致分页结果错误。

## 现状确认

1. 页面最终使用的活动列表 UI 是本仓库的 `BottomTradesTable.tsx`，不是直接使用 `../react-sdk` 的 `TokenActivitiesList` UI 组件。
2. 数据请求与分页状态最终依赖 `../react-sdk/packages/ui-tokens/src/components/token-detail/token-activities-list/token-activities-list.script.ts` 中的 `useTokenActivitiesListScript`。
3. 当前 hook 只暴露：
   - `sortBy`
   - `setSortBy(sortBy)`
   - `typeFilter`
   - `setTypeFilter(typeFilter)`
4. 当前 `BottomTradesTable.tsx` 表头只传递 `sortBy`，点击排序列时只调用 `setSortBy(sortBy)`，无法表达 `asc` / `desc`。
5. 当前 `../react-sdk/packages/types/src/api/activity-options.ts` 中 `GetActivitiesOptions` 只有 `sortBy?: "timestamp" | "totalUsd"`，没有排序方向字段。
6. 当前 `../react-sdk/packages/client/src/client.ts` 的 `_getActivities` 已经尝试把 `sortBy` 映射到 chainstream `ActivitySortBy.totalUsdDesc` / `ActivitySortBy.timestampDesc`，但本地安装的 `@chainstream-io/sdk@2.1.12` 类型里 `ActivitySortBy` 暴露的是 `timestamp` / `totalUsd`。需要先确认当前 SDK 实际支持的枚举和接口名称，再决定兼容方式。

## 修改范围

### 1. SDK 接口能力确认

执行以下检查：

```bash
rg -n "ActivitySortBy|GetActivitiesParams|SORT_BY|SORT_TYPE|sortDirection|sortType|PageDirection" ../react-sdk/node_modules/.pnpm/@chainstream-io+sdk@*/node_modules/@chainstream-io/sdk/dist -S
```

重点确认：

- `GetActivitiesParams.sortBy` 是否仍为单字段枚举承载排序字段和方向，例如 `timestampDesc` / `timestampAsc` / `totalUsdDesc` / `totalUsdAsc`
- 或是否变为 `sortBy: "timestamp" | "totalUsd"` 加 `sortDirection` / `sortType: "asc" | "desc"`
- `direction?: PageDirection` 是否仅用于分页方向，值为 `next` / `prev`，不能误用为排序方向

如果 chainstream SDK 类型不完整但运行时枚举对象存在更多 key，需要通过最小兼容转换处理，并避免扩大类型污染。

### 2. 扩展 react-sdk 类型

修改：

```text
../react-sdk/packages/types/src/api/activity-options.ts
```

计划新增：

```ts
export type ActivitiesSortDirection = "asc" | "desc";
```

并在 `GetActivitiesOptions` 中新增：

```ts
/**
 * Sort direction for activity list. Defaults to `desc`.
 */
sortDirection?: ActivitiesSortDirection;
```

保留现有 `sortBy?: ActivitiesSortBy`，以保证调用方兼容。

### 3. 扩展 react-sdk client 请求映射

修改：

```text
../react-sdk/packages/client/src/client.ts
```

目标：

- `_getActivities(...)` 读取 `options?.sortBy` 和 `options?.sortDirection`
- 默认方向为 `desc`
- 根据 chainstream SDK 确认结果选择映射策略：
  - 如果 SDK 支持组合枚举：映射为 `timestampAsc` / `timestampDesc` / `totalUsdAsc` / `totalUsdDesc`
  - 如果 SDK 支持字段加方向：传 `sortBy` 和 `sortDirection` 或 `sortType`
- 保留分页 `direction: options?.direction` 不变，不把分页方向和排序方向混用

需要覆盖的映射矩阵：

| sortBy | sortDirection | 请求参数 |
| --- | --- | --- |
| `timestamp` | `desc` | 时间倒序 |
| `timestamp` | `asc` | 时间正序 |
| `totalUsd` | `desc` | USD 总额倒序 |
| `totalUsd` | `asc` | USD 总额正序 |

### 4. 扩展 useTokenActivitiesListScript 状态

修改：

```text
../react-sdk/packages/ui-tokens/src/components/token-detail/token-activities-list/token-activities-list.script.ts
```

计划新增参数：

```ts
initialSortDirection?: "asc" | "desc";
```

计划新增返回值：

```ts
sortDirection: "asc" | "desc";
setSortDirection: (direction: "asc" | "desc") => void;
setSortBy: (sortBy: TokenActivitiesListSortBy, direction?: "asc" | "desc") => void;
```

状态与查询规则：

- 默认 `sortDirection = "desc"`
- 当 `sortBy` 或 `sortDirection` 变化时：
  - 清空 `cursor`
  - 清空 `pages`
  - 清空 `liveFront`
- `queryParams` 增加 `sortDirection`
- `useMemo` 依赖增加 `sortDirection`
- 实时推送 `liveEligible` 仅在以下条件为真时启用：
  - `sortBy` 为空或为 `timestamp`
  - `sortDirection === "desc"`
  - `typeFilter === "all"`
  - `cursor == null`

这样可以避免在时间正序或 USD 排序时，新活动实时插入破坏排序窗口。

### 5. 更新 react-sdk TokenActivitiesList UI 兼容能力

修改：

```text
../react-sdk/packages/ui-tokens/src/components/token-detail/token-activities-list/token-activities-list.ui.tsx
```

如果该 UI 组件也暴露活动列表排序按钮，则同步增加可选方向参数：

```ts
sortDirection?: "asc" | "desc";
onSortByChange?: (sortBy: TokenActivitiesListSortBy, direction?: "asc" | "desc") => void;
```

若当前 UI 仍只做单向排序，可以保持默认点击行为为 `desc`，避免破坏旧使用方；本次需求的双向交互主要在 `BottomTradesTable.tsx` 实现。

### 6. 更新 BottomTradesTable 表头交互

修改：

```text
apps/web/src/components/page/token-detail/bottom-tables/BottomTradesTable.tsx
```

计划调整：

- 从 `useTokenActivitiesListScript` 解构新增的 `sortDirection`
- `ActivityHeader` 增加 `sortDirection` 入参
- `ActivitySortHeader` 增加 `activeSortDirection` 入参
- 点击同一排序列时切换方向：
  - 当前列未激活：设置该列 `desc`
  - 当前列已激活且为 `desc`：切换到 `asc`
  - 当前列已激活且为 `asc`：切换到 `desc`
- 图标方向体现排序方向：
  - `desc`：保持 `TriangleDownIcon`
  - `asc`：同一图标旋转 `180deg`
- `aria-label` 增加下一次点击动作，例如：
  - `Sort by time ascending`
  - `Sort by total USD descending`

### 7. 校验步骤

代码校验：

```bash
pnpm --filter @liberfi/web typecheck
```

如果项目没有 `typecheck` script，则先查看：

```bash
pnpm --filter @liberfi/web run
```

再选择最接近的本地类型校验命令。

联调校验：

1. 如果当前 dev server 已经启动，直接使用现有服务验证，不重启。
2. 如果未启动，按项目规则启动：

   ```bash
   pnpm --filter @liberfi/web dev
   ```

3. 打开 token detail 页面，进入底部“活动”列表。
4. 点击 `时间`：
   - 首次点击应为 `desc`
   - 再次点击应切换为 `asc`
   - 请求参数应反映 `timestamp + asc/desc`
5. 点击 `總額 USD`：
   - 首次点击应为 `desc`
   - 再次点击应切换为 `asc`
   - 请求参数应反映 `totalUsd + asc/desc`
6. 每次切换排序后，列表应从第一页重新加载，滚动分页应继续可用。
7. 在 `timestamp desc` 以外的排序状态下，新活动实时推送不应插入破坏当前排序。

## 风险与处理

1. 如果当前 chainstream SDK 版本的类型确实不包含活动排序方向，但运行时/API 已支持，需要用局部兼容类型转换，不修改全局 SDK 类型。
2. 如果 chainstream SDK 实际未支持 `asc`，不能用前端本地排序冒充完整排序；应明确标记接口能力阻塞并等待 SDK/API 更新。
3. 不能把 `CursorListOptions.direction` 当作排序方向，因为该字段是分页方向，值为 `next` / `prev`。
