Create a professional infographic following these specifications:

## Image Specifications
- **Type**: Infographic
- **Layout**: linear-progression (Timeline variant) — horizontal timeline showing automatic disk failure handling from T+0 to T+N
- **Style**: technical-schematic (Blueprint variant) — white lines on deep blue (#1E3A5F) background, grid pattern, time markers, clean connecting lines
- **Aspect Ratio**: 16:9
- **Language**: zh

## Core Principles
- Horizontal timeline with 6 time markers from T+0 to T+N
- Below each time marker: the event/action that occurs, with actor label (Broker/Controller/ZK)
- Three swimlanes (horizontal bands): Broker actions (top), ZK state (middle), Controller actions (bottom)
- Connecting arrows between related events across swimlanes
- Green for normal state transitions, red for failure events, amber for recovery steps
- Blueprint aesthetic: white-on-blue, grid background, precise timeline markers

## Text Requirements
- Title: "自动故障处理完整时间线" (top, prominent)
- Time markers: T+0, T+~1s, T+~2s, T+~30s, T+~5min, T+N
- Actor labels: [Broker], [ZK], [Controller]
- Brief event descriptions under each marker

## Content
Complete automatic failure handling timeline: T+0: Broker detects disk I/O error → LogDirFailureChannel triggers → DirectoryHealthManager marks dir OFFLINE in memory. T+~1s: Broker writes two ZK updates: (a) /brokers/dirs/{id} updated with OFFLINE state, (b) /log_dir_event_notification sequence node created with LOG_DIR_FAILURE event. ZK Watcher fires immediately. T+~2s: Controller receives ZK watch notification → reads /brokers/dirs/{id} → identifies which dir failed and what partitions are affected → marks dir DISABLED. T+~30s: Controller triggers replica migration: creates reassignment plan only for partitions on failed dir, writes to /admin/reassign_partitions, executes reassignment with throttling. T+~5min: Replica migration completes: all affected partitions have new replicas on healthy directories, ISR expanded to include new replicas, cluster returns to full health. T+N: Admin notified: disk replacement scheduled, after replacement DirectoryHealthManager detects recovery, transitions DISABLED→ONLINE.

## Text Labels (in zh)
- 标题: 自动故障处理完整时间线
- T+0 [Broker]: 磁盘 I/O 错误检测 → DirectoryHealthManager 标记 OFFLINE
- T+~1s [Broker→ZK]: 写入 /brokers/dirs/{id} (OFFLINE) + /log_dir_event_notification (LOG_DIR_FAILURE) → ZK Watcher 触发
- T+~2s [Controller]: 收到 ZK 通知 → 读取故障目录 → 识别受影响分区 → 标记 DISABLED
- T+~30s [Controller]: 触发副本迁移 → 创建重分配计划 (仅故障盘分区) → 写入 /admin/reassign_partitions → 执行迁移 (带限流)
- T+~5min [Controller]: 迁移完成 → 所有受影响分区已有健康副本 → ISR 扩展 → 集群恢复完整健康状态
- T+N [Admin]: 通知管理员 → 安排换盘 → 换盘后 DirectoryHealthManager 检测恢复 → DISABLED→ONLINE
- 横向泳道: Broker 操作 | ZK 状态 | Controller 操作
