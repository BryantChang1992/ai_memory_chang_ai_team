# CHANG_AI_TEAM 记忆沉淀体系设计

**创建时间：** 2026-04-19  
**作者：** Claw (CEO) + Frank  
**状态：** 📝 待 Frank Review

---

## 一、记忆分层架构

```
┌─────────────────────────────────────────────────────────┐
│                    L1: 公司级记忆                         │
│              (所有 VP 共享，CEO 维护)                      │
│  - 组织架构、重大决策、公司文化、核心项目                  │
├─────────────────────────────────────────────────────────┤
│                    L2: VP 级记忆                          │
│           (VP 私有，可分享给相关方)                        │
│  - CTO: 技术决策、架构设计、团队记录                       │
│  - CPO: 产品规划、用户反馈、需求池                         │
├─────────────────────────────────────────────────────────┤
│                    L3: 会话级记忆                         │
│         (临时、用完即弃，重要的升级到 L2)                   │
│  - 日常对话、临时任务、一次性讨论                          │
└─────────────────────────────────────────────────────────┘
```

---

## 二、文件结构设计

```
/home/admin/.openclaw/workspace/
├── memory/                          # 记忆存储
│   ├── shared/                      # L1: 公司级共享记忆
│   │   ├── ORGANIZATION.md          # 组织架构 + VP 名单
│   │   ├── DECISIONS.md             # 重大决策记录
│   │   ├── CULTURE.md               # 公司文化/价值观
│   │   └── PROJECTS.md              # 核心项目列表
│   │
│   ├── vp/                          # L2: VP 级记忆
│   │   ├── ceo/                     # CEO 私有记忆
│   │   │   ├── strategy.md          # 战略思考
│   │   │   └── vp-reviews.md        # VP 评估记录
│   │   └── cto/                     # CTO 私有记忆
│   │       ├── tech-decisions.md    # 技术决策
│   │       ├── architecture.md      # 架构设计
│   │       └── team-records.md      # 团队记录
│   │
│   └── sessions/                    # L3: 会话级记忆（自动）
│       ├── ceo-daily/               # CEO 日常会话
│       └── cto-daily/               # CTO 日常会话
│
├── .git/                            # Git 版本控制
└── scripts/
    └── sync-memory.sh               # Git 同步脚本
```

---

## 三、记忆写入规则

| 记忆类型 | 写入时机 | 升级条件 | 保留策略 |
|---------|---------|---------|---------|
| L1 公司级 | CEO 手动写入 | - | 永久保留 |
| L2 VP 级 | VP 手动写入 | VP 认为重要 | 永久保留 |
| L3 会话级 | 自动写入 | 会话中决定升级 | 7 天后清理 |

---

## 四、Git 同步策略

### 同步规则

- ✅ 只同步 `shared/` 和 `vp/` 目录
- ❌ 会话级记忆不同步（`.gitignore` 忽略）
- ✅ 每次同步前合并冲突
- ✅ 提交信息带时间戳和 agent 标识

### 同步频率

- **手动触发：** 重要决策后立即同步
- **自动触发：** 每天凌晨 2 点（cron）

### .gitignore 配置

```gitignore
# 不同步会话级记忆
memory/sessions/*

# 不同步临时文件
memory/*.tmp
*.log

# 不同步敏感信息
**/credentials.md
**/secrets.md
```

---

## 五、MVP 试点方案（CEO + CTO）

### 阶段 1：基础框架（1 天）

```bash
# 1. 创建目录结构
mkdir -p memory/{shared,vp/{ceo,cto},sessions/{ceo-daily,cto-daily}}

# 2. 创建共享记忆模板
# ORGANIZATION.md - 组织架构
# DECISIONS.md - 重大决策
# CULTURE.md - 公司文化
# PROJECTS.md - 核心项目

# 3. 初始化 Git
git init
git add memory/shared/
git commit -m "init: 公司记忆体系"
```

### 阶段 2：CTO 技术记忆（试点）

CTO 创建自己的记忆：
- `tech-decisions.md` - 技术决策记录
- `architecture.md` - 架构设计文档
- `team-records.md` - 团队记录

### 阶段 3：记忆升级流程

**升级条件**（满足任一）：
1. 影响多个 VP 的决策
2. 涉及公司战略方向
3. CEO 认为需要全员共享

**升级流程：**
1. VP 提出升级建议
2. CEO 审核批准
3. 复制到 `shared/` 目录
4. Git 同步

---

## 六、自动化脚本

### 6.1 日常同步脚本

```bash
#!/bin/bash
# scripts/sync-memory.sh

set -e

WORKSPACE="/home/admin/.openclaw/workspace"
cd "$WORKSPACE"

# 只同步共享记忆和 VP 记忆
git add memory/shared/ memory/vp/

# 检查是否有变更
if git diff --cached --quiet; then
    echo "No changes to sync"
    exit 0
fi

# 提交并推送
TIMESTAMP=$(date +%Y-%m-%d_%H:%M:%S)
git commit -m "auto: memory sync at $TIMESTAMP"
git push origin main

echo "Memory synced at $TIMESTAMP"
```

### 6.2 Cron 定时任务

```bash
# crontab -e
# 每天凌晨 2 点同步记忆
0 2 * * * /home/admin/.openclaw/workspace/scripts/sync-memory.sh >> /tmp/memory-sync.log 2>&1
```

---

## 七、记忆查询规范

### VP 读取记忆的规则

**CEO 可以读：**
- ✅ `memory/shared/*` (全部)
- ✅ `memory/vp/ceo/*` (自己的)
- ✅ `memory/vp/cto/*` (CTO 的，需授权)

**CTO 可以读：**
- ✅ `memory/shared/*` (全部)
- ✅ `memory/vp/cto/*` (自己的)
- ❌ `memory/vp/ceo/*` (需要 CEO 授权)

### 读取方式

1. 直接 `read` 文件
2. 通过 `memory_search` 搜索
3. 通过 `memory_get` 获取片段

---

## 八、安全与权限

| 目录 | CEO | CTO | 其他 VP |
|------|-----|-----|--------|
| memory/shared/ | 读写 | 读 | 读 |
| memory/vp/ceo/ | 读写 | ❌ | ❌ |
| memory/vp/cto/ | 读写 | 读写 | ❌ |
| memory/vp/cpo/ | 读写 | ❌ | 读 (未来) |

**实现方式：**
- 文件权限控制（chmod）
- Agent 读取时检查权限
- Git 远端分支隔离（可选）

---

## 九、MVP 测试清单

- [ ] 创建目录结构
- [ ] 初始化 Git 仓库
- [ ] CEO 写入第一条公司记忆
- [ ] CTO 写入第一条技术记忆
- [ ] 测试 Git 同步脚本
- [ ] 设置 Cron 定时任务
- [ ] 测试记忆读取权限
- [ ] 测试记忆升级流程

---

## 十、下一步行动

1. **创建目录结构和模板文件**
2. **授权 CEO 飞书应用权限**
3. **CTO 写入第一条技术决策记录**
4. **配置 Git 远端**（GitHub/Gitee）
5. **设置自动同步**

---

## Review 意见

**请 Frank 在此处添加 Review 意见：**

- [ ] 架构设计是否合理？
- [ ] 权限控制是否足够？
- [ ] Git 同步频率是否合适？
- [ ] 还需要补充什么？

---

**文档版本：** v1.0  
**最后更新：** 2026-04-19