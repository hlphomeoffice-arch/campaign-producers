import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

const exists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const SITE_ROOT = (await exists(path.join(ROOT, "public", "index.html")))
  ? path.join(ROOT, "public")
  : ROOT;

const requiredFiles = [
  "index.html",
  "insights/index.html",
  "insights/ai-traditional-or-hybrid-production/index.html",
  "assets/css/styles.css",
  "assets/css/insights.css",
  "assets/js/site.js",
  "og.png",
  "rss.xml",
  "sitemap.xml",
  "robots.txt",
];

for (const relativePath of requiredFiles) {
  if (!(await exists(path.join(SITE_ROOT, relativePath)))) {
    errors.push(`Missing required file: ${relativePath}`);
  }
}

for (const relativePath of [
  "automation/editorial-history.json",
  "automation/generate-weekly-insight.mjs",
  "automation/latest-linkedin-post.txt",
  ".github/workflows/weekly-insight.yml",
]) {
  if (!(await exists(path.join(ROOT, relativePath)))) {
    errors.push(`Missing required automation file: ${relativePath}`);
  }
}

const retiredPaths = [
  "microdramas",
  "assets/css/microdramas-base.css",
  "assets/css/microdramas.css",
  "assets/js/microdramas.js",
  "assets/images/microdramas-og.jpg",
];

for (const relativePath of retiredPaths) {
  if (await exists(path.join(SITE_ROOT, relativePath))) {
    errors.push(`Retired page or asset still exists: ${relativePath}`);
  }
}

const walk = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(fullPath)));
    else files.push(fullPath);
  }
  return files;
};

const insightFiles = (await walk(path.join(SITE_ROOT, "insights"))).filter(
  (file) => file.endsWith(".html"),
);

const localTarget = (htmlFile, rawReference) => {
  const reference = rawReference.split("#")[0].split("?")[0];
  if (
    !reference ||
    /^(https?:|mailto:|tel:|data:|javascript:)/.test(reference)
  ) {
    return null;
  }

  let target;
  if (reference.startsWith("/")) {
    target = path.join(SITE_ROOT, reference.slice(1));
  } else {
    target = path.resolve(path.dirname(htmlFile), reference);
  }

  if (reference.endsWith("/")) target = path.join(target, "index.html");
  return target;
};

for (const file of insightFiles) {
  const relativePath = path.relative(SITE_ROOT, file);
  const html = await fs.readFile(file, "utf8");

  if (!/^<!doctype html>/i.test(html)) {
    errors.push(`${relativePath} is missing the HTML doctype.`);
  }
  if ((html.match(/<h1[ >]/gi) || []).length !== 1) {
    errors.push(`${relativePath} must contain exactly one h1.`);
  }
  if (!/<meta[^>]+name="description"/i.test(html)) {
    errors.push(`${relativePath} is missing its meta description.`);
  }
  if (!/<link[^>]+rel="canonical"/i.test(html)) {
    errors.push(`${relativePath} is missing its canonical URL.`);
  }

  for (const match of html.matchAll(
    /<(?:a|link|script|img)[^>]+(?:href|src)="([^"]+)"/gi,
  )) {
    const target = localTarget(file, match[1]);
    if (target && !(await exists(target))) {
      errors.push(
        `${relativePath} points to a missing local file: ${match[1]}`,
      );
    }
  }

  for (const match of html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi,
  )) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(
        `${relativePath} contains invalid JSON-LD: ${error.message}`,
      );
    }
  }
}

const liveTextFiles = [
  path.join(SITE_ROOT, "index.html"),
  ...insightFiles,
  path.join(SITE_ROOT, "rss.xml"),
  path.join(SITE_ROOT, "sitemap.xml"),
  path.join(ROOT, "automation", "latest-linkedin-post.txt"),
];

const retiredTopicPattern = new RegExp(["micro", "dramas?"].join(""), "i");
const legacyPhrases = [
  /Request a clarity call/i,
  /Say what matters\. Spend where it counts\./i,
];

for (const file of liveTextFiles) {
  if (!(await exists(file))) continue;
  const content = await fs.readFile(file, "utf8");
  const relativePath = path.relative(ROOT, file);

  if (/\u2014|\u2013/.test(content)) {
    errors.push(`${relativePath} contains an em dash or en dash.`);
  }
  if (retiredTopicPattern.test(content)) {
    errors.push(`${relativePath} contains retired editorial terminology.`);
  }
  for (const phrase of legacyPhrases) {
    if (phrase.test(content)) {
      errors.push(`${relativePath} contains legacy positioning: ${phrase}`);
    }
  }
}

const insightsIndex = await fs.readFile(
  path.join(SITE_ROOT, "insights", "index.html"),
  "utf8",
);
for (const marker of [
  "<!-- AUTOMATED_POSTS_START -->",
  "<!-- AUTOMATED_POSTS_END -->",
]) {
  if (!insightsIndex.includes(marker)) {
    errors.push(`insights/index.html is missing marker: ${marker}`);
  }
}

const rss = await fs.readFile(path.join(SITE_ROOT, "rss.xml"), "utf8");
for (const marker of [
  "<!-- AUTOMATED_RSS_START -->",
  "<!-- AUTOMATED_RSS_END -->",
]) {
  if (!rss.includes(marker)) errors.push(`rss.xml is missing marker: ${marker}`);
}
if (!rss.includes('<rss version="2.0"')) {
  errors.push("rss.xml is missing its RSS 2.0 root element.");
}

const sitemap = await fs.readFile(
  path.join(SITE_ROOT, "sitemap.xml"),
  "utf8",
);
for (const marker of [
  "<!-- AUTOMATED_SITEMAP_START -->",
  "<!-- AUTOMATED_SITEMAP_END -->",
]) {
  if (!sitemap.includes(marker)) {
    errors.push(`sitemap.xml is missing marker: ${marker}`);
  }
}
for (const url of [
  "https://www.campaignproducers.com/insights/",
  "https://www.campaignproducers.com/insights/ai-traditional-or-hybrid-production/",
]) {
  if (!sitemap.includes(`<loc>${url}</loc>`)) {
    errors.push(`sitemap.xml is missing required URL: ${url}`);
  }
}

const history = JSON.parse(
  await fs.readFile(
    path.join(ROOT, "automation", "editorial-history.json"),
    "utf8",
  ),
);
if (!Array.isArray(history.posts) || history.posts.length < 1) {
  errors.push("automation/editorial-history.json must contain at least one post.");
}

const articleDirectories = (
  await fs.readdir(path.join(SITE_ROOT, "insights"), { withFileTypes: true })
)
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

for (const post of history.posts) {
  if (!articleDirectories.includes(post.slug)) {
    errors.push(
      `Editorial history refers to a missing article directory: ${post.slug}`,
    );
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${insightFiles.length} insight pages, local links, structured data, RSS, sitemap, editorial automation and retired-page removal.`,
);
