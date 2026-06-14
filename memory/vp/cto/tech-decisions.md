# CTO 技术决策记录

**维护者：** CTO  
**最后更新：** 2026-04-19

---

## 2026-04-19: 多飞书机器人架构

**决策者：** CTO  
**状态：** ✅ 已实施

### 决策内容
采用单实例多飞书账号方案，实现 CEO + CTO 双 VP 架构。

### 技术配置

```json
{
  "channels": {
    "feishu": {
      "defaultAccount": "ceo",
      "accounts": {
        "ceo": {
          "appId": "cli_a96e7225c1f89bb3",
          "name": "CHANG_AI_TEAM CEO"
        },
        "cto": {
          "appId": "cli_a96e6494a3b89bc4",
          "name": "CHANG_AI_TEAM CTO"
        }
      }
    }
  },
  "bindings": [
    {
      "agentId": "cto-agent",
      "match": {
        "channel": "feishu",
        "accountId": "cto"
      }
    }
  ]
}
```

### 路由验证
- ✅ CEO 消息 → main agent
- ✅ CTO 消息 → cto-agent

### 经验教训
- Bindings 配置需要重启 Gateway 生效
- 每个账号需要单独配对授权
- Agent workspace 的 AGENTS.md/SOUL.md 必须明确角色定位

---

## 待决策事项

### 1. 专家层是否需要独立机器人？

**背景：** 技术线需要 Infra/Perf/SRE 三个专家。

**方案对比：**

| 方案 | 优点 | 缺点 |
|------|------|------|
| 独立机器人 | 身份独立、可私聊 | 配置复杂、资源消耗 |
| 共享账号 | 配置简单、成本低 | 身份混淆、权限难控 |

**建议：** 专家层采用独立机器人，保持身份清晰。

**决策：** 📝 待 CEO 批准

---

### 2. 执行层 worker 的 session 复用策略

**背景：** RD/SRE/QA worker 通过 session_spawn 动态创建。

**方案对比：**

| 方案 | 优点 | 缺点 |
|------|------|------|
| 每次新建 | 干净上下文 | 启动开销大 |
| 复用 session | 启动快 | 上下文污染风险 |

**建议：** 
- 短任务（<10 分钟）：复用 session
- 长任务/不同项目：新建 session
- 设置 session 超时自动清理

**决策：** 📝 待 CTO 内部讨论

---

## 技术债务

| 问题 | 影响 | 优先级 | 计划解决时间 |
|------|------|--------|-------------|
| 配置变更需重启 Gateway | 影响可用性 | 中 | 2026-05-01 |
| Token 监控未自动化 | 可能超预算 | 中 | 2026-04-21 |
| 会话压缩脚本待完善 | 同步延迟 | 低 | 2026-04-25 |

---

## 技术雷达

### 已采用
- ✅ OpenClaw 多 agent 框架
- ✅ 飞书协作平台
- ✅ Git 版本控制

### 评估中
- 🟡 会话压缩算法优化
- 🟡 Token 使用监控
- 🟡 自动备份策略

### 未来关注
- ⚪ Agent 间通信优化
- ⚪ 分布式部署方案
