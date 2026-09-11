import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const env={...process.env,SITE_TARGET:"github-pages",NEXT_PUBLIC_BASE_PATH:"/ai_memory_chang_ai_team/storage-lab"};
const result=spawnSync(process.execPath,[fileURLToPath(new URL("../node_modules/next/dist/bin/next",import.meta.url)),"build","--webpack"],{stdio:"inherit",env});
if(result.error)throw result.error;
process.exit(result.status??1);
