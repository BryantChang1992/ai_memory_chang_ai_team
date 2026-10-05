---
title: 存储/数据库顶会趋势洞察 · Week 04
date: 2026-06-11 08:00:00 +0800
permalink: /posts/tech-research/week-04/conferences/
categories:
- 数据库与存储
- AI 基础设施与数据平台
tags:
- 顶会
- 趋势洞察
description: 存储/数据库顶会趋势洞察 · Week 04：修订后的机制、证据边界与关联阅读。
issue: 4
issue_date: '2026-06-11'
content_type: 周报分稿
topic: storage
reading_title: 顶会论文趋势
knowledge_source: 技术文章/技术调研周报/Week 04 - 顶会趋势洞察.md
knowledge_synced_at: '2026-10-05'
last_modified_at: '2026-10-05'
---

## Week 04 顶会线索：核验后的阅读分层

本期保留 2026-06-11 的归档时间。2026-10-05 复核发现旧稿将会议目录线索扩写成了未经原文支持的算法与实验数字，现撤回这类描述。“全部可免费获取”也不成立：LSM-Raft 的既有 PDF 实际是拦截页。

下面区分已完成精读的材料与待核验题名。待核验目录用于找原文，不代表题名、作者、会议归属和性能结论已逐项确认；历史全文可通过 Git 历史追溯。

## 已有原文精读

- [HATS：读与本地 Compaction 协同调度]({{ '/knowledge/LSM-Scheduling-精读分析/' | relative_url }})

- [CockroachDB：Liveness Fabric 与 leader fortification]({{ '/knowledge/CockroachDB-Leader-Leases-精读分析/' | relative_url }})

- [RaaS：分离日志回放资源以缓解尾延迟]({{ '/posts/raas-paper/' | relative_url }})

- [Rosé：共同 epoch 边界与协调应用]({{ '/knowledge/Rose-精读分析/' | relative_url }})

- [Aurora-Limitless 原文精读]({{ '/knowledge/Aurora-Limitless-精读分析/' | relative_url }})

- [ByteHouse 原文精读]({{ '/knowledge/ByteHouse-精读分析/' | relative_url }})

- [Agent-First-Data 原文精读]({{ '/knowledge/Agent-First-Data-精读分析/' | relative_url }})


HATS 并非旧稿描述的 compaction 迁移求解器；CockroachDB 的论文讨论支持关系和强化领导权，不是预测性心跳延长；RaaS 的核心是回放与读取资源竞争，不是旧稿的 hedge request / 预取三件套。性能数字请连同精读中的基线、负载与图表位置一起引用。

## 待核验的会议目录线索

以下仅保留旧稿的题名与入口。取得原文后再判断贡献，不能从标题推导实现。
