# Static demo on GitHub Pages

This folder contains a standalone preview of the AEM site. No AEM server, Maven,
API credentials or frontend build is required to serve the checked-in HTML.

## Preview locally

Open `index.html` in a browser. Follow **Parks & Walks** and then **Coastal Walks**.
The menu, search and filters use plain browser JavaScript.

The preview includes six authored listing records and one full detail page.
Other homepage categories are labelled **Coming soon**. Listings and practical
information are a snapshot of repository content, not a live activity service.
The map button opens Google Maps; there is no embedded map or postcode API call.

## Publish

1. Commit and push `docs/`, `scripts/build-demo.mjs` and the README update to the
   branch you want to publish (normally `main`). Keep the existing screenshots.
2. In the GitHub repository, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the branch containing the demo and the **/docs** folder, then **Save**.
5. Wait for the Pages deployment to succeed. Open the URL shown on that page and
   check the home page, filters and Coastal Walks page.
6. On the repository's main page, use the gear beside **About**, paste that URL
   into **Website**, and save.

For this repository, the expected default URL is:

`https://kerkaryashashri.github.io/outwiththenest/`

That address is only live after a successful deployment. GitHub Free supports
Pages for public repositories; private repositories require an eligible plan.

Official instructions:
[Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Update the demo

Run from the repository root with Node.js 18 or later:

```sh
node scripts/build-demo.mjs
```

This rebuilds the three HTML pages, copies the selected AEM images, and writes
`.nojekyll`. Listing metadata is read from the authored page XML. The curated
homepage and Coastal Walks detail copy live in the generator; update them there
when changing the preview. CSS and JavaScript are maintained directly in
`docs/assets/`. Commit the generated files as well as generator changes.

All local URLs are relative so the demo works under the repository's Pages
subpath and from a local file. The existing screenshot files are not modified.
