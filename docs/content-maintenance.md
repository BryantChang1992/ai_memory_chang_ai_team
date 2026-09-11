# 内容维护约定

主导航为首页、专题、周报、关于。归档和标签保留在页脚，旧分类链接自动转到对应入口。

## 发布文章

文章继续放在 `_posts`。保留原来的 `title`、`date`、`permalink`、`description` 和 `tags`，补充：

- `topic`：`streaming`、`storage` 或 `ai`。
- `categories`：对应的中文主题名，分别为“流式数据与消息系统”“数据库与存储”“AI 基础设施与数据平台”。跨主题文章可以使用多个分类。
- `content_type`：源码分析、深度调研、技术综述、论文解读、论文翻译、工程实践或随笔。
- `reading_title`：可选的简短展示标题，文章原始标题继续保留。

系列文章另填 `series: fluss` 或 `series: doris`，以及 `series_order` 阅读顺序；专题页会自动加入该章节。新增系列需在 `_data/editorial.yml` 声明。

论文主文可用 `translation` 指向全文译文。译文作为补充阅读，从主文进入，同时保留搜索和归档入口。

## 发布周报

每期只有一篇 `content_type: 周报` 总览，填整数 `issue`、`issue_date: YYYY-MM-DD` 和简短 `reading_title`。总览用 `categories: []`，跨主题内容通过分稿归类。

分稿使用 `content_type: 周报分稿`，填相同 `issue`、`issue_date`，并选择 `topic` 和中文分类。周报页自动按年度和期号排序、关联同年度分稿；修订日期不会改变期号顺序。缺失期数不自动补造。

同一期不再另发内容重复的合稿。尚未迁移的 HTML 分稿继续从总览关联；后续迁移时更新 `_data/legacy_articles.json` 中的旧网址映射。

## 调整首页

在 `_data/editorial.yml` 修改 `featured` 中的文章 URL。首页取前三期周报；专题章节数量由实际文章自动计算。

维护日志放在 `docs/maintenance-notes.md`。`docs` 已被排除在公开站点之外。

## 验证

使用原来的 Ruby/Bundler 环境：

```sh
bash scripts/build_site.sh
bundle exec ruby tests/category_tree_test.rb
bundle exec ruby tests/content_catalog_test.rb
python3 scripts/check_site.py _site
```

检查内容覆盖、旧链接与所有站内链接后，再沿用现有 GitHub Pages 发布流程。
