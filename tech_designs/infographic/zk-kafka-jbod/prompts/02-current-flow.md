Create a professional infographic following these specifications:

## Image Specifications
- **Type**: Infographic
- **Layout**: linear-progression (Process variant) — vertical top-to-bottom flow showing current ZK-mode disk failure handling chain
- **Style**: technical-schematic (Blueprint variant) — white lines on deep blue (#1E3A5F) background, grid pattern, clean geometric shapes, numbered steps
- **Aspect Ratio**: 9:16
- **Language**: zh

## Core Principles
- Vertical linear flow from top to bottom with 8 clearly numbered steps
- Each step as a rounded-rectangle node connected by downward arrows
- Right-side annotations highlighting problems at key steps
- Use blueprint aesthetic: white-on-blue, grid background, consistent stroke weights
- Amber (#F59E0B) highlights for problem indicators
- Red (#EF4444) for the critical problem callout at step 7

## Text Requirements
- Title: "ZK 模式现有磁盘故障处理流程" (top, prominent)
- Step labels in Chinese, technical sans-serif font, all-caps for step numbers
- Problem annotations in amber/red on the right side
- Arrow labels: "→" between each step

## Content
In ZooKeeper-mode Kafka, when a disk I/O error occurs: 1) Disk I/O Error detected; 2) ReplicaManager catches IOException; 3) LogDirFailureChannel.maybeAddOfflineLogDir() is called; 4) KafkaServer LogDirFailure handler thread receives notification; 5) Default behavior: wait for log.dir.failure.timeout.ms; 6) After timeout, broker performs active SHUTDOWN; 7) CRITICAL PROBLEM: Controller only learns about the failure AFTER entire broker shuts down — fault disk partitions are unreadable but Controller unaware until then; 8) Broker ZK session timeout → Controller triggers Leader Election for ALL partitions on this broker.

## Text Labels (in zh)
- 标题: ZK 模式现有磁盘故障处理流程
- 步骤1: 磁盘 I/O 错误
- 步骤2: ReplicaManager 捕获 IOException
- 步骤3: LogDirFailureChannel.maybeAddOfflineLogDir()
- 步骤4: KafkaServer LogDirFailure 处理线程收到通知
- 步骤5: 等待 log.dir.failure.timeout.ms 超时
- 步骤6: Broker 主动 SHUTDOWN
- 步骤7: ⚠️ 核心问题: Controller 直到 Broker 整机 shutdown 才知道故障 — 在此之前故障盘上的分区不可读写但 Controller 无感知
- 步骤8: ZK 会话超时 → Controller 触发 Leader 选举
- 右侧标注: 问题1: 粒度过粗(整机级别), 问题2: 感知延迟(依赖心跳超时), 问题3: 恢复需手动操作
