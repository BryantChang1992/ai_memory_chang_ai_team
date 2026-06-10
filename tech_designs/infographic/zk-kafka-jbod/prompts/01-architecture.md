Create a professional infographic following these specifications:

## Image Specifications
- **Type**: Infographic
- **Layout**: hub-spoke — Central hub "ZooKeeper" with radiating connections to Broker 1, Broker 2, and Controller nodes
- **Style**: technical-schematic (Blueprint variant) — white lines on deep blue (#1E3A5F) background, grid pattern, dimension lines, technical annotations, clean geometric shapes
- **Aspect Ratio**: 16:9
- **Language**: zh

## Core Principles
- Central ZooKeeper node as the hub, with 3 spokes connecting to: Broker 1, Broker 2, Controller
- Show ZK paths under the ZooKeeper hub: /brokers/ids/{id}, /brokers/dirs/{id} (NEW), /controller, /admin/reassign..., /log_dir_event_notification (ENHANCED)
- Under Broker 1: show DirectoryHealthManager (NEW) component, list directories: /data1 ✅ ONLINE, /data2 ❌ OFFLINE, /data3 ✅ ONLINE
- Under Broker 2: show DirectoryHealthManager (NEW) component, list directories: /data1 ✅ ONLINE, /data2 ✅ ONLINE
- Under Controller: show response actions: listens to /brokers/dirs/*, on dir failure: 1. Mark dir DISABLED, 2. Migrate replicas from failed dir, 3. Notify admin
- Use blueprint aesthetic: white-on-blue, grid background, dimension lines, clean vector lines, consistent stroke weights

## Text Requirements
- Title: "ZK 版 Kafka JBOD 磁盘故障处理 — 架构总览" (top, prominent)
- All labels in Chinese, technical sans-serif or stencil font
- Key concepts visually emphasized with amber (#F59E0B) highlights for "NEW" and "❌ OFFLINE"
- Use cyan callouts for the Controller response actions

## Content
Architecture of ZooKeeper-based Kafka JBOD disk failure handling system. Central ZooKeeper cluster acts as metadata communication channel between Brokers and Controller. Each Broker runs a new DirectoryHealthManager component that monitors local disk health and reports status to ZK via /brokers/dirs/{id} znode. Controller watches these znodes and upon detecting a disk failure (OFFLINE state), marks the directory as DISABLED, triggers replica migration from affected partitions, and sends admin notification. The system supports per-directory health states: ONLINE, OFFLINE, CORDONED, DISABLED.

## Text Labels (in zh)
- 标题: ZK 版 Kafka JBOD 磁盘故障处理 — 架构总览
- ZooKeeper (中心枢纽)
- ZK 路径: /brokers/ids/{id}, /brokers/dirs/{id} [新增], /controller, /admin/reassign_partitions, /log_dir_event_notification [增强]
- Broker 1: DirectoryHealthManager [新增], /data1 ✅, /data2 ❌ OFFLINE, /data3 ✅
- Broker 2: DirectoryHealthManager [新增], /data1 ✅, /data2 ✅
- Controller: 监听 /brokers/dirs/* → 磁盘故障时: 1.标记 DISABLED, 2.迁移副本, 3.通知管理员
