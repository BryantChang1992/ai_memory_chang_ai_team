# Storage Lab 维护

正式入口：https://bryantchang1992.github.io/ai_memory_chang_ai_team/storage-lab/

projects/storage-lab/ 只保存公开站点与经过严格白名单验证的统计快照。所有题目、用户回答、评审、修订、复盘、能力依据、事件和私有引用均留在独立私有训练档案中。不得在本仓库、提交说明、构建日志、HTML、JSON、JS 或 source map 中放入训练原文。

本轮公开范围：当前阶段、已完成数量、本人确认的累计分钟数、更新日期和 publicationId。用时未知保持 null；能力固定显示未评估。按真实事件更新，不按日期、字数或计划工时推断成绩。

先私有保存并回读核验，再导出允许的统计。重复事件必须幂等。公开失败只重试公开步骤，不重复训练事件，不回滚已保存的私有记录。

发布前在 projects/storage-lab/ 运行 npm test、npm run lint、npm run typecheck、npm run build:pages。新构建保留旧训练 URL 但只显示统计。现有 GitHub Actions 负责全站检查与 Pages 部署；完成后必须核对线上 publicationId。

此次调整仅影响当前源码与新部署，未清除 Git 历史或旧缓存。历史清理、新平台与长期自动同步均不包含在本轮。
