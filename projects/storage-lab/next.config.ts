import type { NextConfig } from "next";
const pages=process.env.SITE_TARGET==="github-pages";
const nextConfig:NextConfig={trailingSlash:true,outputFileTracingRoot:process.cwd(),...(pages?{output:"export",basePath:"/ai_memory_chang_ai_team/storage-lab",images:{unoptimized:true}}:{})};
export default nextConfig;
