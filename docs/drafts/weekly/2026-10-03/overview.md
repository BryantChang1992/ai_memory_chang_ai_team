**主窗口：2026 年 9 月 26 日 10:30—10 月 3 日 10:30（北京时间）。** 自上期 9 月 11 日 09:00 至主窗口开始前的重要变化单列“补查”。本期编号接续已发布的 Week 11，不补造中间期数。

这期的三个判断是：**状态变更需要明确的生效边界；存储介质更快以后，同步和恢复状态仍有成本；缓存收益必须同时接受延迟与质量检验。** 这些是从下面的独立案例归纳出的工程判断，并不意味着不同项目已经实现了一套统一架构。

## 数据湖：先确认“可以安全继续”，再重试、过滤或清理

Iceberg 1.12.0 官方标注 9 月 29 日发布，但 9 月 29 日合并的幂等键期限保护并不包含在该版本中。版本与合并恰好同周，很容易造成误判：客户端原本可重试带键的 POST，新补丁进一步要求下一次等待不能越过服务端保存去重记录的期限。否则，相同键在过期之后不再保证是同一次操作。[发行说明](https://iceberg.apache.org/releases/#1120-release) · [期限保护 #18070](https://github.com/apache/iceberg/pull/18070) · [1.12.0 源码](https://github.com/apache/iceberg/blob/apache-iceberg-1.12.0/core/src/main/java/org/apache/iceberg/rest/ExponentialHttpRequestRetryStrategy.java)

这不是简单增加重试次数的问题。停止重试后，结果仍可能不确定，调用方需要核对表状态；换一个新键重发，也不能自动消除重复执行风险。这是从协议边界推导出的恢复要求。

Paimon 同周的两个实现处理不同层次：共享位图把同一批候选行交给所有列 reader，避免过滤下推造成列错位；快照发布报错后核对目标内容，识别“服务端成功、客户端收到异常”，再补齐 `LATEST` 提示。二者都已合并，稳定版归属尚未确认；已经落后的提示如何跨保留窗口恢复，另一个 PR 仍未合并。[行对齐 #10289](https://github.com/apache/paimon/pull/10289) · [提交识别 #10324](https://github.com/apache/paimon/pull/10324) · [待完成恢复 #10323](https://github.com/apache/paimon/pull/10323)

版本核对、失败时序和过滤示例见[数据湖分稿]({{ '/posts/tech-research/week-12/lakehouse/' | relative_url }})。

## 流存储：日志搬走之后，顺序和回收证据留在哪里？

Kafka KIP-1165 在 9 月 30 日和 10 月 2 日修订，仍处于重新讨论阶段。当前方案把混合分区 WAL 异步物化为普通日志段，再进入 KIP-405 分层存储；回收依据是已完整发布、没有洞的远端前缀，而不是所见最大的 offset。事务仍是后续工作，不能把设计修订写成 Kafka 已交付无盘事务。[KIP-1165 原文](https://cwiki.apache.org/confluence/spaces/KAFKA/pages/350783996/KIP-1165+Object+Consolidation+for+Diskless)

AutoMQ 本周合并的逻辑截断，通过缩小旧 slice 可见范围、创建新段表达日志回退，并用截断 epoch 阻止旧追加回调再次推进确认位置。Fluss 的历史分区则补上湖进度到 WAL 回收边界的通知；它没有取消远端上传和本地保留保护，而是把已有回收资格传给 leader 与 follower。[AutoMQ #3632](https://github.com/AutoMQ/automq/pull/3632) · [Fluss #4487](https://github.com/apache/fluss/pull/4487)

补查中，Fluss 1.0.0 为 Coordinator HA 及上期两项修复补齐了发行证据；FIP 页面仍为 Accepted，不能用 Wiki 标签代替实际版本核对。[Fluss 1.0.0](https://github.com/apache/fluss/releases/tag/v1.0.0)。分支、批次内部截断和提案状态对照见[流存储分稿]({{ '/posts/tech-research/week-12/streaming/' | relative_url }})。

## 存储顶会：共享内存不会自动消除协调

SOSP 2026 于 9 月 29 日至 10 月 2 日举行。本期从正式日程选取 Prism 与 Borges，读取作者公开的完整论文；会议时间是本期事件，不能当作论文首次公开时间。[官方日程](https://sigops.org/s/conferences/sosp/2026/schedule.html)

Prism 让大部分数据不可变，把有限的硬件一致性空间用于热写入及版本元数据；Borges 则将复制完成、全局排序、索引发布分开，让读者只看到匹配的提交边界与索引。两者共同提醒我们：优化的对象应包含“谁能修改”和“谁能看见”，而不仅是字节搬运速度。[Prism 原文](https://dassl-uiuc.github.io/pdfs/papers/prism.pdf) · [Borges 原文](https://www.cs.utexas.edu/users/witchel/pubs/chen26sosp-borges.pdf)

这两项研究也不能被包装为现成生产替代方案。Prism 不提供持久性，任一主机或 CXL 设备失败会使全系统停止；Borges 的 pod 评估采用单物理服务器上的虚拟机与真实 CMM-H，尚不是独立物理故障域的生产验证。补查 DiaLSM 则展示了把写停顿转为跨分片指针和迁回工作的另一种取舍，其关键性能实验关闭 commit logging，不能直接套用到持久数据库。[DiaLSM 原文](https://arxiv.org/pdf/2609.14370)

FAST、OSDI、SOSP、ATC、SIGMOD、VLDB，并补充 NSDI/ICDE 的核验范围和实验配置见[存储顶会分稿]({{ '/posts/tech-research/week-12/distributed-storage/' | relative_url }})。其中 ATC 官方已说明 2025 为最后一届，不将不存在的 ATC 2026 列作待更新论文集。[USENIX 说明](https://www.usenix.org/blog/preserving-legacy-usenix-atc)

## AI Infra：弹性与命中率之外，还要回答切换成本与质量

10 月 2 日发布的 SGLang v0.5.21 包含运行时 prefill/decode 角色切换。模型权重和 KV pool 可以保留，但实例需先排空，前缀缓存会清空；外部控制器仍需决定何时切换。因而“不重启加载权重”并不等于没有停接单和预热代价。[Release](https://github.com/sgl-project/sglang/releases/tag/v0.5.21) · [角色切换实现](https://github.com/sgl-project/sglang/pull/28403)

补查的 Dynamo v1.5.0 把存储层与共享缓存事件纳入路由，强调对象存在、分片齐全、本机可用是不同条件。事件流中断时保守清空索引，会暂时损失命中收益，却避免继续使用过期信息。组合部署缓存路由与角色切换时，需要另验旧亲和性是否及时失效；不能从两个单独特性推导组合系统的一致性。[版本说明](https://docs.dynamo.nvidia.com/dynamo/v1.5.0/reference/releases/v1-5-0) · [共享事件索引](https://github.com/ai-dynamo/dynamo/pull/11239)

9 月 25 日的评估预印本追问的是位置无关、chunk 级近似 KV 复用，不能泛化成精确前缀缓存的问题。它要求观察完整计算本来答对的题是否被保住、结果是否受旧缓存历史影响，而非只比较平均分。本期未复现 GPU 基准，性能和质量结论均保留作者实现与负载边界。[论文原文](https://arxiv.org/html/2609.31415v1)

切换失败分支、路由索引缺口与逐题质量例子见[AI Infra 分稿]({{ '/posts/tech-research/week-12/ai-infra/' | relative_url }})。

## 下一步值得验证什么

如果只选三组实验，我会优先做：

1. **不确定提交恢复**：让远端操作实际成功，再丢弃响应，观察重试是否重复执行、提示和真实状态是否一起前进。
2. **安全回收边界**：人为延迟索引、manifest 或协调元数据更新，验证物理删除不会抢在新的可读路径之前。
3. **缓存状态变化**：同时记录角色切换排空时间、事件断流后的索引恢复，以及近似复用的逐题退化；把状态历史纳入实验输入。

这些是根据本期机制提出的实验建议，尚未在对应系统上实测。逐条日期、状态、已读内容及访问限制见[来源索引](https://github.com/BryantChang1992/ai_memory_chang_ai_team/blob/main/docs/drafts/weekly/2026-10-03/sources.json)与[核验说明](https://github.com/BryantChang1992/ai_memory_chang_ai_team/blob/main/docs/drafts/weekly/2026-10-03/review.md)。
