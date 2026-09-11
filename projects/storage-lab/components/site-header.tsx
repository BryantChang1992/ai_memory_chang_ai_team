import Link from "next/link";
import { Database, ArrowUpRight } from "lucide-react";
import { schedule } from "@/lib/training";
export function SiteHeader(){return <header className="masthead"><Link href="/" className="brand" aria-label="Storage Lab 首页"><span className="brand-icon"><Database size={23}/></span><strong>STORAGE LAB</strong><span>Bryant 的存储设计手记</span></Link><nav aria-label="外部链接"><a href={schedule.repositoryUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14}/></a><a href={schedule.blogUrl} target="_blank" rel="noreferrer">个人博客 <ArrowUpRight size={16}/></a></nav></header>}
