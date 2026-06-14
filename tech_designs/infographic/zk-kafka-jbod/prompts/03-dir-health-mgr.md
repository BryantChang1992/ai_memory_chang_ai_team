Create a professional infographic following these specifications:

## Image Specifications
- **Type**: Infographic
- **Layout**: structural-breakdown (Exploded variant) — internal components of the new DirectoryHealthManager shown as separated blocks with callout lines
- **Style**: technical-schematic (Blueprint variant) — white lines on deep blue (#1E3A5F) background, grid pattern, clean geometric shapes, dimension lines
- **Aspect Ratio**: 16:9
- **Language**: zh

## Core Principles
- Main subject: DirectoryHealthManager (new component in Kafka Broker), shown as exploded view with internal modules separated
- 6 internal modules, each as a labeled block with callout lines pointing to it
- Arrows showing data flow between modules: Disk Health Monitor → State Manager → ZK Reporter and Event Emitter
- External interfaces shown at edges: LogDirFailureChannel (input, left), ZooKeeper (output, right), Controller (output, top-right), Admin API (input, top-left)
- Blueprint aesthetic: white-on-blue, grid background, technical annotations, dimension lines
- Amber (#F59E0B) for "NEW" labels, cyan for data flow arrows, green for ONLINE indicators

## Text Requirements
- Title: "DirectoryHealthManager 组件架构" (top, prominent)
- Module labels in Chinese, technical sans-serif, all-caps for module names
- Callout descriptions for each module
- Input/Output arrows labeled with protocols: ZK write, ZK sequence node, REST/CLI

## Content
DirectoryHealthManager is a new lightweight manager component added to Kafka Broker (2.7.x compatible). It does NOT modify existing ReplicaManager logic. Internal modules: 1) Disk Health Monitor — periodically checks all configured log.dirs via LogDirFailureChannel, detects I/O errors; 2) State Manager — maintains in-memory directory state machine (ONLINE/OFFLINE/CORDONED/DISABLED), tracks transition timestamps; 3) ZK Reporter — writes directory health status to /brokers/dirs/{brokerId} znode in JSON format; 4) Event Emitter — writes sequence znodes to /log_dir_event_notification for real-time Controller notification; 5) Cordon/Uncordon Handler — processes admin commands via dynamic config or API; 6) Recovery Detector — polls failed directories after replacement, auto-transitions from OFFLINE to ONLINE. External interfaces: input from LogDirFailureChannel (existing), output to ZooKeeper via ZK client, admin commands via kafka-configs.sh or REST API.

## Text Labels (in zh)
- 标题: DirectoryHealthManager 组件架构 [新增]
- 模块1: 磁盘健康监控器 — 定期检查 log.dirs, 通过 LogDirFailureChannel 检测 I/O 错误
- 模块2: 状态管理器 — 内存目录状态机 (ONLINE/OFFLINE/CORDONED/DISABLED), 追踪转换时间戳
- 模块3: ZK 上报器 — 写入目录状态到 /brokers/dirs/{brokerId} (JSON)
- 模块4: 事件发射器 — 写入 sequence znode 到 /log_dir_event_notification (实时通知)
- 模块5: Cordon/Uncordon 处理器 — 处理管理员命令 (动态配置/API)
- 模块6: 恢复检测器 — 轮询故障目录, 自动 OFFLINE→ONLINE
- 外部接口: LogDirFailureChannel (已有), ZooKeeper Client, kafka-configs.sh / REST API
