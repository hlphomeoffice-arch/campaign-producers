import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

const requiredFiles = [
  "index.html",
  "insights/index.html",
  "insights/ai-traditional-or-hybrid-production/index.html",
  "assets/css/insights.css",
  "rss.xml",
  "sitemap.xml",
  "robots.txt",
  "automation/editorial-history.json"
];

const exists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

for (const relativePath of requiredFiles) {
  if (!(await exists(path.join(ROOT, relativePath)))) {
    errors.push(`Missing required file: ${relativePath}`);
  }
}

const walk = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
};

const insightFiles = (await walk(path.join(ROOT, "insights"))).filter((file) => file.endsWith(".html"));
const publicTextFiles = [
  ...insightFiles,
  path.join(ROOT, "automation", "latest-linkedin-post.txt")
];

const localTarget = (htmlFile, rawReference) => {
  const reference = rawReference.split("#")[0].split("?")[0];
  if (!reference || /^(https?:|mailto:|tel:|data:)/.test(reference)) return null;

  let target;
  if (reference.startsWith("/")) target = path.join(ROOT, reference.slice(1));
  else target = path.resolve(path.dirname(htmlFile), reference);

  if (reference.endsWith("/")) target = path.join(target, "index.html");
  return target;
};

for (const file of insightFiles) {
  const relativePath = path.relative(ROOT, file);
  const html = await fs.readFile(file, "utf8");

  if (!html.startsWith("<!DOCTYPE html>")) errors.push(`${relativePath} is missing the HTML doctype.`);
  if ((html.match(/<h1[ >]/g) || []).length !== 1) errors.push(`${relativePath} must contain exactly one h1.`);
  if (!/<meta[^>]+name="description"/.test(html)) errors.push(`${relativePath} is missing its meta description.`);
  if (!/<link[^>]+rel="canonical"/.test(html)) errors.push(`${relativePath} is missing its canonical URL.`);

  for (const match of html.matchAll(/<(?:a|link|script|img)[^>]+(?:href|src)="([^"]+)"/g)) {
    const target = localTarget(file, match[1]);
    if (target && !(await exists(target))) {
      errors.push(`${relativePath} points to a missing local file: ${match[1]}`);
    }
  }

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${relativePath} contains invalid JSON-LD: ${error.message}`);
    }
  }
}

for (const file of publicTextFiles) {
  if (!(await exists(file))) continue;
  const content = await fs.readFile(file, "utf8");
  if (/\u2014|\u2013/.test(content)) {
    errors.push(`${path.relative(ROOT, file)} contains an em dash or en dash.`);
  }
}

const insightsIndex = await fs.readFile(path.join(ROOT, "insights", "index.html"), "utf8");
for (const marker of ["<!-- AUTOMATED_POSTS_START -->", "<!-- AUTOMATED_POSTS_END -->"]) {
  if (!insightsIndex.includes(marker)) errors.push(`insights/index.html is missing marker: ${marker}`);
}

const rss = await fs.readFile(path.join(ROOT, "rss.xml"), "utf8");
for (const marker of ["<!-- AUTOMATED_RSS_START -->", "<!-- AUTOMATED_RSS_END -->"]) {
  if (!rss.includes(marker)) errors.push(`rss.xml is missing marker: ${marker}`);
}
if (!rss.includes("<rss version=\"2.0\"")) errors.push("rss.xml is missing its RSS 2.0 root element.");

const sitemap = await fs.readFile(path.join(ROOT, "sitemap.xml"), "utf8");
for (const marker of ["<!-- AUTOMATED_SITEMAP_START -->", "<!-- AUTOMATED_SITEMAP_END -->"]) {
  if (!sitemap.includes(marker)) errors.push(`sitemap.xml is missing marker: ${marker}`);
}

const history = JSON.parse(await fs.readFile(path.join(ROOT, "automation", "editorial-history.json"), "utf8"));
if (!Array.isArray(history.posts) || history.posts.length < 1) {
  errors.push("automation/editorial-history.json must contain at least one post.");
}

const articleDirectories = (await fs.readdir(path.join(ROOT, "insights"), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
for (const post of history.posts) {
  if (!articleDirectories.includes(post.slug)) {
    errors.push(`Editorial history refers to a missing article directory: ${post.slug}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${insightFiles.length} insight pages, RSS, sitemap, local links and editorial history.`);
