import type { Metadata } from "next";
import Home from "@/app/page";
import { schedule } from "@/lib/training";
// Preserve old public links without retaining any former exercise content.
export const dynamicParams = false;
export function generateStaticParams() { return Array.from({ length: 12 }, (_, i) => ({ id: String(i + 1).padStart(2, "0") })); }
export const metadata: Metadata = { title: "训练进展 · Storage Lab", description: "公开训练进展统计", alternates: { canonical: schedule.canonicalUrl + "/" }, robots: { index: false, follow: true } };
export default Home;
