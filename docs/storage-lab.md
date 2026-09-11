# Storage Lab 维护

训练站公开地址：<https://bryantchang1992.github.io/ai_memory_chang_ai_team/storage-lab/>。

源码及权威训练数据位于 `projects/storage-lab/`。在当前训练对话形成新的题面、初稿、评审或复盘后，更新 `content/training.json` 对应期数，再提交到 main。GitHub Actions 会自动生成网站。

用户选择在原训练对话中完成全部讨论，网页只负责公开记录、进度与回看。不要要求用户转去网页填写、登录或重复粘贴。每次形成有意义的新记录后，由训练助手整理、校验并发布，确认部署成功后给出本期链接；若尚未发布则明确说明状态，不能把聊天结束视为网站自动同步成功。

记录流程：

1. 收到实际初稿后写入 `design`，保留原始方案与假设。未作答保持空。
2. 每轮追问 1—2 个问题，写入 `reviewQuestions`。以稳定 ID 关联后续回答；`discussion` 按时间追加，区分 Bryant 回答与评审反馈。问题使用 open / resolved / deferred 状态，结论保留成立前提。
3. 方案改变时追加 `revisions`，记录修改前后、修改原因、验证办法和实际结果。不以新稿覆盖初稿。
4. 形成真实复盘后更新 `reflection`、`takeaways`。给分时将回答证据写入 `scoreEvidence`；未评估分数为 null。
5. 实际进度使用 planned / drafting / review / revising / completed。归档前保留初稿、评审和复盘，解决或明确延期所有 open 问题；deferred 的原因与验证计划继续公开展示。

页面中的“记录模板”是讨论提纲，不是训练产出。不要为填满模板生成答案或推测用时。字段格式详见 `projects/storage-lab/README.md` 和 `scripts/training-schema.mjs`。

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
