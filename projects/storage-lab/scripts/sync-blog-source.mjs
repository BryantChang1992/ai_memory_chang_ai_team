import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve, basename } from "node:path";
const source=resolve(import.meta.dirname,"..");
const target=resolve(process.argv[2]||"../blog-publish/projects/storage-lab");
if(!existsSync(resolve(target,"../../.git"))) throw new Error("Expected projects/storage-lab inside the selected blog checkout");
mkdirSync(target,{recursive:true});
const ignored=new Set([".git","node_modules",".next",".vinext","out","dist",".wrangler",".sites-runtime","outputs","work","examples",".agents",".codex",".DS_Store","next-env.d.ts","tsconfig.tsbuildinfo"]);
for(const entry of readdirSync(source)){
 if(ignored.has(entry)||entry.startsWith(".env"))continue;
 cpSync(resolve(source,entry),resolve(target,entry),{recursive:true,filter:p=>!ignored.has(basename(p))});
}
console.log("Synced public source to "+target);
