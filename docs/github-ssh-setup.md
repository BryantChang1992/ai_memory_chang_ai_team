# 🔐 GitHub SSH Key 配置

## 生成的 SSH 公钥

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAID0k23mVoCflQVZ1h12htK4JfWc2jN1GC/Xplk2U4RU/ ceo@chang-ai.team
```

---

## 配置步骤

### 1. 复制公钥

```bash
cat ~/.ssh/id_ed25519.pub
```

### 2. 添加到 GitHub

1. 打开 https://github.com/settings/keys
2. 点击 "New SSH key"
3. Title: `CHANG_AI_TEAM CEO`
4. Key type: `Authentication Key`
5. 粘贴上面的公钥
6. 点击 "Add SSH key"

### 3. 验证连接

```bash
ssh -T git@github.com
```

期望输出：
```
Hi BryantChang1992/ai_memory_chang_ai_team.git! You've successfully authenticated.
```

### 4. 推送到 GitHub

```bash
cd /home/admin/.openclaw/workspace
git push -u origin main
```

---

## 完成后

推送成功后，记忆体系就正式托管到 GitHub 了！

🎉
