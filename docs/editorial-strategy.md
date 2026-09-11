# 博客更新策略

确认日期：2026-09-11。适用于本博客后续内容生产，与 `content-maintenance.md` 的页面和元数据约定配合使用。

## 两条内容流程

| 类型 | 触发方式 | 交付 | 发布条件 |
|---|---|---|---|
| 技术调研周报 | 每周五北京时间 09:00 开始生成 | 一篇总览、按需分方向报告、来源清单、提案变化记录 | Bryant review 通过后提交并发布 |
| 技术想法与观点文章 | Bryant 发起讨论 | 讨论结论、文章草稿、待确认的问题 | Bryant review 最终稿后提交并发布 |

定时任务只生成草稿，不向 `_posts` 写入待审稿，不推送或部署。已有待审稿继续保留；没有 review 不影响下一期草稿生成，也不视为默许发布。每次批准只适用于对应稿件的确认版本。

## 每周四个调研领域

| 领域 | 核心问题与范围 | 论文重点 |
|---|---|---|
| 数据湖处理 | 表格式、Catalog、流批处理、增量计算、Compaction、查询优化、湖仓互操作；重点关注 Iceberg、Paimon、Hudi、Delta Lake 及相关 Flink/Trino 集成 | SIGMOD/PACMMOD、VLDB/PVLDB、ICDE，以及相关系统会议 |
| 流存储最新进展 | Kafka、AutoMQ、Fluss；日志与 KV、对象存储、分层存储、复制、元数据、消费协议、故障恢复、湖仓融合与协议兼容 | SIGMOD、VLDB、FAST、OSDI、SOSP、NSDI |
| 分布式存储最新进展 | 分布式 KV、对象/文件存储、共识与一致性、分布式事务、存算分离、缓存与恢复、性能成本；Doris 等系统仅在存储架构相关时纳入 | FAST、OSDI、SOSP、NSDI、ATC、SIGMOD、VLDB |
| AI Infra 调研 | 推理/服务、调度与资源管理、训练数据链路、缓存与存储、Agent 运行环境、评估、可观测性和安全；模型发布需有基础设施层面的变化才纳入 | MLSys、OSDI、SOSP、NSDI，以及 NeurIPS、ICML、ICLR 的相关系统工作 |

四个领域是周报的固定章节，与站点三个长期主题分开管理。每项动态选择一个主领域，跨领域只做关联引用，避免同一条新闻重复占位。

周报总览保持四个章节；每领域优先选择 2～4 项有价值变化，不凑数。缺乏重要更新时说明“本周未发现可核验的重要更新”；来源访问失败写“覆盖不足”，不能写成“没有进展”。有足够分析再生成分稿，不为了四个领域机械生成四篇空稿。

## 来源和采集口径

1. 优先读取论文原文、会议正式论文集、官方提案、开发者邮件列表、关联 Issue/PR、Release Notes。官方技术博客可补充设计动机；搜索摘要和二手报道仅用于发现线索。
2. 默认覆盖上周五 09:00 至本周五 09:00（Asia/Shanghai）。记录事件日期和核验时间。首次运行建立现状基线，旧进展标为“背景/基线”，不填补过去未调研的期数。延期执行保留计划窗口，跨过多个周期时分清补查记录。
3. 论文区分预印本、正式录用、已发表；会议和年份从正式页面核验。旧论文有新代码/评测时，分别记录旧论文日期和本周新增事件。只有摘要可读时注明，不能声称全文精读。
4. 发布、合并、通过投票是不同事件。版本、编号、日期、性能数据必须有对应原文；实验结论注明硬件、负载、基线与适用范围，区分作者报告和独立验证。
5. 先看上一期和持续跟踪表，按论文标识、提案编号、PR 或 Release 去重。正文明确区分“来源事实”“我的分析”“尚待验证”。
6. SearXNG 可用时优先用它发现来源；不可用时转官方站点和可用浏览工具，记录来源缺口，不把失败转换成猜测。

论文来源从当期正式目录定位，避免把会议预告当作论文已发表的证据：[PVLDB](https://www.vldb.org/pvldb/)、[USENIX 会议目录](https://www.usenix.org/conferences)。

## 社区提案与实现进展

- **Kafka**：[KIP 目录](https://cwiki.apache.org/confluence/spaces/KAFKA/pages/50859233/Kafka+Improvement+Proposals) → 提案原文 → 开发邮件的讨论/投票 → 关联 Issue/PR → 正式版本。
- **Fluss**：[FIP 目录与流程](https://cwiki.apache.org/confluence/spaces/FLUSS/pages/372214312/Fluss+Improvement+Proposals) → [开发邮件](https://lists.apache.org/list.html?dev@fluss.apache.org) → [PR](https://github.com/apache/fluss/pulls) → 发布记录。
- **AutoMQ**：按[官方贡献流程](https://github.com/AutoMQ/automq/blob/main/CONTRIBUTING_GUIDE.md)跟踪 [Issue](https://github.com/AutoMQ/automq/issues)、[PR](https://github.com/AutoMQ/automq/pulls)、[发布记录](https://github.com/AutoMQ/automq/releases)。RFC/proposal/design 可作检索关键词，保留来源自身编号；没有依据时不命名为 AMIP。
- AutoMQ 涉及上游 Kafka 时，分开记录上游 KIP 状态和 AutoMQ 具体版本的实现/回移差异。[协议兼容说明](https://docs.automq.com/automq/what-is-automq/compatibility-with-apache-kafka)不能替代某个 KIP 已交付的证据。

维护 `research/proposal-watchlist.json`。初次运行先从官方目录建立核心清单，之后每周同时检查已有条目和新提案，避免清单固化。优先关注对象/分层存储、存算分离、复制与一致性、元数据/容错、消费协议、湖仓集成。

每项记录：项目、原始编号、标题、链接、关注原因、来源状态、上次状态、本次变化、事件时间、核验时间、讨论/投票链接、实现 PR、目标版本、实际发布版本、发布证据、后续观察点。目录与正文冲突时保留两条证据并标记待确认。

首次可以从 KIP-1163、KIP-1164、KIP-1183 等相关设计建立基线，但必须打开原文确认状态。已撤回、拒绝、被替代或稳定发布的设计保留历史；只在重新启动、替代方案或维护修复有变化时再写入周报。不得从编号大小推断重要程度或活跃状态。

每周总览中的跟踪表只展开实质变化：

| 项目 / 提案 | 上次状态 | 本周变化 | 工程影响 | 实现 / 发布证据 |
|---|---|---|---|---|
| 原始编号和标题 | 原文状态 | 设计修订、投票、实现、撤回或发布 | 兼容性、可靠性、性能、成本 | 原始链接 |

## 周报交付与 review

草稿存放在 `docs/drafts/weekly/YYYY-MM-DD/`，该目录不进入公开站点：

- `overview.md`：最重要的 3 个判断、四领域摘要、提案变化表、后续值得深挖的选题。
- 方向分稿：仅在需要时增加，命名 `lakehouse.md`、`streaming.md`、`distributed-storage.md`、`ai-infra.md`。
- `sources.json`：每项结论对应的来源、事件时间、读取时间和证据。
- `review.md`：本期覆盖范围、缺口、待确认结论、稿件列表及 review 状态。

总览建议 1,500～2,500 中文字；单条采用“发生了什么 → 关键机制与取舍 → 对工程的影响 → 原始来源”。模板见 `templates/weekly-overview.md`。正文不放抓取日志、模型运行记录、知识库入库数量或内部任务分工。

review 通过后才转为文章：检查最新仓库与未提交改动，按 `content-maintenance.md` 生成元数据和同一期总览/分稿关系，执行构建与站内链接检查，提交并推送；发布成功后回读页面。新增期号根据已发布内容和草稿登记生成，避免同一期重复。不得把用户 review 后的正文重新扩写再直接发布。

## 技术想法文章

1. Bryant 给出问题、初步判断或反例；通过讨论澄清读者、核心主张、适用场景和边界。
2. 将讨论中已确认的观点整理成提纲，再起草；思路已经清楚时直接推进，不额外增加每一步的审批。
3. 保留 Bryant 的立场和表达。补充外部论据时提供一手来源；示例、推断与真实经历明确区分，不虚构“我们线上验证过”。
4. 草稿存放在 `docs/drafts/ideas/<slug>/`，附 `review.md` 列出待确认点，模板见 `templates/idea-article.md`。
5. Bryant review 最终稿后提交并发布。新的实质改写回到 review，只有措辞和排版修正可沿用该稿的批准。

讨论中的零散想法不自动变成公开文章；周报中发现的选题可以进入待讨论清单。
