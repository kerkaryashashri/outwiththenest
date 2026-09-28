# Page templates

Create pages under `/content/outwiththenest/gb/en` using the template that matches their purpose. All three templates inherit the site header and footer.

| Template | Starting components | Authoring |
| --- | --- | --- |
| Home Page | Hero carousel, adventure finder, category tiles, featured places and promotion | Edit these sections; add or reorder relevant home components in the main container. |
| Category Page | Breadcrumb, category hero, section introduction and discovery listing | Choose a DAM image in the hero. The listing shows direct child pages by default; set Source page only to list another branch. |
| Place Info Page | Breadcrumb, place hero, About, Practical information, visit map and Before you go | Edit each component's content. The template fixes the section positions and details layout. |

## Place page layout

Desktop uses a native AEM 12-column grid:

```text
| 1 empty | About this place: 5 | Practical information: 5 | 1 empty |
```

The details container occupies 10 columns, with two equal 5-column children. At tablet widths (769–1200px), it uses all 12 columns with two 6-column children. At 768px and below, the components stack at full width. Authors do not need to resize components in Layout mode.

1. Create a **Place Info Page** beneath the appropriate category.
2. In **Page Properties → Discovery Card**, enter the description, location and other discovery details, then select the place photograph. The place hero also uses this page image and title.
3. Edit **About this place** with a short introduction and useful visitor detail.
4. Edit **Practical information**: Best for, Parking, Facilities and Good to know. Keep each answer concise.
5. Edit **Plan your visit** with the arrival address and postcode, map embed URL and directions URL. A Google Maps directions URL without an `origin` allows visitors to use their current location or enter a starting point. Check the arrival entrance, not just the centre of the postcode.
6. Add official visitor links and booking notes in **Before you go**. Keep photograph source records in DAM metadata and `reference/IMAGE-CREDITS.md`.
7. Preview desktop and phone layouts; check the image, map and directions link before publishing.

Use photographs of the actual place, with appropriate permission and attribution. Empty new templates deliberately contain no invented venue details or borrowed address.

## Maintenance

Template definitions live under `ui.content/src/main/content/jcr_root/conf/outwiththenest/settings/wcm/templates`. The place row uses the `place-details` container policy and scoped styles in `ui.frontend/src/main/webpack/components/_pagelayout.scss`.

Home and category containers offer a focused component palette. The generic Content Page template remains available for other page types. Existing place content, DAM references, postcodes and maps are retained during this migration.

The three managed templates and ten named component and layout policies are replaced on package installation; other site configuration is merged. Back up deliberate changes made through the Template Editor before installing a new content package.
