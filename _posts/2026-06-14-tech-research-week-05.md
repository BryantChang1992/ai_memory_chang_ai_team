---
title: "技术调研周报 — Week 05 (2026-06-14)"
date: 2026-06-14 23:00:00 +0800
permalink: /posts/tech-research/week-05/
categories: [技术调研, 周报]
tags: [LSM-Tree, OLAP, TSDB, 分布式一致性, Wiki Synthesize]
description: >-
  首轮 Wiki Synthesize：31 张概念卡片 → 3 篇综述，11 个跨领域洞察。LSM-Tree 体系、OLAP/TSDB 横向对比、分布式一致性全层次视图。
---

> 覆盖周期：2026-06-12 ~ 2026-06-14（本周为知识库建设专项周）

---

## 🧠 Wiki Synthesize · 知识库领域提炼（首轮）

> 31 张概念卡片 → 3 篇综述 + 1 篇 Lint 报告。每篇综述已发布为独立 Blog 文章。

### 综述一：LSM-Tree 存储引擎体系

### 综述一：LSM-Tree 存储引擎体系

→ [阅读全文](/posts/wiki-synthesis-lsm-tree/) · [子调研详情](../../../tech_research/wiki_synthesis/week_01_2026-06-14.html)

基于 VLDB Journal 2019 Survey 的 7 张 wiki 卡片，以 RUM 猜想为统一框架。5 个核心洞察：

1. **写放大是所有优化的最终判据** — RUM 三角定义了上限，"无损改进"极其稀缺
2. **Dostoevsky 打破同质化合并假设** — 低层 tiering + 最底层 leveling 的混合策略是长期被忽视的低垂果实
3. **硬件假设是存储引擎的隐藏变量** — WiscKey 证明 SSD 时代需要 KV 分离
4. **写入停顿是最大盲区** — bLSM (2012) 之后十年无人系统性解决端到端延迟方差
5. **LSM-tree 是现代存储引擎的通用语言** — InfluxDB TSM、Doris Compaction、Kafka Log Compaction 都是变体

### 综述二：OLAP 与时序数据库全景对比

→ [阅读全文](/posts/wiki-synthesis-olap-tsdb/)

Doris (OLAP) vs InfluxDB (TSDB) 横向对比，17 张卡片输入。3 个核心洞察：

- **存算分离 + 列式存储**：Doris 3.0 和 InfluxDB 3.0 在底层架构上快速融合
- **数据模型哲学决定工程复杂度**：Doris 宽表 vs InfluxDB Tag/Field 体系，由场景驱动
- **湖仓一体化是终局**：Iceberg + Parquet + Arrow 正在同时侵蚀两个赛道的护城河

### 综述三：分布式数据系统一致性体系

→ [阅读全文](/posts/wiki-synthesis-consistency/)

事务层 → 副本层 → 会话层，三层叠加视图。4 个核心洞察：

- **协调代价是分布式一致性的统一度量**
- **"不需要全序"是 2024-2026 年最大趋势**：Event Horizon Semi-Linearizability、RaaS 按需回放
- **存算分离打破了一致性假设**：本地日志编排公平性本身就是一致性命题
- **分布式事务演进史 = 协调代价 vs 隔离保证的压缩史**

### Lint 质量报告

| 类别 | 结果 |
|------|------|
| 孤儿页 | 0 ✅ |
| 概念矛盾 | 0 ✅ |
| Bloom Filter 缺口 | 被 15 页引用但无独立卡片 🟡 |
| 存算分离集群 | 仅 4 页未达 synthesis 临界质量 🟡 |

---

## 🔗 链接

- [技术调研总目录](../../../tech_research/index.html)
- [知识库 GitHub](https://github.com/BryantChang1992/ai_wikis)
