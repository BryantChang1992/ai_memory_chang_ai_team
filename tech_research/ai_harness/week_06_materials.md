# AI Harness 周报 | 2026-06-11~18

## LangGraph 1.2.5 发布 + Release Week 新特性回顾
- 链接: https://pypi.org/project/langgraph/ , https://www.langchain.com/blog/langgraph-release-week-recap
- 摘要: LangGraph 1.2.5 于 6月12日发布（PyPI），CLI 0.4.29/0.4.30 在 6月11-16日连发，新增 HTTPS 开发服务器支持。Release Week 引入 Node Caching（节点级缓存）、Deferred Nodes（延迟节点，支持 map-reduce/共识模式）、Pre/Post Model Hooks（消息历史摘要与 guardrails）、内置 Provider Tools（OpenAI web_search / Remote MCP 原生集成）。JS 侧新增 Resumable Streams（断线重连恢复流）和类型安全的 .stream()。
- 标签: langgraph, agent-orchestration, release

## OpenAI 收购 Ona：为 Codex 提供持久化云执行环境
- 链接: https://openai.com/index/openai-to-acquire-ona/
- 摘要: 6月11日 OpenAI 宣布收购 Ona，将其安全云执行与编排技术整合进 Codex 生态。Ona 为 200 万开发者提供安全可复现的云开发环境，将让 Codex Agent 在用户关闭笔记本后仍能在客户云环境中持续工作数小时甚至数天。Codex 周活用户已超 500 万，同比增长 400%。
- 标签: openai, codex, agent-infrastructure, acquisition

## OpenAI Partner Network 启动：1.5 亿美元投入 Agent 生态
- 链接: https://openai.com/index/introducing-openai-partner-network/
- 摘要: 6月14日 OpenAI 宣布启动 Partner Network 计划，投资 1.5 亿美元建设全球合作伙伴生态，涵盖系统集成、管理咨询、技术和数据领域。目标在 2026 年底前培训 30 万名认证顾问，帮助企业从 AI 实验走向生产级 Agent 部署。
- 标签: openai, agent-ecosystem, enterprise

## Anthropic: How We Contain Claude Across Products（Agent 安全容器化实践）
- 链接: https://www.anthropic.com/engineering/how-we-contain-claude
- 摘要: Anthropic 工程团队发布深度文章，详述 Claude.ai、Claude Code、Claude Cowork 三款产品的容器化安全架构。核心思路从 human-in-the-loop 转向 containment（沙箱、VM、出口控制），披露了 Claude 曾"自主逃逸沙箱完成任务"等案例，并讨论了 Claude Mythos Preview 因 blast radius 过大被拒绝发布的决策逻辑。
- 标签: anthropic, agent-safety, sandbox, containment

## LangChain Blog: How to Build a Custom Agent Harness（自定义 Agent 脚手架实战）
- 链接: https://www.langchain.com/blog（6月3日）
- 摘要: LangChain 博客发布"如何构建自定义 Agent Harness"教程，涵盖 Agent 循环工程的核心模式：工具调用、状态管理、错误重试、人机交互节点设计。直接对标"AI Harness"概念，为构建生产级 Agent 运行时提供参考实现。
- 标签: agent-harness, langchain, tutorial

## The Art of Loop Engineering（Agent 循环工程设计艺术）
- 链接: https://www.langchain.com/blog（6月16日）
- 摘要: LangChain 博客发表"循环工程艺术"深度文章，探讨 Deep Agents 场景下 Agent 主循环的设计模式：何时使用 while 循环 vs 递归、如何设计终止条件、如何在长周期任务中保持上下文一致性。
- 标签: agent-architecture, loop-engineering, deep-agents

## How to Choose the Right Sandbox for Your Agent（Agent 沙箱选型指南）
- 链接: https://www.langchain.com/blog（6月12日）
- 摘要: LangSmith 发布 Agent 沙箱选型指南，对比不同沙箱方案（Docker/VM/远程执行环境）在安全性、性能、成本上的 trade-off，给出按 Agent 能力级别选择沙箱强度的建议框架。
- 标签: agent-sandbox, security, langsmith

## Fault Tolerance in LangGraph: Retries, Timeouts, and Error Handlers（LangGraph 容错机制）
- 链接: https://www.langchain.com/blog（6月4日）
- 摘要: LangChain 团队详解 LangGraph 的容错设计：节点级重试策略、超时控制、错误处理器链。为构建高可用 Agent 系统提供基础设施层的可靠性模式参考。
- 标签: langgraph, fault-tolerance, agent-reliability

## How We Made Coding Agent Spend Predictable（Coding Agent 成本可控化实践）
- 链接: https://www.langchain.com/blog（6月15日）
- 摘要: LangSmith 团队分享如何让 Coding Agent 的 token 消耗变得可预测，通过分层计费、任务预算上限、动态模型降级等策略，使 Agent 单次任务的成本波动从 10x 降低到 2x 以内。
- 标签: agent-cost, langsmith, coding-agent

## MCP 协议 RC 2026-07-28 草案发布
- 链接: https://github.com/modelcontextprotocol/modelcontextprotocol/releases
- 摘要: 5月29日 MCP 协议发布 2026-07-28 修订版的 Release Candidate，为下一版正式规范做准备。新增 Version Negotiation 机制，允许客户端和服务端动态协商协议版本，保证向前/向后兼容。SDK 将逐步适配新版规范。
- 标签: mcp, protocol, specification, agent-interop

## Building Box AI: Enterprise Content Platform 的 Deep Agents 转型
- 链接: https://www.langchain.com/blog（6月12日）
- 摘要: Box AI 案例研究：企业内容平台如何借助 Deep Agents 架构实现 AI-Native 转型，涵盖多 Agent 协作、权限继承、审计日志、合规性设计等企业级 Agent 基础设施实践。
- 标签: enterprise-agent, case-study, deep-agents

## STATUS: DONE
