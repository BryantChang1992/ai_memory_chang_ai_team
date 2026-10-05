---
title: Custom Agent Harness — Middleware 架构
date: 2026-06-19 08:00:00 +0800
categories:
- AI 基础设施与数据平台
tags:
- agent-infra
- Agent Harness
- middleware
- langchain
topic: ai
content_type: 知识卡片
permalink: /knowledge/Custom-Agent-Harness-Middleware架构/
knowledge_source: 知识库/wiki/Custom-Agent-Harness-Middleware架构.md
knowledge_status: draft
knowledge_synced_at: '2026-10-05'
description: Custom Agent Harness — Middleware 架构：修订后的机制、证据边界与关联阅读。
knowledge_date_source: frontmatter
last_modified_at: '2026-10-05'
knowledge_reviewed_at: '2026-10-05'
mermaid: true
---

Middleware 将上下文组装、工具生命周期、状态、重试与策略干预放到 Agent 循环的明确位置。它让逻辑可复用，但模块之间仍可能共享状态、改变控制流和竞争预算。

```mermaid
flowchart TD
 I[初始化] --> C[组装上下文与策略]
 C --> M[模型调用]
 M -->|工具请求| T[受控执行工具]
 T --> S[更新状态与记录结果]
 S --> C
 M -->|完成| V[验证与清理]
 O[日志、额度与恢复逻辑] -.-> C
 O -.-> T
 O -.-> V
```

图为概念位置，不是当前库的字面 hook API。四种扩展杠杆是确定性逻辑、工具管理、自定义状态和流事件处理；一项能力可横跨多个模块，也可由一个模块承担多种职责。

**组合例子**：摘要先于审计，会改变审计可看到的原文；重试嵌套会放大调用量。为模块明确状态归属、顺序、失败和幂等语义，并共享任务预算，比单纯检查单个模块更重要。

[原文](https://www.langchain.com/blog/how-to-build-a-custom-agent-harness) 没有共同 benchmark 证明更强 Harness 永远胜过更强模型，也没有证明顺序执行等于无耦合。权限 middleware 还必须连接实际执行边界；仅在同权限进程里检查参数不足以提供 [Parallax — Agent 安全架构]({{ '/knowledge/Parallax-Agent安全架构/' | relative_url }}) 所要求的隔离。

[Loop Engineering — 多层 Agent 循环架构]({{ '/knowledge/Loop-Engineering-多层Agent循环架构/' | relative_url }}) 决定运行与改进循环，middleware 决定具体干预位置。模型路由可借此接入，但替换模型后仍应验证工具调用、状态兼容和任务质量。

详读：[自定义 Agent Harness — Middleware 精读]({{ '/knowledge/custom-agent-harness-精读/' | relative_url }})；相关：[Agent Fault Tolerance — 容错设计]({{ '/knowledge/Agent-Fault-Tolerance-容错设计/' | relative_url }})、[Agent Cost Control — Gateway 成本控制]({{ '/knowledge/Agent-Cost-Control-Gateway成本控制/' | relative_url }})、[Agent Sandbox — 安全沙箱选型]({{ '/knowledge/Agent-Sandbox-安全沙箱选型/' | relative_url }})。

## 来源与关联阅读

- [Model Neutrality — 模型中立与反锁定]({{ '/knowledge/Model-Neutrality-模型中立与反锁定/' | relative_url }})
- [Agentic Memory — Agent-First 语义缓存]({{ '/knowledge/Agentic-Memory-语义缓存/' | relative_url }})
- [Agent 基础设施：执行、状态、治理与证据]({{ '/knowledge/AI-Infra-Agent基础设施体系综述/' | relative_url }})
