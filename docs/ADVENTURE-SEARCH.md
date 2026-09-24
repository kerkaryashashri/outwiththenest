# Adventure Search Results (AEM)

The homepage Adventure Finder submits `location`, `ageGroup` and `environment`
to `/content/outwiththenest/gb/en/search.html`. That page now uses the
**Adventure Search Results** component. It also supports keyword `q` and
`costType` (`Free` or `Paid`). Filters use an ordinary GET form; JavaScript is
not required. Selections stay visible after submission and Clear filters links
to the results page without query parameters.

## Authoring

The component is in **Out With The Nest - Content**, which is already allowed
by the site's content policies. Its dialog configures the heading and search
source page. The default source is `/content/outwiththenest/gb/en`; the search
includes the source page and all descendant pages within that site.

On each activity page, fill in **Page Properties → Discovery Card**:

- Location and environment (both required for inclusion in search).
- Age group, cost type, card image and short description.
- Select **Hide this page from Discovery Listing Grid** to exclude it from both
  listings and adventure search. Hiding a parent does not hide its descendants.

The existing Discovery Listing and the new search share one HTL card template.
Results sort by title. Count refers to all matched cards; this first version has
no pagination. The homepage finder does not need to be reauthored: its saved
results-page path already points to the Search Results page.

## Matching rules

Filters combine with AND. All ages activities match every selected age band.
Authored `0–4 years`, `5–8 years`, `9–12 years` and `Teens` match the finder's
`0-4`, `5-8`, `9-12` and `13-17` values. Both `Indoor & Outdoor` and
`Indoor and outdoor` are recognised; a mixed-setting activity matches either
indoor or outdoor searches. Selecting the mixed setting requires a mixed
activity. `Free & paid options` matches either cost filter.

Location is an exact match: Clevedon does not automatically match North Somerset.
Keywords match a case-insensitive phrase in title, short description or location.
Unknown filter values show a validation message and no results.

## Verification on AEM

Build and install using the existing [setup instructions](../SETUP.md). Then:

1. Open `/content/outwiththenest/gb/en/home.html?wcmmode=disabled` and submit
   Clevedon / Under 5s / Outdoors.
2. Confirm the results page keeps these filters and includes the authored
   all-ages Clevedon activities. Apply the Free filter.
3. Choose a combination with no authored matches and confirm the empty message.
4. Clear filters, check the full count, and follow Coastal Walks to its detail.
5. Check a narrow mobile viewport and keyboard navigation.

The component reads only the current visitor's accessible content. For the
current small site it traverses the configured page tree; before growing to a
large catalogue, replace traversal with an indexed query and pagination.
Filtered URLs must bypass shared unparameterised page caches. The current
Dispatcher configuration does not ignore query parameters; retain that behavior
for `q`, `location`, `ageGroup`, `environment` and `costType`.

The GitHub Pages demo is separate and does not run Sling models or AEM HTL.
