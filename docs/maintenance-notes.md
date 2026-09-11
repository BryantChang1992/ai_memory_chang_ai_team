# 从公开周报移入的维护记录

## 2026-09-11 · 博客头像

使用内置 image_gen 生成 BC / BryantChang 与分布式存储节点头像，保存到 `assets/img/avatar-bryantchang-storage.png`，接入主题的圆形头像区域并提供中文替代描述。生成提示词保存在 [头像设计记录](branding/avatar-prompt.md)。本地检查桌面 112 px 和手机 104 px 的显示、图片资源及首页链接；保留远程最新的存储训练内容。

## 2026-09-11 · Week 11 发布

Bryant 批准第 3 版后发布一篇总览与四篇方向分稿，包含 10 幅 Mermaid 图。发布仅移除草稿标记、转换链接并补齐元数据；保留已确认的技术正文和图示。合并同期远程 Storage Lab 更新，导航与两套构建均保留。统一新稿 `kip` 标签，避免与既有标签生成相同归档地址。

发布提交 `f09cc3bf86b5370ec0cef44d3502c7779b782c9f` 的 [GitHub Actions](https://github.com/BryantChang1992/ai_memory_chang_ai_team/actions/runs/34558629017) 成功；已回读五篇正式文章并检查桌面/手机图表，以及首页、周报和 Storage Lab 入口。发布前 14 项 Ruby 测试、546 个断言、273 页与 8,883 个站内引用检查通过。完整记录见 [本期发布核验](drafts/weekly/2026-09-11/publication.json)。


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
