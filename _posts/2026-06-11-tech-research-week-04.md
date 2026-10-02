---
title: "技术调研周报 — Week 04 (2026-06-11)"
date: 2026-06-11 08:00:00 +0800
permalink: /posts/tech-research/week-04/
categories: []
tags: [AI基础设施, 数据平台, Kafka]
description: >-
  覆盖周期 2026-06-04 ~ 2026-06-11，Claude Fable 5 & Mythos 5 发布、OpenAI Assistants API 宣布退役、Apache Hudi 1.2 发布等重大动态。
issue: 4
issue_date: "2026-06-11"
content_type: "周报"
reading_title: "Agent 工具调用与湖仓生态更新"
---

> 覆盖周期：2026-06-04 ~ 2026-06-11

本期按三个社区方向提炼重点；版本特性、指标、提案状态与来源见各方向完整报告。

## 🧠 AI Harness · Agent 基础设施

- **模型与迁移**：Claude Fable 5 / Mythos 5 发布；Claude Opus 4.1 与 OpenAI Assistants API 进入退役迁移窗口。
- **工具调用**：Tool Search Tool、Programmatic Tool Calling 与 Tool Use Examples，关注按需加载、代码调用和示例驱动。
- **框架与安全**：Google ADK、LangGraph、CrewAI 更新，以及 Anthropic 容器化安全实践和 OWASP Agentic Top 10。

→ [查看完整报告]({{ '/posts/tech-research/week-04/ai-harness/' | relative_url }})

## 🗄️ 面向 AI 的数据平台建设

- **Hudi 1.2**：6 月 7 日发布，重点是 VECTOR / BLOB / VARIANT 与 Lance 集成。
- **Iceberg 1.11.0**：v3 Spec、服务端扫描规划、表级加密与 File Format API。
- **Catalog 治理**：Unity Catalog 扩展 Iceberg 支持及跨引擎 ABAC；Gravitino 1.2.1 持续完善多 Catalog 联邦。

→ [查看完整报告]({{ '/posts/tech-research/week-04/data-for-ai/' | relative_url }})

## ⚡ Kafka / AutoMQ / Fluss 社区动态

- **Kafka**：37 个 PR 合并，以 Group Coordinator、SharePartition 等修复为主；上期 9 个 KIP 继续讨论。
- **AutoMQ**：API Key 鉴权修复、Failover 与重试退避优化；ETag 条件写入仍为 Open 状态。
- **Fluss**：Tiering Service Deep Dive Part 2 解释调优方法，Hudi Source Split Planner、Aggregation Column 与 Auto Partition 持续推进。

→ [查看完整报告]({{ '/posts/tech-research/week-04/kafka/' | relative_url }})

## 🔗 链接

- [技术调研总目录]({{ '/weekly/' | relative_url }})
- [GitHub 仓库](https://github.com/BryantChang1992/ai_memory_chang_ai_team)
