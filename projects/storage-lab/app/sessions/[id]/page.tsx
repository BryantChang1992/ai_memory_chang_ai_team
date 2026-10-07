import type { Metadata } from "next";
import Home from "@/app/page";
import { schedule } from "@/lib/training";

// Old URLs remain safe overview aliases, not twelve actual training records.
export const dynamicParams = false;
export function generateStaticParams() {
  return Array.from({ length: 12 }, (_, i) => ({ id: String(i + 1).padStart(2, "0") }));
}
export const metadata: Metadata = {
  title: "训练进展",
  description: "公开训练总览与实际训练轮次明细",
  alternates: { canonical: schedule.canonicalUrl + "/" },
  robots: { index: false, follow: true },
};
export default Home;
