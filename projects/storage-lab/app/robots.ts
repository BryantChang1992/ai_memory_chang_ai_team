import type { MetadataRoute } from "next";
import { schedule } from "@/lib/training";
export const dynamic = "force-static";
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:"*",allow:"/"},sitemap:schedule.canonicalUrl+"/sitemap.xml"};}
