---
title: "顶会趋势 / Doris / 时序 / 存储引擎 — Week 06 合稿"
date: 2026-06-18 14:00:00 +0800
permalink: /posts/tech-research/week-06/conferences-doris/
categories: [技术调研, 深度方向, 顶会趋势]
tags: [SIGMOD, VLDB, 顶会, ArXiv, VectorDB, AI Infra, Doris, InfluxDB, TimescaleDB, 时序数据库, 存储引擎]
description: >-
  顶会 10 篇（Ghost Vectors 安全 · LLM 504 GPU · RollArt Agentic RL · NVIDIA Spectrum-X） + Doris 4.0.6 · InfluxDB 3.10 Pacha-Tree · TimescaleDB 2.28 · CRDB Leader Lease
---

> 采集窗口：2026-06-11 ~ 2026-06-18 · 来源：ArXiv + SearXNG + 直接源抓取
>
> ⚠️ 本周 SearXNG 无法响应，改为 ArXiv 直接检索。SIGMOD 2026 已闭幕（5/31-6/5, Bengaluru），论文列表尚未公开索引；VLDB 2026 将于 8/31-9/4 在 Boston 举行。

---

## 第一部分：顶会趋势

### 📊 本周概览

| 会议 | 状态 | 本周动态 |
|------|------|----------|
| **SIGMOD 2026** | 已闭幕 (5/31-6/5, Bengaluru) | 论文列表待后续跟踪 |
| **VLDB 2026** | 筹办中 (8/31-9/4, Boston) | PVLDB 滚动卷进行中 |
| **FAST 2026** | 投稿期 | 暂无公开论文列表 |
| **OSDI/SOSP 2026** | 待公布 | 暂无 |
| **CIDR 2026** | 待公布 | 暂无 |

### 🔬 本周论文

#### 1. Ghost Vectors: Soft-Deleted Embeddings Remain Reconstructible in HNSW Vector Databases

- **来源**：ArXiv (2026-06-16)
- **作者**：Chandranil Chakraborttii, Jackeline García Alvarado, Sitora Abdulofizova, Shivanshu Dwivedi
- **标签**：`#VectorDB` `#Security` `#Privacy` `#HNSW`

研究 RAG pipeline 中 HNSW 向量数据库在用户请求数据删除后，"软删除"的 embedding 仍然可被重建的安全隐患。揭露了当前向量数据库在数据删除合规性方面的系统性缺陷，对 GDPR/隐私合规场景有重要影响。

#### 2. From Detection to Recovery: Operational Analysis on LLM Pre-training with 504 GPUs

- **来源**：ArXiv (2026-06-15, v1: 2026-05-10)
- **作者**：Daemyung Kang, Eunjin Hwang, Hanjeong Lee, HyeokJin Kim, Hyunhoi Koo 等 (14 人)
- **标签**：`#AIInfra` `#LLMTraining` `#GPUCluster` `#FaultTolerance`

大规模 AI 训练本质上是分布式系统工程问题。本文基于 504 GPU 集群上的 LLM 预训练实战，系统分析了从故障检测到自动恢复的完整运维链路：包括 GPU 故障模式分类、checkpoint 策略优化、训练中断恢复时间 (MTTR) 分析与优化，为生产级大模型训练基础设施提供了宝贵的运维经验。

#### 3. RollArt: Disaggregated Multi-Task Agentic RL Training at Scale

- **来源**：ArXiv (2026-06-14, v1: 2025-12-27)
- **作者**：Wei Gao, Yuheng Zhao, Tianyuan Wu, Shaopan Xiong 等 (Alibaba)
- **标签**：`#AIInfra` `#RLTraining` `#DisaggregatedArch` `#AgenticAI`

Agentic RL 训练需要同时管理多个 agent、environment 和 model。RollArt 提出解耦式架构将 RL 训练的推理、环境交互、模型更新分离到不同资源池，实现多任务弹性调度。在大规模集群上展示了显著的资源利用率和训练吞吐提升。

#### 4. M-CTX: Exact and Scalable Spatial Context Retrieval for Trajectory Analytics

- **来源**：ArXiv (2026-06-13)
- **作者**：Kun Ma, Qilong Han, Chengjing Song, Jingzheng Yao, Xiao Han, Yuee Zhou, Changmao Wu
- **标签**：`#SpatialDB` `#TrajectoryAnalytics` `#Systems`

空间上下文检索是轨迹预测的关键步骤，但在大规模 AIS 海事数据中（5.48M anchor 需约 17 CPU-days）已成为系统瓶颈。M-CTX 提出通过符号距离场 (SDF) 索引优化的精确可扩展空间上下文检索方法，大幅降低检索延迟。

#### 5. Private Information Retrieval for Large-Scale DNA-Based Data Storage

- **来源**：ArXiv (2026-06-12)
- **作者**：Gökberk Erdoğan, Daniella Bar-Lev, Rawad Bitar, Antonia Wachter-Zeh, Zohar Yakhini
- **标签**：`#NovelStorage` `#DNAStorage` `#PIR` `#Privacy`

首次将私有信息检索 (PIR) 理论应用于合成 DNA 数据存储场景。DNA 存储因其超高密度和长期稳定性成为新型存储介质的前沿方向，但随机访问和隐私保护是核心挑战。该工作提出适配 DNA 存储特性的 PIR 方案，为下一代存储架构的安全访问机制奠基。

### 📡 近期高相关论文（窗口外，值得关注）

#### 6. A Multimodal Machine Learning Framework for Enterprise Database Workload-Aware Root Cause Analysis

- **来源**：ArXiv (2026-06-02)
- **作者**：Ruchi Pakhle, Siddhant Pawar
- **标签**：`#DatabaseOps` `#RootCauseAnalysis` `#ML`

#### 7. Architectural Evolution and Selection Framework for Database Systems in AI-Ready Data Platforms

- **来源**：ArXiv (2026-06-06)
- **作者**：Mohit Srivastava
- **标签**：`#DatabaseArchitecture` `#AIPlatform` `#Survey`

#### 8. AIM: A Practical Approach to Automated Index Management for SQL Databases

- **来源**：ArXiv (2026-05-29)
- **作者**：Ritwik Yadav, Satyanarayana R. Valluri, Mohamed Zaït (Oracle)
- **标签**：`#IndexManagement` `#SQL` `#AutoTuning`

#### 9. Is Agent Memory a Database? Rethinking Data Foundations for Long-Term AI Agent Memory

- **来源**：ArXiv (2026-05-25)
- **作者**：Abdelghny Orogat, Essam Mansour
- **标签**：`#AgentMemory` `#DatabaseTheory` `#AISystems`

#### 10. High-speed Networking for Giga-Scale AI Factories (NVIDIA Spectrum-X)

- **来源**：ArXiv (2026-05-20)
- **作者**：Sajy Khashab, Albert Gran Alcoz 等 (NVIDIA)
- **标签**：`#AIInfra` `#Networking` `#GPUCluster`

### 🏛️ 顶会背景更新

#### SIGMOD 2026

- **时间/地点**：2026-05-31 ~ 06-05，Bengaluru, India（已闭幕）
- **重要变化**：ACM 自 2026-01-01 起全面转为 Open Access，APC 临时补贴价 $250-$350
- **待办**：论文列表需后续从 ACM Digital Library 或 dblp 获取

#### VLDB 2026

- **时间/地点**：2026-08-31 ~ 09-04，Boston, MA, USA
- **状态**：筹办中，PVLDB 滚动卷持续出版
- **主题**：data management, scalable data science, novel database architectures, ML+DB

### 🔍 顶会趋势观察

1. **向量数据库安全与隐私**成为新兴热点——Ghost Vectors 揭露了软删除 embedding 可恢复的安全隐患
2. **AI Infra 运维实战**报告增多——从 504 GPU 故障恢复到 Spectrum-X 网络架构，工程化论文增加
3. **Agent 与数据库的边界模糊化**——"Is Agent Memory a Database?" 标志着长期记忆存储成为数据库领域新课题
4. **新型存储介质研究持续**——DNA 存储 + PIR 的结合展示了基础理论向新型介质延伸
5. **自动化运维 (AIOps for DB)**——多模态根因分析、自动索引管理成为持续热点

---

## 第二部分：Doris / 时序数据库 / 存储引擎

### 一、Apache Doris / OLAP 分析型数据库

#### 1. Apache Doris 4.0.6 正式发布

- **日期**：2026-06-08
- **链接**：[Doris Releases](https://doris.apache.org/releases/all-release/)
- **标签**：`#release` `#ApacheDoris` `#OLAP`

Doris 4.0.6 正式发布，紧随 5 月 24 日的 4.1.1 和 4 月 21 日的 4.1.0。GitHub releases 页面显示后续还有持续 commit 合并（最近日 commit 在 6 月 17 日）。

#### 2. VeloDB + Apache Doris 通过 Supermetal 实现单二进制 CDC

- **日期**：2026-06-15
- **链接**：[VeloDB Blog](https://www.velodb.io/blog/velodb-and-apache-doris-cdc-integration-with-supermetal)
- **标签**：`#CDC` `#VeloDB` `#Supermetal` `#ApacheDoris` `#实时同步`

Supermetal 现在可将 Postgres、MySQL、MongoDB、SQL Server、Oracle 五种源的操作数据实时复制到 Apache Doris/VeloDB Cloud。

**架构简化**：从 Debezium → Kafka → Flink → Doris 四跳简化到 Supermetal → Object Store → Doris 两跳，全程 Parquet + Arrow 列式传输，省去 JVM 依赖。

**基准测试**：
- 433M 行快照仅需 6 分 11 秒（~1.5M rows/sec）
- CDC 端到端延迟在 25K ops/sec 负载下保持在 7-9 秒
- Merge-on-Write 模型保证查询零读时去重

#### 3. Apache Doris 2026 Roadmap

- **日期**：2026-01-19（持续更新）
- **链接**：[GitHub Issue #60036](https://github.com/apache/doris/issues/60036)
- **标签**：`#Roadmap` `#向量搜索` `#存算分离` `#Iceberg` `#Paimon`

2026 年路线图以 **"Scale Intelligence, Accelerate Insights"** 为主题，聚焦三大方向：

| 方向 | 关键特性 |
|------|----------|
| **AI & Hybrid Search** | 磁盘 ANN 支持单表 100 亿向量、全文搜索打分/多索引、Iceberg 混合搜索 |
| **存储引擎** | 超大 Tablet (100GB+)、存算分离弹性调度、分布式缓存 |
| **数据湖集成** | Iceberg V3 全面支持、Paimon 读写、Arrow Flight Data Catalog |

MERGE INTO、递归 CTE、ASOF JOIN、Python UDF 等新特性也在规划中。

### 二、时序数据库

#### 4. InfluxDB 3.10 发布：Pacha-Tree Beta + 企业级特性

- **日期**：2026-06-17
- **链接**：[InfluxData Blog](https://www.influxdata.com/blog/influxdb-3-10/)
- **标签**：`#InfluxDB` `#时序数据库` `#RBAC` `#PachaTree` `#跨库查询`

InfluxDB 3.10 核心亮点：

| 特性 | 说明 |
|------|------|
| **Pacha-Tree 性能 Beta** | 端到端备份恢复、行级删除、Parquet 批量导入 |
| **跨数据库插件查询** | Processing Engine 插件可跨库读写，实现 raw → rollup → forecast 管道 |
| **生产就绪端点 `/ready`** | 验证对象存储可达性，而非简单进程存活 |
| **并行 Compaction** | 加速后台压缩 |
| **RBAC 预览** | JWT/OAuth/OIDC、Admin/Auditor/Member 三种内置角色 |
| **Catalog v3 自动迁移** | on-disk ~5-6x 压缩 |

> InfluxDB 3 Core 保持 MIT/Apache 2 开源。

#### 5. InfluxDB 3 合成时序数据生成插件

- **日期**：2026-06-12
- **链接**：[InfluxData Blog](https://www.influxdata.com/blog/generate-synthetic-data/)
- **标签**：`#InfluxDB` `#时序数据` `#插件` `#测试工具`

新增两个 Processing Engine 调度插件：

- **Bird Tracking Simulator**：鸟类移动遥测模拟
- **Signal Generator**：可配置波形生成器（sine / square / triangle / sawtooth / noise / spike）

可通过 `influxdb3 create trigger` 一键启动数据生成，用于仪表盘测试、告警验证、边缘复制评估等场景。

#### 6. TimescaleDB 2.28.0：压缩查询加速 + 增量刷新

- **日期**：2026-06-16
- **链接**：[GitHub Releases](https://github.com/timescale/timescaledb/releases)
- **标签**：`#TimescaleDB` `#时序数据库` `#压缩优化` `#连续聚合` `#PostgreSQL`

| 更新 | 说明 |
|------|------|
| **first()/last() 压缩加速** | 直接利用压缩列存批量元数据，跳过批量解压，最新值查询显著加速 |
| **增量分批刷新** | `refresh_continuous_aggregate()` 支持增量分批，锁粒度大幅降低 |
| **向量化 CASE** | 条件聚合不再退化为逐行解压 |
| **无重建添加列** | `ALTER MATERIALIZED VIEW ADD COLUMN` 无需重建 |
| **PG 版本计划** | 2.28.x 为最后一个支持 PG15 的版本，下个版本仅支持 PG16/17/18 |

#### 7. InfluxDB 3 卫星遥测 + ITAR 数据驻留架构

- **日期**：2026-06-11
- **链接**：[InfluxData Blog](https://www.influxdata.com/blog/satellite-telemetry-itar-architecture/)
- **标签**：`#InfluxDB` `#遥测` `#ITAR` `#架构`

探讨卫星任务运营中如何用 InfluxDB 3 构建受控遥测架构：

- **Ingress**：Telegraf Agent、MQTT Pipeline 等路径，Tag 注入操作上下文（航天器 ID、子系统、地面站）
- **部署**：InfluxDB 3 Core 自托管满足边缘/私有云需求，Enterprise 提供 HA + 读副本分离

核心论点：共享时序架构消除数据孤岛，让工程师在异常响应时无需跨系统拼凑数据。

### 三、存储引擎 / 分布式共识

#### 8. CockroachDB @ SIGMOD 2026：可扩展 Leader Lease 论文

- **日期**：2026-05-26（SIGMOD 2026 收录）
- **链接**：[Cockroach Labs Blog](https://www.cockroachlabs.com/blog/distributed-database-leader-leases/)
- **标签**：`#分布式共识` `#Raft` `#Lease` `#SIGMOD2026` `#CockroachDB`

Cockroach Labs 在 SIGMOD 2026 发表论文 *"Scalable Leader Leases For Multi Consensus Groups in CockroachDB"*。该论文解决多 Raft Group 场景下 Leader Lease 机制的可扩展性问题——这是分布式 SQL 数据库实现低延迟一致性读的关键基础设施。

### 四、云原生数据库架构

#### 9. CockroachDB：Agentic AI 架构中的数据库角色

- **日期**：2026-06-11
- **链接**：[Cockroach Labs Blog](https://www.cockroachlabs.com/blog/agentic-ai-architecture-memory-control/)
- **标签**：`#AgenticAI` `#云原生` `#分布式数据库` `#CockroachDB`

探讨当企业将自主 AI Agent 连接到生产数据栈时，数据库需要提供三个核心能力：

1. **Memory**（持久化记忆）
2. **Context**（上下文管理）
3. **Control**（访问控制）

CockroachDB 作为分布式 SQL 数据库在 Agentic AI 架构中的定位。

#### 10. SingleStore：云数据库客户自主管理加密密钥 (CMEK)

- **日期**：2026-06-11
- **链接**：[SingleStore Blog](https://www.singlestore.com/blog/customer-managed-encryption-keys-cloud-database-cmek/)
- **标签**：`#云原生` `#加密` `#CMEK` `#SingleStore` `#安全架构`

SingleStore 发布云数据库加密控制频谱，重点介绍 Customer-Managed Encryption Keys (CMEK) 能力。作为云原生数据库安全架构的关键演进，CMEK 让企业客户在共享责任模型中获得对加密密钥的完全生命周期控制。

---

## 📊 综合趋势信号

| 信号 | 强度 | 说明 |
|------|------|------|
| **CDC 管道简化** | ⬆️ 强 | Supermetal → Doris 单二进制替代 Kafka+Flink 四跳架构 |
| **时序数据库 AI/ML 内嵌** | ⬆️ 强 | InfluxDB PE 插件生态成熟，信号生成器/异常检测/预测维护落地 |
| **存储引擎列存加速** | ⬆️ 中 | TimescaleDB 向量化 CASE、first/last 利用列存元数据避免解压 |
| **存算分离深化** | ➡️ 持续 | Doris Roadmap 分布式缓存、弹性调度、读写分离 |
| **数据库 + Agentic AI** | ⬆️ 新 | CockroachDB/SingleStore 均在布局 AI Agent 基础设施 |
| **向量数据库安全** | ⬆️ 新 | Ghost Vectors 揭露软删除 embedding 可恢复的安全隐患 |
| **AI Infra 运维实战** | ⬆️ 中 | 504 GPU 故障恢复、NVIDIA Spectrum-X 网络架构 |
