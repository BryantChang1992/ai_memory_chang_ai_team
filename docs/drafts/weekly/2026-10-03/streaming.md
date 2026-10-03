**主窗口：2026 年 9 月 26 日 10:30—10 月 3 日 10:30（Asia/Shanghai）。补查窗口：9 月 11 日 09:00 至主窗口开始前。**

日志系统中的 offset 是位置，却不是一张通用的“完成证明”。对象已经上传，不等于它已成为连续可读的日志；旧批次已经被截断，不等于较早发出的异步回调也随之失效；湖里的快照已经推进，也不等于每个副本都知道本地日志可以回收。

本期选取 Kafka、AutoMQ、Fluss 三个案例，讨论这些位置分别证明什么。Kafka 的新证据属于仍在讨论的设计修订，另外两个案例属于已合并实现；正式版本的交付证据放在文末，避免把不同成熟度混在一起。

## Kafka：把无盘 WAL 变成长期日志，需要证明前缀没有洞

[KIP-1165：Object Consolidation for Diskless](https://cwiki.apache.org/confluence/spaces/KAFKA/pages/350783996/KIP-1165+Object+Consolidation+for+Diskless) 当前状态是 **Under Discussion (Re-Opened)**。补查读到的 9 月 18 日版本已重写方案，主窗口内 9 月 30 日继续修订，10 月 2 日又明确把事务列入后续工作。这里讨论的是最新版提案，尚无据此确认的正式发布。

方案关注一个容易被“数据都在对象存储”掩盖的问题：混合多个分区的 WAL 对象适合摄入。一次上传覆盖多个分区，可以摊薄请求成本；但把这种布局永久当作日志，会让慢消费者反复定位批次、让协调器长期保存大量坐标，也使某个分区的数据删除受同一对象中其他活跃批次牵制。

当前 KIP 因而选择：无盘主题从创建起就具有 consolidation 路径。各副本异步把 WAL 批次物化为普通的分区日志段，再由分区 leader 通过 KIP-405 的存储及元数据插件上传。它复用既有日志格式、索引和远端读取；原先关联到 KIP-1165 的“合并 WAL 对象”不再是该提案的范围。物化放在 Produce 确认之后，避免把本地写盘重新放回摄入关键路径。[方案与范围](https://cwiki.apache.org/confluence/spaces/KAFKA/pages/350783996/KIP-1165+Object+Consolidation+for+Diskless)

最关键的不是多一条复制流水线，而是拆开几种过去容易混用的边界：

| 边界 | 证明的事情 | 不能据此推出 |
|---|---|---|
| 全局起点 G | G 之前的数据在逻辑上不可读取 | 所有旧对象已经物理删除 |
| WAL 起点 W | 更早的位置已没有可用 WAL 坐标 | 消费者不能从长期分层存储读取更早数据 |
| 连续远端末尾 T，含该位置 | 从有效起点开始，分层副本已完成且没有洞 | 看到一个更大远端 offset，就能跨越中间缺口 |
| 本地物化末尾 C | 此副本已构造到哪里 | 该范围已经完成远端持久化 |

提案要求远端数据、索引和 producer snapshot 完整保存，元数据进入 `COPY_SEGMENT_FINISHED`，并检查与已有连续前缀衔接，才能推进 T。随后 leader 向协调器报告，协调器检查领导权及边界，提交元数据记录，才移除被覆盖的 WAL 坐标。对象真正删除继续使用 KIP-1164 的所有权交接机制。

可以用一个**本文推演**理解这个顺序：远端已完成 [100,200)，又出现 [300,400)，却缺少中间一段。如果仅按“最大远端 offset 是 399”清理 WAL，就会删除仍承担 [200,300) 唯一读路径的坐标。连续前缀必须停在 199；补齐缺口后才能向前。leader 切换后，同样需要重建连续边界，不能照抄看起来最大的数字。

保留策略走相反方向：先提交新的全局起点 G，使旧记录逻辑不可读，再删除完全落在 G 之前的远端段。如果协调器提交失败，提案选择保留旧起点、不删除对象，代价是过期数据可能暂时继续可读。它用可解释的回收延迟换取避免误删的安全性。[删除与恢复协议](https://cwiki.apache.org/confluence/spaces/KAFKA/pages/350783996/KIP-1165+Object+Consolidation+for+Diskless)

代价也很具体：后台需要额外读取 WAL、生成日志段并再次上传；本地磁盘仍承担缓存和中转职责。暂停 consolidation 会积累 WAL 和坐标，不能据此承诺固定时间内完成物理删除。最新版还限制 `cleanup.policy` 为 delete，并将事务留作后续设计。**它是在收窄和补齐无盘方案的交付边界，不能读成 Kafka 已经拥有完整无盘事务能力。**

## AutoMQ：底层只能追加，怎样让上层日志“退回去”？

AutoMQ 的 [#3627](https://github.com/AutoMQ/automq/pull/3627) 与 [#3632](https://github.com/AutoMQ/automq/pull/3632) 分别于 9 月 29 日 14:40、15:18 合入 `1.8` 和 `main`，为 ElasticLog 增加逻辑截断。两条 PR 是同一能力在不同分支的落地，尚未确认正式发行版归属。

ElasticLog 的 segment 由只能追加的 stream slice 支撑。文件式日志可以改变文件长度，而底层 stream 不能把末尾倒退；上层仍必须表达“目标 offset 及之后的旧记录失效”，并保证重开后保持这个结果。补丁没有尝试改写旧对象，而是缩小旧 slice 的可见范围，封闭它，再从请求的逻辑 offset 创建新活动段。[截断实现](https://github.com/AutoMQ/automq/pull/3632/files)

底层批次不可拆分，使物理保留边界与新段逻辑起点未必相同。下面是**说明性例子，并非事故记录**：

| 步骤 | 结果 |
|---|---|
| 某个底层批次覆盖 [100,110)，请求截断到 105 | 包含目标位置的整个底层批次被排除 |
| 封闭旧 slice | 保留到该批次之前，不把其中半批重新解释为有效数据 |
| 新活动段从 105 开始 | 100—104 可能形成合法空隙；不能把新起点偷偷改成 100 |

只有可见范围还不够。假设截断前已经发出一次追加，其完成回调在截断后才到达。若它仍推进 confirmed offset，就会把已经失效的尾部重新算作已确认。补丁为追加捕获 truncation epoch；回调只有仍属于当前 epoch，才可以推进确认位置。这里的 epoch 是对旧异步工作的隔离边界，不是对象存储复制完成的证明。

新段转换还要同步持久化完整 segment 集合，再进入活动状态；过程失败会转成 I/O 错误，让原有失败路径隔离分区。被截短的时间索引可能缺少物理末尾条目，因此实现另存逻辑最大时间戳及其 offset，保证恢复后的时间查询不跳错段。[元数据、回调与恢复测试](https://github.com/AutoMQ/automq/pull/3632/files)

工程上的收益是用不可变底层实现可变的日志视图；成本是同步元数据持久化、定位批次与重建索引边界的工作。逻辑截断也不承诺旧对象立即物理回收。验证重点应是“截断前回调迟到”“目标落在批次内部”“持久化失败”“重开后按时间查找”，而不是只检查内存中的末尾数字是否变小。

补查窗口内，9 月 21 日合并的 [#3609](https://github.com/AutoMQ/automq/pull/3609) 解决了另一方向的边界问题：保留策略已推进日志起点，但旧 segment 尚未移除时，时间查询必须尊重起点，并在当前段找不到有效记录时继续搜后续段。一个收紧尾部，一个排除失效前缀，共同说明索引必须服从逻辑可见范围。

## Fluss：湖已提交，为什么磁盘还在增长？

Fluss [#4487](https://github.com/apache/fluss/pull/4487) 于 9 月 28 日 16:01 合入 `main`，修复历史分区的 WAL 保留边界一直停留在初始化值的问题。即便日志已上传、湖提交也不断推进，本地段仍可能无法回收。

普通 KV 分区依靠 KV snapshot 加剩余 WAL 恢复，因而可以用快照进度推进最小保留位置。历史分区采用湖中状态加后续 WAL 的恢复方式，并不生成同样的 KV snapshot。继续等待普通分区的回调，相当于等待一个不会到来的回收信号。[原因与补丁](https://github.com/apache/fluss/pull/4487/files)

修复把历史分区的最小保留位置更新放入共享 `LogTablet` 的湖进度处理路径。leader 和 follower 都能收到；这一点很重要，因为 follower 没有本地 KV 状态，也不会产生对应快照回调。边界只向前推进，重复或迟到通知不会使它后退。

不过，湖进度并不是唯一删除条件。补丁保留远端上传边界、完整 segment 判断和配置的本地保留段数。其回归测试给出了很直观的过程：

| 已知进度 | 本地回收应有的限制 |
|---|---|
| 湖进度到 15，段从 0、10、20 等位置开始 | 包含 15 的段仍有恢复所需后缀，不能整段删除 |
| 湖进度到 30，远端上传仅覆盖到 20 | 不能借湖进度越过远端上传保护 |
| 上传追上后 | 仍保留配置要求的最近本地段 |

这里没有缩短湖提交周期，也没有取消恢复保护，而是把已经具备的回收资格传递给正确组件。测试还覆盖 follower 清理后升为 leader：湖已覆盖的值从湖查找，较新的值和删除标记从 WAL 恢复，删除标记必须继续压住湖里的旧值。[恢复测试](https://github.com/apache/fluss/pull/4487/files)

补查的 [#4199](https://github.com/apache/fluss/pull/4199) 于 9 月 18 日合入 `main`，处理的是另一份本地状态：给历史 KV 值和 tombstone 标注产生它们的 WAL offset，以确认的湖进度确定可清理范围，再借正常 RocksDB compaction 逐步回收。它不在边界推进时额外触发一次全范围 compaction。两项修改分别推进 KV 状态和 WAL 段的清理，不能把其中一项当成全部磁盘占用问题已经解决。

## 发布与提案：本期真正变化在哪里

Kafka [4.2.2 于 9 月 29 日发布](https://kafka.apache.org/blog/2026/09/29/apache-kafka-4.2.2-release-announcement/)。其[升级说明](https://kafka.apache.org/42/getting-started/upgrade/#upgrading-to-422)列出 EOS 恢复后 checkpoint 残留、消费组降级等修复；这与同日才合入 trunk 的 [#23584](https://github.com/apache/kafka/pull/23584)、[#23585](https://github.com/apache/kafka/pull/23585)应分开。后两项分别清除任务复活前的旧消费位置，以及让 source-topic changelog 的 checkpoint 采用已消费位置，防止把“写到了哪里”当成“状态应用到了哪里”。本期未把它们归入 4.2.2。

| 跟踪项 | 核验结果及所属窗口 |
|---|---|
| KIP-1165 | 本期新增跟踪；仍在重新讨论，9/30、10/2 修订，未确认实现或发布 |
| [FIP-9](https://cwiki.apache.org/confluence/spaces/FLUSS/pages/373886089/FIP-9+Support+CoordinatorServer+High+Availability) | Wiki 仍标 Accepted；Coordinator HA 已有 [Fluss 1.0.0 release](https://github.com/apache/fluss/releases/tag/v1.0.0) 明确证据，属于补查窗口 |
| Week11 的 Fluss #4254、#3675 | 同一 1.0.0 release 明确列出，分别补齐远端 offset 更新顺序、Flink 2.x lookup shuffle 的发行归属 |
| AutoMQ #3575 | [1.7.5-rc1](https://github.com/AutoMQ/automq/releases/tag/1.7.5-rc1) 于 9/24 列入，属于候选版交付证据；不写成稳定版发布 |

Fluss [1.0 公告](https://fluss.apache.org/blog/releases/1.0/)页面标注 9 月 21 日，GitHub release 发布于 9 月 22 日，两者都属于补查。FIP-3、FIP-6 页面仍为 Accepted，但 Iceberg 分层及 union read 解耦的实现早已出现在 [0.8.0 发行记录](https://github.com/apache/fluss/releases/tag/v0.8.0-incubating)；这是补全旧基线，不是本周新能力。

[KIP-1163](https://cwiki.apache.org/confluence/spaces/KAFKA/pages/350783976/KIP-1163+Diskless+Core)、[KIP-1164](https://cwiki.apache.org/confluence/spaces/KAFKA/pages/350783984/KIP-1164+Diskless+Coordinator)、[KIP-1183](https://cwiki.apache.org/confluence/spaces/KAFKA/pages/357960226/KIP-1183+Unified+Shared+Storage)仍为 Under Discussion；1164 的 9/30 文本差异只是作者增补。新建的 [KIP-1379](https://cwiki.apache.org/confluence/spaces/KAFKA/pages/451979127/KIP-1379+Make+server-side+rack-aware+assignment+opt-in)则在 10 月 2 日提出让服务端 rack-aware assignment 显式启用，减少不需要机架信息的组计算开销，仍待讨论。

本期最值得带回自己的系统的是一组具体问题：每个水位由谁推进、代表哪个恢复条件、旧异步任务能否越过它，以及物理回收失败时系统保留什么。只有这些答案一致，offset 的前进或后退才真正有意义。
