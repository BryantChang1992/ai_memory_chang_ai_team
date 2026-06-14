---
title: "技术调研周报 — Week 05 (2026-06-14)"
date: 2026-06-14 23:30:00 +0800
categories: [技术调研, 周报, 技术调研]
tags: [LSM-Tree, OLAP, TSDB, 分布式一致性, 知识库]
description: >-
  首轮 Wiki Synthesize：31 张概念卡片 → 3 篇综述，11 个跨领域洞察。LSM-Tree 体系、OLAP/TSDB 横向对比、分布式一致性全层次视图。
---

> 覆盖周期：2026-06-12 ~ 2026-06-14（本周为知识库建设专项周）

---

## 🧠 Wiki Synthesize · 知识库领域提炼（首轮）

→ [查看完整报告](../../tech_research/wiki_synthesis/week_01_2026-06-14.html)

### 概况

- **31 张概念卡片** 入库，覆盖 4 个知识集群
- **3 篇综述** 产出：LSM-Tree 体系 / OLAP & TSDB 全景 / 分布式一致性体系
- **1 篇 Lint 质量报告**：0 孤儿、0 矛盾、4 个待改进项

### 🔴 LSM-Tree 存储引擎体系 — 5 个关键洞察

1. **写放大是所有优化的最终判据** — RUM 三角定义了上限，"无损改进"极其稀缺
2. **Dostoevsky 打破同质化合并假设** — 低层 tiering + 最底层 leveling 的混合策略是长期被忽视的低垂果实
3. **硬件假设是存储引擎的隐藏变量** — WiscKey 证明 SSD 时代需要 KV 分离
4. **写入停顿是最大盲区** — bLSM (2012) 之后十年无人系统性解决端到端延迟方差
5. **LSM-tree 是现代存储引擎的通用语言** — InfluxDB TSM、Doris Compaction、Kafka Log Compaction 都是变体

### 🟠 OLAP vs TSDB — 架构趋同趋势

- **Doris 3.0** 走向存算分离，**InfluxDB 3.0** 从 TSM 走向纯列式，两个赛道在底层架构上快速融合
- 数据模型哲学差异决定了工程复杂度：Doris 宽表 vs InfluxDB Tag/Field 体系
- 湖仓一体化（Iceberg/Hudi/Parquet）同时在侵蚀两个赛道的护城河

### 🟡 分布式一致性 — 三层体系

- **事务层 → 副本层 → 会话层** 三层叠加，Event Horizon 的半线性化提供了"不需要全线性化"的新选择
- RaaS (SIGMOD 2026) 揭示存算分离下本地日志编排公平性本身就是一个一致性命题
- 分布式事务演进史 = 协调代价 vs 隔离保证的 trade-off 压缩史

### 🩺 Lint 发现

| 类别 | 结果 |
|------|------|
| 孤儿页 | 0 ✅ |
| 概念矛盾 | 0 ✅ |
| Bloom Filter 缺口 | 被 15 页引用但无独立卡片 🟡 |
| 存算分离集群 | 仅 4 页未达 synthesis 临界质量 🟡 |

---

## 🔗 链接

- [技术调研总目录](../../tech_research/index.html)
- [知识库 GitHub](https://github.com/BryantChang1992/ai_wikis)
