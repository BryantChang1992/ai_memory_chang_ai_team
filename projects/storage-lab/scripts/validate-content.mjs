import { readFileSync } from "node:fs";
import { validateTraining } from "./training-schema.mjs";
validateTraining(JSON.parse(readFileSync(new URL("../content/training.json",import.meta.url),"utf8")));
console.log("Validated 12 sessions, schedule, review history, revisions and evidence-backed progress.");
