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

The form currently uses the Formspree endpoint found in the supplied Vertical Haus website so the prototype has a working submission route. Before publishing, confirm that `https://formspree.io/f/mzdaqgod` should receive Campaign Producers enquiries or replace the `action` value in `index.html` with the new endpoint.

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
