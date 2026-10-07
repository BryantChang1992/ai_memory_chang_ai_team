import type { MetadataRoute } from "next";
import { schedule, progress, rounds, roundPath } from "@/lib/training";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: schedule.canonicalUrl + "/", lastModified: progress.updatedAt, changeFrequency: "weekly", priority: 1 },
    ...rounds.map((round) => ({ url: schedule.canonicalUrl + roundPath(round.id), lastModified: progress.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
