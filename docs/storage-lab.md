# Storage Lab 维护

训练站公开地址：<https://bryantchang1992.github.io/ai_memory_chang_ai_team/storage-lab/>。

源码及权威训练数据位于 `projects/storage-lab/`。在当前训练对话形成新的题面、初稿、评审或复盘后，更新 `content/training.json` 对应期数，再提交到 main。GitHub Actions 会自动生成网站。

```sh
cd projects/storage-lab
npm ci
npm run validate
npm run build:pages
```

不凭日期推进完成状态，不发布虚构答案或评分。未评估分数为 null。初始训练完成度为 0 / 12。

全站构建先运行 Jekyll，再将训练站静态产物覆盖到 `_site/storage-lab/`。这保证 Next 的 `_next` 静态资产完整保留，不改变博客的 Jekyll 行为。构建脚本会在缺失训练站产物时明确失败，避免发布一个只有入口的空栏目。

博客侧栏的“存储训练”直接进入小站；About 页也提供入口；小站所有页面均有返回博客与 GitHub 仓库的链接。每期独立页面设有 canonical 与 sitemap，正式地址统一指向博客路径。

本地 Sites 预览为辅助部署。公开博客仓库及本页记录的栏目路径是正式维护入口。
