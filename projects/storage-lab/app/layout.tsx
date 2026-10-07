import type { Metadata } from "next";
import "./globals.css";
import { schedule } from "@/lib/training";
export const metadata: Metadata = { title: "Storage Lab · 训练进展", description: "分布式存储训练的公开进展统计。训练内容私有保存，当前能力尚未评估。", alternates: { canonical: schedule.canonicalUrl + "/" }, openGraph: { title: "Storage Lab · 训练进展", description: "真实训练进展与确认用时", url: schedule.canonicalUrl + "/", siteName: "Bryant · Storage Lab", locale: "zh_CN", type: "website" }, icons: { icon: (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
