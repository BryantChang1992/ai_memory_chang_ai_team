# 从公开周报移入的维护记录

## Week 10

### 🔧 知识库 Schema V2 升级 + V2 全量升级

- **Schema V2**（Commit `5e424bc`，7/5）：引入 confidence + confidence_rationale 字段、.entities.json 实体图谱、Supersession 检测
- **全量升级**（Commit `92e4c8e`，7/6）：121 页全量注入 confidence（0.70-0.95）、119 实体 + 485 关系知识图谱、Lint 全量清零、修复 6 处 dangling wikilink + 16 个 sources 路径 + 19 个 ASCII 残留 + 16 个孤儿

V2 升级后，知识库具备了自我评估能力——每张卡片明确标注"我知道什么、我有多确定"。


## Week 05

### Lint 质量报告

| 类别 | 结果 |
|------|------|
| 孤儿页 | 0 ✅ |
| 概念矛盾 | 0 ✅ |
| Bloom Filter 缺口 | 被 15 页引用但无独立卡片 🟡 |
| 存算分离集群 | 仅 4 页未达 synthesis 临界质量 🟡 |

