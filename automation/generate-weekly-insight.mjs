import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = "https://www.campaignproducers.com";
const MODEL = process.env.OPENAI_BLOG_MODEL || "gpt-5.6";
const apiKey = process.env.OPENAI_API_KEY;
const fixturePath = process.env.BLOG_FIXTURE_PATH;

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const SITE_ROOT = await fileExists(path.join(ROOT, "public", "index.html"))
  ? path.join(ROOT, "public")
  : ROOT;

if (!apiKey && !fixturePath) {
  throw new Error(
    "OPENAI_API_KEY is missing. Add it as a GitHub Actions repository secret before running the weekly insight workflow.",
  );
}

const schema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "slug",
    "meta_description",
    "standfirst",
    "topic_label",
    "takeaway",
    "opening_paragraphs",
    "sections",
    "conclusion",
    "sources",
    "linkedin_post",
  ],
  properties: {
    title: { type: "string", minLength: 25, maxLength: 86 },
    slug: { type: "string", minLength: 8, maxLength: 72 },
    meta_description: { type: "string", minLength: 120, maxLength: 165 },
    standfirst: { type: "string", minLength: 90, maxLength: 240 },
    topic_label: { type: "string", minLength: 3, maxLength: 40 },
    takeaway: { type: "string", minLength: 60, maxLength: 220 },
    opening_paragraphs: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: { type: "string", minLength: 80, maxLength: 650 },
    },
    sections: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "paragraphs", "bullets", "source_numbers"],
        properties: {
          heading: { type: "string", minLength: 8, maxLength: 80 },
          paragraphs: {
            type: "array",
            minItems: 2,
            maxItems: 3,
            items: { type: "string", minLength: 70, maxLength: 650 },
          },
          bullets: {
            type: "array",
            minItems: 0,
            maxItems: 5,
            items: { type: "string", minLength: 25, maxLength: 240 },
          },
          source_numbers: {
            type: "array",
            minItems: 0,
            maxItems: 5,
            items: { type: "integer", minimum: 1, maximum: 5 },
          },
        },
      },
    },
    conclusion: { type: "string", minLength: 100, maxLength: 650 },
    sources: {
      type: "array",
      minItems: 2,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "publisher", "url"],
        properties: {
          title: { type: "string", minLength: 5, maxLength: 180 },
          publisher: { type: "string", minLength: 2, maxLength: 80 },
          url: { type: "string", minLength: 12, maxLength: 500 },
        },
      },
    },
    linkedin_post: { type: "string", minLength: 120, maxLength: 1200 },
  },
};

const developerPrompt = `
You are the editorial writer for Campaign Producers, a UK campaign leadership business founded by Henk Pretorius.

Campaign Producers turns a commercial objective into a clear campaign, assembles a hand-picked team of human specialists around the brief, and leads every moving part from brief to delivery. Each campaign is human-led, AI-enabled where useful, and has one accountable Campaign Producer.

The audience is marketing leaders, founders, internal campaign owners, agency producers and creative decision-makers. The editorial territory includes campaign strategy and scoping, audience and message clarity, selecting and briefing specialist talent, creative direction, commercial storytelling, human-led AI use, traditional and hybrid production, campaign operations, transparent budgeting, performance collaboration and campaign effectiveness.

Write with Henk's point of view: clarify the commercial job first, decide what deserves to be made, assemble only the specialists the result needs, keep every discipline moving in one direction, and make every production method earn its place. Sound experienced, direct, curious and useful. Do not sound like a generic content marketer.

Success means:
- Use web search to identify a timely, useful industry development or a current evidence-backed question.
- Prefer primary sources, official research and credible established trade publications.
- Build one clear argument that helps the reader make a real campaign, team or production decision.
- Support material current claims with the numbered sources returned in the sources array.
- Use source_numbers on each section to identify which sources support it.
- Paraphrase sources. Do not copy passages or quotations.
- Write 850 to 1,250 words across the opening, sections and conclusion.
- Use UK English.
- Never use an em dash or en dash. Use commas, brackets, colons or full stops.
- Do not invent statistics, client results, company claims, Collective members, quotations, dates or product capabilities.
- Do not mention a client unless the relationship is already public and a source verifies the claim.
- Never describe Campaign Producers as a fixed agency, directory, freelancer marketplace, production company or AI studio.
- Do not revive retired formats, pages or terminology from earlier versions of the business.
- Avoid hype, empty trend language, exaggerated certainty and vague predictions.
- Keep paragraphs readable and headings decisive.
- End with a practical conclusion, not a sales pitch.
- The LinkedIn post should hook the same idea in 120 to 220 words. Do not invent or include an article URL.
- Return only the required structured result.
`;

const normaliseText = (value) =>
  String(value || "")
    .replaceAll("\u2014", ",")
    .replaceAll("\u2013", " to ")
    .replace(/\s+/g, " ")
    .trim();

const escapeHtml = (value) =>
  normaliseText(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const escapeXml = escapeHtml;

const slugify = (value) =>
  normaliseText(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72)
    .replace(/-+$/g, "");

const datePartsInLondon = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return {
    iso: `${values.year}-${values.month}-${values.day}`,
    human: new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date()),
  };
};

const validateUrl = (value) => {
  const url = new URL(normaliseText(value));
  if (url.protocol !== "https:") {
    throw new Error(`Only HTTPS sources are accepted: ${value}`);
  }
  return url.toString();
};

const responseText = (response) => {
  for (const item of response.output || []) {
    if (item.type !== "message") continue;
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) return content.text;
      if (content.type === "refusal") {
        throw new Error(`The model refused the request: ${content.refusal}`);
      }
    }
  }
  throw new Error("The OpenAI response did not contain article output.");
};

const requestArticle = async ({ history, requestedTopic, correction = "" }) => {
  if (fixturePath) {
    return JSON.parse(await fs.readFile(fixturePath, "utf8"));
  }

  const userPrompt = `
Prepare this week's Campaign Producers insight.

Recent published posts to avoid repeating:
${history.posts
  .slice(0, 16)
  .map((post) => `- ${post.date}: ${post.title} [${post.topic}]`)
  .join("\n")}

${
  requestedTopic
    ? `Requested subject: ${requestedTopic}`
    : "Choose the strongest current subject from the approved editorial territory."
}

Look primarily at developments from the last 21 days. If no recent development supports a clearly useful article, choose an evergreen decision problem and ground it in current authoritative sources.
${correction}
`;

  const apiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      store: false,
      reasoning: { effort: "low" },
      tools: [
        {
          type: "web_search",
          search_context_size: "medium",
          user_location: {
            type: "approximate",
            country: "GB",
            city: "London",
            region: "London",
            timezone: "Europe/London",
          },
        },
      ],
      tool_choice: "auto",
      max_output_tokens: 9000,
      text: {
        format: {
          type: "json_schema",
          name: "campaign_producers_insight",
          strict: true,
          schema,
        },
      },
      input: [
        { role: "developer", content: developerPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const response = await apiResponse.json();
  if (!apiResponse.ok) {
    throw new Error(
      `OpenAI API error ${apiResponse.status}: ${JSON.stringify(response)}`,
    );
  }
  return JSON.parse(responseText(response));
};

const cleanArticle = (raw, history, date) => {
  const article = {
    title: normaliseText(raw.title),
    slug: slugify(raw.slug || raw.title),
    meta_description: normaliseText(raw.meta_description),
    standfirst: normaliseText(raw.standfirst),
    topic_label: normaliseText(raw.topic_label),
    takeaway: normaliseText(raw.takeaway),
    opening_paragraphs: raw.opening_paragraphs.map(normaliseText),
    sections: raw.sections.map((section) => ({
      heading: normaliseText(section.heading),
      paragraphs: section.paragraphs.map(normaliseText),
      bullets: section.bullets.map(normaliseText),
      source_numbers: [...new Set(section.source_numbers)].sort(
        (a, b) => a - b,
      ),
    })),
    conclusion: normaliseText(raw.conclusion),
    sources: raw.sources.map((source) => ({
      title: normaliseText(source.title),
      publisher: normaliseText(source.publisher),
      url: validateUrl(source.url),
    })),
    linkedin_post: normaliseText(raw.linkedin_post),
  };

  if (!article.slug) article.slug = slugify(article.title);
  if (history.posts.some((post) => post.slug === article.slug)) {
    article.slug = `${article.slug}-${date.iso}`
      .slice(0, 72)
      .replace(/-+$/g, "");
  }

  const sourceCount = article.sources.length;
  for (const section of article.sections) {
    if (
      section.source_numbers.some(
        (number) => number < 1 || number > sourceCount,
      )
    ) {
      throw new Error(
        `Section "${section.heading}" refers to a source that does not exist.`,
      );
    }
  }

  const articleText = [
    ...article.opening_paragraphs,
    ...article.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      ...section.bullets,
    ]),
    article.conclusion,
  ].join(" ");

  article.word_count = articleText.split(/\s+/).filter(Boolean).length;
  article.reading_minutes = Math.max(4, Math.ceil(article.word_count / 200));

  const minimumWordCount =
    process.env.BLOG_TEST_ALLOW_SHORT === "1" ? 100 : 750;
  if (article.word_count < minimumWordCount || article.word_count > 1400) {
    throw new Error(
      `Article length ${article.word_count} words is outside the safe publishing range.`,
    );
  }

  if (/\u2014|\u2013/.test(JSON.stringify(article))) {
    throw new Error("The article still contains a prohibited dash character.");
  }

  const retiredTopicPattern = new RegExp(
    ["micro", "dramas?"].join(""),
    "i",
  );
  if (retiredTopicPattern.test(JSON.stringify(article))) {
    throw new Error("The article revives retired editorial terminology.");
  }

  return article;
};

const renderHeader = () => `
<a class="skip-link" href="#article">Skip to article</a>
<header class="site-header" data-header>
<div class="shell header-inner">
<a aria-label="Campaign Producers home" class="brand" href="/">
<img alt="Campaign Producers" height="208" src="/assets/images/campaign-producers-logo.png" width="800">
</a>
<button aria-controls="site-nav" aria-expanded="false" aria-label="Open navigation" class="nav-toggle" data-nav-toggle type="button">
<span class="nav-toggle-label">Menu</span>
<span aria-hidden="true" class="nav-toggle-lines"><i></i><i></i></span>
</button>
<nav aria-label="Primary navigation" class="site-nav" data-nav id="site-nav">
<a href="/#process">How it works</a>
<a href="/#collective">The Collective</a>
<a href="/insights/">Insights</a>
<a href="/#proof">Results</a>
<a href="/#producer">Your Campaign Producer</a>
<a href="/#join">Join the Collective</a>
<a class="button button-small button-primary" href="/#start">Build Your Campaign Team</a>
</nav>
</div>
</header>`;

const renderFooter = () => `
<footer class="site-footer">
<div class="shell footer-grid">
<div class="footer-brand">
<img alt="Campaign Producers" height="208" src="/assets/images/campaign-producers-logo.png" width="800">
<p>One campaign. The right people.</p>
</div>
<div class="footer-links">
<span>Navigate</span>
<a href="/">Home</a>
<a href="/#process">How it works</a>
<a href="/#collective">The Collective</a>
<a href="/insights/">Insights</a>
<a href="/#proof">Results</a>
<a href="/rss.xml">RSS feed</a>
</div>
<div class="footer-action">
<span>Have an important campaign to move?</span>
<a class="button button-primary" href="/#start">Build Your Campaign Team</a>
<a class="footer-email" href="mailto:henk@campaignproducers.com">henk@campaignproducers.com</a>
</div>
</div>
<div class="shell footer-bottom">
<span>© <span data-year>${new Date().getFullYear()}</span> Campaign Producers</span>
<span>Human-led / AI-enabled / One accountable lead</span>
</div>
</footer>
<script defer src="/assets/js/site.js?v=20260729-2"></script>`;

const renderSourceLinks = (sourceNumbers) => {
  if (!sourceNumbers.length) return "";
  return `<p class="section-citations">Sources: ${sourceNumbers
    .map((number) => `<a href="#source-${number}">${number}</a>`)
    .join(", ")}</p>`;
};

const renderArticlePage = (article, date) => {
  const url = `${BASE_URL}/insights/${article.slug}/`;
  const sections = article.sections
    .map(
      (section) => `
<h2>${escapeHtml(section.heading)}</h2>
${section.paragraphs
  .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
  .join("\n")}
${
  section.bullets.length
    ? `<ul>${section.bullets
        .map((bullet) => `<li>${escapeHtml(bullet)}</li>`)
        .join("")}</ul>`
    : ""
}
${renderSourceLinks(section.source_numbers)}`,
    )
    .join("\n");

  const sources = article.sources
    .map(
      (source, index) => `
<li id="source-${index + 1}"><a href="${escapeHtml(
        source.url,
      )}" rel="noopener noreferrer" target="_blank">${escapeHtml(
        source.title,
      )}</a> <span>${escapeHtml(source.publisher)}</span></li>`,
    )
    .join("");

  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.meta_description,
    datePublished: date.iso,
    dateModified: date.iso,
    mainEntityOfPage: url,
    author: {
      "@type": "Person",
      name: "Henk Pretorius",
      url: `${BASE_URL}/#producer`,
    },
    publisher: {
      "@type": "Organization",
      name: "Campaign Producers",
      url: `${BASE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/assets/images/campaign-producers-logo.png`,
      },
    },
    image: `${BASE_URL}/og.png`,
  }).replaceAll("<", "\\u003c");

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1" name="viewport">
<title>${escapeHtml(article.title)} | Campaign Producers</title>
<meta content="${escapeHtml(article.meta_description)}" name="description">
<meta content="#f7f3ea" name="theme-color">
<link href="${url}" rel="canonical">
<link href="${BASE_URL}/rss.xml" rel="alternate" title="Campaign Producers Insights" type="application/rss+xml">
<meta content="${escapeHtml(article.title)}" property="og:title">
<meta content="${escapeHtml(article.standfirst)}" property="og:description">
<meta content="article" property="og:type">
<meta content="${url}" property="og:url">
<meta content="Campaign Producers" property="og:site_name">
<meta content="${date.iso}" property="article:published_time">
<meta content="Henk Pretorius" property="article:author">
<meta content="${BASE_URL}/og.png" property="og:image">
<meta content="Campaign Producers: One campaign. The right people." property="og:image:alt">
<meta content="summary_large_image" name="twitter:card">
<meta content="${escapeHtml(article.title)}" name="twitter:title">
<meta content="${escapeHtml(article.standfirst)}" name="twitter:description">
<meta content="${BASE_URL}/og.png" name="twitter:image">
<link href="/assets/images/campaign-producers-mark.png" rel="icon" type="image/png">
<link href="/assets/css/styles.css?v=20260729-2" rel="stylesheet">
<link href="/assets/css/insights.css?v=20260729-2" rel="stylesheet">
<script type="application/ld+json">${schemaJson}</script>
</head>
<body>
${renderHeader()}
<main id="article">
<article>
<header class="article-hero">
<div class="shell article-hero-inner">
<div class="article-meta"><span>${escapeHtml(
    article.topic_label,
  )}</span><time datetime="${date.iso}">${date.human}</time><span>${
    article.reading_minutes
  } minute read</span></div>
<h1>${escapeHtml(article.title)}</h1>
<p class="article-standfirst">${escapeHtml(article.standfirst)}</p>
<div class="article-byline"><span>By <a href="/#producer" rel="author">Henk Pretorius</a></span><span>Founder / Campaign Producer</span></div>
</div>
</header>
<div class="section-pad">
<div class="shell article-layout">
<div class="article-body">
${article.opening_paragraphs
  .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
  .join("\n")}
<div class="article-pullquote">${escapeHtml(article.takeaway)}</div>
${sections}
<h2>What this means for your next campaign</h2>
<p>${escapeHtml(article.conclusion)}</p>
<section class="article-sources" aria-labelledby="sources-title">
<h2 id="sources-title">Sources</h2>
<ol>${sources}</ol>
</section>
</div>
<aside class="article-aside" aria-label="Campaign Producers perspective">
<span>The decision in one line</span>
<p>${escapeHtml(article.takeaway)}</p>
<a class="button button-primary" href="/#start">Build Your Campaign Team</a>
</aside>
</div>
</div>
</article>
<section class="article-next section-pad">
<div class="shell article-next-inner">
<div><p class="eyebrow"><span></span>More campaign thinking</p><h2>Read the latest insights.</h2></div>
<a class="button button-primary" href="/insights/">Explore Insights</a>
</div>
</section>
</main>
${renderFooter()}
</body>
</html>
`;
};

const insertAfterMarker = (content, marker, insertion) => {
  if (!content.includes(marker)) {
    throw new Error(`Missing required marker: ${marker}`);
  }
  return content.replace(marker, `${marker}\n${insertion}`);
};

const renderCard = (article, date) => `<article class="insight-card reveal">
<div>
<div class="insight-card-topline"><span>${escapeHtml(
  article.topic_label,
)}</span><time datetime="${date.iso}">${date.human}</time><span>${
  article.reading_minutes
} minute read</span></div>
<h2><a href="/insights/${article.slug}/">${escapeHtml(article.title)}</a></h2>
<p>${escapeHtml(article.standfirst)}</p>
</div>
<a aria-label="Read ${escapeHtml(
  article.title,
)}" class="insight-card-link" href="/insights/${
  article.slug
}/">Read the insight</a>
</article>`;

const renderRssItem = (article, date) => `<item>
<title>${escapeXml(article.title)}</title>
<link>${BASE_URL}/insights/${article.slug}/</link>
<guid isPermaLink="true">${BASE_URL}/insights/${article.slug}/</guid>
<pubDate>${new Date(`${date.iso}T08:00:00Z`).toUTCString()}</pubDate>
<description>${escapeXml(article.standfirst)}</description>
</item>`;

const renderSitemapItem = (article, date) => `<url>
<loc>${BASE_URL}/insights/${article.slug}/</loc>
<lastmod>${date.iso}</lastmod>
<priority>0.8</priority>
</url>`;

const main = async () => {
  const historyPath = path.join(ROOT, "automation", "editorial-history.json");
  const history = JSON.parse(await fs.readFile(historyPath, "utf8"));
  const date = datePartsInLondon();
  const requestedTopic = normaliseText(process.env.REQUESTED_TOPIC || "");

  let article;
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const raw = await requestArticle({
        history,
        requestedTopic,
        correction:
          attempt === 2
            ? `The previous attempt failed validation: ${lastError.message}. Correct that issue.`
            : "",
      });
      article = cleanArticle(raw, history, date);
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error;
      if (attempt === 2) throw error;
    }
  }

  const articleDirectory = path.join(
    SITE_ROOT,
    "insights",
    article.slug,
  );
  await fs.mkdir(articleDirectory, { recursive: false });
  await fs.writeFile(
    path.join(articleDirectory, "index.html"),
    renderArticlePage(article, date),
  );

  const indexPath = path.join(SITE_ROOT, "insights", "index.html");
  const rssPath = path.join(SITE_ROOT, "rss.xml");
  const sitemapPath = path.join(SITE_ROOT, "sitemap.xml");
  const [indexHtml, rssXml, sitemapXml] = await Promise.all([
    fs.readFile(indexPath, "utf8"),
    fs.readFile(rssPath, "utf8"),
    fs.readFile(sitemapPath, "utf8"),
  ]);

  const nextIndex = insertAfterMarker(
    indexHtml,
    "<!-- AUTOMATED_POSTS_START -->",
    renderCard(article, date),
  );
  const nextRss = insertAfterMarker(
    rssXml,
    "<!-- AUTOMATED_RSS_START -->",
    renderRssItem(article, date),
  );
  let nextSitemap = insertAfterMarker(
    sitemapXml,
    "<!-- AUTOMATED_SITEMAP_START -->",
    renderSitemapItem(article, date),
  );
  nextSitemap = nextSitemap.replace(
    /(<loc>https:\/\/www\.campaignproducers\.com\/insights\/<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,
    `$1${date.iso}$2`,
  );

  history.posts.unshift({
    date: date.iso,
    title: article.title,
    slug: article.slug,
    topic: article.topic_label,
  });
  history.posts = history.posts.slice(0, 52);

  const articleUrl = `${BASE_URL}/insights/${article.slug}/`;
  const linkedInDraft = `${article.linkedin_post}\n\nRead the full insight:\n${articleUrl}\n`;

  await Promise.all([
    fs.writeFile(indexPath, nextIndex),
    fs.writeFile(rssPath, nextRss),
    fs.writeFile(sitemapPath, nextSitemap),
    fs.writeFile(historyPath, `${JSON.stringify(history, null, 2)}\n`),
    fs.writeFile(
      path.join(ROOT, "automation", "latest-linkedin-post.txt"),
      linkedInDraft,
    ),
  ]);

  console.log(
    JSON.stringify({
      title: article.title,
      slug: article.slug,
      date: date.iso,
      reading_minutes: article.reading_minutes,
      source_count: article.sources.length,
    }),
  );
};

await main();
