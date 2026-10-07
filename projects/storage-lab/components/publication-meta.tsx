import { displayDate, progress } from "@/lib/training";

export function PublicationMeta() {
  return (
    <p className="publication-meta">
      <span>数据更新：<time dateTime={progress.updatedAt}>{displayDate(progress.updatedAt)}</time></span>
      <span>发布标识：<code data-publication-id={progress.publicationId}>{progress.publicationId}</code></span>
    </p>
  );
}
