# Top Traders 真实接口对接计划

## 目标

- 将 `apps/web/src/components/page/token-detail/AxiomTradePage.tsx` 与 `apps/web/src/components/page/token-detail/AxiomTradeMobilePage.tsx` 中 Top Traders tab 使用的列表，从 holders 代理数据切换为 chainstream SDK 已实现的 Top Traders 查询能力。
- 保持当前桌面端与移动端入口不变：两个页面都继续渲染 `BottomTopTradersTable`，只替换该表格内部的数据源、分页加载与必要字段映射。
- 必要时修改同级 `../react-sdk` 源码；由于当前项目使用源码链接，不执行 `react-sdk` build。

## 已确认现状

- Web 侧 Top Traders 实际组件：
  - `apps/web/src/components/page/token-detail/BottomDataPanel.tsx`
  - `apps/web/src/components/page/token-detail/AxiomTradeMobilePage.tsx`
  - 二者都通过 `BottomTopTradersTable` 渲染 Top Traders tab。
- 当前错误数据源：
  - `apps/web/src/components/page/token-detail/bottom-tables/BottomTopTradersTable.tsx`
  - 当前导入 `useTokenHoldersListScript`，使用 holders 数据并截取前 50 条。
- SDK 侧可用能力：
  - `@chainstream-io/sdk@2.1.12`
    - `token.getTokenTopTraders(chain, tokenAddress, params)`
    - 实际路径：`/v2/token/{chain}/{tokenAddress}/topTraders`
    - 返回 DTO：`TokenTopTrader`
  - `../react-sdk/packages/react/src/hooks/useTokenTopTradersQuery.ts`
    - 旧实现默认调用 `client.getTokenHolders(..., { sortBy: "realizedPnl" })`，需要改为调用 `client.getTokenTopTraders(...)`
    - query key 名称为 `tokenTopTraders`
  - `../react-sdk/packages/ui-tokens/src/components/token-detail/token-top-traders-list/token-top-traders-list.script.ts`
    - 导出 `useTokenTopTradersListScript`
    - 返回字段：`traders`、`isLoading`、`hasMore`、`loadMore`、`onlyTracked`、`setOnlyTracked`
  - `../react-sdk/packages/ui-tokens/src/components/token-detail/index.ts`
    - 已 export `./token-top-traders-list`

## 对接方案

1. 修改 `apps/web/src/components/page/token-detail/bottom-tables/BottomTopTradersTable.tsx`。
   - 将导入从：
     - `useTokenHoldersListScript`
   - 替换为：
     - `useTokenTopTradersListScript`
   - 不再使用 `TokenHolder` 表示 Top Traders 行；按 chainstream `TokenTopTrader` DTO 推导并使用新的 trader 类型。

2. 替换 hook 调用，并接入分页加载。
   - 当前：
     ```ts
     const { holders, isLoading } = useTokenHoldersListScript({
       chain,
       address,
       limit: 50,
     });
     ```
   - 目标：
     ```ts
     const { traders, isLoading, hasMore, loadMore } =
       useTokenTopTradersListScript({
         chain,
         address,
         limit: 50,
       });
     ```
   - Top Traders 不是固定 50 条；`limit: 50` 只作为每页大小。
   - 在 `TableShell` 上接入无限滚动：
     ```ts
     infiniteScroll={{ hasMore, isLoading, onLoadMore: loadMore }}
     ```
   - 桌面端使用 `TableShell` 自己的滚动容器触发分页。
   - 移动端通过 `TableShellScrollRootProvider` 使用页面级 scroll root 触发分页，保持单滚动流布局。

3. 替换列表变量与空状态判断。
   - `holders.length` 改为 `traders.length`。
   - 删除 `slice(0, 50)`，直接渲染已累积的 `traders`。
   - 将变量命名为 `topTraders` 或直接使用 `traders`，避免再表达固定 50 条的语义。
   - row key 继续使用 `trader.address`。

4. 更新行组件命名与注释。
   - `TopTraderRow` 参数从 `holder` 改为 `trader`。
   - 删除“temporary stub backed by holders feed”相关注释。
   - 新注释说明：
     - 数据源来自 `useTokenTopTradersListScript`
     - 数据源最终调用 chainstream SDK `token.getTokenTopTraders`
     - 请求路径为 `/v2/token/{chain}/{tokenAddress}/topTraders`
     - 每页 `limit: 50`，通过 `hasMore/loadMore` 继续加载后续页

5. 字段显示策略。
   - Trader：继续显示 `trader.address` 的短地址。
   - Balance：继续用 `trader.amountInUsd` 渲染当前持仓价值。
   - Realized PnL：使用 `totalRealizedPnlInUsd`。
   - Unrealized PnL：使用 `unrealizedPnlInUsd`。
   - Total PnL：使用 `totalPnlInUsd`。
   - Buys：使用 `totalBuyCount`。
   - Sells：使用 `totalSellCount`。

6. 检查 SDK 导出与类型。
   - 运行：
     ```bash
     rg -n "useTokenTopTradersListScript|token-top-traders-list" ../react-sdk/packages/ui-tokens/src
     ```
   - 如果 web 编译无法从 `@liberfi.io/ui-tokens` 导入该 hook，需要修改 `../react-sdk/packages/ui-tokens/src/index.ts` 或相关 barrel export。
   - 修改后不 build `react-sdk`，只依赖源码链接让 web dev server 编译校验。

7. 本地验证。
   - 先检查是否已有 web dev server：
     ```bash
     lsof -iTCP -sTCP:LISTEN -n -P | rg ":(3000|3001|5173|5174)"
     ```
   - 若已存在当前项目 dev server，直接使用现有服务验证，不重启。
   - 若不存在，执行：
     ```bash
     pnpm --filter @liberfi/web dev
     ```
   - 若端口被占用，先询问用户是启动新端口还是释放占用端口，不能擅自切换端口或 kill 进程。
   - 在 dev server 日志确认本地 SDK 模式生效，重点查看 local SDK alias / PostCSS rewrite 相关输出。

8. 页面验证。
   - 桌面端打开任意 token detail 页面，切换到底部 `Top Traders` tab。
   - 移动端 viewport 下打开同一页面，滚动到 sticky tab bar，切换 `Top Traders` tab。
   - 检查：
     - Network 请求路径为 `/v2/token/{chain}/{address}/topTraders`，不是 holders endpoint。
     - Top Traders 不再复用 holders tab 当前排序。
     - 初始加载 spinner、空状态、行高度、表头 sticky、移动端横向滚动仍正常。
     - 首屏 50 行排序与接口返回顺序一致。
     - 向列表底部滚动后会继续请求下一页，新增行追加到原列表尾部。
     - 移动端页面级滚动到底部也能触发下一页加载，而不是只在内部表格滚动时触发。

9. 静态校验。
   - 运行：
     ```bash
     pnpm --filter @liberfi/web typecheck
     ```
   - 如果仓库没有 `typecheck` script，则运行：
     ```bash
     pnpm --filter @liberfi/web lint
     ```
   - 按项目规则，本次不执行 production build。

10. Diff 检查。
    - 运行：
      ```bash
      git diff -- apps/web/src/components/page/token-detail/bottom-tables/BottomTopTradersTable.tsx ../react-sdk/packages/ui-tokens/src ../react-sdk/packages/react/src
      ```
    - 确认 diff 只包含 Top Traders 数据源替换、必要 SDK barrel export 或最小字段适配。

## 预期改动文件

- 必改：
  - `apps/web/src/components/page/token-detail/bottom-tables/BottomTopTradersTable.tsx`
- 可能需要：
  - `../react-sdk/packages/types/src/token.ts`
  - `../react-sdk/packages/types/src/api/token-options.ts`
  - `../react-sdk/packages/types/src/api/client.ts`
  - `../react-sdk/packages/client/src/client.ts`
  - `../react-sdk/packages/client/src/utils.ts`
  - `../react-sdk/packages/react/src/hooks/useTokenTopTradersQuery.ts`
  - `../react-sdk/packages/ui-tokens/src/components/token-detail/token-top-traders-list/token-top-traders-list.script.ts`
  - `../react-sdk/packages/ui-tokens/src/components/token-detail/token-top-traders-list/token-top-traders-list.ui.tsx`

## 风险与处理

- 风险：SDK hook 已存在但 package 顶层未导出。
  - 处理：补齐 barrel export，不改业务逻辑。
- 风险：`apps/web` 的裸 `tsc` 解析到已安装的 npm 包类型，而不是 `../react-sdk` 源码类型。
  - 处理：web 表格使用基于 `useTokenTopTradersListScript` 返回值的窄类型扩展；真实 SDK 类型仍定义在 `../react-sdk/packages/types/src/token.ts`。
- 风险：dev server 端口已被占用。
  - 处理：按项目规则先询问用户，不能自行换端口或 kill 进程。
