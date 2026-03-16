import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const data = JSON.parse(
  await fs.readFile(path.join(root, "data", "project.json"), "utf8"),
);

if (!data.name || !data.slug) {
  throw new Error("Project identity is incomplete.");
}

if (!Array.isArray(data.previewHighlights) || data.previewHighlights.length === 0) {
  throw new Error("Preview highlights must not be empty.");
}

if (!Array.isArray(data.roadmap) || data.roadmap.length === 0) {
  throw new Error("Roadmap must contain at least one item.");
}

const roadmapIds = new Set(data.roadmap.map((item) => item.id));
if (roadmapIds.size !== data.roadmap.length) {
  throw new Error("Roadmap ids must be unique.");
}

console.log("Lint clean for", data.name);
