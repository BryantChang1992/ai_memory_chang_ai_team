# Infra 最佳实践

**维护者：** 待任命  
**最后更新：** 2026-04-19

---

## 配置管理

### OpenClaw 配置

```json
// openclaw.json
{
  "channels": {
    "feishu": {
      "defaultAccount": "ceo",
      "accounts": {
        "ceo": {...},
        "cto": {...}
      }
    }
  },
  "bindings": [
    {"agentId": "cto-agent", "match": {...}}
  ]
}
```

**最佳实践：**
- 配置变更先备份
- 修改后验证语法
- 重启前通知相关方

---

## Git 工作流

### 分支策略

```
main (生产)
    │
    └── 自动同步（Cron）
```

### 提交规范

```
<type>: <description>

- init: 初始化
- auto: 自动同步
- feat: 新功能
- fix: 修复
- docs: 文档
```

**示例：**
```bash
git commit -m "init: 公司记忆体系"
git commit -m "auto: memory sync at 2026-04-19_14:30:00"
```

---

## 会话管理

### Session 创建

```python
sessions_spawn(
    task="任务描述",
    mode="session",  # 常驻
    runtime="subagent",
    label="agent-name",
    cleanup="keep"
)
```

### Session 清理

```bash
# 删除旧 session
rm -rf /home/admin/.openclaw/agents/<agent-id>/sessions/*
```

---

## 故障排查

### Gateway 无法启动

```bash
# 1. 检查配置
openclaw doctor --fix

# 2. 查看日志
cat /tmp/openclaw/openclaw-*.log

# 3. 重启
openclaw gateway restart
```

### 飞书消息不响应

```bash
# 1. 检查配对
openclaw pairing list feishu

# 2. 重新配对
# 私聊机器人发消息
# openclaw pairing approve feishu <CODE>

# 3. 检查权限
# 飞书开放平台 → 应用 → 权限管理
```

### Git 同步失败

```bash
# 1. 检查 SSH key
ssh -T git@github.com

# 2. 检查远程仓库
git remote -v

# 3. 手动推送
git push origin main
```

---

## 性能优化

### Token 控制

- 设置预算上限
- 自动压缩大文件
- 懒加载 + 缓存

### 同步优化

- 增量同步（只同步变更）
- 压缩后同步
- 避开高峰期

---

## 安全检查清单

- [ ] API Key 未硬编码
- [ ] SSH Key 权限正确（600）
- [ ] 飞书权限最小化
- [ ] Git 仓库私有
- [ ] 定期更新依赖

---

## 相关资源

- [OpenClaw 配置文档](https://docs.openclaw.ai/gateway/configuration)
- [Git 最佳实践](https://git-scm.com/book)
- [飞书权限管理](https://open.feishu.cn/document/ukzMzISNzUjLwgSO)
