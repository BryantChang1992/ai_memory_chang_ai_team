# Obsidian 与博客同步

2026-10-05 用户明确要求双向对齐：博客已有的内容用于修正 Obsidian，Obsidian 独有的技术知识补到 GitPage；只公开技术知识，不发布团队规范与 Agent 核心文件。

## 归属和范围

- `docs/obsidian-sync-manifest.json` 记录每篇文章的两个路径、固定网址、SHA256 和同步方向。Obsidian 在 `知识库/.blog-sync-manifest.json` 保存同一份清单。
- `blog_to_obsidian`：博客为正文来源。保留现有 `_posts` 网址和周报期号，转换 Liquid 站内链接和附件路径后更新笔记。独有旧 HTML 专题也有对应笔记。
- `obsidian_to_blog`：知识库为正文来源。新页面使用 `/knowledge/` 网址，转换双链、嵌入、图片和关联阅读；原始创建日期与审核状态保留，不能把同步日期当成事实复核日期。
- 相同的原始笔记有多个副本时，`aliases` 指向同一公开文章，避免全文重复发布。
- 缺少日期字段时，优先使用文内研究日期，其次使用首次 Git 入库日期；`knowledge_date_source` 记录日期依据。入库日期不代表事实复核日期。
- 团队规范、Agent 文件、混有具体团队运行规则的三份项目设计文档、维护报告、图片制作提示词、待入库队列不进入公开内容。原始论文文件仅作为已有技术材料的引用附件。

## 后续更新

1. 先筛选并修订 Obsidian 正文，完成证据、链接和图表检查，写回实际 vault 后再更新博客对应页面；随后运行 `python3 scripts/check_knowledge_sync.py --vault /path/to/ai_wikis`。
2. 根据 `direction` 检查实际正文差异。两边同时变化时保留双方修改并人工合并，不能只刷新摘要值来让检查通过。
3. 修正文章及其对应笔记；图表必须一并同步。知识库新增笔记要更新总索引、实体图谱和清单，避免仅发布网页后留下孤立笔记。
4. 重新计算受影响条目的摘要值，两份清单保持一致。清单中的 `pending_concepts` 与 `unresolved_source_mentions` 是待研究内容，不能通过创建空白页面假装修复。
5. 执行正文检查、站点构建、分类/入口测试和全站链接检查。验证后提交两个仓库，核对 GitHub Actions 和公开页面。

本文规定手动维护约定，不创建自动定时任务。清单检查只检测变更和范围，不验证技术事实。

## 公开导航与笔记映射

- 同步清单维护笔记与文章的固定对应关系；公开导航由 `_data/knowledge.yml` 和 `_plugins/knowledge_catalog.rb` 生成。调整阅读层级不移动笔记、不改文章 URL，也不需要刷新正文哈希。
- `/library/` 先展示研究方向和专题入口，`/library/<id>/` 展示推荐阅读顺序、系列章节及分组资料。完整目录在 `/knowledge/`，提供关键词、专题和内容类型筛选；周报仍归 `/weekly/`。
- 每篇知识文章只有一个主要专题。规则先限定 `topic`，再匹配清单中的 Obsidian 来源路径；无来源路径时才匹配标题。新增资料需要审核所属专题，未匹配资料会进入方向内的“综合阅读”，分类覆盖测试会提醒维护者补齐规则。
- 内容角色根据实际来源区分综述、概念卡、论文精读、配套译述、实践和待核验材料。论文译述按来源论文目录与主文配对，保留独立网址和完整目录条目。待核验内容单独收纳，不放入推荐阅读路径。
- 在配置的 `route` 中维护推荐文章及阅读理由；系列章节仍按原 `series_order` 排序。推荐路径不替代完整分组目录，文章页需提供返回所属专题的链接。
- 导航变更后构建站点，运行 `bundle exec ruby tests/knowledge_catalog_test.rb` 及现有分类、内容、同步和站内链接检查；浏览器核对筛选、折叠目录及窄屏显示。旧专题锚点须保持可用。

## 内容复核与图表约定

- 本轮先在 Obsidian 完成修订，复核后的条目以 Obsidian 为正文来源；initial_direction 保留最初迁移方向，不应据此覆盖新稿。
- 精读应交代论文身份、问题与假设、机制步骤、不变量、示例、原文定位、评价条件和局限。译述、选译不得宣称全文翻译；未取得有效原文的内容标为待核验。
- 图表优先使用 Mermaid；确有表达限制时才采用 SVG，并注明原因。原始论文 PDF / 实验图不因统一格式而改写。
- 同步前同时核对概念卡、精读、综述、索引和别名。旧 HTML 指向已维护的新版入口，避免继续显示过时结论。
- reviewed / source_checked 表示人工复核日期；created 和既有审核状态保留。不能按笔记年龄自动提高或降低置信度。
- 哈希校验只证明对应关系；技术正确性仍需要原论文或相应版本官方文档的证据。

## 检查范围与固定版本发布门槛

`check_knowledge_sync.py` 是只读检查器，不更新清单、正文、哈希或权限，不执行同步或发布。清单中的历史 `blog_base_commit` / `wiki_base_commit` 不代表本次验证的实际提交。

- 默认运行 `python3 scripts/check_knowledge_sync.py` 仅检查站点现有映射与附件。成功不表示知识库没有新增报告，也不认证完整同步。现有 Pages 工作流保持此范围，不能把这一项成功当成双库发布完成。
- 运行 `python3 scripts/check_knowledge_sync.py --vault /path/to/ai_wikis` 检查两边清单、文章、别名和附件，以及 `技术文章/博客同步` 目录内递归发现的 Markdown 报告。新增未映射报告使检查失败；此目录之外的笔记不会自动入列。覆盖检查是待办发现机制，不是公开授权。
- 使用完整发布门槛时，显式提供两个仓库根目录和已经审阅的完整 commit ID：

```bash
python3 scripts/check_knowledge_sync.py \
  --site /path/to/ai_memory_chang_ai_team \
  --vault /path/to/ai_wikis \
  --site-commit "$SITE_COMMIT" \
  --vault-commit "$WIKI_COMMIT" \
  --require-complete --json
```

`SITE_COMMIT` 和 `WIKI_COMMIT` 必须是这次发布候选的完整、小写 commit ID，不能用分支名、短 SHA 或旧清单中的基准字段代替。工具不 fetch、不 checkout、不创建凭据。

固定版本模式要求输入路径是两个不同的真实 Git checkout 根目录，HEAD 与指定提交一致。检查前后均验证 Git 状态，并按提交树逐一核对受控文件的实际 blob 哈希和执行位，避免 `assume-unchanged` / `skip-worktree` 隐藏变更。所有同步输入必须受 Git 跟踪。无关、被忽略的构建产物可以存在；不忽略的未跟踪文件、受控文件缺失或变化、未映射报告都不能通过。当前不支持包含 gitlink/submodule 的严格核验。运行期间应保持两个 checkout 静止，检查本身不会加写锁或提供跨库原子事务。

无 `.git` 的导出快照可以做双库诊断，不能通过固定版本门槛。只有版本核验、已有映射和指定报告目录覆盖全部通过，JSON 的 `sync_complete` 才为 true；这个字段只认证上述范围，不证明技术事实、全库链接、分类、构建、部署或线上呈现。没有输入对端时明确输出 site-only，而不是“完整同步”。

回归测试：`python3 tests/knowledge_sync_test.py`。Pages 工作流在构建前运行此回归测试及 `python3 scripts/test_public_sync_scope.py`，随后继续运行原有 `python3 tests/content_source_test.py`、Ruby 分类/入口测试、Storage Lab 测试与构建、全站链接检查。CI 的真实内容检查仍为 site-only；增加只读 wiki checkout 并固定该次 wiki commit，需要独立审阅。现有未同步报告仍须解决后才能通过双库完整发布门槛，不能以 CI 站点构建成功代替。

任何未同步报告都应保留为显式待办，不能通过移出覆盖目录、删旧映射、修改哈希掩盖差异或生成空白映射让检查变绿。两份清单仍须通过原有授权与审核流程；检查器不会解除或绕过发布阻塞。

清单解析拒绝重复 JSON 键以及 NaN、Infinity、-Infinity 等非标准数值常量。文章固定 URL 不接受 query/fragment 分隔符，即使 `?` 或 `#` 后没有内容也拒绝，避免把等价地址当作不同映射。
