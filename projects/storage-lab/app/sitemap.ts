import type { MetadataRoute } from "next";
import { schedule, progress, rounds, roundPath, projects, projectPath } from "@/lib/training";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: schedule.canonicalUrl + "/", lastModified: progress.updatedAt, changeFrequency: "weekly", priority: 1 },
    ...projects.map((project) => ({ url: schedule.canonicalUrl + projectPath(project.id), lastModified: progress.updatedAt, changeFrequency: "weekly" as const, priority: 0.9 })),
    ...rounds.map((round) => ({ url: schedule.canonicalUrl + roundPath(round.id), lastModified: progress.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
