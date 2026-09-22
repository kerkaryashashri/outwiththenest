# Editable template recovery

The original `/conf/outwiththenest` configuration was missing from both the source
and the local author repository. The reconstructed configuration supplies the five
template paths referenced by existing pages: `page-content`, `catalog-page`,
`category-page`, `product-page`, and `xf-web-variation`.

Two template types support creating new page and experience fragment templates.
Shared policies enable the project's content, structure and form component groups
and its site client libraries. Page structures preserve the existing
`root/responsivegrid` and `root/container/container` authoring paths.

These are baseline reconstructions, not copies of the lost configuration.
Commerce templates currently provide editable content containers; their original
commerce setup and style policies are not recovered.

All four site page templates and the page template type include locked header and
footer experience fragment references around the editable content. These reference
the existing Nest Header and Nest Footer under
`/content/experience-fragments/outwiththenest/gb/en/site`. Edit shared header/footer
content there. The experience fragment template deliberately omits these references
because it is itself used by those fragments and would introduce recursive inclusion.

The `/conf/outwiththenest` package filter uses `merge` to preserve subsequent
author changes. Existing template changes therefore require an intentional update
or a targeted migration; rebuilding does not overwrite authored configuration.

Validate with `mvn -pl ui.content package -DskipTests`. For a fresh instance, install
the project's packages as usual. On an existing author, install a package scoped
only to `/conf/outwiththenest` to avoid reinstalling the sample site content.

Local verification: the configuration and templates are listed in the Templates
console, all five templates are enabled, and the existing home page hero renders.
