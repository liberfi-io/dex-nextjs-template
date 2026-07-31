# Stage 5 ChainStream Adapter 删除门禁

状态：`blocked-by-parity-evidence`

G2 保留 `ChainStreamDexDataAdapter`，并明确它不属于 `CapabilityBundleV1`。Stage 5 只有在以下五项 parity fixture 全部通过后，才允许决定切换到底层 LiberFi capability 或继续保留 Adapter：

1. `getToken`：DTO 字段、nullability、错误传播一致。
2. `getTokens`：输入排序、批量结果顺序、缺失 token 语义一致。
3. `getTokenMarketData`：价格单位、空值与错误语义一致。
4. `getTokenCandles`：`from`、`to`、`resolution`、`limit`、时间单位和 candle DTO 一致。
5. `subscribeTokenCandles`：单条 callback、错误传播、unsubscribe exactly-once 和 reconnect 行为一致。

若任一 fixture 不通过，禁止删除 Adapter，也禁止把 `TokenDataCapability` 直接注入 TradingView。差异必须记录为 `product_semantics` 决策并重新审批。
