import type { Metadata } from "next";
import "./globals.css";
import { schedule } from "@/lib/training";
export const metadata: Metadata = {title:"Storage Lab · Bryant 的存储设计手记",description:"Bryant 的分布式存储公开训练档案：每两周一个案例，从规模、一致性与性能出发，记录设计、评审和复盘。",alternates:{canonical:schedule.canonicalUrl+"/"},openGraph:{title:"Storage Lab · Bryant 的存储设计手记",description:"从规模、一致性与性能出发，公开记录分布式存储设计训练。",url:schedule.canonicalUrl+"/",siteName:"Bryant · Storage Lab",locale:"zh_CN",type:"website"},icons:{icon:(process.env.NEXT_PUBLIC_BASE_PATH??"")+"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
