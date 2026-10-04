Paimon 这段时间的实质增量，是把复合 BTree 从核心等值查询，接到 Flink/Spark 的建索引入口，再扩展到前缀、范围、IN 和 NULL。前序存储与等值查询已经在 10 月 2 日合并，属于本次窗口外背景；本次四项补丁分别于 10 月 3 日 14:05、16:35、17:55、19:17 合入 master，目前没有核验到包含它们的稳定发行版。[前序等值查询](https://github.com/apache/paimon/pull/10339)；[SQL 建索引](https://github.com/apache/paimon/pull/10345)；[范围查询](https://github.com/apache/paimon/pull/10346)；[IN/NULL](https://github.com/apache/paimon/pull/10347)；[切片比较](https://github.com/apache/paimon/pull/10349)

它解决的是多列过滤的中间结果成本。独立单列索引可能先展开两大份行号，再求交集；复合索引将有类型的元组直接映射到行号列表。以 `(category, item_number)` 为例，类别 IN 两个值、编号大于 7，可以拆成两个类别前缀内的范围；只筛编号不能利用这个索引的左前缀。遇到首个范围列之后，后续键列条件仍由数据过滤处理，不能把“涉及多列”写成“所有条件都下推”。[实现与文档](https://github.com/apache/paimon/pull/10346/files)

离散条件也有成本上限：每列先求条件交集、按类型去重，再展开，最多生成 256 个元组区间；超限改走其他索引或普通扫描。IN 列表里的 NULL 不命中 NULL 键，IS NULL 才显式选择它。范围扫描按候选索引文件字节数计算预算，共享文件只算一次；任一索引组超预算，就放弃整个复合定义，避免只选择部分组造成执行路径的覆盖范围不一致。完整键的点查不受这一扫描预算限制，但仍受区间数量限制。[规划器与边界测试](https://github.com/apache/paimon/pull/10347/files)

最后一项把块索引和数据块二分查找中的复合键比较，改为直接比较序列化切片，省掉反复拷贝与完整行反序列化，保留文件格式。上游测试对真实跨块点查计数，断言打开元数据后不再增加完整行反序列化；这是机制证据，不能换算成查询加速倍数。测试还覆盖 NULL、NaN、不同切片偏移和并发比较；本次未独立运行。[比较实现与测试](https://github.com/apache/paimon/pull/10349/files)

工程上应先核对索引列序、选择性和覆盖范围。FULL/DETAIL 模式会对未覆盖行保留数据过滤；更新键列导致索引范围失效后，还要重建。Python 复合索引支持仍未交付，不能因为文档同时列出 Python 单列示例就推定能力对齐。[版本固定的文档](https://github.com/apache/paimon/blob/9489f9a3eb094fc4bbec6b93b22dd85a95903d66/docs/docs/multimodal-table/global-index/btree.mdx)；[本次支持范围](https://github.com/apache/paimon/pull/10347)

### Iceberg 与快照恢复跟进

- 上期未合并的 [Paimon #10323](https://github.com/apache/paimon/pull/10323) 仍为 open。10 月 3 日 13:23 的[新增评审](https://github.com/apache/paimon/pull/10323#issuecomment-5965917048)支持撤回读侧恢复、改在过期删除前保护从提示快照起的连续后缀；仅保留 N 而删除 N+1 仍会让判断误认 N 为最新。评审还要求区分提示不存在与读取失败，无法确定边界时保守停止删除。评审明确当前 head 仍存在此前提出的重放问题，尚未验证新实现；不可写成已修复。
- Iceberg 的官方发行说明与 GitHub 发布记录仍以 1.12.0 为最新；GitHub 日期型合并搜索无结果，并以最新 100 个 closed PR 的 merged_at 交叉核对，未找到本窗口新合并。因此只写“在本次覆盖来源内未发现可核验的新进展”，不重复昨天的旧材料，也不推断整个项目没有活动。[发行说明](https://iceberg.apache.org/releases/#1120-release)；[发布记录](https://github.com/apache/iceberg/releases)
