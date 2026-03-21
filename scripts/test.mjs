import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";

const data = JSON.parse(
  await fs.readFile(path.join(process.cwd(), "data", "project.json"), "utf8"),
);

test("project data exposes a live objective", () => {
  assert.equal(typeof data.activeRun.objective, "string");
  assert.ok(data.activeRun.objective.length > 10);
});

test("roadmap keeps at least one visible task", () => {
  const hasVisibleTask = data.roadmap.some(
    (item) => item.status === "active" || item.status === "queued",
  );

  assert.ok(
    hasVisibleTask || data.launchStatus === "launch-ready" || data.launchStatus === "live",
  );
});
