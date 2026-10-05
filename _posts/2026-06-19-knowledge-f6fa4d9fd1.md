---
title: Agent Memory 综述 2026
date: 2026-06-19 08:00:00 +0800
categories:
- AI 基础设施与数据平台
tags:
- agent-infra
- agent-memory
- survey
- llm-agents
topic: ai
content_type: 深度调研
permalink: /knowledge/Agent-Memory-Survey-2026综述/
knowledge_source: 知识库/wiki/Agent-Memory-Survey-2026综述.md
knowledge_status: draft
knowledge_synced_at: '2026-10-05'
description: Agent Memory 综述 2026：机制、设计取舍与关联阅读。
knowledge_date_source: frontmatter
---

## Agent Memory 综述 2026

Du et al. (2026) 的系统综述覆盖 2022 - 2026 年初 LLM Agent 记忆研究全景。核心论点：**Agent 记忆不是单一功能，而是一个 write → manage → read 的系统架构循环**，与感知和行动紧密耦合。

## 分类体系

### 三维分类法

| 维度 | 含义 | 关键问题 |
|------|------|----------|
| **时间维度** (temporal scope) | 记忆保留的跨度 | 对话级 / 会话级 / 跨会话级 |
| **表示基底** (representational substrate) | 如何编码存储 | 向量 / 文本块 / 知识图谱 / 模型权重 |
| **控制策略** (control policy) | 何时读写 | 启发式 / LLM 决策 / 策略学习 |

### 五大机制家族

| 家族 | 核心原理 | 优势 | 局限 |
|------|----------|------|------|
| **Context-resident compression** | 压缩历史使 fit context window | 实现简单、延迟低 | 信息损失不可避免 |
| **Retrieval-augmented stores** | 外部向量库检索相关记忆 | 容量理论上无限 | 检索精度是瓶颈 |
| **Reflective self-improvement** | Agent 反思自身行为并自我改进 | 可提升长期推理能力 | 反思质量不可靠 |
| **Hierarchical virtual context** | 多层级摘要 + 按需展开 | 平衡上下文利用率和信息保真 | 层级设计无通用方案 |
| **Policy-learned management** | RL/进化算法学习记忆策略 | 可自适应环境 | 训练成本高、泛化难 |

## 工程实践前沿

### Write-path 过滤

存储前对记忆做质量过滤，避免垃圾信息污染检索。关键挑战：**查全 vs 查准的帕累托前沿**——过滤太严丢关键信息，太松引入噪声。

### 矛盾处理

不同会话产生的记忆可能矛盾。两种主流方案：**时间戳冲突解决**（最新优先）和 **置信度加权合并**。前者简单但粗暴，后者对置信度估计要求高。

### 延迟预算

记忆操作（读写 + 检索）延迟不能超过任务允许上限。工程策略：分层存储（热数据 in-context，温数据向量库，冷数据块存储），各层延迟目标依次放宽。

### 隐私治理

跨会话记忆的敏感信息生命周期管理：自动识别 PII、过期自动遗忘、用户可主动删除。GDPR/SOC2 合规的实际落地问题。

## 开放挑战

| 挑战 | 现状 | 与已有知识库的关联 |
|------|------|-------------------|
| **持续整合** | 新记忆如何与旧记忆建立因果联系而非仅向量近邻 | 类似 [LSM-Tree]({{ '/knowledge/LSM-Tree/' | relative_url }}) 的 compaction 问题——增量合并 |
| **因果驱动检索** | 从"语义相似"到"因果相关"的检索跃升 | [Agentic-Memory-语义缓存]({{ '/knowledge/Agentic-Memory-语义缓存/' | relative_url }}) 正在探索的方向 |
| **可信反思** | 如何保证反思质量，防止自我欺骗循环 | 暂无可靠方案 |
| **学习性遗忘** | Agent 应主动遗忘无用信息，而非容量耗尽后被动淘汰 | 类比 [LSM-Tree-写放大]({{ '/knowledge/LSM-Tree-写放大/' | relative_url }})——写满才 compacts 不是最优 |
| **多模态具身记忆** | 视觉/语音/触觉记忆的统一表示 | 研究极早期 |

## 与 [Agentic-Memory-语义缓存]({{ '/knowledge/Agentic-Memory-语义缓存/' | relative_url }}) 的关系

本综述是理论全景，[Agentic-Memory-语义缓存]({{ '/knowledge/Agentic-Memory-语义缓存/' | relative_url }}) 是其中一个子机制的工程实践——语义缓存属于 retrieval-augmented stores + context-resident compression 的混合体。

## 在 [Agent-First-Data-Systems]({{ '/knowledge/Agent-First-Data-Systems/' | relative_url }}) 中的位置

Memory 是 Agent-First 数据系统中"状态层"的核心组件——Agent 需要持久化状态、选择性召回、因果推理，这正是本综述覆盖的全栈问题。

## 来源与关联阅读

- [知识库/sources/papers/Agent-Memory-Survey/arxiv-2603.07670-精读]({{ '/knowledge/arxiv-2603.07670-精读/' | relative_url }})
- [参考来源](https://arxiv.org/abs/2603.07670)
- [知识库/wiki/Agentic-Memory-语义缓存]({{ '/knowledge/Agentic-Memory-语义缓存/' | relative_url }})
- [知识库/wiki/Agent-First-Data-Systems]({{ '/knowledge/Agent-First-Data-Systems/' | relative_url }})
- [知识库/wiki/Custom-Agent-Harness-Middleware架构]({{ '/knowledge/Custom-Agent-Harness-Middleware架构/' | relative_url }})
- [知识库/wiki/LSM-Tree]({{ '/knowledge/LSM-Tree/' | relative_url }})
- [知识库/wiki/synthesis/AI-Infra-Agent基础设施体系综述]({{ '/knowledge/AI-Infra-Agent基础设施体系综述/' | relative_url }})
