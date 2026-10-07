# Storage Lab 维护

正式入口：https://bryantchang1992.github.io/ai_memory_chang_ai_team/storage-lab/

projects/storage-lab/ 只保存公开站点与经过严格白名单验证的统计快照。所有题目、用户回答、评审、修订、复盘、能力依据、事件和私有引用均留在独立私有训练档案中。不得在本仓库、提交说明、构建日志、HTML、JSON、JS 或 source map 中放入训练原文。

公开 v2 范围：首页汇总和逐轮明细，包含独立公开编号、日期、类别、阶段、参与方式、用时及来源、能力评估状态和发布核验字段。用时未知保持 null；当前能力各维度仍未独立评估。按真实事件更新，不按日期、字数或计划工时推断成绩。

先私有保存并回读核验，再导出允许的统计。重复事件必须幂等。公开失败只重试公开步骤，不重复训练事件，不回滚已保存的私有记录。

发布前在 projects/storage-lab/ 运行 npm test、npm run lint、npm run typecheck、npm run build:pages。新构建保留旧训练 URL 但只显示统计。现有 GitHub Actions 负责全站检查与 Pages 部署；完成后必须核对线上 publicationId。

此次调整仅影响当前源码与新部署，未清除 Git 历史或旧缓存。历史清理、新平台与长期自动同步均不包含在本轮。

用时区分 user_confirmed（本人确认）与 conversation_span（对话跨度估算）。同一轮优先使用确认值，不再叠加估算；汇总分别列出各类。对话跨度以私有消息端点计算，公开不含精确端点、消息 ID 或来源链接；它可能包含等待，不是精确专注时长。真实轮次明细在 /rounds/<公开编号>/，主页提供入口；旧 /sessions/ 路径仅作概要别名。
