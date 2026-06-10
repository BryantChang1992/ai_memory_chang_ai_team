Create a professional infographic following these specifications:

## Image Specifications
- **Type**: Infographic
- **Layout**: linear-progression (Process variant) — vertical/horizontal flow showing planned maintenance procedure for disk replacement
- **Style**: technical-schematic (Blueprint variant) — white lines on deep blue (#1E3A5F) background, grid pattern, clean geometric shapes, step numbers
- **Aspect Ratio**: 16:9
- **Language**: zh

## Core Principles
- 6-step process flow with clear step numbers and direction arrows
- Alternating actor labels: [Admin], [Controller], [Broker]
- Color coding: green for safe operations, amber for migration in progress, blue for recovery
- Each step as a distinct block with icon, step number, actor badge, and description
- Blueprint aesthetic: white-on-blue, grid background, consistent styling
- Side annotations for estimated time per step

## Text Requirements
- Title: "计划内磁盘维护完整流程 (Cordon → 换盘 → Uncordon)" (top, prominent)
- Step numbers: 1-6 with actor badges
- Time estimates per step
- Key command references (kafka-configs.sh, etc.)

## Content
Planned maintenance procedure for JBOD disk replacement without broker downtime: Step 1 [Admin]: Run cordon command → kafka-configs.sh --alter --add-config cordoned.log.dirs=/data2 → signals intent to isolate disk → Broker writes CORDONED to ZK. Step 2 [Controller]: Detects CORDONED state → stops assigning new partitions to /data2 → triggers migration of existing partitions from /data2 to other healthy dirs → throttled reassignment to avoid performance impact. Step 3 [Admin]: Wait for migration complete → verify no partitions remain on /data2 → cordon wait complete, disk safe to replace. Step 4 [Admin]: Physically replace disk → mount new disk at /data2 → verify disk is writable. Step 5 [Admin]: Run uncordon command → kafka-configs.sh --alter --delete-config cordoned.log.dirs → Broker removes CORDONED → writes ONLINE to ZK. Step 6 [Controller]: Detects ONLINE transition → /data2 becomes eligible for new partition assignments → normal replica balancing resumes → cluster returns to full JBOD capacity.

## Text Labels (in zh)
- 标题: 计划内磁盘维护完整流程 — Cordon → 换盘 → Uncordon
- 步骤1 [Admin]: Cordon 磁盘 — kafka-configs.sh --alter --add-config cordoned.log.dirs=/data2 → Broker 写入 CORDONED 到 ZK
- 步骤2 [Controller]: 停止分配新分区到 /data2 → 迁移现有分区到健康目录 (带限流)
- 步骤3 [Admin]: 等待迁移完成 → 验证 /data2 无残留分区 → 磁盘安全可替换
- 步骤4 [Admin]: 物理更换磁盘 → 挂载新磁盘到 /data2 → 验证可写
- 步骤5 [Admin]: Uncordon 磁盘 — kafka-configs.sh --alter --delete-config cordoned.log.dirs → Broker 写入 ONLINE 到 ZK
- 步骤6 [Controller]: /data2 重新可分配 → 正常副本均衡恢复 → 集群恢复完整 JBOD 容量
- 时间估算: 步骤1-2 (~30s), 步骤2 迁移 (取决于数据量, 通常 5-30min), 步骤3 (验证 1-2min), 步骤4 (物理操作 10-30min), 步骤5 (~30s), 步骤6 (自动进行)
