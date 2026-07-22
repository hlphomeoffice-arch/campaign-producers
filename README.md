# Campaign Producers website

Customer-led, single-page website built around Donald Miller's StoryBrand sequence:

1. The customer wants a product launch people understand and choose.
2. Disconnected campaign production stands in the way.
3. Campaign Producers enters as the empathetic, experienced campaign producer.
4. The customer receives a three-step plan.
5. Clear calls to action invite them to start a campaign.
6. The successful outcome is a connected campaign the whole team can use.
7. The cost of inaction is a valuable launch lost in fragmented content.

## Preview locally

Open `index.html` directly, or serve the folder from a terminal:

```bash
python3 -m http.server 8080 --directory campaign-producers-site
```

Then visit `http://localhost:8080`.

## Contact form

The public contact address is `henk@campaignproducers.com`. The form currently uses the Formspree endpoint found in the supplied Vertical Haus website so the prototype has a working submission route. Before publishing, confirm in Formspree that `https://formspree.io/f/mzdaqgod` delivers Campaign Producers enquiries to `henk@campaignproducers.com`, or replace the `action` value in `index.html` with a new Campaign Producers endpoint.

## Assets and attribution

- The Campaign Producers logo and monogram were extracted without redrawing from the supplied Brand Bible master artwork.
- Queensberry × DAZN, Queensberry × DerbyFest and Henk Pretorius images came from the supplied Vertical Haus website archive.
- Those case studies are explicitly attributed on the website to work delivered through Vertical Haus.

## Publishing checks

- Add the final domain to canonical and social metadata once known.
- Confirm the Formspree destination.
- Add privacy and cookie pages appropriate to the deployment and analytics stack.
- Keep `reported` or `company-reported` beside campaign performance figures unless platform analytics are approved for publication.
- Do not add client logos until the exact relationship and public-use approval are confirmed.

## Insights and weekly publishing

The website includes a static Insights section at `/insights/`, plus an RSS feed and sitemap.

`.github/workflows/weekly-insight.yml` runs at 08:17 every Tuesday in the `Europe/London` timezone. It researches a current industry subject, creates a source-backed article, updates the Insights index, RSS feed and sitemap, then opens a draft pull request. The article is published only when that pull request is reviewed and merged.

Repository setup required:

1. Add an Actions repository secret named `OPENAI_API_KEY`.
2. Allow GitHub Actions to create pull requests under **Settings > Actions > General > Workflow permissions**.
3. Keep the workflow enabled on the default branch.

The workflow can also be run manually from the Actions tab with an optional requested topic. `automation/editorial-history.json` prevents recent subjects from being repeated. `automation/latest-linkedin-post.txt` contains the promotional draft prepared with each article.

Run the local validation without installing dependencies:

```bash
node automation/validate-site.mjs
```
