#!/bin/bash
# 每周技术调研任务调度脚本
# 运行时间: 每周四 09:00 CST
# 通过 openclaw CLI 触发 CTO agent 执行技术调研
# 任务完成后自动提交并推送到 GitHub（GitHub Pages 自动部署）

set -e

LOG_FILE="/tmp/tech-research-weekly.log"
REPO_DIR="/home/admin/.openclaw/workspace/agents/cto/work/ai_memory_chang_ai_team"

echo "=== 技术调研周报 ===" >> "$LOG_FILE"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$LOG_FILE"

# 计算周次（从第1期 2026-05-26 起算）
REFERENCE_DATE="2026-05-26"
WEEK_NUM=$(python3 -c "
from datetime import datetime
ref = datetime.strptime('$REFERENCE_DATE', '%Y-%m-%d')
now = datetime.now()
delta = (now - ref).days
week = delta // 7 + 1
print(week)
")

TARGET_DATE=$(date +%Y-%m-%d)
WEEK_STR=$(printf '%02d' "$WEEK_NUM")

echo "周次: Week $WEEK_STR" >> "$LOG_FILE"

# Step 1: 通过 openclaw agent CLI 发送任务给 CTO agent 生成周报
echo "Step 1: 触发 CTO agent 生成周报..." >> "$LOG_FILE"
cd /home/admin/.openclaw/workspace/agents/cto

openclaw agent \
  --agent cto \
  --timeout 1800 \
  --message "执行本周技术调研周报，三大方向全部覆盖：
1. AI Harness · Agent 基础设施（OpenAI、Anthropic、框架生态、Agent 安全等）
2. 面向 AI 的数据平台建设（Iceberg/Delta/Hudi、Lakehouse、多模态数据等）
3. Kafka / AutoMQ / Fluss 社区动态（版本发布、KIP、PR、生态等）

周次 Week_${WEEK_STR}，目标日期 ${TARGET_DATE}。

要求：
- 在 tech_research/ 对应子目录下生成 week_${WEEK_STR}_${TARGET_DATE}.html
- 更新 tech_research/index.html 索引页面
- 生成完成后 commit 并 push 到 GitHub main 分支
- commit message 格式: 'research: week ${WEEK_STR} (${TARGET_DATE})' " \
  >> "$LOG_FILE" 2>&1

echo "Step 1 完成: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"

# Step 2: 确保 Git 提交发布（兜底，防止 agent 未执行 git 操作）
echo "Step 2: 检查并推送 Git 变更..." >> "$LOG_FILE"
cd "$REPO_DIR"

if git diff --quiet && git diff --cached --quiet; then
  echo "  ℹ️  无变更，跳过提交" >> "$LOG_FILE"
else
  git add tech_research/
  git commit -m "research: week ${WEEK_STR} (${TARGET_DATE})"
  git push origin main
  echo "  ✅ 已提交并推送到 GitHub" >> "$LOG_FILE"
  echo "  📎 GitHub Pages: https://bryantchang1992.github.io/ai_memory_chang_ai_team/tech_research/" >> "$LOG_FILE"
fi

echo "全部完成: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
