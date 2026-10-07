import { readFileSync } from "node:fs";
import { validatePublic } from "./public-schema.mjs";
try { validatePublic(JSON.parse(readFileSync(new URL("../content/training.json", import.meta.url), "utf8"))); console.log("Public progress allowlist validated."); }
catch { console.error("Public progress validation failed; input values are not logged."); process.exitCode = 1; }
