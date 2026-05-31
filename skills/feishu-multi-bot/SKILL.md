# VP 层通用技能：多飞书机器人绑定与 Agent 招募

## 技能描述

**VP 层共享技能**，用于在 OpenClaw 单实例中配置多个飞书机器人，实现多 agent 架构。

**适用场景：**
- CEO 任命 VP 层成员（CPO/COO/CFO/CHO/CTO）
- VP 招募自己领域的专家层 agent（如 CTO 招募 Infra/性能/SRE 专家）
- 专家层创建执行层 worker（动态 spawn，不需要独立机器人）

**权限说明：**
- ✅ CEO：可以任命/剔除任何 VP，招募任何领域专家
- ✅ VP：可以招募自己领域的专家/子 agent（如 CTO 招募技术专家）
- ❌ 执行层：不独立，通过 session_spawn 动态创建

---

## 配置步骤

### Step 1: 创建飞书应用

#### VP 层应用（CEO 创建）

为每个 VP 角色创建独立的飞书应用：

```
应用 1: AI-CEO-App
  └─ 机器人：公司CEO
  └─ app_id: cli_xxx
  └─ app_secret: xxx

应用 2: AI-CTO-App
  └─ 机器人：公司CTO
  └─ app_id: cli_yyy
  └─ app_secret: yyy

应用 3: AI-CPO-App
  └─ 机器人：公司CPO
  └─ app_id: cli_zzz
  └─ app_secret: zzz
```

#### 专家层应用（VP 创建）

VP 可以为自己领域的专家创建独立机器人（可选）：

```
CTO 创建技术专家机器人：
  - AI-Infra-App → 机器人：Infra 专家
  - AI-Perf-App → 机器人：性能专家
  - AI-SRE-App → 机器人：SRE 专家
```

**每个应用需要的权限：**
- 机器人消息读写
- 获取用户信息
- 发送消息

---

### Step 2: 修改 OpenClaw 配置

编辑 `~/.openclaw/openclaw.json`：

#### 2.1 配置多飞书账号

```json
{
  "channels": {
    "feishu": {
      "enabled": true,
      "defaultAccount": "ceo",
      "accounts": {
        "ceo": {
          "appId": "cli_a96e7225c1f89bb3",
          "appSecret": "xxx",
          "name": "CHANG_AI_TEAM CEO"
        },
        "cto": {
          "appId": "cli_a96e6494a3b89bc4",
          "appSecret": "yyy",
          "name": "CHANG_AI_TEAM CTO"
        },
        "cpo": {
          "appId": "cli_zzz",
          "appSecret": "zzz",
          "name": "CHANG_AI_TEAM CPO"
        },
        "infra-expert": {
          "appId": "cli_infra_xxx",
          "appSecret": "infra_secret",
          "name": "Infra 专家"
        }
      }
    }
  }
}
```

**账号命名规范：**
- VP 层：小写角色名（ceo, cto, cpo, coo, cfo, cho）
- 专家层：`<领域>-expert` 或 `<领域>-expert`（infra-expert, perf-expert）
- 执行层：不需要独立账号（通过 session_spawn 动态创建）

#### 2.2 配置 Agent 列表

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "workspace": "/home/admin/.openclaw/workspace"
      },
      {
        "id": "cto-agent",
        "workspace": "/home/admin/.openclaw/workspace/agents/cto"
      },
      {
        "id": "cpo-agent",
        "workspace": "/home/admin/.openclaw/workspace/agents/cpo"
      },
      {
        "id": "infra-expert",
        "workspace": "/home/admin/.openclaw/workspace/agents/infra-expert"
      }
    ]
  }
}
```

**Agent ID 命名规范：**
- VP 层：`<role>-agent`（cto-agent, cpo-agent）
- 专家层：`<领域>-expert`（infra-expert, perf-expert）
- 执行层：不需要（动态 spawn）

#### 2.3 配置消息路由（Bindings）

```json
{
  "bindings": [
    {
      "agentId": "cto-agent",
      "match": {
        "channel": "feishu",
        "accountId": "cto"
      }
    },
    {
      "agentId": "cpo-agent",
      "match": {
        "channel": "feishu",
        "accountId": "cpo"
      }
    },
    {
      "agentId": "infra-expert",
      "match": {
        "channel": "feishu",
        "accountId": "infra-expert"
      }
    }
  ]
}
```

**路由规则说明：**
- `accountId` 对应 `channels.feishu.accounts` 中的 key
- `agentId` 对应 `agents.list` 中的 id
- 匹配到该账号的消息会路由到指定 agent
- **权限边界**：每个 VP 只能管理自己领域的 bindings

**权限示例：**
```json
// CTO 可以添加技术线 binding
{"agentId": "infra-expert", "match": {"accountId": "infra-expert"}}

// CTO 不能添加其他 VP 的 binding（需要 CEO 操作）
{"agentId": "cpo-agent", "match": {"accountId": "cpo"}} // ❌ 越权
```

---

### Step 3: 创建 Agent Workspace

为每个非 main agent 创建独立 workspace：

```bash
# VP 层 workspace
mkdir -p /home/admin/.openclaw/workspace/agents/cto
mkdir -p /home/admin/.openclaw/workspace/agents/cpo

# 专家层 workspace（CTO 创建）
mkdir -p /home/admin/.openclaw/workspace/agents/infra-expert
mkdir -p /home/admin/.openclaw/workspace/agents/perf-expert
```

#### 3.1 创建 AGENTS.md（必需）

**VP 层模板（以 CTO 为例）：**
```markdown
# AGENTS.md - CTO Agent Workspace

## 角色定位
**你是 CHANG_AI_TEAM 的 CTO（首席技术官）**。

## 汇报关系
- 上级：CEO 和 Frank（老板）
- 下属：技术专家、执行层

## 核心职责
1. 技术决策
2. 任命技术专家
3. 创建执行层 worker
4. 汇报进展

## 招募权限
✅ 可以招募：技术专家（Infra/Perf/SRE）
❌ 不能招募：其他 VP、非技术专家
```

**专家层模板（以 Infra 专家为例）：**
```markdown
# AGENTS.md - Infra Expert Workspace

## 角色定位
**你是 CHANG_AI_TEAM 的 Infra 专家**，向 CTO 汇报。

## 汇报关系
- 上级：CTO
- 下属：RD/SRE worker（动态 spawn）

## 核心职责
1. Infra 架构设计
2. 创建 RD/SRE worker 执行任务
3. 向 CTO 汇报进展

## 招募权限
✅ 可以创建：RD/SRE worker（动态 spawn）
❌ 不能创建：独立 agent（需要 CTO 批准）
```

#### 3.2 创建 SOUL.md（推荐）

**VP 层模板（CTO）：**
```markdown
# SOUL.md - CTO Identity

## 我是谁
**我是 CHANG_AI_TEAM 的 CTO**。

我不是 CEO，不是通用助手。

## 我的使命
领导技术团队，实现技术愿景。

## 启动确认
第一次启动回复："CTO Agent 已启动，等待任务分配。"
```

**专家层模板（Infra 专家）：**
```markdown
# SOUL.md - Infra Expert Identity

## 我是谁
**我是 CHANG_AI_TEAM 的 Infra 专家**，向 CTO 汇报。

## 我的使命
设计稳定的 Infra 架构，支持业务发展。

## 启动确认
第一次启动回复："Infra 专家已启动，等待 CTO 分配任务。"
```

#### 3.3 删除 BOOTSTRAP.md

```bash
rm /home/admin/.openclaw/workspace/agents/cto/BOOTSTRAP.md
```

---

### Step 4: 飞书机器人配对

每个飞书账号需要单独配对授权：

#### 4.1 私聊机器人

在飞书中私聊每个机器人，发送任意消息（如 "hello"）。

#### 4.2 查看配对请求

```bash
openclaw pairing list feishu
```

输出示例：
```
┌──────────┬──────────────────────────────────────────────┬─────────────────────────────────┬──────────────────────────┐
│ Code     │ feishuUserId                                 │ Meta                            │ Requested                │
├──────────┼──────────────────────────────────────────────┼─────────────────────────────────┼──────────────────────────┤
│ X7SHZZRQ │ ou_d07b0f612dbac96b60f0425e1e90c95d          │ {"accountId":"cto"}             │ 2026-04-19T13:36:00.000Z │
└──────────┴──────────────────────────────────────────────┴─────────────────────────────────┴──────────────────────────┘
```

#### 4.3 授权配对

```bash
openclaw pairing approve feishu X7SHZZRQ
```

**注意：** 每个账号的配对码不同，需要分别授权。

---

### Step 5: 重启 Gateway

```bash
openclaw gateway restart
```

---

### Step 6: 测试验证

#### 6.1 测试 CTO 机器人

在飞书私聊 `公司CTO`，问："你是谁？"

**期望回复：** "我是 CTO" 或类似表述

**如果回复 "我是 CEO/OpenClaw"，说明配置未生效：**
1. 检查 `bindings` 配置是否正确
2. 清除旧 session：`rm -rf /home/admin/.openclaw/agents/cto-agent/sessions/*`
3. 重启 Gateway

#### 6.2 查看日志验证路由

```bash
openclaw logs 2>&1 | grep "feishu\[cto\]"
```

**期望看到：**
```
feishu[cto]: dispatching to agent (session=agent:cto-agent:feishu:direct:ou_xxx)
```

---

## 完整配置示例

```json
{
  "agents": {
    "defaults": {
      "workspace": "/home/admin/.openclaw/workspace",
      "model": {
        "primary": "qwenCodeProvider/qwen3.5-plus"
      }
    },
    "list": [
      {"id": "main", "workspace": "/home/admin/.openclaw/workspace"},
      {"id": "cto-agent", "workspace": "/home/admin/.openclaw/workspace/agents/cto"}
    ]
  },
  "channels": {
    "feishu": {
      "enabled": true,
      "defaultAccount": "ceo",
      "accounts": {
        "ceo": {
          "appId": "cli_ceo_xxx",
          "appSecret": "ceo_secret",
          "name": "CEO"
        },
        "cto": {
          "appId": "cli_cto_xxx",
          "appSecret": "cto_secret",
          "name": "CTO"
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

---

## 常见问题

### Q1: 机器人说错自己身份

**症状：** CTO 机器人说自己是 CEO 或 OpenClaw

**原因：** agent workspace 的 AGENTS.md/SOUL.md 配置不正确，或旧 session 缓存

**解决：**
1. 检查 AGENTS.md 和 SOUL.md 是否明确角色定位
2. 删除旧 session：`rm -rf /home/admin/.openclaw/agents/<agent-id>/sessions/*`
3. 重启 Gateway

---

### Q2: 消息路由不到目标 agent

**症状：** CTO 机器人的消息还是 main agent 在处理

**原因：** bindings 配置错误或 accountId 不匹配

**检查：**
```bash
openclaw logs 2>&1 | grep "dispatching to agent"
```

**期望：** `agent:cto-agent:feishu:direct:ou_xxx`
**错误：** `agent:main:feishu:direct:ou_xxx`

**解决：** 检查 `bindings[].match.accountId` 是否与 `channels.feishu.accounts` 的 key 一致

---

### Q3: 配对请求不显示

**症状：** `openclaw pairing list feishu` 不显示新机器人的配对请求

**原因：**
1. 机器人没收到消息
2. 配置未生效

**解决：**
1. 确认飞书应用已发布
2. 确认机器人已加为好友
3. 重启 Gateway 后再发消息

---

### Q4: Gateway 重启失败

**症状：** `openclaw gateway restart` 返回错误

**常见原因：**
- config 中有 `plugins.allow: ["feishu"]`（stale entry）

**解决：** 删除 `plugins.allow` 中的 `feishu` 条目

---

## 扩展：添加更多 VP 或专家

### CEO 添加新 VP

按同样流程添加 CPO/COO/CFO/CHO：

```json
// openclaw.json
"agents": {
  "list": [
    {"id": "main"},
    {"id": "cto-agent"},
    {"id": "cpo-agent"},
    {"id": "coo-agent"},
    {"id": "cfo-agent"},
    {"id": "cho-agent"}
  ]
},
"channels": {
  "feishu": {
    "accounts": {
      "ceo": {...},
      "cto": {...},
      "cpo": {...},
      "coo": {...},
      "cfo": {...},
      "cho": {...}
    }
  }
},
"bindings": [
  {"agentId": "cto-agent", "match": {"accountId": "cto"}},
  {"agentId": "cpo-agent", "match": {"accountId": "cpo"}},
  {"agentId": "coo-agent", "match": {"accountId": "coo"}},
  {"agentId": "cfo-agent", "match": {"accountId": "cfo"}},
  {"agentId": "cho-agent", "match": {"accountId": "cho"}}
]
}
```

### VP 添加领域专家（以 CTO 为例）

CTO 可以为自己领域添加专家：

```json
// openclaw.json
"agents": {
  "list": [
    {"id": "main"},
    {"id": "cto-agent"},
    {"id": "infra-expert"},
    {"id": "perf-expert"},
    {"id": "sre-expert"}
  ]
},
"channels": {
  "feishu": {
    "accounts": {
      "ceo": {...},
      "cto": {...},
      "infra-expert": {...},
      "perf-expert": {...},
      "sre-expert": {...}
    }
  }
},
"bindings": [
  {"agentId": "cto-agent", "match": {"accountId": "cto"}},
  {"agentId": "infra-expert", "match": {"accountId": "infra-expert"}},
  {"agentId": "perf-expert", "match": {"accountId": "perf-expert"}},
  {"agentId": "sre-expert", "match": {"accountId": "sre-expert"}}
]
```

**注意：** VP 添加专家需要 CEO 批准（修改 openclaw.json 需要权限）

---

## 最佳实践

### 1. 命名规范

| 层级 | accountId | agentId | workspace |
|------|-----------|---------|----------|
| VP 层 | `ceo`, `cto`, `cpo` | `cto-agent`, `cpo-agent` | `agents/cto`, `agents/cpo` |
| 专家层 | `infra-expert`, `perf-expert` | `infra-expert`, `perf-expert` | `agents/infra-expert` |
| 执行层 | 不需要 | 不需要 | 动态 spawn |

### 2. 权限最小化

- 每个飞书应用只开通必要权限
- CEO 账号作为 `defaultAccount`
- VP 只能管理自己领域的 bindings

### 3. Session 管理

- 配置变更后清除旧 session：`rm -rf /home/admin/.openclaw/agents/<agent-id>/sessions/*`
- 定期清理 stale sessions
- 执行层 worker 用 `cleanup="delete"` 自动销毁

### 4. 日志监控

- 用 `openclaw logs` 验证路由
- 关注 `feishu[<account>]: dispatching to agent` 日志
- 错误日志及时排查

### 5. 组织架构记录

用飞书多维表格记录组织架构：
- VP 层名单 + 飞书账号
- 专家层名单 + 所属 VP
- 权限配置

---

## 执行层 Worker 动态创建

**专家层/VP 层通过 `sessions_spawn` 动态创建执行层 worker：**

```python
# 伪代码：Infra 专家创建 RD worker
worker = sessions_spawn(
    task="完成 XXX 开发任务",
    mode="run",  # 一次性任务
    runtime="subagent",
    label="rd-worker-xxx",
    cleanup="delete"  # 完成后销毁
)
result = await sessions_yield()
```

**执行层特点：**
- ❌ 不需要独立飞书机器人
- ❌ 不需要独立 workspace
- ✅ 通过专家/VP 代理通信
- ✅ 任务完成后自动销毁

---

## 参考资料

- [OpenClaw Channels 文档](/usr/lib/node_modules/openclaw/docs/channels/feishu.md)
- [OpenClaw Bindings 配置](/usr/lib/node_modules/openclaw/docs/channels/channel-routing.md)
- [飞书开放平台](https://open.feishu.cn/)
