# Storage Lab · Bryant 的存储设计手记

公开的分布式存储训练档案，属于 [BryantChang · Tech Insights](https://bryantchang1992.github.io/ai_memory_chang_ai_team/index.html)。

- 12 期训练，每两周一期，预计 24 周。
- 北京时间隔周日 21:00，起始日期 2026-09-13。
- 覆盖单机引擎、KV、块、文件、对象、缓存、分层与跨地域存储。
- 固定观察规模、一致性和性能，记录初稿、追问、修订和复盘。
- 起始状态为 0 / 12 完成。未发布内容明确标为待发布，不生成虚构训练记录。

## 访问与公开记录

正式地址：[Storage Lab](https://bryantchang1992.github.io/ai_memory_chang_ai_team/storage-lab/)。

`content/training.json` 是训练记录的权威数据源，随 Git 仓库保存历史，并在网站构建时发布。网站面向访客只读；不会把浏览器缓存当作训练记录，也不会允许匿名访客修改作者的进度。

在当前训练对话完成讨论后，将真实内容写入相应训练记录并提交。只保存需要公开的设计内容，不复制整段聊天或本机配置。计划日期不代表完成日期；顺延训练应保留计划与实际状态的区别。

## 更新一份训练记录

编辑 `content/training.json` 对应的 session：

- `status`：`planned` → `drafting` → `review` → `completed`。
- `brief` 与 `questions`：实际发布的题目和约束。未发布的未来题面保持空。
- `design`、`review`、`reflection`：纯文本记录，段落间空一行；内容按文本渲染，不执行 HTML。
- `takeaways`：从实际讨论得到的结论。
- `scores`：规模、一致性、性能的 0—3 级观察；未评估为 null，不能用 0 冒充未评估。
- `updatedAt`：实际更新日期，格式 YYYY-MM-DD。
- `minutes`：实际投入分钟数，没有记录时为 0。
- `references`：使用过的一手来源。

标记 completed 前必须有真实复盘与更新日期。第 4、8、12 期进行阶段回评。

## 本地运行

需要 Node.js 22.13 或更新版本。

```sh
npm ci
npm run dev
```

`npm run validate` 检查记录结构、双周节奏与完成状态。`npm run build:pages` 生成 GitHub Pages 静态输出至 `out/`，每期有独立 URL、页面元数据和 canonical 链接。

## 博客发布

仓库位置：`projects/storage-lab/`。博客的 GitHub Actions 会安装锁定依赖、检查数据、构建训练站，再把 `out/` 复制到最终 Jekyll 产物的 `storage-lab/`，最后检查全站链接并发布。

不要把 node_modules、.env、.wrangler、本地预览状态或构建缓存提交到公开仓库。源代码与公开学习记录保存在 Git；构建产物由 CI 生成。

## Sites 预览

当前开发流程也支持 Vinext / Cloudflare Workers 的 Sites 发布。`npm run build` 生成该目标的产物。GitHub Pages 导出与 Sites 构建使用同一套页面和公开训练数据；canonical 指向博客内的正式栏目，减少重复内容入口。
