---
title: "技术调研周报 — Week 13（2026-10-04 周日增补）"
date: "2026-10-04 08:00:00 +0800"
permalink: "/posts/tech-research/week-13/"
categories: []
issue: 13
issue_date: "2026-10-04"
content_type: "周报"
reading_title: "复合索引与客户端状态修补"
description: "周日增补：Paimon 复合 BTree、Fluss Rust 路由与退避、SGLang KV 事件重放；Kafka 未合并提案及存储顶会覆盖边界。"
tags: ["数据湖", "Paimon", "Kafka", "AutoMQ", "Fluss", "AI Infra", "KV Cache"]
---

**本期是 10 月 3 日即时周报之后的周日增补。新增事件窗口为 10 月 3 日 10:30 至 10 月 4 日 08:00（北京时间）；来源于今晨逐项复核，具体读取时间见文末来源索引。** 前一窗口的完整机制分析继续保留在 [Week 12]({{ '/posts/tech-research/week-12/' | relative_url }})，本期只展开后续变化。

这次新增进展更偏向实现边界：Paimon 把复合索引接到可用的查询路径，同时限定区间展开与扫描成本；Fluss 修补 Rust 客户端对故障状态和分区元数据的处理；SGLang 开始为缓存事件缺口补账，却仍明确保留历史不足时的失败边界。它们均不能直接推导成稳定版本已经交付，更没有新的通用性能倍数可供引用。

对部署决策，三个判断值得放在前面：复合索引要先验证列序与覆盖范围；故障恢复时的重试频率本身会影响剩余节点；缓存路由中“预测持有”和“事件确认”需要分别验收。存储顶会与 AutoMQ 在本轮覆盖内未建立新的实质交付证据，相应章节保留核查结论和缺口。

## 数据湖：Paimon 复合索引接通 SQL 与范围查询

Paimon 这段时间的实质增量，是把复合 BTree 从核心等值查询，接到 Flink/Spark 的建索引入口，再扩展到前缀、范围、IN 和 NULL。前序存储与等值查询已经在 10 月 2 日合并，属于本次窗口外背景；本次四项补丁分别于 10 月 3 日 14:05、16:35、17:55、19:17 合入 master，目前没有核验到包含它们的稳定发行版。[前序等值查询](https://github.com/apache/paimon/pull/10339)；[SQL 建索引](https://github.com/apache/paimon/pull/10345)；[范围查询](https://github.com/apache/paimon/pull/10346)；[IN/NULL](https://github.com/apache/paimon/pull/10347)；[切片比较](https://github.com/apache/paimon/pull/10349)

它解决的是多列过滤的中间结果成本。独立单列索引可能先展开两大份行号，再求交集；复合索引将有类型的元组直接映射到行号列表。以 `(category, item_number)` 为例，类别 IN 两个值、编号大于 7，可以拆成两个类别前缀内的范围；只筛编号不能利用这个索引的左前缀。遇到首个范围列之后，后续键列条件仍由数据过滤处理，不能把“涉及多列”写成“所有条件都下推”。[实现与文档](https://github.com/apache/paimon/pull/10346/files)

离散条件也有成本上限：每列先求条件交集、按类型去重，再展开，最多生成 256 个元组区间；超限改走其他索引或普通扫描。IN 列表里的 NULL 不命中 NULL 键，IS NULL 才显式选择它。范围扫描按候选索引文件字节数计算预算，共享文件只算一次；任一索引组超预算，就放弃整个复合定义，避免只选择部分组造成执行路径的覆盖范围不一致。完整键的点查不受这一扫描预算限制，但仍受区间数量限制。[规划器与边界测试](https://github.com/apache/paimon/pull/10347/files)

最后一项把块索引和数据块二分查找中的复合键比较，改为直接比较序列化切片，省掉反复拷贝与完整行反序列化，保留文件格式。上游测试对真实跨块点查计数，断言打开元数据后不再增加完整行反序列化；这是机制证据，不能换算成查询加速倍数。测试还覆盖 NULL、NaN、不同切片偏移和并发比较；本次未独立运行。[比较实现与测试](https://github.com/apache/paimon/pull/10349/files)

工程上应先核对索引列序、选择性和覆盖范围。FULL/DETAIL 模式会对未覆盖行保留数据过滤；更新键列导致索引范围失效后，还要重建。Python 复合索引支持仍未交付，不能因为文档同时列出 Python 单列示例就推定能力对齐。[版本固定的文档](https://github.com/apache/paimon/blob/9489f9a3eb094fc4bbec6b93b22dd85a95903d66/docs/docs/multimodal-table/global-index/btree.mdx)；[本次支持范围](https://github.com/apache/paimon/pull/10347)

### Iceberg 与快照恢复跟进

- 上期未合并的 [Paimon #10323](https://github.com/apache/paimon/pull/10323) 仍为 open。10 月 3 日 13:23 的[新增评审](https://github.com/apache/paimon/pull/10323#issuecomment-5965917048)支持撤回读侧恢复、改在过期删除前保护从提示快照起的连续后缀；仅保留 N 而删除 N+1 仍会让判断误认 N 为最新。评审还要求区分提示不存在与读取失败，无法确定边界时保守停止删除。评审明确当前 head 仍存在此前提出的重放问题，尚未验证新实现；不可写成已修复。
- Iceberg 的官方发行说明与 GitHub 发布记录仍以 1.12.0 为最新；GitHub 日期型合并搜索无结果，并以最新 100 个 closed PR 的 merged_at 交叉核对，未找到本窗口新合并。因此只写“在本次覆盖来源内未发现可核验的新进展”，不重复昨天的旧材料，也不推断整个项目没有活动。[发行说明](https://iceberg.apache.org/releases/#1120-release)；[发布记录](https://github.com/apache/iceberg/releases)


幂等提交、共享位图与不确定 rename 的前序机制见[上期数据湖分稿]({{ '/posts/tech-research/week-12/lakehouse/' | relative_url }})。

## Kafka、AutoMQ、Fluss：分区布局与故障重试

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

## 存储顶会：本轮未建立新增实质研究进展证据

在本次可访问的官方目录、日程和勘误范围内，尚未核实到增量窗口内发布的新存储论文或有明确日期的实质修订；这不代表所有作者仓库和出版社页面均无变化。[SOSP 官方日程](https://sigops.org/s/conferences/sosp/2026/schedule.html)仍对应 9 月 30 日至 10 月 2 日正式场次；[PVLDB 第 20 卷](https://www.vldb.org/pvldb/volumes/20/)可见部分仍仅列第 1 期，其[正式刊头](https://www.vldb.org/pvldb/vol20/FrontMatterVol20No1.pdf)为 2026 年 9 月，论文将于 VLDB 2027 展示。月级日期不能证明进入这个小时级窗口。

有一项书目补查值得保留：[FAST 2026 官方勘误](https://www.usenix.org/system/files/fast26_errata_baron.pdf)把苹果对象存储论文的系统名称从 McQueen 改为 ACOS。这份一页勘误没有发布日期，也没有新增架构实验，因此只更新引用名称，不当作本周新技术。

本轮核对了 FAST、OSDI、SOSP、SIGMOD/PACMMOD、VLDB/PVLDB 和 USENIX ATC。OSDI 技术目录多次超时，ACM 最新期刊及对象存储论文原文未成功取得，无法排除相关新增或勘误；[USENIX ATC 已于 2025 届后停办](https://www.usenix.org/blog/usenix-atc-announcement)，不建立 ATC 2026 论文集。详细访问范围与原始链接见来源索引。Prism、Borges、DiaLSM 的机制、论文状态和实验限制继续见[上期存储分稿]({{ '/posts/tech-research/week-12/distributed-storage/' | relative_url }})。

## AI Infra：缓存事件缺口补账与预测归属

**本节新增均为主干合并，尚未核验到包含它们的新发行版。SGLang 路由变化位于实验性的 experimental/sgl-router，不代表所有网关都已启用。**

**最有实质性的变化，是把“没收到缓存事件”从监控计数推进到有限修复。** SGLang #42274/#42275 于 10 月 4 日 04:42/04:43 合并：引擎先公布重放端口，路由订阅者再按 worker、DP rank 跟踪序号，发现跳号就取回缺失批次，先处理补回事件，再处理触发缺口的实时批次。[端点发现](https://github.com/sgl-project/sglang/pull/42274) · [缺口重放](https://github.com/sgl-project/sglang/pull/42275)

这不是普通的“提高命中率”。ZMQ 在发送队列触及高水位时会丢事件；丢掉新增记录，路由可能少算缓存，丢掉删除记录，却可能继续相信 worker 持有已淘汰的数据。补回删除事件，修的是亲和性判断的事实基础。非零序号回退时，新实现会触发发布者重置、重新学习；回到 batch 0 则交给 pump 按流起点处理。这个区别避免把起点批次一概当作重启，又能阻止旧游标一直挡住后续事件。

**代价与边界同样明确。** 重放需显式配置；引擎默认只保留最近 10,000 批事件，单次补账最多等待 2 秒，其间实时帧留在订阅 socket。历史不足或超时，就转发已取回部分，剩余仍计为丢失，不能称为可靠消息队列或完整状态恢复。多 DP rank 的发布与重放端口范围还须错开。作者给出本机回环测试：实时收到 1、4 时补回 2、3；这证明协议路径，不证明生产故障下的 TTFT 收益。[实现与配置](https://github.com/sgl-project/sglang/blob/fd5e68f99e552b98d1086e543b2a958899e8632b/experimental/sgl-router/README.md)

同日 05:57 合并的 #42276 则处理相反的时间差：冷前缀刚被路由，还没有确认事件时，用可选短 TTL 记录其预期归属，减少并发采样或 Agent 扇出把相同前缀散到多台机器。它默认关闭、仅用于本地前缀树，预测与事件树分别保存，不能把预测命中写成引擎实际复用。作者仅验证八个相同请求的路由聚集，明确尚无端到端测量；最终代码也会在清理 worker 缓存时清掉预测记录。[PR 与验证边界](https://github.com/sgl-project/sglang/pull/42276)

**必要简报：** vLLM #59504 于 10 月 3 日 14:26 合并，让 connector 明确声明异步装载会写入哪些 KV 组，再由分配器只对这些新块跳过清零，修复清零与外部写入竞争；未装载组仍保留清零。它是正确性修补，没有通用加速结论。[实现 PR](https://github.com/vllm-project/vllm/pull/59504)

我的判断：验收应拆开“事件确认、路由预测、引擎实际复用”，注入丢删除事件、历史溢出和重启三类故障，分别观察补账结果与请求延迟。以上读取了原始 PR 和相关实现，未运行 GPU 基准；不能将这里的 SGLang 重放误写为昨日 Dynamo Mooncake 共享索引的重放能力。

运行时角色切换、Dynamo 分层路由及近似 KV 复用质量的既有分析见[上期 AI Infra 分稿]({{ '/posts/tech-research/week-12/ai-infra/' | relative_url }})。

## 下一步优先验证什么

这轮更值得新增的是边界测试，而非重复测一个热路径平均值。下面是依据实现提出的验证建议，尚未在业务系统复现：

| 对象 | 建议输入或故障 | 需要区分的结果 |
|---|---|---|
| Paimon 复合索引 | 非左前缀、IN 展开超过上限、部分数据未建索引 | 正确回退与遗漏过滤是两回事；同时记录扫描成本 |
| Fluss Rust 客户端 | 扩桶前后分区共存、leader 长时间缺失 | 错布局批次应被拒绝，并由调用方重试，元数据请求频率应有界 |
| SGLang 实验路由 | 丢删除事件、重放历史不足、publisher 重启 | 事件补账、预测亲和性和实际复用分别计量 |

这是一篇有意收敛的周日补刊：以上代码变化均保留主干合并与发行之间的距离；Kafka PoC 和设计修订不算已交付。原始事件时间、检索时间、读取范围、提案前后状态及访问缺口见[本期来源索引](https://github.com/BryantChang1992/ai_memory_chang_ai_team/blob/main/docs/drafts/weekly/2026-10-04/sources.json)和[核验说明](https://github.com/BryantChang1992/ai_memory_chang_ai_team/blob/main/docs/drafts/weekly/2026-10-04/review.md)。
