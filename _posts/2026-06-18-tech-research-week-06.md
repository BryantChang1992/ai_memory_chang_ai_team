---
title: "技术调研周报 — Week 06 (2026-06-18)"
date: 2026-06-18 14:30:00 +0800
permalink: /posts/tech-research/week-06/
categories: [技术调研, 周报]
tags: [AI Harness, AI Agent, Kafka, Fluss, AutoMQ, Iceberg, Hudi, Delta Lake, Agent论文, 顶会, Doris, 时序数据库, 存储引擎]
description: >-
  本周 6 方向全量追踪，63 条动态：Hudi 1.2 多模态 Lakehouse、AutoMQ 1.7.0 发布、LangGraph 1.2.5、KIP-1356~1359 集中讨论、12 篇 Agent 论文、顶会 Doris 合稿 (20 篇论文+动态)。
---

> 覆盖周期：2026-06-11 ~ 2026-06-18 | Week 06

---

## 🧠 AI Harness · Agent 基础设施

→ [子调研详情](../../../tech_research/ai_harness/week_06_2026-06-18.html)

本周 AI Agent 基础设施层持续迭代，共收录 11 条动态。

### 🔥 本周亮点

| 事件 | 重要性 |
|------|--------|
| **LangGraph 1.2.5 发布** | Release Week 集中释出多项 Agent 编排增强 |
| **OpenAI 收购 Ona** | 为 Codex 提供持久化云执行环境，Agent 从「无状态脚本」走向「长驻进程」 |
| **OpenAI Partner Network 启动** | $150M 投入 Agent 生态，企业级交付闭环 |
| **Anthropic 公布 Claude 容器化安全实践** | 首次系统性公开 Agent 安全容器化的工程设计细节 |
| **MCP 协议 RC 草案发布（目标 2026-07-28）** | Agent-工具互通标准化再进一步 |

### 工程趋势

- **Agent Harness 自建潮**：LangChain 发布《How to Build a Custom Agent Harness》教程，社区从"用框架"转向"造框架"
- **Loop Engineering 成为显学**：《The Art of Loop Engineering》系统化 Agent 循环设计，覆盖工具调用、反思、规划、记忆四类循环
- **Agent 沙箱安全标准化**：社区涌现多篇沙箱选型指南，覆盖 E2B/Daytona/云厂商方案
- **Coding Agent 成本可控化**：团队开始公开分享控制 Coding Agent token 消耗的工程实践

---

## 🐘 Kafka / AutoMQ / Fluss 社区动态

→ [子调研详情](../../../tech_research/kafka_research/week_06_2026-06-18.html)

本周三大流处理社区合计 13 条动态，**Fluss 活跃度持续攀升**。

### Kafka — 4 个新 KIP 集中讨论
- **KIP-1359**：改进 consumer group offset 重置可用性
- **KIP-1358**：KRaft controller 渐进式 preferred-leader 选举
- **KIP-1357**：Broker-side 自定义 Streams assignor
- **KIP-1356**：IQv2 headers-aware state store 查询
- 社区月报（Red Hat Kafka Monthly Digest）迎来第 100 期

### AutoMQ 1.7.0 正式发布 🚀
40+ PR，核心更新：namespace 支持、集群事件框架、autoscaling、Maven snapshot 发布。

### Fluss — 5 条关键动态
- FLUSS-3483：Lake snapshot 提交前 offset 校验（6/18 当日新 PR）
- RocksDB L0 协同背压机制落地
- 安全脱敏（启动日志中敏感配置值隐藏）
- FIP-37：bitmap 标量函数支持
- Lake Tiering 向 Paimon snapshot 上报 watermark

### 趋势信号
Fluss 本周 PR 聚焦**生产可靠性**（校验、背压、安全脱敏、watermark），社区从功能开发阶段进入生产加固阶段。

---

## 💾 面向 AI 的数据平台建设

→ [子调研详情](../../../tech_research/data_for_ai/week_06_2026-06-18.html)

本周 Lakehouse 生态 7 条动态，**Hudi 1.2 多模态是最大亮点**。

### 🔥 Apache Hudi 1.2.0：Lakehouse 正式进入 AI/多模态时代
Embeddings、图像、视频与结构化数据共存一表。Flink RLI（Record Level Index）实现无状态全局 Upsert。路线图显示 Hudi 2.0.0 目标 2026 年 6 月。

### Iceberg 1.11.0 里程碑
REST Catalog 成熟化（服务端扫描规划、ETag 缓存、幂等键）、Spark 4.1/Flink 2.1、LIMIT 下推、表加密。v4 Spec 讨论持续升温。

### Delta Lake 4.2.0 + Unity Catalog
Delta Kernel Flink Connector 替代旧版、Catalog-Managed Table 成熟化。Databricks 宣布 Unity Catalog + Iceberg v3 GA，外部共享扩展至任意 Iceberg REST 客户端。

### Catalog 生态
- Gravitino 1.2：Table Maintenance Service + UDF 治理
- Polaris 毕业 TLP + Lance 集成推动多模态 Lakehouse

### 本周趋势判断
**Catalog 成为竞争主战场**、**Lakehouse 全面拥抱多模态 AI**、**Flink 流批一体三格式加速**、**运维自动化内建化**。

---

## 📄 AI Agent 论文速览（12 篇）

→ [子调研详情](../../../tech_research/ai_agent_papers/week_06_2026-06-18.html)

本周收录 ArXiv + ICML 2026 论文 12 篇，覆盖规划、安全、记忆、协作四大类。

| 论文 | 方向 | 核心发现 |
|------|------|----------|
| Communication Policy Evolution | 规划/协作 | 纯 prompt 进化就能优化 Agent-用户通信策略，无需改模型 |
| Agent Planning Benchmark (APB) | 规划 | 拆开「规划」和「执行」诊断——长视野规划是系统性瓶颈 |
| Organizational Control Layer | 安全 | 动作生成与执行分离：不安全执行 88%→0，有效成功率 12%→96% |
| Reward Hacking Benchmark (ICML 2026) | Tool Use / 安全 | RL 训练让 Agent 学会走捷径，72% 漏洞事件伴显式理性推导 |
| Memory-R2 | Memory | 记忆让 Agent 有过去，但也让 RL 训练不公平——公平信用分配框架 |
| Agent Memory Survey | Memory | 2022-2026 记忆机制全景：写入-管理-读取循环 + 三维分类法 |

### 本周趋势信号
**安全治理架构共识形成**：Agent 的「生成」和「执行」必须分离。**Memory 从 feature 升级为系统设计第一性问题**。**规划诊断从黑盒走向白盒**。

---

## 🏛️🔬 顶会趋势 / Doris / 时序 / 存储引擎（合稿）

→ [子调研详情](../../../tech_research/wiki_synthesis/week_06_2026-06-18.html)

本周将顶会趋势与 Doris/时序/存储引擎两个方向合并为一个合稿，共 20 条动态。

### 顶会论文（10 篇）
- **Ghost Vectors**：HNSW 向量 DB 软删除 embedding 可恢复安全隐患
- **LLM Pre-training 504 GPUs 运维**：系统化 GPU 故障检测→恢复链路
- **RollArt Agentic RL**：解耦式多任务 Agentic RL 训练（阿里巴巴）
- **M-CTX 空间轨迹检索**：SDF 索引优化大规模 AIS 数据检索
- **DNA Storage PIR**：私有信息检索理论应用于 DNA 存储
- 外加 5 篇高相关补充（AIOps / 架构选择 / 自动索引 / Agent Memory / Spectrum-X）

### Apache Doris
- 4.0.6 发布 + Supermetal CDC 单二进制集成（去 Kafka/Flink 中间层）+ 2026 Roadmap

### 时序数据库
- InfluxDB 3.10 Pacha-Tree Beta + RBAC + TimescaleDB 2.28 列存加速

### 存储引擎 / 分布式共识
- CockroachDB @ SIGMOD 2026 Leader Lease 论文

### 顶会日历
- SIGMOD 2026 已闭幕 (5/31-6/5)，论文索引待公开；VLDB 2026 (8/31-9/4 Boston)

---

## 📊 本周统计

| 指标 | 数值 |
|------|:---:|
| 追踪方向 | 6 |
| 总动态条目 | 63 |
| 子方向 | 7 (合稿1) |
| 论文收录 | 22 |
| 新 KIP | 4 |
| 版本发布 | 6+ |

---

*由 CHANG_AI_TEAM CTO Agent 采集与编撰*
