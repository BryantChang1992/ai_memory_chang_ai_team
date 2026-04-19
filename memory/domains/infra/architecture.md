# Infra 架构设计

**维护者：** 待任命  
**最后更新：** 2026-04-19

---

## 当前架构

### 基础设施

| 组件 | 配置 | 用途 |
|------|------|------|
| 服务器 | 阿里云 ECS | OpenClaw 运行 |
| 操作系统 | Linux 5.10 | 基础环境 |
| Node.js | v22 | 运行时 |
| Chrome | v144+ | 浏览器自动化 |

### 网络架构

```
互联网
    │
    ├── 飞书 API ←→ OpenClaw Gateway
    ├── GitHub ←→ Git 同步
    └── 用户 ←→ 飞书机器人
```

---

## 技术栈

### 核心组件

- **OpenClaw**: AI agent 框架
- **飞书**: 协作平台
- **GitHub**: 代码/记忆托管
- **Qwen 3.5 Plus**: AI 模型

### 工具链

- **Git**: 版本控制
- **Cron**: 定时任务
- **Bash**: 自动化脚本

---

## 最佳实践

### 1. 配置管理

- 所有配置版本化
- 敏感信息用环境变量
- 变更需要 Review

### 2. 监控告警

- Gateway 状态监控
- Token 使用监控
- Git 同步状态监控

### 3. 备份策略

- 每天 Git 同步
- 本地保留 7 天快照
- 远端永久保留

---

## 运维手册

### Gateway 重启

```bash
openclaw gateway restart
openclaw gateway status
```

### 检查配对状态

```bash
openclaw pairing list feishu
```

### 查看日志

```bash
openclaw logs --follow
```

### Git 同步

```bash
cd /home/admin/.openclaw/workspace
./scripts/sync-memory.sh
```

---

## 待办事项

- [ ] 任命 Infra 专家
- [ ] 完善监控脚本
- [ ] 配置告警通知
- [ ] 编写备份恢复流程

---

## 相关资源

- [OpenClaw 文档](https://docs.openclaw.ai)
- [飞书开放平台](https://open.feishu.cn)
- [GitHub 仓库](https://github.com/BryantChang1992/ai_memory_chang_ai_team)
