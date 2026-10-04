### Fluss：分区布局不能借用表的最新值

[#4527](https://github.com/apache/fluss/pull/4527) 于 10 月 4 日 00:37 合入 main，补齐 Rust 客户端按分区 bucket count 路由。修改表的 bucket.num 后，旧分区仍保留创建时的桶数。如果客户端把最新表级值套到所有分区，写入、lookup 和扫描会使用错误布局。

补丁缓存分区自己的桶数，并在请求中携带 routing_bucket_count。尚未取得布局时形成的批次，需要在发送前校验；keyed batch 若按错误桶数分组，选择失败并让调用方重试，不能简单换一个标签继续发送。服务端拒绝错路由批次后，客户端重新读取布局，并归还未写入批次占用的幂等序号，避免下一批凭空出现序号缺口。无 key 批次则仅在原 bucket 仍存在时重标。新增测试覆盖扩桶前后分区共存、旧 writer、prefix lookup 和扫描边界；本文未独立运行这些测试。[代码与测试](https://github.com/apache/fluss/pull/4527/files)

另一项 [#4536](https://github.com/apache/fluss/pull/4536) 于 10 月 3 日 23:27 合并。桶暂时没有 leader 时，Rust Sender 原本可能在每次元数据刷新结束后立即再查，故障因此变成对剩余节点的密集轮询。现在两次刷新间遵守 writer_retry_backoff_ms，默认 100 ms；找回 leader 后仍可立即发送。它约束的是下一次查询节奏，不能解读为所有写入都增加固定延迟。[补丁](https://github.com/apache/fluss/pull/4536/files)

这两项修改可以放在同一张恢复清单里看：布局已过期时，要阻止错误批次继续前进；leader 尚未恢复时，要避免重试本身放大故障。应用接收到路由错误后还需正确重试，不能把“客户端能刷新元数据”理解为每次旧批次都会透明成功。

### Kafka：DNS 处理出现 Streams PoC，尚未交付

KIP-909 的页面仍为 Accepted，但本窗口新建的 [#23685](https://github.com/apache/kafka/pull/23685) 才开始讨论 Streams 如何使用它：取消 bootstrap.resolve.timeout.ms 强制置零，并识别 BootstrapResolutionException，避免恢复或线程重建进入无意义重试。作者明确将其定位为暂未加测试的 PoC，当前未合并，不能写成 Streams 已支持。

窗口内另新建的 [#23688](https://github.com/apache/kafka/pull/23688) 则拟将 consumer group 分配器移到后台线程，并取消因写入回滚而失效的异步分配计算。它特别处理 epoch 被重新使用的情形，说明数字相等并不足以证明旧结果仍有效；当前同样未合并。

另有仍在讨论的 [KIP-1368](https://cwiki.apache.org/confluence/spaces/KAFKA/pages/440304679/KIP-1368+Client+framework+name+and+version) 在本窗口内两次修订，在框架名称、版本之外增加 framework ID，并细化 Connect 的编码与长度规则，属于观测上下文设计的推进。

### AutoMQ 与发行边界

在本轮 [AutoMQ PR](https://github.com/AutoMQ/automq/pulls) 与[发布记录](https://github.com/AutoMQ/automq/releases)覆盖中，暂无可核验的重要交付增量：未找到新合并；两个旧 PR 的关闭并非合入，nightly 例行刷新也不等于稳定版。Fluss 最新公开 release 仍为 9 月 22 日的 [1.0.0](https://github.com/apache/fluss/releases/tag/v1.0.0)，上述两项 main 合并尚无正式发行归属。昨日的截断、WAL 回收和无盘提案不重复包装成新动态。


此前日志截断、湖进度与 WAL 回收、KIP-1165 的机制与状态见[上期流存储分稿]({{ '/posts/tech-research/week-12/streaming/' | relative_url }})。
