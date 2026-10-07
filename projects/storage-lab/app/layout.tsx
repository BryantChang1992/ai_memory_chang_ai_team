import type { Metadata } from "next";
import "./globals.css";
import { schedule } from "@/lib/training";

export const metadata: Metadata = {
  metadataBase: new URL(schedule.canonicalUrl + "/"),
  title: { default: "Storage Lab · 训练进展", template: "%s · Storage Lab" },
  description: "分布式存储训练总览与逐轮明细，展示真实进度、本人用时来源和能力评估状态。",
  alternates: { canonical: schedule.canonicalUrl + "/" },
  openGraph: {
    title: "Storage Lab · 训练进展",
    description: "真实训练进展、分来源用时与逐轮能力评估状态",
    url: schedule.canonicalUrl + "/",
    siteName: "Bryant · Storage Lab",
    locale: "zh_CN",
    type: "website",
  },
  icons: { icon: (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
