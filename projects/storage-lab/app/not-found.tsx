import Link from "next/link";

export default function NotFound() {
  return <main className="workspace not-found"><p className="eyebrow">404 / NOT FOUND</p><h1>这份项目或训练记录还不存在。</h1><p>返回总览，查看已记录的设计项目。</p><Link href="/#projects">返回项目总览 →</Link></main>;
}
