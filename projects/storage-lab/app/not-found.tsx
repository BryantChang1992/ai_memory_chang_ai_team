import Link from "next/link";

export default function NotFound() {
  return <main className="workspace not-found"><p className="eyebrow">404 / NOT FOUND</p><h1>这轮训练记录还不存在。</h1><p>返回总览，查看已记录的实际训练轮次。</p><Link href="/#rounds">返回训练总览 →</Link></main>;
}
