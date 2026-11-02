import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
async function moduleAt(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`
  );
}
const { stopIds, stopPoints, TERRAIN, getJourney, getJourneyTiming } =
  await moduleAt("../src/features/island/data/trail.ts");
const { topics, TOTAL_LESSONS } = await moduleAt(
  "../src/features/island/data/topics.ts",
);
const english = JSON.parse(
  await readFile(
    new URL("../src/i18n/content.en.json", import.meta.url),
    "utf8",
  ),
);
assert.equal(TOTAL_LESSONS, 24);
for (const topic of topics)
  for (const lesson of topic.lessons) {
    for (const key of ["title", "summary", "example"])
      assert.ok(english[lesson[key]], `Missing English ${lesson.id}:${key}`);
  }
for (let a = 0; a < stopIds.length; a++)
  for (let b = 0; b < stopIds.length; b++) {
    const path = getJourney(stopIds[a], stopIds[b]);
    assert.deepEqual(path[0], stopPoints[a]);
    assert.deepEqual(path.at(-1), stopPoints[b]);
    assert.deepEqual(path, [...getJourney(stopIds[b], stopIds[a])].reverse());
    for (const [x, y] of path) {
      assert.ok(x >= 0 && x <= TERRAIN.width && y >= 0 && y <= TERRAIN.height);
    }
    if (a !== b) {
      const { duration, times } = getJourneyTiming(path);
      assert.ok(duration >= 1.1 && duration <= 7.5);
      assert.equal(times[0], 0);
      assert.equal(times.at(-1), 1);
      assert.ok(
        times.every(
          (time, i) => Number.isFinite(time) && (!i || time > times[i - 1]),
        ),
      );
    }
  }
console.log(
  "Passed: 36 forward/reverse journeys, bounded monotonic timing, and English title/concept/example for all 24 lessons.",
);
