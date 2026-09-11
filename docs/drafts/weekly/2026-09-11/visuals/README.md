# 本期图表

10 幅 Mermaid 图的源码位于上一级五篇文章的相应段落；修改图示时先修改正文，再使用与当前 Chirpy 主题一致的 Mermaid 版本重新导出。不要只修改 SVG/PNG。

- `index.html`：无外部脚本依赖的静态图册。
- `manifest.json`：图题、图注、来源 ID、源码和导出资源 SHA-256。
- `*.svg` / `*.png`：各图导出，可独立查看；PNG 不作为正式文章的默认呈现方式。
- `*-desktop-page.png` / `*-mobile-page.png`：实际博客主题中每篇第一幅图的视口截图，长图可能超出截图范围。
- `render-validation.json` / `page-validation.json`：10 幅图及五篇文章在两种视口下的检查记录。

正式发布时五篇文章均需在 front matter 设置 `mermaid: true`。图中 `useMaxWidth: false` 保留字号，主题容器提供横向滚动；图题后的阅读提示帮助窄屏读者发现此交互。

这些文件仅供草稿审阅，目录被公开站点排除。事实来源和图示的简化边界以正文及 manifest 为准。
