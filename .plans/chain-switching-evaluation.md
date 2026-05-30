# 链切换实现评估与改进方案

## 结论先行

当前“连续切换后页面自动来回切”的核心问题是 **URL、Jotai atom、token path、钱包链之间存在多源写入与双向纠偏**。其中最容易触发振荡的是：

- 用户点击链选择器后，`selectChain()` 写 atom。
- `onSuccess` 再通过 `router.replace()` 写 URL。
- `useChainUrlSync()` 又监听 URL，并且 effect 依赖包含 `currentChain` / 不稳定 `selectChain`。
- 在 `router.replace()` 尚未让 `useSearchParams()` 追上时，atom 变化会触发 effect 用 stale URL 把 atom 切回旧链。

这是一个**时序相关的高概率竞态**，单击可能复现，连续点击几乎必现。异步钱包切换没有 last-write-wins 是第二个放大器，但 P0 不应直接大改成“点击只导航”；那会丢失乐观更新，并让当前 selector 局部 `isSwitching` 失效。

本计划采用两步策略：

1. **P0 止血**：收编所有 `selectChain` 写入点，修 `useChainUrlSync` 的反馈触发条件，并在 dex 侧稳定回调引用，保留点击时直接 `selectChain` 的乐观更新。
2. **P1 收敛**：在 `react-sdk` 中补 last-write-wins、相同链短路、共享 switching 状态；再评估是否需要“URL 唯一权威 / 点击只导航”的架构收敛。

## 已核实写入点

当前直接或间接写 `@liberfi.io/ui-chain-select` atom 的入口至少有 4 类：

| 写入点 | 文件 | 行为 | 风险 |
|---|---|---|---|
| URL sync | `apps/web/src/hooks/useChainUrlSync.ts` | `?chain` 变化时调用带钱包切换的 `selectChain(queryChain)` | 会被 `currentChain` / 不稳定回调触发 stale URL 回滚 |
| 新布局 header | `apps/web/src/components/NewAppLayout.tsx` | 用户点击后调用 `selectChain(c)`，成功后 `onSuccess` 写 URL | atom -> URL -> atom 闭环 |
| token detail | `packages/ui-dex/src/components/trade/TradeDataLoader.tsx` | 根据 path chain 调用 `selectChain(chainId)`，不切钱包 | 展示链与钱包链可能不一致 |
| AccountPage | `packages/ui-dex/src/pages/AccountPage.tsx` | `AssetTap onChainChange={setChainId}` 直接写 atom，绕过 URL | URL 不变，刷新/分享丢链；后续 URL 变化可能切回旧链 |

任何方案在执行前都必须先审计并处理这些入口，否则“单一权威源”不成立。

## P0：最小止血方案

### 阶段 0：审计并收编所有写入点

目标：确认所有 `selectChain` 调用都有明确同步策略。

执行：

1. 在当前仓库运行：

```bash
rg -n "useSelectChain|selectChain\\(|onChainChange" apps packages -S
```

2. 必须逐项分类：
   - `useChainUrlSync`：URL -> atom 对齐入口。
   - `NewAppLayout` / `CombinedTokenList`：用户显式点击入口。
   - `TradeDataLoader`：token path -> atom 对齐入口。
   - `AccountPage`：账户页链 tab 切换入口。
3. `AccountPage` 不能继续无说明地绕过 URL。注意依赖方向：`AccountPage` 位于 `packages/ui-dex`，不能反向 import `apps/web/src/hooks/useChainSwitchUrlHandler.ts`。
4. P0 可选两种处理：
   - 推荐：由 app 层包装/注入带 URL 同步的 `onChainChange`，或让已注入的 router adapter 承担 `?chain=` 同步。`ui-dex` 只消费回调/路由能力，不依赖 `apps/web`。
   - 临时豁免：明确账户页链切换只是页面内筛选，不代表全局链；此时不要调用全局 `useSelectChain()`，改为局部 state。

建议采用第一种：账户页当前读取 `useCurrentChain()` 驱动 `AssetList` / `ActivityList`，语义更像全局链，不应是局部筛选。

如果选择“局部 state”备选，必须同步改造下游：`AssetList` / `ActivityList` 等当前由 `useCurrentChain()` 间接驱动的组件需要接收并使用局部 `chainId`，否则会出现 tab 显示链与列表数据链脱节。

### 阶段 1：修 `useChainUrlSync` 的反馈触发

文件：`apps/web/src/hooks/useChainUrlSync.ts`

目标：atom 变化不能让 effect 用 stale query 回滚 atom。

改动：

1. 保留 `useCurrentChain()`，但只用于维护 ref：

```ts
const { chain: currentChain } = useCurrentChain();
const currentChainRef = useRef(currentChain);
currentChainRef.current = currentChain;
```

2. effect 内用 `currentChainRef.current` 做短路。
3. 从 effect 依赖中移除 `currentChain`。
4. dex 侧稳定 `onSwitchChain`，避免 `selectChain` 引用随 wallets / options 对象变化而触发 effect：

```ts
const switchEvmWalletsToChain = useSwitchEvmWalletsToChain();
const switchRef = useRef(switchEvmWalletsToChain);
switchRef.current = switchEvmWalletsToChain;

const stableSwitch = useCallback(
  (chain: Chain) => switchRef.current(chain),
  [],
);

const { selectChain } = useSelectChain({
  onSwitchChain: stableSwitch,
});
```

5. 如果 `useSelectChain` 返回的 `selectChain` 仍不稳定，可同样包一层 `selectChainRef`，effect 内调用 ref，依赖不放 `selectChain`。

验收：

- `/?chain=sol` 点击 ETH 后，URL 最终为 `?chain=eth`，atom 最终为 ETH。
- 在 URL 尚未更新的窗口内，`useChainUrlSync` 不应因为 atom 变化再次用 `chain=sol` 调 `selectChain(SOL)`。

### 阶段 2：保留乐观更新，先不改成“只导航”

文件：

- `apps/web/src/components/NewAppLayout.tsx`
- `apps/web/src/components/home/CombinedTokenList.tsx`
- `packages/ui-dex/src/pages/AccountPage.tsx`

本阶段不做“用户点击只写 URL”。原因：

- 当前 selector 的 `isSwitching` 是 hook 实例局部状态；如果实际切换挪到 `useChainUrlSync`，点击入口会丢 loading 态。
- 点击到 atom 更新会变成 `router.replace -> searchParams -> effect -> wallet switch -> setChain`，交互变慢。
- 钱包授权弹窗时机会从“用户点击时”后移到“URL 变化后”，体验和调试都更难。

P0 做法：

1. 用户点击仍调用当前入口自己的 `selectChain(c)`，保留乐观路径。
2. `onSuccess` 仍可写 URL，但必须依赖阶段 1 防止 stale query 回滚。
3. 所有用户入口都要统一写 URL：
   - header dropdown 已有 `onChainSwitchedUrl(c)`。
   - mobile token list selector 已有 `onChainSwitchedUrl(c)`。
   - `AccountPage` 需要通过 app 层注入/包装或 router adapter 新增同等 URL 同步，不能在 `ui-dex` 中 import `apps/web` hook；或改成明确局部 state。

“点击只导航”降级为 P2 可选架构项，只有在 SDK 提供共享 switching 状态后再考虑。

## P1：SDK 健壮性改造

文件：`../react-sdk/packages/ui-chain-select/src/hooks/useSelectChain.tsx`

目标：即使上层仍有多个入口并发调用，也保证最后一次用户意图获胜。

改动：

1. 读取当前 chain，并对相同链短路：
   - 当前 chain 可通过 `useAtomValue(chainAtom)` 同步到 ref。
   - `target === currentChainRef.current` 时直接 return，不执行 `onSwitchChain`。
2. 稳定 options 引用：
   - `optionsRef.current = options`。
   - `selectChain` 内部读取 `optionsRef.current`。
   - 减少消费者 effect 因 callback 身份变化而重复触发。
3. last-write-wins：
   - `requestIdRef.current += 1`。
   - 每次调用保存本次 `requestId`。
   - `await onSwitchChain` 返回后，只有最新 `requestId` 才允许写 atom / 调 `onSuccess`。
   - stale reject 不触发最新错误状态。
4. 共享 switching 状态：
   - 当前 `isSwitching` 是 hook 实例局部状态。
   - 后续应提升到 chain-select provider 的共享 atom，例如 `pendingChainAtom` / `switchRequestIdAtom`。

测试：

```bash
cd ../react-sdk
pnpm --filter @liberfi.io/ui-chain-select test
```

新增用例：

- 连续触发 ETH、BSC，ETH 晚返回，最终 atom 必须是 BSC。
- stale resolve 不调用 stale `onSuccess`。
- stale reject 不污染最新错误。
- 相同目标链不调用 `onSwitchChain`。

## P1：首屏 URL 初始化与 Suspense 注意项

### 首屏闪链

当前 `atomWithStorage(..., { getOnInit: true })` 会先从 localStorage 读历史链，再由 `useChainUrlSync` 根据 `?chain` 修正。

验收中必须覆盖：

- localStorage 为 SOL，打开 `/?chain=bsc`。
- 页面最终稳定 BSC。
- 不应出现持续振荡；如果首屏短暂 SOL 请求不可接受，需要后续在 app 层用 URL 初值 gate 渲染。

### Suspense

当前多个组件直接使用 `useSearchParams()`：

- `useChainUrlSync`
- `useChainSwitchUrlHandler`
- `useChainAwareRouter`
- `ChainAwareLink`
- 若干 page/layout

Next App Router 下，`useSearchParams()` 在静态预渲染路径可能要求 Suspense 边界。需要在实现/验证时关注 dev/build warning；若出现预渲染降级或 warning，应补对应 Suspense 边界。

## P2：可选架构收敛

### “点击只导航”作为后续可选项

只有满足以下条件后再考虑：

1. SDK 已提供共享 `isSwitching` / `pendingChain`。
2. 入口 UI 可以展示由 URL sync 触发的 pending 状态。
3. 钱包授权弹窗时机经过产品确认。

目标模型：

- 普通页 `?chain` 是展示链权威。
- token detail path 是 token 数据权威。
- 用户点击只改变 URL。
- `useChainUrlSync` 单向把 URL 派生到 atom 和钱包链。

这不是 P0 必做项。

### token detail 链语义隔离

文件：

- `packages/ui-dex/src/components/trade/TradeDataLoader.tsx`
- `apps/web/src/components/page/TokensPage.tsx`

现状：`TradeDataLoader` 根据 path chain 写全局 atom，但不切钱包。

后续目标：

1. 区分 `routeChain` / `selectedChain` / `walletChain`。
2. token detail 内的 token 数据使用 `routeChain`。
3. 全局 selector 仍使用 `selectedChain`。
4. 交易前校验 EVM 钱包实际链是否等于交易链；不一致则显式切钱包或阻断。

## P3：SDK 状态结构优化

文件：`../react-sdk/packages/ui-chain-select/src/states.ts`

建议：

- `chainNamespace` 从 `chain` 派生，避免 `chain` 与 `chainNamespace` 双 atom 漂移。
- 只持久化必要的 `chain`。
- provider 暴露 `pendingChain`、`isSwitching`、`lastSwitchError`。

## 手动验证清单

联调步骤：

1. 确保 `react-sdk` 与当前仓库位于同级目录。
2. 在 `../react-sdk` 执行：

```bash
pnpm install
```

3. 当前仓库 `apps/web/.env.local`：

```env
USE_LOCAL_SDK=true
LOCAL_SDK_ROOT=../../../react-sdk
```

4. 当前仓库执行：

```bash
pnpm install
pnpm --filter @liberfi/web dev
```

若 dev server 已启动，复用现有服务；端口占用时先询问用户，不自行换端口或 kill。

验证用例：

1. `/?chain=sol` 单击 ETH：最终 URL / UI / token list 稳定 ETH，不被 stale SOL 回滚。
2. 首页快速连点 SOL -> ETH -> BSC -> ETH：最终稳定最后一次 ETH。完整稳定依赖 P1 的 last-write-wins；P0 只能保证不再由 stale URL feedback 回滚。
3. 连接 EVM 钱包后重复连点：旧请求晚返回不能覆盖最新选择。该用例是 P1 验收项，P0 后仍可能因异步钱包切换乱序出现闪动。
4. 账户页切链：URL 同步更新，刷新后保持同一链；若改成局部 state，则刷新行为符合明确产品定义。
5. 打开 `/?chain=bsc` 且 localStorage 为 SOL：最终稳定 BSC，不持续振荡。
6. token detail `/tokens/eth/<address>`：token 数据使用 path 链 ETH。
7. EVM token detail 发起交易前：钱包实际链必须与交易链一致；不一致时要显式提示/切换/阻断。
8. 从 `/?chain=eth` 点击 SOL token：目标 token detail 不携带 stale `?chain=eth`。
9. token detail header 切链：跳转到 `/?chain=<new>`，不回跳旧 token path。
10. 检查浏览器 console / dev server：无 `useSearchParams` Suspense 相关 warning。

## 优先级

1. **P0**：审计并收编所有 `selectChain` 写入点，尤其 `AccountPage`。
2. **P0**：修 `useChainUrlSync`，移除 atom 变化触发 stale URL 回滚；dex 侧稳定回调引用。
3. **P0**：保留乐观更新，不把点击入口改成“只导航”。
4. **P1**：SDK `useSelectChain` 增加相同链短路、last-write-wins、稳定 options。
5. **P1**：首屏 URL 初始化与 `useSearchParams` Suspense warning 验证。
6. **P2**：在共享 switching 状态可用后，再评估“URL 唯一权威 / 点击只导航”。
7. **P2**：token detail 的 route chain / selected chain / wallet chain 解耦。
8. **P3**：SDK 双 atom 收敛为派生 namespace。

## 最终判断

被评审指出的问题成立：原计划遗漏了 `AccountPage` 写 atom，且把“点击只导航”放进 P0 会带来交互回归。修订后，P0 聚焦止血：先切断 `useChainUrlSync` 的 stale URL 回滚路径，并收编所有直接写 atom 的入口。SDK 的 last-write-wins 是必要的第二层保险，但不是 P0 的前置条件。
