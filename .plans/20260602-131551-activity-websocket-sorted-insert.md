# 活动列表 WebSocket 增量排序插入改造计划

## 目标

底部“活动”列表通过 websocket 推送收到的新活动数据后，不再只在 `timestamp desc + all` 状态下插入，也不再忽略其他排序状态。

新规则：

- websocket 推送的数据都要进入当前活动列表。
- 插入前需要遵守当前筛选条件。
- 插入后需要按照当前排序规则保持列表顺序。
- 当前只允许一个排序字段生效：
  - `sortBy = "timestamp"` + `sortDirection = "desc" | "asc"`
  - `sortBy = "totalUsd"` + `sortDirection = "desc" | "asc"`
  - `sortBy = undefined` 时按服务端默认排序处理，默认等价 `timestamp desc`

## 当前实现问题

文件：

```text
../react-sdk/packages/ui-tokens/src/components/token-detail/token-activities-list/token-activities-list.script.ts
```

当前 `liveEligible` 逻辑只允许 websocket 数据在以下状态插入：

```ts
(sortBy == null || sortBy === "timestamp") &&
sortDirection === "desc" &&
typeFilter === "all" &&
cursor == null
```

问题：

1. `totalUsd desc` / `totalUsd asc` 下 websocket 新数据不会进入列表。
2. `timestamp asc` 下 websocket 新数据不会进入列表。
3. `buy` / `sell` 过滤状态下，即使推送数据符合过滤条件也不会进入列表。
4. 当前使用 `liveFront` 单独维护前插数据，只适合“最新数据前插”的场景，不适合按不同排序规则插入。

## 改造范围

### 1. react-sdk hook 状态结构调整

修改：

```text
../react-sdk/packages/ui-tokens/src/components/token-detail/token-activities-list/token-activities-list.script.ts
```

保留现有对外 API：

```ts
activities
isLoading
sortBy
sortDirection
setSortBy
setSortDirection
typeFilter
setTypeFilter
hasMore
loadMore
```

内部调整：

- 移除或弱化 `liveEligible` 对排序/过滤状态的限制。
- websocket 数据不再只写入 `liveFront` 的“前插队列”。
- 引入统一的 merge/sort 管道：

```ts
const activities = mergeAndSortActivities({
  pages,
  liveActivities,
  sortBy,
  sortDirection,
  typeFilter,
});
```

建议内部状态：

```ts
const [liveActivities, setLiveActivities] = useState<Array<Activity>>([]);
```

`reset()` 时清空：

```ts
setCursor(undefined);
setPages([]);
setLiveActivities([]);
```

### 2. websocket 数据过滤规则

新增 helper：

```ts
function matchesActivityTypeFilter(
  activity: Activity,
  typeFilter: "all" | "buy" | "sell",
): boolean
```

规则：

- `typeFilter === "all"`：全部保留
- `typeFilter === "buy"`：只保留 `activity.type === "buy"`
- `typeFilter === "sell"`：只保留 `activity.type === "sell"`

注意：

- 如果 `Activity.type` 实际值包含大写或更多枚举，需要复用现有 SDK 数据转换后的标准值，避免直接比较 chainstream 原始大写枚举。
- 流动性、红包等非 buy/sell 类型在 `buy` / `sell` 过滤下应被过滤掉。

### 3. 去重规则

新增 helper：

```ts
function activityIdentity(activity: Activity): string
```

优先级：

1. `txHash`
2. 如果未来存在同交易多 activity 且 `txHash` 不唯一，则扩展为：

   ```ts
   `${txHash}:${type}:${timestamp}:${accountOwnerAddress ?? ""}`
   ```

本次先以当前代码使用的 `txHash` 为主，和现有实现保持一致。

合并顺序：

```ts
const paged = pages.flatMap((p) => p.data);
const merged = [...liveActivities, ...paged];
```

去重策略：

- websocket 数据优先于分页旧数据。
- 保留第一次出现的记录。
- 如果同一个 `txHash` 后续推送了更新版数据，后续可以改为 map 覆盖；本次先保持“首个优先”，避免无意改变分页数据。

### 4. 排序规则

新增 helper：

```ts
function compareActivities(
  a: Activity,
  b: Activity,
  sortBy: TokenActivitiesListSortBy | undefined,
  sortDirection: ActivitiesSortDirection,
): number
```

排序字段：

#### timestamp

字段候选：

- 优先使用现有活动对象里的时间字段，按实际 `Activity` 类型确认字段名。
- 预期字段可能是：
  - `timestamp`
  - `blockTimestamp`
  - `createdAt`

需要先在 `../react-sdk/packages/types/src/activity.ts` 中确认。

比较：

```ts
const av = toTimeValue(a);
const bv = toTimeValue(b);
```

方向：

- `desc`：新时间在前
- `asc`：旧时间在前

#### totalUsd

字段候选：

- 预期字段可能是：
  - `totalUsd`
  - `amountUsd`
  - `volumeUsd`

需要先在 `Activity` 类型中确认。

比较：

```ts
const av = toNumberValue(a.totalUsd);
const bv = toNumberValue(b.totalUsd);
```

方向：

- `desc`：金额大在前
- `asc`：金额小在前

#### sortBy undefined

按服务端默认排序处理：

```ts
effectiveSortBy = "timestamp";
effectiveSortDirection = "desc";
```

#### 稳定排序 tie-breaker

为了避免同值时顺序抖动：

1. 主排序字段比较。
2. `timestamp desc` 作为 secondary tie-breaker。
3. `txHash` 字符串比较作为最终 tie-breaker。

### 5. 插入策略

推荐实现：

每次 websocket 收到 `incoming`：

```ts
setLiveActivities((prev) => {
  const filteredIncoming = incoming.filter((a) =>
    matchesActivityTypeFilter(a, typeFilter),
  );

  if (filteredIncoming.length === 0) return prev;

  return mergeUniqueActivities(filteredIncoming, prev).slice(0, LIVE_LIMIT);
});
```

然后 `activities` 统一由 `useMemo` 合并分页与 websocket 数据后排序。

`LIVE_LIMIT` 建议：

```ts
const LIVE_LIMIT = 500;
```

原因：

- 防止 websocket 长时间运行导致内存无限增长。
- 当前列表分页每页 50，500 条 live cache 足够覆盖常规实时窗口。

### 6. 分页边界处理

必须接受的行为：

- 当前列表已经加载了 N 页时，websocket 新数据插入当前可见集合并重新排序。
- `hasMore` 和 `loadMore` 仍然只由服务端分页 `pages` 决定。
- websocket 插入不会修改服务端 cursor。

需要注意：

- 如果当前为 `totalUsd asc`，新来的大额交易可能排在当前已加载集合末尾，甚至逻辑上应该在未加载页之后；但前端无法知道全量服务端排序窗口。因此本次只保证“当前已加载集合 + websocket 增量集合”内部排序正确。
- 不做本地全量排序冒充服务端全量排序；分页继续由服务端排序接口保障。

### 7. UI 状态无需额外改动

文件：

```text
apps/web/src/components/page/token-detail/bottom-tables/BottomTradesTable.tsx
```

当前 `BottomTradesTable` 只消费：

```ts
activities
sortBy
sortDirection
setSortBy
```

如果 SDK hook 的 `activities` 已经排序完成，页面不需要额外排序。

仍需保留三态排序交互：

- 第一次点击：`desc`
- 第二次点击：`asc`
- 第三次点击：清除排序

### 8. react-sdk UI 组件同步

文件：

```text
../react-sdk/packages/ui-tokens/src/components/token-detail/token-activities-list/token-activities-list.ui.tsx
../react-sdk/packages/ui-tokens/src/components/token-detail/token-activities-list/token-activities-list.widget.tsx
```

如果 widget 使用同一个 script：

- 不需要单独处理 websocket。
- 确认 UI 的排序按钮仍传递 `sortBy + sortDirection`。
- 清除排序时传：

```ts
onSortByChange(undefined, undefined)
```

### 9. 测试与校验

#### 代码校验

```bash
pnpm --dir ../react-sdk --filter @liberfi.io/types --filter @liberfi.io/client --filter @liberfi.io/react --filter @liberfi.io/ui-tokens build
```

```bash
pnpm --filter @liberfi/web lint
```

如果当前仓库其他未提交文件导致 `tsc --noEmit` 失败，需要记录具体阻塞文件，不将其归因到本次活动列表改造。

#### 手动交互校验

使用现有 dev server，不额外启动新端口。

页面：

```text
/tokens/sol/9ckNq6UmrVK9G7rAnETZAj7LyYVjhPrdoW8DLC3rTL7X
```

校验场景：

1. 默认排序：
   - websocket 新活动进入列表
   - 列表保持 `timestamp desc`
2. 时间升序：
   - 点击时间列两次进入 `timestamp asc`
   - websocket 新活动进入列表
   - 新数据按时间升序插入，不强制前插
3. 总额 USD 降序：
   - 点击总额 USD 一次进入 `totalUsd desc`
   - websocket 新活动进入列表
   - 大额靠前，小额靠后
4. 总额 USD 升序：
   - 点击总额 USD 两次进入 `totalUsd asc`
   - websocket 新活动进入列表
   - 小额靠前，大额靠后
5. 清除排序：
   - 第三次点击当前排序列
   - `sortBy` 清空
   - websocket 新活动按默认 `timestamp desc` 插入
6. buy/sell 过滤：
   - 如果当前 UI/SDK 暴露 type filter，切到 buy 或 sell
   - websocket 不符合类型的数据不插入当前列表

### 10. 风险与决策

#### 风险 1：当前已加载集合不是服务端全量集合

排序只能保证当前前端持有的数据内部有序，不能保证 websocket 新数据相对未加载服务端页的位置完全正确。

处理：

- 明确这是无限分页的天然边界。
- 不做隐藏 refetch，避免频繁打断用户滚动和 cursor。

#### 风险 2：Activity 时间或 USD 字段为空

处理：

- 数值缺失时按 `0` 或 `Number.NEGATIVE_INFINITY` 处理需要谨慎。
- 推荐规则：
  - 时间缺失：视为 `0`
  - USD 缺失：视为 `0`
  - 保证 comparator 不返回 `NaN`

#### 风险 3：同一交易多条 activity

处理：

- 先沿用现有 `txHash` 去重。
- 如果确认存在同 `txHash` 多条有效 activity，再升级 identity。

#### 风险 4：live cache 无限增长

处理：

- 增加 `LIVE_LIMIT`。
- 排序后可只保留前 `LIVE_LIMIT` 条 websocket 数据。
