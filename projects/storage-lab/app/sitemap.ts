import type { MetadataRoute } from "next";
import { sessions, schedule, sessionPath } from "@/lib/training";
export const dynamic = "force-static";
export default function sitemap():MetadataRoute.Sitemap{return [{url:schedule.canonicalUrl+"/",changeFrequency:"weekly",priority:1},...sessions.map(s=>({url:schedule.canonicalUrl+sessionPath(s.id),...(s.updatedAt?{lastModified:s.updatedAt}:{}),changeFrequency:"monthly" as const,priority:0.7}))];}
