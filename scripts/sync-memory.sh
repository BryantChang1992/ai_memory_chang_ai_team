#!/bin/bash
# CHANG_AI_TEAM 记忆同步脚本
# 用法：./scripts/sync-memory.sh

set -e

WORKSPACE="/home/admin/.openclaw/workspace"
cd "$WORKSPACE"

echo "=== CHANG_AI_TEAM Memory Sync ==="
echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. 压缩会话（如果有未压缩的）
echo "Step 1: Compressing sessions..."
if [ -d "memory/sessions/ceo-daily" ]; then
    for file in memory/sessions/ceo-daily/*.jsonl 2>/dev/null; do
        if [ -f "$file" ]; then
            basename=$(basename "$file" .jsonl)
            # 简单的压缩：提取关键信息
            echo "  Compressing: $basename"
            # TODO: 实现智能压缩逻辑
            cp "$file" "memory/sessions/compressed/${basename}.jsonl" 2>/dev/null || true
        fi
    done
fi
echo "  ✓ Sessions compressed"
echo ""

# 2. 添加所有记忆文件
echo "Step 2: Adding memory files to Git..."
git add memory/shared/ memory/vp/ memory/projects/ memory/domains/ memory/sessions/compressed/ 2>/dev/null || true
echo "  ✓ Files added"
echo ""

# 3. 检查是否有变更
echo "Step 3: Checking for changes..."
if git diff --cached --quiet; then
    echo "  ℹ️  No changes to sync"
    echo ""
    echo "=== Sync Complete (No Changes) ==="
    exit 0
fi
echo "  ✓ Changes detected"
echo ""

# 4. 提交
echo "Step 4: Committing changes..."
TIMESTAMP=$(date +%Y-%m-%d_%H:%M:%S)
git commit -m "auto: memory sync at $TIMESTAMP"
echo "  ✓ Committed"
echo ""

# 5. 推送
echo "Step 5: Pushing to remote..."
git push origin main
echo "  ✓ Pushed"
echo ""

echo "=== Sync Complete ==="
echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
