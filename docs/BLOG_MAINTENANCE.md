# 博客框架维护

本站通过 GitHub Actions 构建 Jekyll + Chirpy，并发布到 GitHub Pages。

## 本地验证

使用 Ruby 3.4、Bundler 和 Python 3：

```sh
bundle install
bash scripts/build_site.sh
bundle exec ruby tests/category_tree_test.rb
python3 scripts/check_site.py _site
```

`build_site.sh` 与 CI 共用：先生成 Jekyll 页面，再复制旧 HTML 专题及其公开资源。`assets/` 必须参与 Jekyll 构建，否则旧页面的公共样式会丢失。

`check_site.py` 扫描生成的 HTML，检查站内页面、样式、脚本、图片和目录锚点，验证归档覆盖全部文章，并阻止内部运行资料进入站点。它不检查外部网站的可用性或文章内容事实。外链和客户端图表仍需定期人工或浏览器检查。

## 新增文章

1. 在 `_posts/` 添加带日期、标题、分类的 Markdown。站内链接使用 `relative_url`，文章引用可使用 `post_url`；不要依赖 `../../../` 这样的目录深度。Chirpy 正文图片会自动补 `baseurl`，图片路径写 `/media/...`，不要再套 `relative_url`。
2. 分类按 `[一级, 二级, 三级]` 声明；分类目录、篇数和归档由 `_plugins/category_tree.rb` 自动生成。直接归属文章与子分类文章会同时展示，同名分类页会聚合不同层级的文章。避免同一条分类路径重复名称，Jekyll 会去重。
3. Mermaid 围栏由插件自动启用 Chirpy 原生渲染，无需在全站 footer 重复引入脚本。
4. 旧 HTML 仍需正确的 viewport、导航、资源路径与目录 ID；新增技术方案时，在 `_tabs/library.md` 添加入口。
5. 运行上述验证后再提交。PR 执行检查，main/master 的成功构建才部署。
6. 标签大小写须保持一致，例如 `Kafka`、`AutoMQ`、`Fluss`、`LSM-Tree`。大小写不同的标签可能生成同一个 URL，回归检查会阻止这种覆盖。

## 预览

为复现项目子路径，在站点输出目录上一级创建 `ai_memory_chang_ai_team` 路径，或使用下面命令：

```sh
bash scripts/build_site.sh _site/ai_memory_chang_ai_team
python3 scripts/check_site.py _site/ai_memory_chang_ai_team
python3 -m http.server 4000 --directory _site --bind 127.0.0.1
```

打开 `http://127.0.0.1:4000/ai_memory_chang_ai_team/`。

## 定期巡检

- 检查最新部署结果、首页分页、分类、标签、归档和专题入口。
- 抽查近期文章中的 Mermaid、代码块、图片、站外引用，以及 390px 宽度的移动端。
- 更新依赖时一并提交 `Gemfile.lock`，验证上述检查后再发布；不要在日常维护中无条件升级主题。

## 2026-09-10 修复验证记录

- 修复分类漏文、分类链接与空标题、空白归档、缺失的标签与专题入口。
- 修复旧页面样式未发布、站内路径与手写目录、占位图片及技术方案图片预览。
- 修复标签大小写冲突导致的归档覆盖，以及 3 处 Mermaid 语法错误。
- 完整构建通过；235 个 HTML 页面、11,022 个站内引用检查无错误。
- 8 个回归用例、307 项断言通过，覆盖 52 篇文章的分类和标签收录。
- 浏览器完成 64 张 Mermaid 实际渲染；检查搜索、52 篇归档、23 篇分页 fixture、390px 手机布局与图片预览关闭行为。
- 本轮验证针对本地生成结果；上线后还应核对 GitHub Actions 和公开页面。
