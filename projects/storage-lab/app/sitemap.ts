import type { MetadataRoute } from "next";
import { schedule, progress } from "@/lib/training";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: schedule.canonicalUrl + "/", lastModified: progress.updatedAt, changeFrequency: "weekly", priority: 1 }]; }
