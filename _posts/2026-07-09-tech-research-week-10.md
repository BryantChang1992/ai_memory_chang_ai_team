---
title: "技术调研周报 — Week 10 (2026-07-09)"
date: 2026-07-09 22:00:00 +0800
permalink: /posts/tech-research/week-10/
categories: [技术调研, 周报]
tags: [AI Infra, Agent, GPT-5.5, Claude Sonnet 5, MAS SAFR, LSM-tree, 存储引擎, 知识库升级, Schema V2]
description: >-
  Week 10 技术调研周报：GPT-5.5 Instant Mini 静默上线、Claude Sonnet 5 Agentic 升级、MAS SAFR 金融 Agent 安全框架发布、LSM-tree KV Survey Top 10 CCF-A 论文入库、知识库 V2 全量升级完成。
---

> 覆盖周期：2026-07-03 ~ 2026-07-09 | Week 10

---

## 🧠 AI Infra · Agent 基础设施

→ [子调研详情](../../../tech_research/ai_harness/week_10_2026-07-09.html)

### 🤖 OpenAI GPT-5.5 Instant Mini：无声升级底层 Fallback 模型

OpenAI 于 7 月 6 日在 ChatGPT 中上线 **GPT-5.5 Instant Mini**，替代 GPT-5.3 Instant Mini 作为用户达到速率限制后的 fallback 模型。该模型不在模型选择器中显示，不影响 API 和 Codex，但会影响大量重度用户的体验。

**改进点**：
- 更好地跟踪用户意图变化，校准语气
- 减少重复或过度结构化的回复
- 更强的个性化能力，减少事实性错误

**Insight**：OpenAI 的"无声 fallback"策略是一种低风险渐进式发布模式。对 Agent 应用而言，底层模型静默变化可能影响 tool call 一致性和输出格式——值得在 Agent Pipeline 中增加回归测试。

### 🧪 Claude Sonnet 5：Anthropic 最强 Agentic Sonnet

Anthropic 于 6 月 30 日发布 **Claude Sonnet 5**，在推理、工具调用、编码和知识工作方面全面超越 Sonnet 4.6。Sonnet 是 Claude 的工作马等级，也是 Microsoft 365 Copilot 的底层模型——此次升级直接影响广大企业用户的 Agent 体验。

**Insight**：Anthropic 和 OpenAI 的竞争进入"Agentic Workhorse"阶段——双方都在工作马级模型上押注 Agent 能力，而非仅靠旗舰模型。底层模型 Agent 原生能力越强，框架的编排负担越轻。

### 🏦 MAS SAFR：全球首个金融 Agent 安全治理框架

新加坡金融管理局（MAS）于 7 月 3 日联合头部金融机构和 FinTech 发布 **SAFR（Safeguards for Agentic Finance at Runtime）** 白皮书，提出全球首个 AI Agent 金融安全治理框架。

| 能力 | 描述 |
|------|------|
| **Policy-Bound Execution** | Agent 行为受预定义策略边界约束，所有拟执行动作须通过治理检查点 |
| **Real-Time Validation** | 执行前的运行时验证，确保不超出机构风险边界 |
| **Auditability** | 全部 Agent 决策链路可审计、可追溯 |
| **Interoperability** | 跨系统、跨机构的 Agent 互操作性保障 |

SAFR 基于 MAS Project Mindforge 的 AI 风险管理工具包构建，已在多个金融用例中测试。这标志着 Agent 治理从"行业最佳实践"进入"监管框架"阶段。

**Insight**：金融监管率先对 Agent 安全提出运行时检查点（而非仅部署前审查）要求。对 Agent Harness Governance 模块有直接指导意义——实时拦截 `before_action` 钩子 + 审计日志将成为基本要求。

---

## 💾 存储引擎与数据基础设施

→ [子调研详情](../../../tech_research/doris/week_10_2026-07-09.html)

### 📚 LSM-tree KV Store 综述深度扩展：Top 10 CCF-A 论文入库

基于 Week 09 入库的 ArXiv LSM-tree KV Store 综述，本周完成了综述引用的 **Top 10 CCF-A 顶会/期刊论文的追踪入库**，新生成 10 张 Wiki 概念卡片。

| 论文/系统 | 方向 | 出处 |
|-----------|------|------|
| Bourbon | Learned Index + LSM | SIGMOD |
| CaaS | Compaction-as-a-Service | VLDB |
| ElasticBF | 弹性 Bloom Filter | ICDE |
| Hailstorm | 存算分离 LSM | VLDB |
| Lethe | 删除感知 LSM | SIGMOD |
| Nova-LSM | 分布式组件化 LSM | FAST |
| Pacman | 持久内存 Compaction | USENIX ATC |
| PebblesDB | 碎片化 LSM-Tree | SOSP |
| REMIX | 全局排序索引 | SIGMOD |
| gLSM | GPU 加速 Compaction | OSDI |

**三大趋势**：
1. **Compaction 是 LSM 研究高地**：10 篇中 4 篇（CaaS/Pacman/PebblesDB/gLSM）直接研究 Compaction 优化
2. **异构硬件适配**：Learned Index + GPU Compaction + PMEM Compaction → LSM 引擎走向异构硬件协同
3. **存算分离共识**：Hailstorm + CaaS 与 Fluss/CockroachDB 的存算分离趋势一脉相承

### 🔧 知识库 Schema V2 升级 + V2 全量升级

- **Schema V2**（Commit `5e424bc`，7/5）：引入 confidence + confidence_rationale 字段、.entities.json 实体图谱、Supersession 检测
- **全量升级**（Commit `92e4c8e`，7/6）：121 页全量注入 confidence（0.70-0.95）、119 实体 + 485 关系知识图谱、Lint 全量清零、修复 6 处 dangling wikilink + 16 个 sources 路径 + 19 个 ASCII 残留 + 16 个孤儿

V2 升级后，知识库具备了自我评估能力——每张卡片明确标注"我知道什么、我有多确定"。

---

## 📊 统计

| 方向 | 动态数 | 亮点 |
|------|--------|------|
| AI Infra · Agent 基础设施 | 3 | GPT-5.5 Instant Mini、Claude Sonnet 5、MAS SAFR 金融 Agent 治理框架 |
| 存储引擎 | 1 | LSM-tree Top 10 CCF-A 论文入库（10 张概念卡片） |
| 知识库升级 | 1 | Schema V2 + V2 全量升级（121 页 confidence + 实体图谱） |

**合计 5 条动态 | 3 方向覆盖**

---

> ⚡ **本周特征**：外部 Agent 动态密集——OpenAI/Anthropic 工作马模型同时升级 + 金融监管率先建立 Agent 安全框架。内部侧聚焦知识库 V2 方法论升级，从"存知识"走向"知道有多确定"。
>
> 📎 子调研详情详见各方向页面。CEO 审阅后标记待入库文章，周五 Wiki 维护日统一入知识库。
