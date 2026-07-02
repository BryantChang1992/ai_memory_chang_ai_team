---
title: "技术调研周报 — Week 09 (2026-07-02)"
date: 2026-07-02 22:00:00 +0800
permalink: /posts/tech-research/week-09/
categories: [技术调研, 周报]
tags: [AI Infra, Agent Harness, Hermes Agent, Qwen 3.6, Flink 2.3.0, Fluss, LSM-tree, CockroachDB, CXL, 湖仓]
description: >-
  Week 09 技术调研周报：Hermes Agent 140k⭐登顶 OpenRouter #1、Flink 2.3.0 发布（FROM_CHANGELOG/TO_CHANGELOG）、Fluss 客户端写入流程深度分析（内部产出）、Agent 框架 2026 全景对比、CXL 数据库演进。
---

> 覆盖周期：2026-06-26 ~ 2026-07-02 | Week 09

---

## 🧠 AI Infra · Agent 基础设施

→ [子调研详情](../../../tech_research/ai_harness/week_09_2026-07-02.html)

### 🔥 Hermes Agent：自进化 Agent 登顶 OpenRouter #1

本周 AI Agent 领域最大的事件是 Nous Research 的 Hermes Agent 达到 **140,000+ GitHub Stars** 并被 OpenRouter 列为全球使用量最高的 Agent 应用。Nvidia 官方博客发文推荐，将 Hermes 与 RTX 硬件生态绑定推广。

**四个核心差异化能力**：

| 能力 | 描述 |
|------|------|
| **Self-Evolving Skills** | 遇到复杂任务或收到反馈后，自动将经验保存为可复用 Skill。基于 ICLR 2026 Oral 论文的 DSPy + GEPA 框架实现 skill 自进化（MIT licensed） |
| **Contained Sub-Agents** | 子 Agent 作为短生命周期隔离 Worker，专注子任务，减少主 Agent 混乱，适配本地小模型 |
| **Reliability by Design** | Nous Research 对每个内置 skill/tool/plugin 进行压力测试，30B 参数级模型即可稳定运行 |
| **Active Orchestration Layer** | 不是薄 wrapper，而是主动编排层。同一模型在不同框架下，Hermes 表现一致更强 |

**技术栈与生态**：
- Provider-agnostic（Anthropic / OpenAI / Google / DeepSeek + 本地 Ollama）
- 16+ 消息平台集成，持久化 Memory 跨 session 累积、Cron 定时任务
- **Nvidia 推荐 DGX Spark**（128GB 统一内存）作为"always-on agentic computer"
- 搭配 **Qwen 3.6 27B/35B** 本地部署，性能超越其前代 120B/400B 级模型

**Insight**：Hermes 的成功标志着 Agent 框架从"胶水代码时代"正式进入"编排引擎时代"。自进化 Skill + 隔离子 Agent 的设计与 Microsoft CodeAct 的"模型写代码替代逐轮 tool call"思路形成互补——前者降低框架复杂度，后者降低推理开销。

### Qwen 3.6 发布

Alibaba Qwen 3.6 系列核心看点：
- **Qwen 3.6 27B**：密集模型，匹配前代 400B 模型精度但仅 1/16 参数
- **Qwen 3.6 35B**：~20GB 内存可运行，超越 120B 级前代模型
- 作为 Hermes Agent 的理想运行底座

### Agent 框架 2026 全景对比

JetBrains 官方博客发布 <em>Top Agentic Frameworks for Building Applications 2026</em>，系统对比 LangGraph、CrewAI、AutoGen、Semantic Kernel、Hermes Agent 五大框架。核心结论：2026 年关键决策不再是"要不要用 Agent"，而是"需要多少自主性、控制力和治理能力"。

### HPE Discover 2026：企业 Agent 战略

HPE 在 Las Vegas Discover 2026 宣布面向 GreenLake 和 Morpheus 的 Agent AI 扩展，将 Agent 能力绑定到混合云和自动化堆栈——传统企业基础设施厂商正式入场 Agent 编排。

### 内部：Agent Harness 知识图谱修复

本周内部完成 Agent Harness 系列 wikilink 图谱修复（434c840, 6/29）：综述 + 8 张子卡片的双向引用全部补全，README 索引完整，网状引用密度从 ~60% → 100%。

---

## 🌊 流处理

→ [子调研详情](../../../tech_research/doris/week_09_2026-07-02.html#flink)

### 🔥 Apache Flink 2.3.0 发布（6/25）

实现 15 个 FLIP 的核心功能，关键增强：

| 特性 | 描述 |
|------|------|
| **FROM_CHANGELOG / TO_CHANGELOG** | append-only ↔ changelog 双向转换 SQL 算子，首次在 SQL 层面将 retract/upsert → append-only |
| **Materialized Table DDL/ALTER** | 显式列定义（含 watermark/PK）、ADD/MODIFY/DROP/RENAME，消除"物化表二等公民"状态 |
| **Adaptive Partition Selection** | 自适应 partition 选择，优化背压处理 |
| **Native S3 FS（Experimental）** | FLIP-555，AWS SDK v2，完全脱离 Hadoop/Presto 依赖 |
| **SinkUpsertMaterializer 重构** | ON CONFLICT（DO NOTHING / DO ERROR / DO DEDUPLICATE）解决无界状态增长 |

Flink 2.1.3 补丁版同周期发布（5 个 bug 修复）。

### 🏠 内部：Fluss 客户端写入流程深度分析

**产出**（a3a59fd ~ 53b4f65, 6/30-7/1）：
- 497 行 Markdown 深度分析：ConnectionFactory → AppendWriter → RpcClient 全链路
- 架构 SVG：3 轮迭代（正交箭头、三列对齐、7 处箭头穿越修复）
- 至此 Fluss 源码分析 8 个模块（01-07 + 05b）**全部完成**

**关键发现**：Connection（重量级全局单例）→ Table（轻量级 per-thread）→ AppendWriter（异步 flush）三层约定明确；MetadataUpdater 后台拉取 schema/bucket/format；WriterClient 管理多 bucket 路由 + 重试/背压。

---

## 🐘 分布式数据库

→ [子调研详情](../../../tech_research/doris/week_09_2026-07-02.html#distdb)

### CockroachDB vs TiDB 2026 架构对比

多家独立评测机构发布年度对比：CockroachDB 紧耦合多层架构（"像运行一台跨越 DC 的 PostgreSQL"），TiDB 存算分离（SQL + TiKV + TiFlash 三组件）。地理分布式事务 → CRDB 更自然；弹性扩缩 OLTP+OLAP → TiDB 存算分离优势明显。

### CXL 3.0 2026 产品化

CXL 3.0（PCIe 6.0 基础）预计 2026 年产品化，有望改变内存数据库的扩展模式——从 scale-out 分片走向 scale-up 弹性内存池。EDBT 2026 已有论文探讨动态 CXL 内存池分配。

---

## 💾 存储引擎

→ [子调研详情](../../../tech_research/doris/week_09_2026-07-02.html#storage)

### LSM-tree KV Store 综述（ArXiv 2507.09642）

最新综述论文从 flush/compaction 优化 + 基础操作改进两个维度系统梳理 LSM-tree 研究全景，并覆盖多租户 Serverless 场景。与 SIGMOD 2026 的 LSM Serverless 论文形成呼应。

---

## 🏛 湖仓

→ [子调研详情](../../../tech_research/doris/week_09_2026-07-02.html#lakehouse)

### Fluss + Paimon 实时湖仓推进

Fluss 1.0 路线图 Feature Freeze 6/1、Release 目标 6/15。核心能力 LakeStream 在已有湖仓表上启用流式读写。最新 commit 已涉及 Hudi Flink connector 集成（#3535）和 Iceberg → Fluss 类型转换。

---

## 📊 统计

| 方向 | 动态数 | 亮点 |
|------|--------|------|
| AI Infra · Agent 基础设施 | 5 | Hermes Agent 140k⭐、Qwen 3.6、Agent 框架对比 2026、内部图谱修复 |
| 流处理 | 3 | Flink 2.3.0（FROM_CHANGELOG/TO_CHANGELOG）、Fluss 客户端深度分析 |
| 分布式数据库 | 2 | CockroachDB vs TiDB 2026、CXL 3.0 产品化 |
| 存储引擎 | 1 | LSM-tree KV Store 综述（ArXiv） |
| 湖仓 | 1 | Fluss + Paimon 路线图推进 |

**合计 12 条动态 | 5 方向覆盖**

---

> ⚡ **下期预告**：Week 10 关注 Flink 2.3.0 的 FROM_CHANGELOG 实际落地案例、Hermes Agent 自进化 Skill 机制深入分析、以及 VLDB 2026 论文列表。
>
> 📎 子调研详情详见各方向页面。CEO 审阅后标记待入库文章，周五 Wiki 维护日统一入知识库。
