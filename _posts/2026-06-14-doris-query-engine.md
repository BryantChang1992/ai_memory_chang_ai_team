---
title: Doris 查询流程：规划、分布与执行
date: 2026-06-14 08:00:00 +0800
categories:
- 数据库与存储
tags:
- Doris
- 查询引擎
- OLAP
description: Doris 查询流程：规划、分布与执行：修订后的机制、证据边界与关联阅读。
topic: storage
content_type: 深度调研
series: doris
series_order: 4
reading_title: 查询流程
knowledge_source: 技术文章/Doris调研/03-查询流程.md
knowledge_synced_at: '2026-10-05'
last_modified_at: '2026-10-05'
knowledge_reviewed_at: '2026-10-05'
mermaid: true
---

```mermaid
flowchart TD
  S[SQL] --> P[FE 解析和语义分析]
  P --> O[规则改写、统计信息与成本优化]
  O --> F[划分并调度 Fragments]
  F --> B[BE 扫描、Join、聚合等批量算子]
  B --> E[Exchange 与结果返回]
```

一个 Fragment 可以有多个并行实例，实例分布与查询计划相关。向量化以列式批次减少解释与函数调用成本，批次大小和 SIMD 使用取决于配置、类型及算子，不能固定写成所有执行都为 4096 行。

## 数据分布和 Join

| 方式 | 作用 | 需要的条件 |
|---|---|---|
| Broadcast | 将一侧数据送到所需执行节点 | 大小估计、内存、Join 语义与成本 |
| Hash Shuffle | 按连接/聚合键重新分布 | 网络代价与数据倾斜可接受 |
| Bucket Shuffle | 利用已有 bucket 分布减少一侧重分布 | 键与分布条件匹配；不等于完全没有 shuffle |
| Colocate | 利用兼容放置执行本地 Join | 表组、分桶和放置满足要求 |

Runtime Filter 来自 Join 的 build 输入，可下推到适用的 probe 侧扫描。左右表不是固定角色；过滤率取决于数据选择性，旧稿没有数据集依据的 50%–99% 不作为保证。

```mermaid
flowchart TD
  B[Build 输入] --> H[Hash Table]
  B --> R[Runtime Filter]
  R --> P[Probe 扫描剪枝]
  P --> J[Join]
  H --> J
```

## 优化器与联邦查询

Nereids 结合规则、统计信息和成本模型选择计划。统计信息过期、相关性估计错误及倾斜都会影响结果；使用 EXPLAIN 与 profile 看真实计划，而非根据版本名预设必然更快。外部 Catalog 扩展数据源访问，但不能把某一数据源支持的读写、时间旅行或 schema 能力推广到其他 Catalog。

本次未对每个历史版本逐条核实首次引入时间，因此撤回旧“v4 Falcon”等未经证实的路线图。阅读 [Doris Nereids CBO 优化器]({{ '/knowledge/Doris-Nereids-CBO-优化器/' | relative_url }}) 与 [Doris MPP 向量化查询引擎]({{ '/knowledge/Doris-MPP-向量化查询引擎/' | relative_url }}) 时应同样以具体版本为准。


## 核验来源

- [Doris 系统架构](https://doris.apache.org/docs/dev/features-architecture/system-architecture/)
