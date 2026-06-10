Create a professional infographic following these specifications:

## Image Specifications
- **Type**: Infographic
- **Layout**: circular-flow — cyclic state machine showing 4 directory states with transition arrows
- **Style**: technical-schematic (Blueprint variant) — white lines on deep blue (#1E3A5F) background, grid pattern, clean geometric circles, precise arrow paths
- **Aspect Ratio**: 1:1
- **Language**: zh

## Core Principles
- 4 states arranged in a circle: ONLINE (top), OFFLINE (right), CORDONED (bottom), DISABLED (left)
- Each state as a prominent circle/node with icon and label
- Curved arrows between states showing transitions with trigger conditions
- Center: title "目录状态机" with legend
- Color coding: ONLINE = green (#4ADE80), OFFLINE = red (#EF4444), CORDONED = amber (#F59E0B), DISABLED = gray (#6B7280)
- Blueprint aesthetic: white-on-blue background, grid pattern, technical annotations on transition arrows
- Self-loop arrows for ONLINE→ONLINE and CORDONED→CORDONED (heartbeat reporting)

## Text Requirements
- Title: "LogDir 目录状态机" (center)
- State labels: ONLINE, OFFLINE, CORDONED, DISABLED
- Transition labels on arrows with trigger conditions in Chinese
- Legend at bottom explaining each state

## Content
Directory state machine with 4 states: ONLINE (normal operation, disk healthy, accepts partition assignments), OFFLINE (I/O failure detected by LogDirFailureChannel, disk unavailable), CORDONED (admin manually isolated via kafka-configs.sh or REST API, no new partitions assigned but existing ones remain), DISABLED (Controller confirmed failure, marked as unavailable, replicas migrated away). Transitions: ONLINE→OFFLINE on disk I/O error; OFFLINE→DISABLED when Controller processes failure event; DISABLED→ONLINE on recovery detection (new disk inserted); ONLINE→CORDONED on admin cordon command; CORDONED→ONLINE on admin uncordon command. All states periodically report heartbeat to ZK.

## Text Labels (in zh)
- 标题: LogDir 目录状态机
- ONLINE: 正常运行, 接受分区分配
- OFFLINE: 磁盘 I/O 故障 (LogDirFailureChannel 检测)
- CORDONED: 管理员手动隔离 (kafka-configs.sh / REST API)
- DISABLED: Controller 确认故障, 副本已迁移
- 转换: ONLINE→OFFLINE (磁盘 I/O 错误), OFFLINE→DISABLED (Controller 处理故障事件), DISABLED→ONLINE (恢复检测: 新磁盘插入), ONLINE→CORDONED (cordon 命令), CORDONED→ONLINE (uncordon 命令)
- 图例: 🟢 ONLINE | 🔴 OFFLINE | 🟡 CORDONED | ⚫ DISABLED
