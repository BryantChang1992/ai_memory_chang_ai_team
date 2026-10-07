import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
const source = resolve(import.meta.dirname, "..");
const target = resolve(process.argv[2] || "../blog-publish/projects/storage-lab");
if (!existsSync(resolve(target, "../../.git"))) throw new Error("Expected the selected public blog checkout");
// Fail closed: only explicitly listed tracked public files can be copied.
const manifest = JSON.parse((await import("node:fs")).readFileSync(resolve(source, "public-source-files.json"), "utf8"));
const allowed = new Set(manifest);
const ignored = new Set([".git", "node_modules", ".next", ".vinext", "out", "dist", ".wrangler", ".sites-runtime", "outputs", "work", ".agents", ".codex"]);
const { readdirSync, lstatSync } = await import("node:fs");
function auditDestination(dir, prefix = "") {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (prefix === "" && (ignored.has(name) || name === "next-env.d.ts" || name.endsWith(".tsbuildinfo"))) continue;
    const relative = prefix + name, path = resolve(dir, name), stat = lstatSync(path);
    if (stat.isSymbolicLink()) throw new Error("Destination symlinks are not allowed");
    if (stat.isDirectory()) auditDestination(path, relative + "/");
    else if (!allowed.has(relative)) throw new Error("Destination has an unlisted file; review it before syncing");
  }
}
auditDestination(target);
for (const entry of manifest) {
  if (typeof entry !== "string" || entry.startsWith("/") || entry.split("/").some(p => p === ".." || p === ".")) throw new Error("Invalid public source path");
  const { lstatSync, realpathSync } = await import("node:fs");
  const input = resolve(source, entry);
  if (!lstatSync(input).isFile() || realpathSync(input) !== input) throw new Error("Public source must be a regular file");
  mkdirSync(resolve(target, entry, ".."), { recursive: true });
  cpSync(input, resolve(target, entry), { dereference: false });
}
console.log("Copied allowlisted public source files.");
