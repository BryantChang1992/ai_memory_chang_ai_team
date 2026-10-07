import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validatePublic } from "./public-schema.mjs";
const snapshot = JSON.parse(readFileSync(new URL("../content/training.json", import.meta.url), "utf8"));
test("published snapshot is allowlisted", () => assert.doesNotThrow(() => validatePublic(snapshot)));
test("freeform and private fields cannot enter the snapshot", () => {
  for (const key of ["question", "answer", "review", "source_ref", "privateUrl", "evidence", "sessions", "roundId"]) {
    assert.throws(() => validatePublic({ ...snapshot, [key]: "SYNTHETIC_PRIVATE_CANARY" }));
  }
});
test("unknown time stays null and ability is not scored", () => {
  assert.ok(snapshot.confirmedMinutes === null || Number.isSafeInteger(snapshot.confirmedMinutes));
  assert.equal(snapshot.abilityStatus, "unassessed");
  assert.equal(snapshot.completedCount, snapshot.stage === "completed" ? 1 : 0);
});
test("inconsistent stages, fake publication identifiers and malformed totals fail", () => {
  for (const replacement of [{ stage: "invented" }, { publicationId: "pub-deadbeefdeadbeef" }, { completedCount: -1 }, { confirmedMinutes: -1 }, { abilityStatus: "mastered" }]) assert.throws(() => validatePublic({ ...snapshot, ...replacement }));
});
