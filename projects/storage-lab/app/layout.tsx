import type { Metadata } from "next";
import "./globals.css";
import { schedule } from "@/lib/training";

export const metadata: Metadata = {
  metadataBase: new URL(schedule.canonicalUrl + "/"),
  title: { default: "Storage Lab · 训练进展", template: "%s · Storage Lab" },
  description: "按设计项目记录分布式存储训练：引导练习、正式修订、独立考核与真实用时。",
  alternates: { canonical: schedule.canonicalUrl + "/" },
  openGraph: {
    title: "Storage Lab · 训练进展",
    description: "设计项目进展、练习与独立考核、分来源用时",
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
