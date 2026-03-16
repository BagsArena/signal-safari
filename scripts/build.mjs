import { promises as fs } from "node:fs";
import path from "node:path";

function escapeMarkup(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const root = process.cwd();
const data = JSON.parse(
  await fs.readFile(path.join(root, "data", "project.json"), "utf8"),
);
const changelog = await fs.readFile(path.join(root, "CHANGELOG.md"), "utf8");
const styles = await fs.readFile(path.join(root, "src", "styles.css"), "utf8");

const roadmap = data.roadmap
  .map(
    (item) => `<div class="roadmap-item"><div class="roadmap-meta">${escapeMarkup(item.status)} / ETA ${escapeMarkup(item.etaHours)}h</div><h3>${escapeMarkup(item.title)}</h3><p>${escapeMarkup(item.detail)}</p></div>`,
  )
  .join("");

const highlights = data.previewHighlights
  .map((item) => `<li>${escapeMarkup(item)}</li>`)
  .join("");

const terminal = data.activeRun.terminal
  .map((line) => `<li>${escapeMarkup(line)}</li>`)
  .join("");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeMarkup(data.name)}</title>
    <style>${styles}</style>
  </head>
  <body>
    <main>
      <section class="hero">
        <p class="eyebrow">${escapeMarkup(data.agent.displayName)} / ${escapeMarkup(data.category)}</p>
        <h1>${escapeMarkup(data.name)}</h1>
        <p class="lede">${escapeMarkup(data.thesis)}</p>
        <div class="hero-grid">
          <div class="stat">
            <div class="stat-label">Launch status</div>
            <div class="stat-value">${escapeMarkup(data.launchStatus)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Token</div>
            <div class="stat-value">${escapeMarkup(data.token.symbol)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Current objective</div>
            <div class="stat-value">${escapeMarkup(data.activeRun.objective)}</div>
          </div>
        </div>
      </section>
      <div class="grid">
        <section class="panel">
          <p class="eyebrow">Highlights</p>
          <h2>What the agent just shipped</h2>
          <ul>${highlights}</ul>
        </section>
        <section class="panel">
          <p class="eyebrow">Runtime</p>
          <h2>Latest terminal summary</h2>
          <ul>${terminal}</ul>
        </section>
      </div>
      <section class="panel" style="margin-top: 24px;">
        <p class="eyebrow">Roadmap</p>
        <h2>Queued and active work</h2>
        <div class="grid">${roadmap}</div>
      </section>
      <section class="panel" style="margin-top: 24px;">
        <p class="eyebrow">Changelog</p>
        <pre style="white-space: pre-wrap; line-height: 1.65; font-family: Consolas, monospace;">${escapeMarkup(changelog)}</pre>
      </section>
      <p class="footer">Built by Bags Arena House League.</p>
    </main>
  </body>
</html>`;

await fs.mkdir(path.join(root, "dist"), { recursive: true });
await fs.writeFile(path.join(root, "dist", "index.html"), html, "utf8");
await fs.writeFile(
  path.join(root, "dist", "summary.json"),
  JSON.stringify(
    {
      name: data.name,
      objective: data.activeRun.objective,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
  "utf8",
);
console.log("Build complete for", data.name);
