// Reviewed public catalog: generic topic names, categories, and relative weeks only.
// No task requirements, prompts, answers, evidence, source references, or time budgets.
export const PLAN_CATALOG = Object.freeze([
  {
    "week": 1,
    "titleKey": "append_read_log_baseline",
    "title": "追加读取与日志布局基线",
    "category": "流存储诊断",
    "track": "stream"
  },
  {
    "week": 2,
    "titleKey": "replication_failure_diagnosis",
    "title": "确认复制与故障诊断",
    "category": "流存储诊断",
    "track": "stream"
  },
  {
    "week": 3,
    "titleKey": "consumer_end_to_end_semantics",
    "title": "消费者与端到端处理语义",
    "category": "流存储",
    "track": "stream"
  },
  {
    "week": 4,
    "titleKey": "tiered_storage_design",
    "title": "分层存储设计",
    "category": "流存储专项",
    "track": "stream"
  },
  {
    "week": 5,
    "titleKey": "segment_scheduling_design",
    "title": "segment 独立调度设计",
    "category": "流存储专项",
    "track": "stream"
  },
  {
    "week": 6,
    "titleKey": "stream_combined_defense",
    "title": "两个专项回评与综合答辩",
    "category": "流存储",
    "track": "stream"
  },
  {
    "week": 7,
    "titleKey": "kv_engine_baseline",
    "title": "KV 基线与单机引擎取舍",
    "category": "KV 存储",
    "track": "kv"
  },
  {
    "week": 8,
    "titleKey": "shard_migration_hotspots",
    "title": "分片迁移与热点",
    "category": "KV 存储",
    "track": "kv"
  },
  {
    "week": 9,
    "titleKey": "kv_end_to_end_defense",
    "title": "端到端 KV 重新答辩",
    "category": "KV 存储",
    "track": "kv"
  },
  {
    "week": 10,
    "titleKey": "namespace_data_layout",
    "title": "命名空间与数据布局",
    "category": "文件系统",
    "track": "filesystem"
  },
  {
    "week": 11,
    "titleKey": "metadata_concurrency_rename",
    "title": "元数据并发与重命名",
    "category": "文件系统",
    "track": "filesystem"
  },
  {
    "week": 12,
    "titleKey": "client_cache_concurrent_writes",
    "title": "客户端缓存与并发写",
    "category": "文件系统",
    "track": "filesystem"
  },
  {
    "week": 13,
    "titleKey": "filesystem_recovery_defense",
    "title": "恢复快照与文件系统答辩",
    "category": "文件系统",
    "track": "filesystem"
  },
  {
    "week": 14,
    "titleKey": "structured_model_access_paths",
    "title": "结构化模型与访问路径",
    "category": "表格存储",
    "track": "table"
  },
  {
    "week": 15,
    "titleKey": "index_update_backfill",
    "title": "索引更新与在线回填",
    "category": "表格存储",
    "track": "table"
  },
  {
    "week": 16,
    "titleKey": "transaction_isolation",
    "title": "事务与隔离边界",
    "category": "表格存储",
    "track": "table"
  },
  {
    "week": 17,
    "titleKey": "partition_table_defense",
    "title": "分区热点与表格答辩",
    "category": "表格存储",
    "track": "table"
  },
  {
    "week": 18,
    "titleKey": "lake_table_snapshots",
    "title": "文件之上的表与快照",
    "category": "湖存储",
    "track": "lake"
  },
  {
    "week": 19,
    "titleKey": "concurrent_writers_commit",
    "title": "多写者与原子提交",
    "category": "湖存储",
    "track": "lake"
  },
  {
    "week": 20,
    "titleKey": "file_layout_scan_cost",
    "title": "文件布局与扫描成本",
    "category": "湖存储",
    "track": "lake"
  },
  {
    "week": 21,
    "titleKey": "updates_deletes_stream_batch",
    "title": "更新删除与流批衔接",
    "category": "湖存储",
    "track": "lake"
  },
  {
    "week": 22,
    "titleKey": "lake_maintenance_defense",
    "title": "维护回收与湖存储答辩",
    "category": "湖存储",
    "track": "lake"
  },
  {
    "week": 23,
    "titleKey": "durability_interfaces",
    "title": "从上层需求归纳持久化接口",
    "category": "存储底座",
    "track": "foundation"
  },
  {
    "week": 24,
    "titleKey": "shared_replication_failover",
    "title": "共享复制与故障切换服务",
    "category": "存储底座",
    "track": "foundation"
  },
  {
    "week": 25,
    "titleKey": "placement_scheduling_expansion",
    "title": "统一放置调度与扩容",
    "category": "存储底座",
    "track": "foundation"
  },
  {
    "week": 26,
    "titleKey": "repair_isolation_defense",
    "title": "修复隔离与通用底座答辩",
    "category": "存储底座",
    "track": "foundation"
  },
  {
    "week": 27,
    "titleKey": "independent_capstone_design",
    "title": "陌生需求的独立选型与设计",
    "category": "综合设计",
    "track": "capstone"
  },
  {
    "week": 28,
    "titleKey": "changing_constraints_defense",
    "title": "约束突变与最终答辩",
    "category": "综合设计",
    "track": "capstone"
  }
].map(entry => Object.freeze(entry)));
